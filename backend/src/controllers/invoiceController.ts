

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiInvoiceData } from '../../../types';

export const getAllInvoices = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const query = `
            SELECT 
                id, invoice_number as "invoiceNumber", customer_id as "customerId",
                issue_date as "issueDate", due_date as "dueDate",
                line_items as "lineItems", total_amount as "totalAmount",
                status, pdf_url as "pdfUrl", company_id as "companyId"
            FROM invoices
            WHERE company_id = $1
            ORDER BY issue_date DESC, id DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { customerId, issueDate, dueDate, lineItems, totalAmount, status } = req.body as ApiInvoiceData;

        if (!customerId || !issueDate || !dueDate || !lineItems || !totalAmount || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Generate invoice number
        const countQuery = 'SELECT COUNT(*) FROM invoices WHERE company_id = $1';
        const countResult = await db.query(countQuery, [companyId]);
        const nextInvoiceNum = parseInt(countResult.rows[0].count, 10) + 1;
        const invoiceNumber = `INV-${nextInvoiceNum.toString().padStart(3, '0')}`;
        
        const id = uuidv4();
        const query = `
            INSERT INTO invoices (id, invoice_number, customer_id, issue_date, due_date, line_items, total_amount, status, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, invoice_number as "invoiceNumber", customer_id as "customerId", issue_date as "issueDate", due_date as "dueDate", line_items as "lineItems", total_amount as "totalAmount", status, company_id as "companyId";
        `;
        // lineItems are passed as a JSON string
        const values = [id, invoiceNumber, customerId, issueDate, dueDate, JSON.stringify(lineItems), totalAmount, status, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;
        const { customerId, issueDate, dueDate, lineItems, totalAmount, status } = req.body as ApiInvoiceData;

        if (!customerId || !issueDate || !dueDate || !lineItems || !totalAmount || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE invoices
            SET customer_id = $1, issue_date = $2, due_date = $3, line_items = $4, total_amount = $5, status = $6
            WHERE id = $7 AND company_id = $8
            RETURNING id, invoice_number as "invoiceNumber", customer_id as "customerId", issue_date as "issueDate", due_date as "dueDate", line_items as "lineItems", total_amount as "totalAmount", status, company_id as "companyId";
        `;
        const values = [customerId, issueDate, dueDate, JSON.stringify(lineItems), totalAmount, status, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Invoice not found or you do not have permission to edit it.' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const companyId = req.user.companyId;

        const query = `DELETE FROM invoices WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Invoice not found or you do not have permission to delete it.' });
        }
        
        res.json({ id });

    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ message: 'Server error' });
    }
};