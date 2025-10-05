
import { Router } from 'express';
import { getAllExpenseClaims, createExpenseClaim, updateExpenseClaim, approveClaim } from '../controllers/expenseClaimController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllExpenseClaims)
    .post(createExpenseClaim);

router.route('/:id')
    .put(updateExpenseClaim);
    
router.post('/:id/approve', approveClaim);

export default router;