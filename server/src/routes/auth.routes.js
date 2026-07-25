import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { sendVerificationEmail } from '../lib/email.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  userType: u.userType,
  emailVerified: u.emailVerified,
  verificationStatus: u.verificationStatus,
  supplierProfileId: u.supplierProfile?.id ?? null,
  createdAt: u.createdAt,
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2),
  role: z.enum(['supplier', 'buyer']),
  userType: z.enum(['individual', 'company']).default('individual'),
  companyName: z.string().min(2).optional(),
});

router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { email, password, fullName, role, userType, companyName } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    if (role === 'supplier' && !companyName) {
      return res.status(400).json({ error: 'Company name is required for suppliers' });
    }

    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        fullName,
        role,
        userType,
        emailVerifyToken,
        // Suppliers (exporters) are manually vetted before they can access the
        // marketplace, so they start "pending". Buyers are approved on signup.
        verificationStatus: role === 'supplier' ? 'pending' : 'verified',
        ...(role === 'supplier'
          ? { supplierProfile: { create: { companyName } } }
          : {}),
      },
      include: { supplierProfile: { select: { id: true } } },
    });

    await sendVerificationEmail(user, emailVerifyToken);

    res.status(201).json({
      userId: user.id,
      token: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: publicUser(user),
      message: 'Account created. Check your email for a verification link.',
    });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      include: { supplierProfile: { select: { id: true } } },
    });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.verificationStatus === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected. Contact admin@afrimos.et for details.' });
    }
    if (user.supplierProfile) {
      await prisma.supplierProfile.update({
        where: { id: user.supplierProfile.id },
        data: { lastActive: new Date() },
      });
    }
    res.json({
      userId: user.id,
      token: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

const adminLoginSchema = z.object({ password: z.string().min(1, 'Password is required') });

// Password-only admin login. Authenticates against the admin account's stored
// (bcrypt-hashed) password — default "0703", changeable from admin settings.
// NOTE: a short numeric password is easy to brute force; there is no rate
// limiting here, so set a stronger one via the admin settings page in anything
// beyond a trusted/internal deployment.
router.post('/admin-login', validate(adminLoginSchema), async (req, res, next) => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      orderBy: { createdAt: 'asc' },
      include: { supplierProfile: { select: { id: true } } },
    });
    if (!admin) return res.status(500).json({ error: 'No admin account is configured' });
    const ok = await bcrypt.compare(req.body.password, admin.password);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });
    res.json({
      userId: admin.id,
      token: signAccessToken(admin),
      refreshToken: signRefreshToken(admin),
      user: publicUser(admin),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  // Stateless JWT: the client discards its tokens.
  res.json({ message: 'Logged out' });
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token is required' });
    const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/resend-verification', requireAuth, async (req, res, next) => {
  try {
    if (req.user.emailVerified) return res.json({ message: 'Email already verified' });
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: req.user.id }, data: { emailVerifyToken } });
    await sendVerificationEmail(req.user, emailVerifyToken);
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    if (user.verificationStatus === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected.' });
    }
    res.json({ token: signAccessToken(user), refreshToken: signRefreshToken(user) });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
