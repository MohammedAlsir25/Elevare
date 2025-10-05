
import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllProducts)
    .post(createProduct);

router.route('/:id')
    .put(updateProduct)
    .delete(deleteProduct);

export default router;