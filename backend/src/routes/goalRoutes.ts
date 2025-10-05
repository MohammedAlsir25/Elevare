

import express from 'express';
import { getAllGoals, createGoal, updateGoal, deleteGoal, addContribution } from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAllGoals)
    .post(createGoal);

router.route('/:id')
    .put(updateGoal)
    .delete(deleteGoal);

router.post('/:id/contribute', addContribution);

export default router;