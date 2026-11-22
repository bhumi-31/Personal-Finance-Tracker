import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { getCache, setCache, getCacheStats } from '../config/redis.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * Helper: build a WHERE clause scoping to user's own transactions
 * (admin sees everything; user/read-only see only their own).
 */
function ownershipFilter(role, userId) {
  if (role === 'admin') return { clause: '', params: [], nextIdx: 1 };
  return { clause: 'WHERE t.user_id = $1', params: [userId], nextIdx: 2 };
}

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
router.get('/summary', async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const cacheKey = `analytics:${req.user.role === 'admin' ? 'admin' : req.user.id}:summary:${period}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const { clause, params } = ownershipFilter(req.user.role, req.user.id);
    const dateTrunc = period === 'year' ? 'year' : 'month';

    const query = `
      SELECT
        date_trunc('${dateTrunc}', t.date) AS period,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS balance
      FROM transactions t
      ${clause}
      GROUP BY period
      ORDER BY period DESC
    `;

    const result = await pool.query(query, params);

    const response = { summary: result.rows, period };
    await setCache(cacheKey, response, 900); // 15 min
    res.json(response);
  } catch (err) {
    next(err);
  }
});

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
router.get('/category-breakdown', async (req, res, next) => {
  try {
    const cacheKey = `analytics:${req.user.role === 'admin' ? 'admin' : req.user.id}:catbreakdown`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const { clause, params } = ownershipFilter(req.user.role, req.user.id);
    const extraAnd = clause ? 'AND' : 'WHERE';

    const query = `
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.type AS category_type,
        COALESCE(SUM(t.amount), 0) AS total,
        COUNT(t.id) AS transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${clause}
      GROUP BY c.id, c.name, c.icon, c.type
      ORDER BY total DESC
    `;

    const result = await pool.query(query, params);

    // Calculate percentages per type
    const totalExpense = result.rows
      .filter((r) => r.category_type === 'expense')
      .reduce((sum, r) => sum + parseFloat(r.total), 0);
    const totalIncome = result.rows
      .filter((r) => r.category_type === 'income')
      .reduce((sum, r) => sum + parseFloat(r.total), 0);

    const breakdown = result.rows.map((r) => {
      const typeTotal = r.category_type === 'expense' ? totalExpense : totalIncome;
      return {
        ...r,
        percentage: typeTotal > 0 ? ((parseFloat(r.total) / typeTotal) * 100).toFixed(2) : '0.00',
      };
    });

    const response = { breakdown, totals: { income: totalIncome, expense: totalExpense } };
    await setCache(cacheKey, response, 900);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

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
router.get('/trends', async (req, res, next) => {
  try {
    const cacheKey = `analytics:${req.user.role === 'admin' ? 'admin' : req.user.id}:trends`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const { clause, params, nextIdx } = ownershipFilter(req.user.role, req.user.id);
    const dateCondition = clause
      ? `${clause} AND t.date >= NOW() - INTERVAL '12 months'`
      : `WHERE t.date >= NOW() - INTERVAL '12 months'`;

    const query = `
      SELECT
        TO_CHAR(date_trunc('month', t.date), 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS net
      FROM transactions t
      ${dateCondition}
      GROUP BY month
      ORDER BY month ASC
    `;

    const result = await pool.query(query, params);

    const response = { trends: result.rows };
    await setCache(cacheKey, response, 900);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

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
router.get('/cache-stats', async (req, res) => {
  const stats = getCacheStats();
  const total = stats.hits + stats.misses;
  res.json({
    ...stats,
    total,
    hitRate: total > 0 ? ((stats.hits / total) * 100).toFixed(2) + '%' : 'N/A',
  });
});

export default router;
