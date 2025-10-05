
import { Router } from 'express';
import { getAllAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accountController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllAccounts)
    .post(createAccount);

router.route('/:id')
    .put(updateAccount)
    .delete(deleteAccount);

export default router;