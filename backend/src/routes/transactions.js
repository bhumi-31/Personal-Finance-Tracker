import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { transactionValidation } from '../middleware/validate.js';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List transactions (paginated, filterable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/', getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get a single transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Not found
 */
router.get('/:id', getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_id, type, amount, date]
 *             properties:
 *               category_id: { type: integer }
 *               type: { type: string, enum: [income, expense] }
 *               amount: { type: number }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Transaction created
 *       403:
 *         description: Forbidden (read-only users)
 */
router.post('/', authorize('admin', 'user'), transactionValidation, createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction
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
 *             required: [category_id, type, amount, date]
 *             properties:
 *               category_id: { type: integer }
 *               type: { type: string, enum: [income, expense] }
 *               amount: { type: number }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Transaction updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('admin', 'user'), transactionValidation, updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', authorize('admin', 'user'), deleteTransaction);

export default router;
