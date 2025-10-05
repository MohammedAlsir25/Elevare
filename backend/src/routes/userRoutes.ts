
import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

export default router;