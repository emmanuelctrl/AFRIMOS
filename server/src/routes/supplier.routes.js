import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, requireApproved } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileCompleteness } from '../utils/completeness.js';

const router = Router();

const CATEGORIES = ['Coffee', 'Pulses', 'Oilseeds', 'Sesame', 'Spices', 'Fruits'];

// GET /api/suppliers - directory of verified suppliers. Real business data, so
// it requires an approved account.
router.get('/', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const { search, category, certification, shippingTerms, sort } = req.query;

    const where = {
      user: { verificationStatus: 'verified' },
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { products: { some: { name: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
      ...(category && CATEGORIES.includes(category)
        ? { products: { some: { category } } }
        : {}),
      ...(certification ? { certifications: { has: certification } } : {}),
      ...(shippingTerms ? { shippingTerms } : {}),
    };

    const orderBy =
      sort === 'newest'
        ? { createdAt: 'desc' }
        : sort === 'inquiries'
          ? { totalInquiries: 'desc' }
          : [{ rating: 'desc' }, { createdAt: 'desc' }];

    const [suppliers, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { verificationStatus: true, fullName: true } },
          products: { select: { id: true, name: true, category: true }, take: 5 },
          _count: { select: { reviews: true, products: true } },
        },
      }),
      prisma.supplierProfile.count({ where }),
    ]);

    res.json({ suppliers, total, page, limit });
  } catch (err) {
    next(err);
  }
});

const profileSchema = z.object({
  companyName: z.string().min(2).optional(),
  registrationNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  logoBanner: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  certifications: z.array(z.string()).optional(),
  shippingTerms: z.enum(['FOB', 'CIF', 'DDP']).optional().nullable(),
  minimumOrderQuantity: z.number().int().positive().optional().nullable(),
  leadTime: z.number().int().positive().optional().nullable(),
});

// POST/PUT /api/suppliers/profile - create or update own profile
router.post(
  '/profile',
  requireAuth,
  requireRole('supplier'),
  validate(profileSchema),
  async (req, res, next) => {
    try {
      const data = { ...req.body };
      if (data.website === '') data.website = null;
      const updatedSupplier = await prisma.supplierProfile.upsert({
        where: { userId: req.user.id },
        update: data,
        create: { userId: req.user.id, companyName: data.companyName || req.user.fullName, ...data },
      });
      const productCount = await prisma.product.count({ where: { supplierId: updatedSupplier.id } });
      res.json({
        updatedSupplier,
        completeness: profileCompleteness(updatedSupplier, productCount),
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/suppliers/me - own profile with completeness (must precede /:supplierId)
router.get('/me', requireAuth, requireRole('supplier'), async (req, res, next) => {
  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: req.user.id },
      include: { products: true, user: { select: { verificationStatus: true, verificationNotes: true, emailVerified: true } } },
    });
    if (!supplier) return res.status(404).json({ error: 'Supplier profile not found' });
    res.json({ supplier, completeness: profileCompleteness(supplier, supplier.products.length) });
  } catch (err) {
    next(err);
  }
});

// GET /api/suppliers/me/analytics - own dashboard stats
router.get('/me/analytics', requireAuth, requireRole('supplier'), async (req, res, next) => {
  try {
    const profile = await prisma.supplierProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Supplier profile not found' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [totalRfqs, respondedRfqs, totalMessages, recentRfqs, productCount] = await Promise.all([
      prisma.rfq.count({ where: { supplierId: profile.id } }),
      prisma.rfq.count({ where: { supplierId: profile.id, status: { in: ['Responded', 'Negotiating', 'Closed'] } } }),
      prisma.message.count({ where: { OR: [{ senderId: req.user.id }, { recipientId: req.user.id }] } }),
      prisma.rfq.findMany({
        where: { supplierId: profile.id, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.product.count({ where: { supplierId: profile.id } }),
    ]);

    // Inquiries per day for the last 30 days (for the dashboard chart)
    const byDay = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const r of recentRfqs) {
      const key = r.createdAt.toISOString().slice(0, 10);
      if (key in byDay) byDay[key] += 1;
    }

    res.json({
      totalInquiries: totalRfqs,
      totalMessages,
      responseRate: totalRfqs ? Math.round((respondedRfqs / totalRfqs) * 100) : 0,
      totalTransactions: profile.totalTransactions,
      productCount,
      completeness: profileCompleteness(profile, productCount),
      inquiriesByDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/suppliers/:supplierId - supplier detail (approved accounts only)
router.get('/:supplierId', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: req.params.supplierId },
      include: {
        user: { select: { verificationStatus: true, fullName: true, createdAt: true } },
        products: { orderBy: { createdAt: 'desc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { fromUser: { select: { fullName: true } } },
        },
      },
    });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ supplier });
  } catch (err) {
    next(err);
  }
});

// GET /api/suppliers/:supplierId/products
router.get('/:supplierId/products', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { supplierId: req.params.supplierId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

const productSchema = z.object({
  category: z.enum(['Coffee', 'Pulses', 'Oilseeds', 'Sesame', 'Spices', 'Fruits']),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  pricePerUnit: z.number().positive(),
  unit: z.enum(['kg', 'MT', 'bag']).default('kg'),
  minimumOrderQuantity: z.number().int().positive().default(1),
  maximumOrderQuantity: z.number().int().positive().optional().nullable(),
  origin: z.string().optional().nullable(),
  quality: z.enum(['Standard', 'Premium', 'Specialty']).default('Standard'),
  certifications: z.array(z.string()).optional(),
  image: z.string().optional().nullable(),
});

// POST /api/suppliers/:supplierId/products - add product (owner only)
router.post(
  '/:supplierId/products',
  requireAuth,
  requireRole('supplier'),
  validate(productSchema),
  async (req, res, next) => {
    try {
      const supplier = await prisma.supplierProfile.findUnique({ where: { id: req.params.supplierId } });
      if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
      if (supplier.userId !== req.user.id) {
        return res.status(403).json({ error: 'You can only add products to your own profile' });
      }
      const product = await prisma.product.create({
        data: { ...req.body, supplierId: supplier.id },
      });
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/suppliers/:supplierId/reviews
router.get('/:supplierId/reviews', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { toSupplierId: req.params.supplierId },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: { select: { fullName: true } } },
    });
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10 });
  } catch (err) {
    next(err);
  }
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  rfqId: z.string().uuid().optional(),
});

// POST /api/suppliers/:supplierId/reviews - buyers leave a review
router.post(
  '/:supplierId/reviews',
  requireAuth,
  requireApproved,
  requireRole('buyer'),
  validate(reviewSchema),
  async (req, res, next) => {
    try {
      const supplier = await prisma.supplierProfile.findUnique({ where: { id: req.params.supplierId } });
      if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
      const review = await prisma.review.create({
        data: { ...req.body, fromUserId: req.user.id, toSupplierId: supplier.id },
      });
      const agg = await prisma.review.aggregate({
        where: { toSupplierId: supplier.id },
        _avg: { rating: true },
      });
      await prisma.supplierProfile.update({
        where: { id: supplier.id },
        data: { rating: Math.round((agg._avg.rating || 0) * 10) / 10 },
      });
      res.status(201).json({ review });
    } catch (err) {
      next(err);
    }
  }
);

export { productSchema };
export default router;
