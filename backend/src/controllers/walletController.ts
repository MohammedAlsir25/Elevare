

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { Wallet } from '../../../types';

// Omit id for creation
type WalletData = Omit<Wallet, 'id' | 'companyId'>;

export const getAllWallets = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const query = `
            SELECT id, name, balance, currency, company_id as "companyId"
            FROM wallets
            WHERE company_id = $1
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createWallet = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { name, balance, currency } = req.body as WalletData;

        if (!name || balance === undefined || !currency) {
            return res.status(400).json({ message: 'Missing required fields: name, balance, currency' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO wallets (id, name, balance, currency, company_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, balance, currency, company_id as "companyId";
        `;
        const values = [id, name, balance, currency, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateWallet = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { name, balance, currency } = req.body as WalletData;

        if (!name || balance === undefined || !currency) {
            return res.status(400).json({ message: 'Missing required fields: name, balance, currency' });
        }

        const query = `
            UPDATE wallets
            SET name = $1, balance = $2, currency = $3
            WHERE id = $4 AND company_id = $5
            RETURNING id, name, balance, currency, company_id as "companyId";
        `;
        const values = [name, balance, currency, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Wallet not found or you do not have permission to edit it.' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error updating wallet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteWallet = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;

        const query = `DELETE FROM wallets WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Wallet not found or you do not have permission to delete it.' });
        }
        
        res.json({ id });

    } catch (error) {
        console.error('Error deleting wallet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};