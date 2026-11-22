import pool from '../config/db.js';
import { getCache, setCache } from '../config/redis.js';

export const getCategories = async (req, res, next) => {
  try {
    const cacheKey = 'categories:all';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ categories: cached, fromCache: true });
    }

    const result = await pool.query(
      'SELECT id, name, type, icon FROM categories ORDER BY type, name'
    );

    // Cache for 1 hour per spec
    await setCache(cacheKey, result.rows, 3600);

    res.json({ categories: result.rows, fromCache: false });
  } catch (err) {
    next(err);
  }
};
