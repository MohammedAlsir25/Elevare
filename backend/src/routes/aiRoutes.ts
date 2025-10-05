

import express from 'express';
import { processQuery } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All AI routes should be protected
router.use(protect);

router.post('/query', processQuery);

export default router;