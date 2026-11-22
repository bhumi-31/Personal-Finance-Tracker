import pool from '../config/db.js';
import { getCache, setCache, getCacheStats as getRedisCacheStats } from '../config/redis.js';

export const getSummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const cacheKey = `analytics:${req.user.role === 'admin' ? 'admin' : req.user.id}:summary:${year || 'all'}:${month || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (req.user.role !== 'admin') {
      conditions.push(`t.user_id = $${idx++}`);
      params.push(req.user.id);
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM t.date) = $${idx++}`);
      params.push(parseInt(year));
    }

    if (month) {
      conditions.push(`EXTRACT(MONTH FROM t.date) = $${idx++}`);
      params.push(parseInt(month));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalsQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS balance,
        COUNT(t.id) AS count
      FROM transactions t
      ${whereClause}
    `;

    const totalsResult = await pool.query(totalsQuery, params);
    const totals = totalsResult.rows[0];

    const response = {
      totalIncome: parseFloat(totals.total_income),
      totalExpenses: parseFloat(totals.total_expenses),
      balance: parseFloat(totals.balance),
      transactionCount: parseInt(totals.count),
    };

    await setCache(cacheKey, response, 900);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const cacheKey = `analytics:${req.user.role === 'admin' ? 'admin' : req.user.id}:catbreakdown:${year || 'all'}:${month || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (req.user.role !== 'admin') {
      conditions.push(`t.user_id = $${idx++}`);
      params.push(req.user.id);
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM t.date) = $${idx++}`);
      params.push(parseInt(year));
    }

    if (month) {
      conditions.push(`EXTRACT(MONTH FROM t.date) = $${idx++}`);
      params.push(parseInt(month));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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
      ${whereClause}
      GROUP BY c.id, c.name, c.icon, c.type
      ORDER BY total DESC
    `;

    const result = await pool.query(query, params);

    const breakdown = result.rows.map((r) => ({
      ...r,
      total: parseFloat(r.total),
      transaction_count: parseInt(r.transaction_count),
    }));

    const response = { breakdown };
    await setCache(cacheKey, response, 900);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const { year } = req.query;
    const cacheKey = `analytics:${req.user.role === 'admin' ? 'admin' : req.user.id}:trends:${year || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (req.user.role !== 'admin') {
      conditions.push(`t.user_id = $${idx++}`);
      params.push(req.user.id);
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM t.date) = $${idx++}`);
      params.push(parseInt(year));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        TO_CHAR(date_trunc('month', t.date), 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS net
      FROM transactions t
      ${whereClause}
      GROUP BY month
      ORDER BY month ASC
    `;

    const result = await pool.query(query, params);

    const trends = result.rows.map((r) => ({
      month: r.month,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
      net: parseFloat(r.net),
    }));

    const response = { trends };
    await setCache(cacheKey, response, 900);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getCacheStats = (req, res) => {
  const stats = getRedisCacheStats();
  const total = stats.hits + stats.misses;
  res.json({
    ...stats,
    total,
    hitRate: total > 0 ? ((stats.hits / total) * 100).toFixed(2) + '%' : 'N/A',
  });
};
