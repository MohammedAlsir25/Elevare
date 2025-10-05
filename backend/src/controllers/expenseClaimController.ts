
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiExpenseClaimData, TransactionType } from '../../../types';

export const getAllExpenseClaims = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, employee_id as "employeeId", date, category_id as "categoryId", amount, description, status, company_id as "companyId"
            FROM expense_claims WHERE company_id = $1 ORDER BY date DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expense claims:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createExpenseClaim = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { employeeId, date, categoryId, amount, description, status } = req.body as ApiExpenseClaimData;

        if (!employeeId || !date || !categoryId || amount === undefined || !description || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO expense_claims (id, employee_id, date, category_id, amount, description, status, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, employee_id as "employeeId", date, category_id as "categoryId", amount, description, status, company_id as "companyId";
        `;
        const values = [id, employeeId, date, categoryId, amount, description, status, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating expense claim:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateExpenseClaim = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { employeeId, date, categoryId, amount, description, status } = req.body as ApiExpenseClaimData;

        if (!employeeId || !date || !categoryId || amount === undefined || !description || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE expense_claims
            SET employee_id = $1, date = $2, category_id = $3, amount = $4, description = $5, status = $6
            WHERE id = $7 AND company_id = $8
            RETURNING id, employee_id as "employeeId", date, category_id as "categoryId", amount, description, status, company_id as "companyId";
        `;
        const values = [employeeId, date, categoryId, amount, description, status, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Expense claim not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating expense claim:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const approveClaim = async (req: AuthRequest, res: Response) => {
    try {
        const { id: claimId } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        // NOTE: This should be a database transaction
        const claimQuery = `
            UPDATE expense_claims SET status = 'Approved' WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const claimResult = await db.query(claimQuery, [claimId, companyId]);
        if (claimResult.rowCount === 0) return res.status(404).json({ message: 'Claim not found or not authorized.' });

        const claim = claimResult.rows[0];
        
        const walletQuery = `SELECT id, currency FROM wallets WHERE company_id = $1 LIMIT 1;`;
        const walletResult = await db.query(walletQuery, [companyId]);
        if (walletResult.rowCount === 0) return res.status(400).json({ message: 'No wallet available to process payment.' });
        const wallet = walletResult.rows[0];
        
        const transactionId = uuidv4();
        const description = `Reimbursement: ${claim.description}`;
        const transactionAmount = -Math.abs(claim.amount);
        
        const createTxQuery = `
            INSERT INTO transactions (id, date, description, amount, currency, type, category_id, wallet_id, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, date, description, amount, currency, type, color, category_id as "categoryId", wallet_id as "walletId", company_id as "companyId";
        `;
        const txValues = [transactionId, new Date().toISOString().split('T')[0], description, transactionAmount, wallet.currency, TransactionType.EXPENSE, claim.category_id, wallet.id, companyId];
        const newTxResult = await db.query(createTxQuery, txValues);

        res.json({
            updatedClaim: {
                id: claim.id,
                employeeId: claim.employee_id,
                date: claim.date,
                categoryId: claim.category_id,
                amount: claim.amount,
                description: claim.description,
                status: claim.status,
                companyId: claim.company_id,
            },
            newTransaction: newTxResult.rows[0],
        });

    } catch (error) {
        console.error('Error approving claim:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
