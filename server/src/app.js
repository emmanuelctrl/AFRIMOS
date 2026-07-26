import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import productRoutes from './routes/product.routes.js';
import rfqRoutes from './routes/rfq.routes.js';
import messageRoutes from './routes/message.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes, { UPLOAD_DIR } from './routes/upload.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  // Rate limiting counts per client address, so `req.ip` has to be the real
  // caller. Behind a proxy (nginx, Render, Fly, a load balancer) set
  // TRUST_PROXY to the number of hops in front — otherwise every request
  // carries the proxy's address and the whole world shares one bucket.
  // Left off by default: trusting a header nobody is setting would let a
  // directly-exposed server be talked out of its own limits.
  if (process.env.TRUST_PROXY) {
    const hops = Number(process.env.TRUST_PROXY);
    app.set('trust proxy', Number.isFinite(hops) ? hops : process.env.TRUST_PROXY);
  }

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/rfqs', rfqRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
