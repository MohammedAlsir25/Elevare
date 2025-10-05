
import { Router } from 'express';
import { processQuery } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All AI routes should be protected
router.use(protect);

router.post('/query', processQuery);

export default router;