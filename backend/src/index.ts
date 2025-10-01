import dotenv from 'dotenv';
// Load environment variables from .env file
// This MUST be at the top, before any other imports that need process.env
dotenv.config();

// FIX: Changed require to ES6-style imports to fix module format errors.
import express from 'express';
import cors from 'cors';
import db from './db.ts';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow the server to understand JSON data

// A simple test route that also checks DB connection
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'Backend is running!',
      db: {
        status: 'ok',
        timestamp: rows[0].now,
      }
    });
  } catch (e) {
    console.error('Database connection error:', e);
    res.status(500).json({
      status: 'error',
      message: 'Backend is running, but database connection failed.',
      db: {
        status: 'error',
        details: (e as Error).message,
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});