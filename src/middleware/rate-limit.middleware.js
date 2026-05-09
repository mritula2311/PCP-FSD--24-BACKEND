const authAttempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

export const authRateLimiter = (req, res, next) => {
  const key = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();

  const entry = authAttempts.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  entry.count += 1;
  authAttempts.set(key, entry);

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many authentication requests, please try again later.' });
  }

  next();
};