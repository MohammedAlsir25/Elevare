

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiPurchaseOrderData, PurchaseOrderLineItem } from '../../../types';

export const getAllPurchaseOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_date as "expectedDate", status, line_items as "lineItems", total_cost as "totalCost", company_id as "companyId"
            FROM purchase_orders WHERE company_id = $1 ORDER BY order_date DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching POs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { supplierId, orderDate, expectedDate, status, lineItems, totalCost } = req.body as ApiPurchaseOrderData;

        const countQuery = 'SELECT COUNT(*) FROM purchase_orders WHERE company_id = $1';
        const countResult = await db.query(countQuery, [companyId]);
        const nextPoNum = parseInt(countResult.rows[0].count, 10) + 1;
        const poNumber = `PO-${nextPoNum.toString().padStart(3, '0')}`;

        const id = uuidv4();
        const query = `
            INSERT INTO purchase_orders (id, po_number, supplier_id, order_date, expected_date, status, line_items, total_cost, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_date as "expectedDate", status, line_items as "lineItems", total_cost as "totalCost", company_id as "companyId";
        `;
        const values = [id, poNumber, supplierId, orderDate, expectedDate, JSON.stringify(lineItems), totalCost, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating PO:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePurchaseOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { supplierId, orderDate, expectedDate, status, lineItems, totalCost } = req.body as ApiPurchaseOrderData;

        const query = `
            UPDATE purchase_orders SET supplier_id = $1, order_date = $2, expected_date = $3, status = $4, line_items = $5, total_cost = $6
            WHERE id = $7 AND company_id = $8
            RETURNING id, po_number as "poNumber", supplier_id as "supplierId", order_date as "orderDate", expected_date as "expectedDate", status, line_items as "lineItems", total_cost as "totalCost", company_id as "companyId";
        `;
        const values = [supplierId, orderDate, expectedDate, status, JSON.stringify(lineItems), totalCost, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'PO not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating PO:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePurchaseOrder = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM purchase_orders WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'PO not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting PO:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const receiveOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id: poId } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        // NOTE: This should be a database transaction
        const poQuery = `
            UPDATE purchase_orders SET status = 'Received' WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const poResult = await db.query(poQuery, [poId, companyId]);
        if (poResult.rowCount === 0) return res.status(404).json({ message: 'PO not found or not authorized.' });
        const po = poResult.rows[0];

        const updatedProducts = [];
        for (const item of po.line_items as PurchaseOrderLineItem[]) {
            const updateStockQuery = `
                UPDATE products SET stock = stock + $1 WHERE id = $2 AND company_id = $3
                RETURNING id, sku, name, description, price, cost, stock, company_id as "companyId";
            `;
            const productResult = await db.query(updateStockQuery, [item.quantity, item.productId, companyId]);
            if (productResult.rowCount > 0) {
                updatedProducts.push(productResult.rows[0]);
            }
        }
        
        const updatedPO = {
            id: po.id,
            poNumber: po.po_number,
            supplierId: po.supplier_id,
            orderDate: po.order_date,
            expectedDate: po.expected_date,
            status: po.status,
            lineItems: po.line_items,
            totalCost: po.total_cost,
            companyId: po.company_id,
        };

        res.json({ updatedPO, updatedProducts });

    } catch (error) {
        console.error('Error receiving order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};