import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getCacheStats,
} from '../controllers/analyticsController.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Monthly/yearly overview (total income, expenses, balance)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [month, year], default: month }
 *     responses:
 *       200:
 *         description: Financial summary
 */
router.get('/summary', getSummary);

/**
 * @swagger
 * /api/analytics/category-breakdown:
 *   get:
 *     tags: [Analytics]
 *     summary: Category-wise expense breakdown
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get('/category-breakdown', getCategoryBreakdown);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Monthly income vs expense trends for the last 12 months
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend data
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /api/analytics/cache-stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Cache hit/miss statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics
 */
router.get('/cache-stats', getCacheStats);

export default router;
