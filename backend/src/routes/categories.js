import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { getCache, setCache } from '../config/redis.js';

const router = Router();

// All category routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', async (req, res, next) => {
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
});

export default router;

