

import express from 'express';
import { getAllWallets, createWallet, updateWallet, deleteWallet } from '../controllers/walletController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

router.route('/')
    .get(getAllWallets)
    .post(createWallet);

router.route('/:id')
    .put(updateWallet)
    .delete(deleteWallet);

export default router;