

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiBudgetData } from '../../../types';

export const getAllBudgets = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const query = `
            SELECT 
                id, category_id as "categoryId", period, amount, start_date as "startDate", company_id as "companyId"
            FROM budgets
            WHERE company_id = $1
            ORDER BY start_date DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { categoryId, period, amount, startDate } = req.body as ApiBudgetData;

        if (!categoryId || !period || amount === undefined || !startDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO budgets (id, category_id, period, amount, start_date, company_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, category_id as "categoryId", period, amount, start_date as "startDate", company_id as "companyId";
        `;
        const values = [id, categoryId, period, amount, startDate, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { categoryId, period, amount, startDate } = req.body as ApiBudgetData;

        if (!categoryId || !period || amount === undefined || !startDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE budgets
            SET category_id = $1, period = $2, amount = $3, start_date = $4
            WHERE id = $5 AND company_id = $6
            RETURNING id, category_id as "categoryId", period, amount, start_date as "startDate", company_id as "companyId";
        `;
        const values = [categoryId, period, amount, startDate, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Budget not found or not authorized.' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;

        const query = `DELETE FROM budgets WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Budget not found or not authorized.' });
        }
        
        res.json({ id });

    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};