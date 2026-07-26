import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

/**
 * The two promises this codebase makes about access, exercised through the
 * real routes: nobody reaches real marketplace data without an approved
 * account, and the short admin password cannot be guessed at speed.
 *
 * Needs a database. Point DATABASE_URL at a throwaway one and seed it:
 *
 *   createdb afrimos_test
 *   DATABASE_URL=postgresql://…/afrimos_test npx prisma db push
 *   DATABASE_URL=postgresql://…/afrimos_test npm run seed
 *   DATABASE_URL=postgresql://…/afrimos_test npm test
 *
 * Without DATABASE_URL the whole file skips, so `npm test` still passes on a
 * machine (or CI job) that has no Postgres — rateLimit.test.js covers the
 * limiter itself there.
 */
const DB = process.env.DATABASE_URL;
const options = DB ? {} : { skip: 'set DATABASE_URL (and seed it) to run the gate tests' };

let server;
let base;
let resetRateLimits;
let adminToken;

const post = (path, body) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const get = (path, token) =>
  fetch(base + path, { headers: token ? { authorization: `Bearer ${token}` } : {} });

before(async () => {
  if (!DB) return;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET ||= 'test-secret-at-least-32-characters-long';
  process.env.JWT_REFRESH_SECRET ||= 'test-refresh-at-least-32-characters-long';

  const { createApp } = await import('../src/app.js');
  ({ __resetRateLimits: resetRateLimits } = await import('../src/middleware/rateLimit.js'));

  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => resetRateLimits?.());
after(() => server?.close());

test('the seeded admin password still signs in', options, async () => {
  const res = await post('/api/auth/admin-login', { password: '0703' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.user.role, 'admin');
  adminToken = body.token;
});

test('guessing the admin password is cut off after five tries', options, async () => {
  const codes = [];
  for (let i = 0; i < 7; i++) {
    codes.push((await post('/api/auth/admin-login', { password: String(1000 + i) })).status);
  }
  assert.deepEqual(codes, [401, 401, 401, 401, 401, 429, 429]);

  const real = await post('/api/auth/admin-login', { password: '0703' });
  assert.equal(real.status, 429, 'the right password is blocked too while limited');
  assert.ok(Number(real.headers.get('retry-after')) > 0);
});

test('a guessed account is limited without affecting others', options, async () => {
  for (let i = 0; i < 12; i++) {
    await post('/api/auth/login', { email: 'buyer@example.com', password: 'nope' });
  }
  assert.equal(
    (await post('/api/auth/login', { email: 'buyer@example.com', password: 'Password123!' })).status,
    429
  );
  assert.equal(
    (await post('/api/auth/login', { email: 'yirga@example.et', password: 'Password123!' })).status,
    200
  );
});

/** Signs up a fresh account of either role and returns its session. */
async function signUp(role) {
  const res = await post('/api/auth/signup', {
    email: `${role}+${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: 'Password123!',
    fullName: `New ${role}`,
    role,
    ...(role === 'supplier' ? { companyName: 'Pending Exports plc' } : {}),
  });
  assert.equal(res.status, 201);
  return res.json();
}

for (const role of ['supplier', 'buyer']) {
  test(`a new ${role} signs up pending, not approved`, options, async () => {
    const { user, token } = await signUp(role);
    assert.equal(user.verificationStatus, 'pending');

    // The whole point of `pending`: a signed-in but unapproved account still
    // sees nothing real. Buyers included — they see exporter contact details
    // and pricing, which is exactly the data being protected.
    for (const path of ['/api/suppliers', '/api/rfqs', '/api/messages/conversations']) {
      assert.equal((await get(path, token)).status, 403, path);
    }
  });
}

test('an admin can approve a buyer, and only then do they get in', options, async () => {
  const { user, token } = await signUp('buyer');
  assert.equal((await get('/api/suppliers', token)).status, 403, 'blocked before approval');

  // The buyer has to be reachable from the queue, or there is no way to
  // approve them and the pending default would strand every buyer.
  const queue = await get('/api/admin/accounts?role=buyer&status=pending', adminToken);
  assert.equal(queue.status, 200);
  const { accounts } = await queue.json();
  assert.ok(accounts.some((a) => a.id === user.id), 'new buyer appears in the pending queue');

  const decision = await fetch(`${base}/api/admin/accounts/${user.id}/verify`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ verificationStatus: 'verified', notes: 'Checked' }),
  });
  assert.equal(decision.status, 200);
  assert.equal((await decision.json()).account.verificationStatus, 'verified');

  assert.equal((await get('/api/suppliers', token)).status, 200, 'through after approval');
});

test('an admin can reject a buyer, and rejection locks them out', options, async () => {
  const { user, token } = await signUp('buyer');
  const res = await fetch(`${base}/api/admin/accounts/${user.id}/verify`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ verificationStatus: 'rejected', notes: 'No' }),
  });
  assert.equal(res.status, 200);

  // Rejected is stopped earlier than pending — in requireAuth rather than at
  // the approval gate — but still as 403: the token is valid, the account just
  // is not allowed through. A token issued before the rejection is no good.
  const blocked = await get('/api/suppliers', token);
  assert.equal(blocked.status, 403);
  assert.match((await blocked.json()).error, /rejected/i);
});

test('the admin account cannot be reviewed through the queue', options, async () => {
  const me = await get('/api/auth/me', adminToken);
  const { user: admin } = await me.json();

  const res = await fetch(`${base}/api/admin/accounts/${admin.id}/verify`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ verificationStatus: 'rejected' }),
  });
  assert.equal(res.status, 404, 'there is nobody above the admin to approve them');
});

test('anonymous callers reach no marketplace data at all', options, async () => {
  for (const path of ['/api/suppliers', '/api/rfqs', '/api/messages/conversations', '/api/admin/users']) {
    assert.equal((await get(path)).status, 401, path);
  }
});

test('an approved account does get through', options, async () => {
  assert.ok(adminToken, 'admin signed in earlier');
  assert.equal((await get('/api/suppliers', adminToken)).status, 200);
});
