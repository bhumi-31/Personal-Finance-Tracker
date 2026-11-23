import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { authLimiter, transactionLimiter, analyticsLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';

const app = express();
app.set('trust proxy', 1);

// ── Root redirect to API Docs ───────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// ── Global middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const configuredOrigins = (process.env.CLIENT_URL || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (
      !origin ||
      configuredOrigins.length === 0 ||
      configuredOrigins.includes('*')
    ) {
      return callback(null, true);
    }

    try {
      const originUrl = new URL(origin);
      if (originUrl.protocol === 'https:' && originUrl.hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch {
      // Fall through to the configured-origin check below.
    }

    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
}));
app.use(express.json({ limit: '10kb' }));

// ── Swagger docs ────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Finance Tracker API Docs',
}));

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes with rate limiters ───────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionLimiter, transactionRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// ── Error handling ──────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
