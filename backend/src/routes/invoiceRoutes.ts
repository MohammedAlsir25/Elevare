
import { Router } from 'express';
import { getAllInvoices, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoiceController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllInvoices)
    .post(createInvoice);

router.route('/:id')
    .put(updateInvoice)
    .delete(deleteInvoice);

export default router;