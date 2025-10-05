

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiFinancialGoalData, TransactionType } from '../../../types';

export const getAllGoals = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, name, target_amount as "targetAmount", current_amount as "currentAmount", deadline, company_id as "companyId"
            FROM financial_goals
            WHERE company_id = $1
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createGoal = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { name, targetAmount, currentAmount, deadline } = req.body as ApiFinancialGoalData;

        if (!name || targetAmount === undefined || currentAmount === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO financial_goals (id, name, target_amount, current_amount, deadline, company_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, target_amount as "targetAmount", current_amount as "currentAmount", deadline, company_id as "companyId";
        `;
        const values = [id, name, targetAmount, currentAmount, deadline, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { name, targetAmount, currentAmount, deadline } = req.body as ApiFinancialGoalData;

        if (!name || targetAmount === undefined || currentAmount === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE financial_goals
            SET name = $1, target_amount = $2, current_amount = $3, deadline = $4
            WHERE id = $5 AND company_id = $6
            RETURNING id, name, target_amount as "targetAmount", current_amount as "currentAmount", deadline, company_id as "companyId";
        `;
        const values = [name, targetAmount, currentAmount, deadline, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Goal not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM financial_goals WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'Goal not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addContribution = async (req: AuthRequest, res: Response) => {
    try {
        const { id: goalId } = req.params;
        const { amount, walletId } = req.body;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        if (!amount || !walletId) {
            return res.status(400).json({ message: 'Amount and walletId are required.' });
        }

        // TODO: This should be a database transaction
        // 1. Get the goal and verify ownership
        const goalQuery = `SELECT * FROM financial_goals WHERE id = $1 AND company_id = $2;`;
        const goalResult = await db.query(goalQuery, [goalId, companyId]);
        if (goalResult.rowCount === 0) return res.status(404).json({ message: 'Goal not found.' });
        const goal = goalResult.rows[0];

        // 2. Update the goal's current amount
        const newCurrentAmount = parseFloat(goal.current_amount) + parseFloat(amount);
        const updateGoalQuery = `
            UPDATE financial_goals SET current_amount = $1 WHERE id = $2
            RETURNING id, name, target_amount as "targetAmount", current_amount as "currentAmount", deadline, company_id as "companyId";
        `;
        const updatedGoalResult = await db.query(updateGoalQuery, [newCurrentAmount, goalId]);
        
        // 3. Create a corresponding expense transaction
        const transactionId = uuidv4();
        const transactionDate = new Date().toISOString().split('T')[0];
        const description = `Contribution to goal: ${goal.name}`;
        const transactionAmount = -Math.abs(amount);
        const categoryId = 'cat-exp10'; // Default to "Bank Transfers & Fees"

        const walletQuery = `SELECT currency FROM wallets WHERE id = $1 AND company_id = $2;`;
        const walletResult = await db.query(walletQuery, [walletId, companyId]);
        if (walletResult.rowCount === 0) return res.status(404).json({ message: 'Wallet not found.' });
        const currency = walletResult.rows[0].currency;
        
        const createTransactionQuery = `
            INSERT INTO transactions (id, date, description, amount, currency, type, category_id, wallet_id, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, date, description, amount, currency, type, color, category_id as "categoryId", wallet_id as "walletId", company_id as "companyId";
        `;
        const transactionValues = [transactionId, transactionDate, description, transactionAmount, currency, TransactionType.EXPENSE, categoryId, walletId, companyId];
        const newTransactionResult = await db.query(createTransactionQuery, transactionValues);

        res.json({
            updatedGoal: updatedGoalResult.rows[0],
            newTransaction: newTransactionResult.rows[0]
        });

    } catch (error) {
        console.error('Error adding contribution:', error);
        res.status(500).json({ message: 'Server error' });
    }
}