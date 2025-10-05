
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiTransaction, ApiTransactionData } from '../../../types';

// Get all transactions for the user's company
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
    try {
        // Add check for req.user to satisfy TypeScript's strict null checks.
        // The `protect` middleware ensures this will be present.
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const query = `
            SELECT 
                id, date, description, amount, currency, type, color, 
                category_id as "categoryId", 
                wallet_id as "walletId", 
                company_id as "companyId"
            FROM transactions
            WHERE company_id = $1
            ORDER BY date DESC, id DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new transaction
export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        // Add check for req.user to satisfy TypeScript's strict null checks.
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { date, description, amount, currency, type, categoryId, walletId, color } = req.body as ApiTransactionData;

        // Basic validation
        if (!date || !description || amount === undefined || !type || !categoryId || !walletId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO transactions (id, date, description, amount, currency, type, category_id, wallet_id, company_id, color)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, date, description, amount, currency, type, color, category_id as "categoryId", wallet_id as "walletId", company_id as "companyId";
        `;
        const values = [id, date, description, amount, currency, type, categoryId, walletId, companyId, color];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing transaction
export const updateTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // Add check for req.user to satisfy TypeScript's strict null checks.
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { date, description, amount, currency, type, categoryId, walletId, color } = req.body as ApiTransactionData;

        // Basic validation
        if (!date || !description || amount === undefined || !type || !categoryId || !walletId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE transactions
            SET date = $1, description = $2, amount = $3, currency = $4, type = $5, category_id = $6, wallet_id = $7, color = $8
            WHERE id = $9 AND company_id = $10
            RETURNING id, date, description, amount, currency, type, color, category_id as "categoryId", wallet_id as "walletId", company_id as "companyId";
        `;
        const values = [date, description, amount, currency, type, categoryId, walletId, color, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Transaction not found or you do not have permission to edit it.' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a transaction
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        // Add check for req.user to satisfy TypeScript's strict null checks.
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;

        const query = `
            DELETE FROM transactions
            WHERE id = $1 AND company_id = $2;
        `;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Transaction not found or you do not have permission to delete it.' });
        }
        
        res.json({ id });

    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
