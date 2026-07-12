import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, requireVerifiedEmail } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendRfqNotification } from '../lib/email.js';

const router = Router();

const rfqSchema = z.object({
  supplierId: z.string().uuid().optional().nullable(),
  productCategory: z.enum(['Coffee', 'Pulses', 'Oilseeds', 'Sesame', 'Spices', 'Fruits']),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unit: z.enum(['kg', 'MT', 'bag']).default('kg'),
  requiredDeliveryDate: z.coerce.date().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  terms: z.string().optional().nullable(),
});

// POST /api/rfqs - buyers create an RFQ (targeted or broadcast)
router.post(
  '/',
  requireAuth,
  requireRole('buyer'),
  requireVerifiedEmail,
  validate(rfqSchema),
  async (req, res, next) => {
    try {
      const { supplierId, ...data } = req.body;
      if (supplierId) {
        const supplier = await prisma.supplierProfile.findUnique({
          where: { id: supplierId },
          include: { user: true },
        });
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        if (supplier.user.verificationStatus !== 'verified') {
          return res.status(400).json({ error: 'This supplier is not yet verified and cannot receive inquiries' });
        }
        const rfq = await prisma.rfq.create({
          data: { ...data, buyerId: req.user.id, supplierId },
        });
        await prisma.supplierProfile.update({
          where: { id: supplierId },
          data: { totalInquiries: { increment: 1 } },
        });
        await sendRfqNotification(supplier.user, rfq);
        return res.status(201).json({ rfq });
      }
      // Broadcast RFQ: not tied to one supplier; notify all verified suppliers in category
      const rfq = await prisma.rfq.create({ data: { ...data, buyerId: req.user.id } });
      const suppliers = await prisma.supplierProfile.findMany({
        where: {
          user: { verificationStatus: 'verified' },
          products: { some: { category: data.productCategory } },
        },
        include: { user: true },
      });
      await Promise.all(suppliers.map((s) => sendRfqNotification(s.user, rfq)));
      res.status(201).json({ rfq, notifiedSuppliers: suppliers.length });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/rfqs - list RFQs relevant to the current user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const { status } = req.query;

    let where;
    if (req.user.role === 'buyer') {
      where = { buyerId: req.user.id };
    } else if (req.user.role === 'supplier') {
      const profile = await prisma.supplierProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) return res.json({ rfqs: [], total: 0, page, limit });
      const categories = (
        await prisma.product.findMany({
          where: { supplierId: profile.id },
          select: { category: true },
          distinct: ['category'],
        })
      ).map((p) => p.category);
      // Direct RFQs plus open broadcast RFQs in the supplier's categories
      where = {
        OR: [
          { supplierId: profile.id },
          ...(categories.length
            ? [{ supplierId: null, productCategory: { in: categories }, status: { not: 'Closed' } }]
            : []),
        ],
      };
    } else {
      where = {}; // admin sees everything
    }
    if (status) where = { AND: [where, { status }] };

    const [rfqs, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          buyer: { select: { fullName: true, email: true } },
          supplier: { select: { id: true, companyName: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.rfq.count({ where }),
    ]);
    res.json({ rfqs, total, page, limit });
  } catch (err) {
    next(err);
  }
});

async function canAccessRfq(user, rfq) {
  if (user.role === 'admin') return true;
  if (rfq.buyerId === user.id) return true;
  if (user.role === 'supplier') {
    const profile = await prisma.supplierProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return false;
    if (rfq.supplierId === profile.id) return true;
    if (rfq.supplierId === null) return true; // broadcast RFQs visible to suppliers
  }
  return false;
}

// GET /api/rfqs/:rfqId
router.get('/:rfqId', requireAuth, async (req, res, next) => {
  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id: req.params.rfqId },
      include: {
        buyer: { select: { id: true, fullName: true, email: true } },
        supplier: { select: { id: true, companyName: true, userId: true } },
      },
    });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (!(await canAccessRfq(req.user, rfq))) {
      return res.status(403).json({ error: 'You do not have access to this RFQ' });
    }
    res.json({ rfq });
  } catch (err) {
    next(err);
  }
});

// GET /api/rfqs/:rfqId/messages
router.get('/:rfqId/messages', requireAuth, async (req, res, next) => {
  try {
    const rfq = await prisma.rfq.findUnique({ where: { id: req.params.rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (!(await canAccessRfq(req.user, rfq))) {
      return res.status(403).json({ error: 'You do not have access to this RFQ' });
    }
    const messages = await prisma.message.findMany({
      where: { rfqId: rfq.id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        recipient: { select: { id: true, fullName: true, role: true } },
      },
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

const rfqUpdateSchema = z.object({
  status: z.enum(['Draft', 'Sent', 'Responded', 'Negotiating', 'Closed']).optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  quantity: z.number().positive().optional(),
  budget: z.number().positive().optional().nullable(),
  terms: z.string().optional().nullable(),
  requiredDeliveryDate: z.coerce.date().optional().nullable(),
});

// PUT /api/rfqs/:rfqId - update status or details
router.put('/:rfqId', requireAuth, validate(rfqUpdateSchema), async (req, res, next) => {
  try {
    const rfq = await prisma.rfq.findUnique({ where: { id: req.params.rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (!(await canAccessRfq(req.user, rfq))) {
      return res.status(403).json({ error: 'You do not have access to this RFQ' });
    }
    const data = { ...req.body };
    if (data.status === 'Closed' && rfq.status !== 'Closed') data.closedAt = new Date();
    const updatedRfq = await prisma.rfq.update({ where: { id: rfq.id }, data });
    res.json({ updatedRfq });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/rfqs/:rfqId - buyer deletes own RFQ
router.delete('/:rfqId', requireAuth, async (req, res, next) => {
  try {
    const rfq = await prisma.rfq.findUnique({ where: { id: req.params.rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.buyerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the buyer who created this RFQ can delete it' });
    }
    await prisma.rfq.delete({ where: { id: rfq.id } });
    res.json({ message: 'RFQ deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
