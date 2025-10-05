
import { Router } from 'express';
import { getAllPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, receiveOrder } from '../controllers/purchaseOrderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllPurchaseOrders)
    .post(createPurchaseOrder);

router.route('/:id')
    .put(updatePurchaseOrder)
    .delete(deletePurchaseOrder);
    
router.post('/:id/receive', receiveOrder);

export default router;