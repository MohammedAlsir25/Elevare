

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiTimesheetEntryData } from '../../../types';

export const getAllTimesheets = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const query = `
            SELECT id, employee_id as "employeeId", date, hours, description, status, company_id as "companyId"
            FROM timesheets WHERE company_id = $1 ORDER BY date DESC;
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching timesheets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTimesheet = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { employeeId, date, hours, description, status } = req.body as ApiTimesheetEntryData;

        if (!employeeId || !date || hours === undefined || !description || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const id = uuidv4();
        const query = `
            INSERT INTO timesheets (id, employee_id, date, hours, description, status, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, employee_id as "employeeId", date, hours, description, status, company_id as "companyId";
        `;
        const values = [id, employeeId, date, hours, description, status, companyId];
        const { rows } = await db.query(query, values);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating timesheet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTimesheet = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;
        const { employeeId, date, hours, description, status } = req.body as ApiTimesheetEntryData;

        if (!employeeId || !date || hours === undefined || !description || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE timesheets
            SET employee_id = $1, date = $2, hours = $3, description = $4, status = $5
            WHERE id = $6 AND company_id = $7
            RETURNING id, employee_id as "employeeId", date, hours, description, status, company_id as "companyId";
        `;
        const values = [employeeId, date, hours, description, status, id, companyId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) return res.status(404).json({ message: 'Timesheet not found or not authorized.' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating timesheet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTimesheet = async (req: AuthRequest, res: Response) => {
     try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const companyId = req.user.companyId;

        const query = `DELETE FROM timesheets WHERE id = $1 AND company_id = $2;`;
        const { rowCount } = await db.query(query, [id, companyId]);

        if (rowCount === 0) return res.status(404).json({ message: 'Timesheet not found or not authorized.' });
        
        res.json({ id });
    } catch (error) {
        console.error('Error deleting timesheet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};