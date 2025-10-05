
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiEmployeeData } from '../../../types';

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, name, employee_id as "employeeId", email, phone, department, role, joining_date as "joiningDate", salary, company_id as "companyId"
            FROM employees WHERE company_id = $1 ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { name, email, phone, department, role, joiningDate, salary } = req.body as ApiEmployeeData;

        if (!name || !email || !role || !joiningDate || salary === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const countQuery = 'SELECT COUNT(*) FROM employees WHERE company_id = $1';
        const countResult = await db.query(countQuery, [companyId]);
        const nextEmployeeNum = parseInt(countResult.rows[0].count, 10) + 1;
        const employeeId = `E-${nextEmployeeNum.toString().padStart(3, '0')}`;

        const id = uuidv4();
        const query = `
            INSERT INTO employees (id, name, employee_id, email, phone, department, role, joining_date, salary, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, name, employee_id as "employeeId", email, phone, department, role, joining_date as "joiningDate", salary, company_id as "companyId";
        `;
        const values = [id, name, employeeId, email, phone, department, role, joiningDate, salary, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { name, email, phone, department, role, joiningDate, salary } = req.body as ApiEmployeeData;

        if (!name || !email || !role || !joiningDate || salary === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE employees
            SET name = $1, email = $2, phone = $3, department = $4, role = $5, joining_date = $6, salary = $7
            WHERE id = $8 AND company_id = $9
            RETURNING id, name, employee_id as "employeeId", email, phone, department, role, joining_date as "joiningDate", salary, company_id as "companyId";
        `;
        const values = [name, email, phone, department, role, joiningDate, salary, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Employee not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM employees WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'Employee not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
