

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiProductData } from '../../../types';

export const getAllProducts = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, sku, name, description, price, cost, stock, company_id as "companyId"
            FROM products WHERE company_id = $1 ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { sku, name, description, price, cost, stock } = req.body as ApiProductData;

        if (!sku || !name || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO products (id, sku, name, description, price, cost, stock, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, sku, name, description, price, cost, stock, company_id as "companyId";
        `;
        const values = [id, sku, name, description, price, cost, stock, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { sku, name, description, price, cost, stock } = req.body as ApiProductData;

        if (!sku || !name || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE products SET sku = $1, name = $2, description = $3, price = $4, cost = $5, stock = $6
            WHERE id = $7 AND company_id = $8
            RETURNING id, sku, name, description, price, cost, stock, company_id as "companyId";
        `;
        const values = [sku, name, description, price, cost, stock, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Product not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM products WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'Product not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};