
import { Router } from 'express';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllEmployees)
    .post(createEmployee);

router.route('/:id')
    .put(updateEmployee)
    .delete(deleteEmployee);

export default router;