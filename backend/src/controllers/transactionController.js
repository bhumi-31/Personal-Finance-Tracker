import pool from '../config/db.js';
import { getCache, setCache, invalidateCache } from '../config/redis.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category_id, type, start_date, end_date, search } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit)));

    // Build cache key
    const cacheKey = `txn:${req.user.id}:${JSON.stringify(req.query)}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Build query dynamically
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    // Admin sees all; others see only their own
    if (req.user.role !== 'admin') {
      conditions.push(`t.user_id = $${paramIdx++}`);
      params.push(req.user.id);
    }

    if (category_id) {
      conditions.push(`t.category_id = $${paramIdx++}`);
      params.push(parseInt(category_id));
    }
    if (type && ['income', 'expense'].includes(type)) {
      conditions.push(`t.type = $${paramIdx++}`);
      params.push(type);
    }
    if (start_date) {
      conditions.push(`t.date >= $${paramIdx++}`);
      params.push(start_date);
    }
    if (end_date) {
      conditions.push(`t.date <= $${paramIdx++}`);
      params.push(end_date);
    }
    if (search) {
      conditions.push(`t.description ILIKE $${paramIdx++}`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `SELECT COUNT(*) FROM transactions t ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Fetch page
    const dataQuery = `
      SELECT t.id, t.user_id, t.category_id, c.name AS category_name, c.icon AS category_icon,
             t.type, t.amount, t.description, t.date, t.created_at, t.updated_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    params.push(pageLimit, offset);

    const dataResult = await pool.query(dataQuery, params);

    const response = {
      transactions: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit),
      },
    };

    await setCache(cacheKey, response, 300); // 5 min cache
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.id, t.user_id, t.category_id, c.name AS category_name, c.icon AS category_icon,
              t.type, t.amount, t.description, t.date, t.created_at, t.updated_at
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const tx = result.rows[0];

    // Non-admin can only see their own
    if (req.user.role !== 'admin' && tx.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. Not your transaction.' });
    }

    res.json({ transaction: tx });
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { category_id, type, amount, description, date } = req.body;

    const result = await pool.query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, category_id, type, amount, description || null, date]
    );

    // Invalidate caches for this user
    await invalidateCache(`txn:${req.user.id}:*`);
    await invalidateCache(`analytics:${req.user.id}:*`);
    if (req.user.role === 'admin') {
      await invalidateCache('analytics:admin:*');
    }

    res.status(201).json({ message: 'Transaction created', transaction: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, type, amount, description, date } = req.body;

    // Check existence and ownership
    const existing = await pool.query('SELECT user_id FROM transactions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 'user' role can only update their own
    if (req.user.role === 'user' && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own transactions' });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3, description = $4, date = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [category_id, type, amount, description || null, date, id]
    );

    // Invalidate caches
    await invalidateCache(`txn:${req.user.id}:*`);
    await invalidateCache(`analytics:${req.user.id}:*`);
    if (req.user.role === 'admin') {
      await invalidateCache('analytics:admin:*');
    }

    res.json({ message: 'Transaction updated', transaction: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check existence and ownership
    const existing = await pool.query('SELECT user_id FROM transactions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 'user' role can only delete their own
    if (req.user.role === 'user' && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own transactions' });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);

    // Invalidate caches
    await invalidateCache(`txn:${req.user.id}:*`);
    await invalidateCache(`analytics:${req.user.id}:*`);
    if (req.user.role === 'admin') {
      await invalidateCache('analytics:admin:*');
    }

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

