

import express from 'express';
import { getAllJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../controllers/journalEntryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAllJournalEntries)
    .post(createJournalEntry);

router.route('/:id')
    .put(updateJournalEntry)
    .delete(deleteJournalEntry);

export default router;