import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.ts';
// FIX: Corrected import path for shared types file.
import { UserRole } from '../../../types.ts';

// We need a user type for the database query result
interface DbUser {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    company_id: string;
}

export const register = async (req: Request, res: Response) => {
    // FIX: Cast req to any to access 'body' due to a type definition issue.
    const { name, email, password, role, companyId } = (req as any).body;

    if (!name || !email || !password || !role || !companyId) {
        // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
        return (res as any).status(400).json({ message: 'All fields are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const id = uuidv4();

        const newUserQuery = `
            INSERT INTO users (id, name, email, password_hash, role, company_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, role, company_id;
        `;

        const { rows } = await db.query(newUserQuery, [id, name, email, password_hash, role, companyId]);

        // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
        (res as any).status(201).json(rows[0]);

    } catch (error) {
        console.error('Registration error:', error);
        // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
        (res as any).status(500).json({ message: 'Server error during registration.' });
    }
};

export const login = async (req: Request, res: Response) => {
    // FIX: Cast req to any to access 'body' due to a type definition issue.
    const { email, password } = (req as any).body;

    if (!email || !password) {
        // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
        return (res as any).status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const userQuery = 'SELECT * FROM users WHERE email = $1;';
        const { rows } = await db.query(userQuery, [email]);
        const user: DbUser | undefined = rows[0];

        if (!user) {
            // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
            return (res as any).status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
            return (res as any).status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.company_id
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_default_secret', {
            expiresIn: '1h',
        });

        // FIX: Cast res to any to access 'json' due to a type definition issue.
        (res as any).json({ token, user: payload.user });

    } catch (error) {
        console.error('Login error:', error);
        // FIX: Cast res to any to access 'status' and 'json' due to a type definition issue.
        (res as any).status(500).json({ message: 'Server error during login.' });
    }
};