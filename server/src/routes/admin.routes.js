import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendVerificationDecisionEmail } from '../lib/email.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

const adminPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters'),
});

// PUT /api/admin/password - change the admin login password
router.put('/password', validate(adminPasswordSchema), async (req, res, next) => {
  try {
    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = await bcrypt.compare(req.body.currentPassword, admin.password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: await bcrypt.hash(req.body.newPassword, 10) },
    });
    res.json({ message: 'Admin password updated' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/suppliers?status=pending
router.get('/suppliers', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const { status } = req.query;
    const where = {
      role: 'supplier',
      ...(status ? { verificationStatus: status } : {}),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          verificationStatus: true,
          verificationNotes: true,
          emailVerified: true,
          createdAt: true,
          supplierProfile: {
            include: { _count: { select: { products: true } } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ suppliers: users, total, page, limit });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  verificationStatus: z.enum(['verified', 'rejected', 'pending']),
  notes: z.string().optional().nullable(),
});

// PUT /api/admin/suppliers/:userId/verify
router.put('/suppliers/:userId/verify', validate(verifySchema), async (req, res, next) => {
  try {
    const { verificationStatus, notes } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user || user.role !== 'supplier') {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    const updatedSupplier = await prisma.user.update({
      where: { id: user.id },
      data: { verificationStatus, verificationNotes: notes || null },
      select: {
        id: true,
        email: true,
        fullName: true,
        verificationStatus: true,
        verificationNotes: true,
        supplierProfile: true,
      },
    });
    if (verificationStatus !== 'pending') {
      await sendVerificationDecisionEmail(user, verificationStatus, notes);
    }
    res.json({ updatedSupplier });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analytics - platform-wide stats + growth series
router.get('/analytics', async (req, res, next) => {
  try {
    const [totalSuppliers, totalBuyers, totalRFQs, totalMessages, pendingVerifications, closedRfqs] =
      await Promise.all([
        prisma.user.count({ where: { role: 'supplier' } }),
        prisma.user.count({ where: { role: 'buyer' } }),
        prisma.rfq.count(),
        prisma.message.count(),
        prisma.user.count({ where: { role: 'supplier', verificationStatus: 'pending' } }),
        prisma.rfq.count({ where: { status: 'Closed' } }),
      ]);

    // Growth over the last 12 weeks
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 3600 * 1000);
    const [users, rfqs] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: twelveWeeksAgo } },
        select: { role: true, createdAt: true },
      }),
      prisma.rfq.findMany({
        where: { createdAt: { gte: twelveWeeksAgo } },
        select: { createdAt: true },
      }),
    ]);

    const weekKey = (d) => {
      const monday = new Date(d);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      return monday.toISOString().slice(0, 10);
    };
    const series = {};
    for (let i = 11; i >= 0; i--) {
      const k = weekKey(new Date(Date.now() - i * 7 * 24 * 3600 * 1000));
      series[k] = { week: k, suppliers: 0, buyers: 0, rfqs: 0 };
    }
    for (const u of users) {
      const k = weekKey(u.createdAt);
      if (series[k]) series[k][u.role === 'supplier' ? 'suppliers' : 'buyers'] += 1;
    }
    for (const r of rfqs) {
      const k = weekKey(r.createdAt);
      if (series[k]) series[k].rfqs += 1;
    }

    res.json({
      totalSuppliers,
      totalBuyers,
      totalRFQs,
      totalMessages,
      pendingVerifications,
      closedRfqs,
      revenue: 0, // payments are post-MVP
      growth: Object.values(series),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users?role=supplier
router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { role, search } = req.query;
    const where = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          userType: true,
          emailVerified: true,
          verificationStatus: true,
          createdAt: true,
          supplierProfile: { select: { companyName: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, page, limit });
  } catch (err) {
    next(err);
  }
});

export default router;
