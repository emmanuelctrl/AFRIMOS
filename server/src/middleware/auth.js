import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { supplierProfile: { select: { id: true } } },
    });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    if (user.verificationStatus === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected. Contact admin@afrimos.et for details.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }
    next();
  };
}

export function requireVerifiedEmail(req, res, next) {
  if (!req.user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email address first' });
  }
  next();
}
