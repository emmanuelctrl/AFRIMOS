import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

/**
 * The password the admin account is created with. Overridable, but it has a
 * default on purpose: a deployment where nobody has run the seed should still
 * let the owner in rather than answering "No admin account is configured".
 */
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0703';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@afrimos.et';

const findAdmin = () =>
  prisma.user.findFirst({
    where: { role: 'admin' },
    orderBy: { createdAt: 'asc' },
    include: { supplierProfile: { select: { id: true } } },
  });

/**
 * Deduplicates concurrent *creation* only. It must not cache the admin itself:
 * the password can change from the settings page, and a cached row would keep
 * authenticating the old one.
 */
let creating = null;

/**
 * Returns the admin account, creating it if there isn't one.
 *
 * Only ever creates. An existing admin keeps its password, so a change from the
 * settings page sticks and a restart cannot quietly reset it — to force it back
 * to the default, re-run `npm run seed`.
 *
 * The trade this makes: on a brand-new deployment with no admin row, whoever
 * posts the default password first becomes the administrator. That is the cost
 * of having a default password at all, which is a deliberate choice here; the
 * sign-in endpoint is rate limited, and setting ADMIN_PASSWORD closes it.
 */
export async function ensureAdmin() {
  const existing = await findAdmin();
  if (existing) return existing;

  creating ??= (async () => {
    try {
      const created = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10),
          fullName: 'AFRIMOS Admin',
          role: 'admin',
          emailVerified: true,
          verificationStatus: 'verified',
        },
        include: { supplierProfile: { select: { id: true } } },
      });
      console.log(
        `Created the admin account (${ADMIN_EMAIL}). Sign in with the password only.` +
          (process.env.ADMIN_PASSWORD
            ? ''
            : ' It is on the built-in default — change it from Admin → Settings, or set ADMIN_PASSWORD.')
      );
      return created;
    } catch (err) {
      // Another process got there first (unique email). Its row is the answer.
      if (err?.code === 'P2002') {
        const raced = await findAdmin();
        if (raced) return raced;
      }
      throw err;
    } finally {
      creating = null;
    }
  })();

  return creating;
}
