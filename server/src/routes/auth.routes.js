import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { sendVerificationEmail } from '../lib/email.js';
import { validate } from '../middleware/validate.js';
import { rateLimitFailures, clientIp } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureAdmin } from '../lib/ensureAdmin.js';

const router = Router();

// The admin password is short by request (default "0703"), so the only thing
// standing between it and a script is this: 5 wrong guesses per IP per 15
// minutes turns a 10,000-key space into years rather than seconds. There is
// only one admin credential, so pooling attempts by address is the point: if
// this is reached, someone is guessing.
const adminLoginLimiter = rateLimitFailures({
  name: 'admin-login',
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many incorrect attempts. Try again in a few minutes.',
});

// Ordinary sign-in is a longer password against a known email, so the limit is
// looser — enough to stop credential stuffing, not enough to punish typos.
// Keyed by address *and* email: behind a proxy or a shared office IP, one
// person fat-fingering their password must not lock out everyone else.
const loginLimiter = rateLimitFailures({
  name: 'login',
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many failed sign-in attempts. Try again in a few minutes.',
  key: (req) => `${clientIp(req)}|${String(req.body?.email || '').toLowerCase()}`,
});

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
        // Everybody is vetted before reaching the marketplace — buyers see
        // real exporter contact details and pricing, so an unreviewed buyer
        // account is the same leak as an unreviewed supplier one. Existing
        // accounts keep whatever status they already have; this only sets the
        // starting point for new ones.
        verificationStatus: 'pending',
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

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      include: { supplierProfile: { select: { id: true } } },
    });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      req.limiter.recordFailure();
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    req.limiter.reset();
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
// A four-digit password is only 10,000 possibilities: the rate limit above is
// doing the real work here, so keep it in place, and prefer a longer password
// from the admin settings page for anything public.
router.post('/admin-login', adminLoginLimiter, validate(adminLoginSchema), async (req, res, next) => {
  try {
    // Creates the account on a database nobody has seeded, so a fresh
    // deployment answers the password instead of "No admin account is
    // configured". Existing admins are returned untouched.
    const admin = await ensureAdmin();
    const ok = await bcrypt.compare(req.body.password, admin.password);
    if (!ok) {
      req.limiter.recordFailure();
      return res.status(401).json({ error: 'Incorrect password' });
    }
    req.limiter.reset();
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
