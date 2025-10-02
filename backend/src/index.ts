import dotenv from 'dotenv';
// Load environment variables from .env file
// This MUST be at the top, before any other imports that need process.env
dotenv.config();

// FIX: Changed require to ES6-style imports to fix module format errors.
import express from 'express';
import cors from 'cors';
import db from './db';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Allow requests from our frontend
// FIX: Cast express.json() to any to resolve 'No overload matches this call' error. This appears to be caused by a type definition issue in the environment.
app.use(express.json() as any); // Allow the server to understand JSON data

// Routes
app.use('/api/auth', authRoutes);

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