

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiAccountData } from '../../../types';

export const getAllAccounts = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, code, name, type, company_id as "companyId"
            FROM accounts WHERE company_id = $1 ORDER BY code ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createAccount = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { code, name, type } = req.body as ApiAccountData;

        if (!code || !name || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO accounts (id, code, name, type, company_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, code, name, type, company_id as "companyId";
        `;
        const values = [id, code, name, type, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { code, name, type } = req.body as ApiAccountData;

        if (!code || !name || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE accounts SET code = $1, name = $2, type = $3
            WHERE id = $4 AND company_id = $5
            RETURNING id, code, name, type, company_id as "companyId";
        `;
        const values = [code, name, type, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Account not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM accounts WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'Account not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};