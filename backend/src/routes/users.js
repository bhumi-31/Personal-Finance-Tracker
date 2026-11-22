import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { getUsers, updateUserRole } from '../controllers/userController.js';

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
router.get('/', getUsers);

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
  updateUserRole
);

export default router;
