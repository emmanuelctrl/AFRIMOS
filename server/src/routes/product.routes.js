import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchema } from './supplier.routes.js';

const router = Router();

async function loadOwnedProduct(req, res) {
  const product = await prisma.product.findUnique({
    where: { id: req.params.productId },
    include: { supplier: { select: { userId: true } } },
  });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  if (product.supplier.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'You can only modify your own products' });
    return null;
  }
  return product;
}

router.put(
  '/:productId',
  requireAuth,
  requireRole('supplier', 'admin'),
  validate(productSchema.partial()),
  async (req, res, next) => {
    try {
      const product = await loadOwnedProduct(req, res);
      if (!product) return;
      const { supplier, ...rest } = product;
      const updatedProduct = await prisma.product.update({
        where: { id: rest.id },
        data: req.body,
      });
      res.json({ updatedProduct });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:productId', requireAuth, requireRole('supplier', 'admin'), async (req, res, next) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    await prisma.product.delete({ where: { id: product.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
