

import express from 'express';
import { getAllTimesheets, createTimesheet, updateTimesheet, deleteTimesheet } from '../controllers/timesheetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAllTimesheets)
    .post(createTimesheet);

router.route('/:id')
    .put(updateTimesheet)
    .delete(deleteTimesheet);

export default router;