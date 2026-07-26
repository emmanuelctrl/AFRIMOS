import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { rateLimitFailures, clientIp, __resetRateLimits } from '../src/middleware/rateLimit.js';

/**
 * The limiter on its own, with the handlers stubbed — no database needed, so
 * this runs anywhere including CI. The behaviour it pins down is the reason
 * the admin login is not brute-forceable: see auth.gate.test.js for the same
 * guarantees exercised through the real routes.
 */

let server;
let base;

const post = (path, body) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

before(async () => {
  const app = express();
  app.use(express.json());

  app.post(
    '/admin-login',
    rateLimitFailures({
      name: 'admin-login',
      max: 5,
      windowMs: 60_000,
      message: 'Too many incorrect attempts.',
    }),
    (req, res) => {
      if (req.body.password !== '0703') {
        req.limiter.recordFailure();
        return res.status(401).json({ error: 'Incorrect password' });
      }
      req.limiter.reset();
      res.json({ ok: true });
    }
  );

  app.post(
    '/login',
    rateLimitFailures({
      name: 'login',
      max: 10,
      windowMs: 60_000,
      message: 'Too many failed sign-in attempts.',
      key: (req) => `${clientIp(req)}|${String(req.body?.email || '').toLowerCase()}`,
    }),
    (req, res) => {
      if (req.body.password !== 'right') {
        req.limiter.recordFailure();
        return res.status(401).json({ error: 'bad' });
      }
      req.limiter.reset();
      res.json({ ok: true });
    }
  );

  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => __resetRateLimits());
after(() => server.close());

test('wrong guesses are refused, then blocked once the window fills', async () => {
  const codes = [];
  for (let i = 0; i < 7; i++) {
    codes.push((await post('/admin-login', { password: String(1000 + i) })).status);
  }
  assert.deepEqual(codes, [401, 401, 401, 401, 401, 429, 429]);
});

test('the block holds against the correct password too', async () => {
  // Otherwise a long enough run of guesses still lands on the right one.
  for (let i = 0; i < 5; i++) await post('/admin-login', { password: 'nope' });

  const res = await post('/admin-login', { password: '0703' });
  assert.equal(res.status, 429);
  assert.ok(Number(res.headers.get('retry-after')) > 0, 'Retry-After header');
  assert.ok((await res.json()).retryAfter > 0, 'retryAfter in body');
});

test('signing in successfully clears the count', async () => {
  for (let i = 0; i < 4; i++) await post('/admin-login', { password: 'nope' });
  assert.equal((await post('/admin-login', { password: '0703' })).status, 200);

  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await post('/admin-login', { password: 'nope' })).status);
  assert.deepEqual(codes, [401, 401, 401, 401, 401, 429], 'full window available again');
});

test('correct sign-ins are never limited', async () => {
  for (let i = 0; i < 20; i++) {
    assert.equal((await post('/admin-login', { password: '0703' })).status, 200);
  }
});

test('one account being guessed does not lock out another on the same address', async () => {
  for (let i = 0; i < 12; i++) await post('/login', { email: 'a@x.com', password: 'wrong' });

  assert.equal((await post('/login', { email: 'a@x.com', password: 'right' })).status, 429);
  assert.equal(
    (await post('/login', { email: 'b@x.com', password: 'right' })).status,
    200,
    'a bystander behind the same proxy is unaffected'
  );
});

test('the email in the key is case-insensitive', async () => {
  for (let i = 0; i < 10; i++) await post('/login', { email: 'c@x.com', password: 'wrong' });
  assert.equal((await post('/login', { email: 'C@X.com', password: 'right' })).status, 429);
});
