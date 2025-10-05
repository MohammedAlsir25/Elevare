
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { UserRole } from '../../../types';

// We need a user type for the database query result
interface DbUser {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    company_id: string;
}

interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    companyId: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

const generateTokens = (userPayload: any) => {
    const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET || 'your_default_secret', {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign(userPayload, process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret', {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};


export const register = async (req: Request, res: Response) => {
    const { name, email, password, role, companyId } = req.body as RegisterRequestBody;

    if (!name || !email || !password || !role || !companyId) {
        return res.status(400).json({ message: 'All fields are required.' });
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

        return res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequestBody;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const userQuery = 'SELECT * FROM users WHERE email = $1;';
        const { rows } = await db.query(userQuery, [email]);
        const user: DbUser | undefined = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
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

        const { accessToken, refreshToken } = generateTokens(payload);
        
        // Store refresh token in DB
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
        const storeTokenQuery = 'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)';
        await db.query(storeTokenQuery, [refreshToken, user.id, expiresAt]);

        return res.json({ accessToken, refreshToken, user: payload.user });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { token: requestToken } = req.body;
    if (!requestToken) {
        return res.status(401).json({ message: "Refresh token not provided."});
    }

    try {
        // Check if token exists in DB
        const tokenQuery = 'SELECT * FROM refresh_tokens WHERE token = $1';
        const { rows, rowCount } = await db.query(tokenQuery, [requestToken]);
        if (rowCount === 0) {
            return res.status(403).json({ message: "Invalid refresh token."});
        }
        
        const storedToken = rows[0];
        if (new Date(storedToken.expires_at) < new Date()) {
            // Clean up expired token
            await db.query('DELETE FROM refresh_tokens WHERE token = $1', [requestToken]);
            return res.status(403).json({ message: "Refresh token expired."});
        }
        
        // Verify the token
        const decoded = jwt.verify(requestToken, process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret');
        
        // Don't need to re-generate refresh token, just issue a new access token
        const payload = { user: (decoded as any).user };
        const { accessToken } = generateTokens(payload);
        
        res.json({ accessToken });

    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(403).json({ message: "Invalid refresh token."});
    }
};

export const logout = async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token is required." });
    }
    
    try {
        await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        return res.status(204).send(); // No Content
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Server error during logout." });
    }
};
