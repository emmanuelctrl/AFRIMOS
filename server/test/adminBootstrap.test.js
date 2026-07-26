import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

/**
 * The admin account has to exist for password-only sign-in to work, and on a
 * deployment nobody has seeded it did not — `0703` answered
 * "No admin account is configured". These cases cover the bootstrap that fixes
 * that, and the thing it must never do: resurrect an old password.
 *
 * Needs its own empty database. Set ADMIN_BOOTSTRAP_DATABASE_URL to one that
 * has the schema but no rows; without it the file skips.
 *
 *   createdb afrimos_bootstrap
 *   DATABASE_URL=postgresql://…/afrimos_bootstrap npx prisma db push
 *   ADMIN_BOOTSTRAP_DATABASE_URL=postgresql://…/afrimos_bootstrap npm test
 */
const DB = process.env.ADMIN_BOOTSTRAP_DATABASE_URL;
const options = DB ? {} : { skip: 'set ADMIN_BOOTSTRAP_DATABASE_URL to an empty seeded-schema database' };

let server;
let base;
let prisma;
let resetRateLimits;

const post = (path, body, token) =>
  fetch(base + path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

before(async () => {
  if (!DB) return;
  process.env.DATABASE_URL = DB;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET ||= 'test-secret-at-least-32-characters-long';
  process.env.JWT_REFRESH_SECRET ||= 'test-refresh-at-least-32-characters-long';

  const { createApp } = await import('../src/app.js');
  ({ prisma } = await import('../src/lib/prisma.js'));
  ({ __resetRateLimits: resetRateLimits } = await import('../src/middleware/rateLimit.js'));

  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(async () => {
  if (!DB) return;
  resetRateLimits();
  // Every case starts from "nobody has run the seed".
  await prisma.user.deleteMany({ where: { role: 'admin' } });
});

after(async () => {
  server?.close();
  await prisma?.$disconnect();
});

test('0703 signs in on a database that was never seeded', options, async () => {
  assert.equal(await prisma.user.count({ where: { role: 'admin' } }), 0);

  const res = await post('/api/auth/admin-login', { password: '0703' });
  assert.equal(res.status, 200, 'this used to be a 500: No admin account is configured');

  const body = await res.json();
  assert.equal(body.user.role, 'admin');
  assert.ok(body.token, 'a usable session comes back');
  assert.equal(await prisma.user.count({ where: { role: 'admin' } }), 1);
});

test('the wrong password does not create anything to sign in with later', options, async () => {
  const res = await post('/api/auth/admin-login', { password: 'not-it' });
  assert.equal(res.status, 401);

  // The account is created either way — bootstrapping is not authentication.
  // What matters is that the wrong password stayed wrong.
  assert.equal((await post('/api/auth/admin-login', { password: 'not-it' })).status, 401);
  assert.equal((await post('/api/auth/admin-login', { password: '0703' })).status, 200);
});

test('signing in twice does not create a second admin', options, async () => {
  await post('/api/auth/admin-login', { password: '0703' });
  await post('/api/auth/admin-login', { password: '0703' });
  assert.equal(await prisma.user.count({ where: { role: 'admin' } }), 1);
});

test('concurrent first sign-ins still produce exactly one admin', options, async () => {
  const results = await Promise.all(
    Array.from({ length: 5 }, () => post('/api/auth/admin-login', { password: '0703' }))
  );
  assert.deepEqual(
    results.map((r) => r.status),
    [200, 200, 200, 200, 200]
  );
  assert.equal(await prisma.user.count({ where: { role: 'admin' } }), 1);
});

test('a changed password sticks, and the old one stops working', options, async () => {
  // The bug this guards: caching the admin row would keep authenticating the
  // password it was created with, forever.
  const first = await post('/api/auth/admin-login', { password: '0703' });
  const { token } = await first.json();

  const change = await fetch(`${base}/api/admin/password`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: '0703', newPassword: 'a-much-longer-password' }),
  });
  assert.equal(change.status, 200);

  resetRateLimits();
  assert.equal((await post('/api/auth/admin-login', { password: 'a-much-longer-password' })).status, 200);
  assert.equal((await post('/api/auth/admin-login', { password: '0703' })).status, 401, 'no going back');
  assert.equal(await prisma.user.count({ where: { role: 'admin' } }), 1, 'and no second admin');
});
