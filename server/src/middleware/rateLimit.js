/**
 * Fixed-window rate limiting for credential endpoints.
 *
 * Written in-process rather than pulling in a dependency: this app runs as a
 * single Express instance, and the counters only need to outlive a burst of
 * guesses. If it is ever run behind more than one instance, each process keeps
 * its own counters and the effective limit multiplies by the instance count —
 * that is the point to move to a shared store (Redis) or `express-rate-limit`
 * with one.
 *
 * Failures are what count, not requests: someone signing in correctly ten times
 * is not an attack and should never be locked out for it.
 */

/** Buckets keyed by `${name}:${key}`, pruned lazily as requests come in. */
const buckets = new Map();

/**
 * Caller's address. `req.ip` respects Express's `trust proxy` setting, so it is
 * the socket address by default and the real client only where the deployment
 * has said a proxy is in front — a raw `x-forwarded-for` read would let anyone
 * spoof their way into a fresh bucket.
 */
export function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Drop entries whose window has closed. Called on each request against any
 * limiter, which is enough to keep the map bounded on a long-running process.
 */
function prune(now) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

/**
 * @param {object}   options
 * @param {string}   options.name     Distinguishes limiters sharing a key.
 * @param {number}   options.max      Failures allowed inside the window.
 * @param {number}   options.windowMs Window length in milliseconds.
 * @param {string}   options.message  Sent with the 429.
 * @param {(req: import('express').Request) => string} [options.key]
 *   What to count against. Defaults to the client address. Endpoints that
 *   identify an account should fold that in, so that every user behind one
 *   corporate NAT or proxy does not share a single bucket.
 */
export function rateLimitFailures({ name, max, windowMs, message, key = clientIp }) {
  return (req, res, next) => {
    const now = Date.now();
    prune(now);

    const bucketKey = `${name}:${key(req)}`;
    const entry = buckets.get(bucketKey);

    if (entry && entry.count >= max && entry.resetAt > now) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: message, retryAfter });
    }

    // Handlers call these rather than the middleware inferring from the status
    // code, so a 401 raised for some *other* reason never burns someone's quota.
    req.limiter = {
      recordFailure() {
        const current = buckets.get(bucketKey);
        if (current && current.resetAt > now) current.count += 1;
        else buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      },
      reset() {
        buckets.delete(bucketKey);
      },
    };

    next();
  };
}

/** Test seam — there is no other way to get a clean slate between cases. */
export function __resetRateLimits() {
  buckets.clear();
}
