import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCategories } from '../controllers/categoryController.js';

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
router.get('/', getCategories);

export default router;
