import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

// All user routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin only
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user, read-only]
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/role',
  [
    body('role')
      .isIn(['admin', 'user', 'read-only'])
      .withMessage('Role must be admin, user, or read-only'),
    handleValidation,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Prevent admin from changing their own role
      if (id === req.user.id) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }

      const result = await pool.query(
        `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2
         RETURNING id, email, name, role, updated_at`,
        [role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Role updated', user: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
