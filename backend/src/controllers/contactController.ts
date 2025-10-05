
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiContactData } from '../../../types';

export const getAllContacts = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const query = `
            SELECT 
                id, name, company, email, phone, status,
                date_added as "dateAdded",
                contact_type as "contactType",
                company_id as "companyId"
            FROM contacts
            WHERE company_id = $1
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createContact = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { name, company, email, phone, status, contactType } = req.body as ApiContactData;

        if (!name || !company || !email || !status || !contactType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const dateAdded = new Date().toISOString();
        const query = `
            INSERT INTO contacts (id, name, company, email, phone, status, date_added, contact_type, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, name, company, email, phone, status, date_added as "dateAdded", contact_type as "contactType", company_id as "companyId";
        `;
        const values = [id, name, company, email, phone, status, dateAdded, contactType, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateContact = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { name, company, email, phone, status, contactType } = req.body as ApiContactData;

        if (!name || !company || !email || !status || !contactType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE contacts
            SET name = $1, company = $2, email = $3, phone = $4, status = $5, contact_type = $6
            WHERE id = $7 AND company_id = $8
            RETURNING id, name, company, email, phone, status, date_added as "dateAdded", contact_type as "contactType", company_id as "companyId";
        `;
        const values = [name, company, email, phone, status, contactType, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Contact not found or you do not have permission to edit it.' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteContact = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;

        const query = `DELETE FROM contacts WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Contact not found or you do not have permission to delete it.' });
        }
        
        res.json({ id });

    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
