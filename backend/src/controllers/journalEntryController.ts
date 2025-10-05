

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiJournalEntryData } from '../../../types';

export const getAllJournalEntries = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, date, ref, lines, company_id as "companyId"
            FROM journal_entries WHERE company_id = $1 ORDER BY date DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createJournalEntry = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { date, ref, lines } = req.body as ApiJournalEntryData;

        if (!date || !ref || !lines) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO journal_entries (id, date, ref, lines, company_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, date, ref, lines, company_id as "companyId";
        `;
        const values = [id, date, ref, JSON.stringify(lines), companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateJournalEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { date, ref, lines } = req.body as ApiJournalEntryData;

        if (!date || !ref || !lines) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE journal_entries SET date = $1, ref = $2, lines = $3
            WHERE id = $4 AND company_id = $5
            RETURNING id, date, ref, lines, company_id as "companyId";
        `;
        const values = [date, ref, JSON.stringify(lines), id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Journal entry not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating journal entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteJournalEntry = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM journal_entries WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'Journal entry not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};