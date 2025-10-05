

import express from 'express';
import { getAllContacts, createContact, updateContact, deleteContact } from '../controllers/contactController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

router.route('/')
    .get(getAllContacts)
    .post(createContact);

router.route('/:id')
    .put(updateContact)
    .delete(deleteContact);

export default router;