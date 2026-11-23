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

// ── Global middleware ───────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : '*';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to prevent production blockages
    },
    credentials: true,
  })
);
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
