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
  origin: process.env.CLIENT_URL,
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
