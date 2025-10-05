
import { Router } from 'express';
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

router.route('/')
    .get(getAllTransactions)
    .post(createTransaction);

router.route('/:id')
    .put(updateTransaction)
    .delete(deleteTransaction);

export default router;