import rateLimit from 'express-rate-limit';

/**
 * Auth limiter – 5 requests per 15 minutes per spec (relaxed to 100 in dev for testing).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

/**
 * Transaction limiter – 100 requests per hour (relaxed to 1000 in dev).
 */
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many transaction requests. Please try again later.' },
});

/**
 * Analytics limiter – 50 requests per hour (relaxed to 1000 in dev).
 */
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 50 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many analytics requests. Please try again later.' },
});
