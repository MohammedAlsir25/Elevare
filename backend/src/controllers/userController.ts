

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiAdminUserData } from '../../../types';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, name, email, role, last_login as "lastLogin", company_id as "companyId"
            FROM users WHERE company_id = $1 ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { name, email, role } = req.body as ApiAdminUserData;

        // NOTE: In a real app, we'd hash a temporary password or send an invite link.
        // For this app, we'll create the user with a null password hash.
        const id = uuidv4();
        const lastLogin = new Date().toISOString();
        const query = `
            INSERT INTO users (id, name, email, role, last_login, company_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, role, last_login as "lastLogin", company_id as "companyId";
        `;
        const values = [id, name, email, role, lastLogin, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { name, email, role } = req.body as ApiAdminUserData;
        
        const query = `
            UPDATE users SET name = $1, email = $2, role = $3
            WHERE id = $4 AND company_id = $5
            RETURNING id, name, email, role, last_login as "lastLogin", company_id as "companyId";
        `;
        const values = [name, email, role, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'User not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM users WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'User not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};