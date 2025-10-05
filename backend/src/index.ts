

import dotenv from 'dotenv';
// Load environment variables from .env file
// This MUST be at the top, before any other imports that need process.env
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import db from './db';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import walletRoutes from './routes/walletRoutes';
import contactRoutes from './routes/contactRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import budgetRoutes from './routes/budgetRoutes';
import goalRoutes from './routes/goalRoutes';
import employeeRoutes from './routes/employeeRoutes';
import timesheetRoutes from './routes/timesheetRoutes';
import expenseClaimRoutes from './routes/expenseClaimRoutes';
import accountRoutes from './routes/accountRoutes';
import journalEntryRoutes from './routes/journalEntryRoutes';
import productRoutes from './routes/productRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import userRoutes from './routes/userRoutes';
import aiRoutes from './routes/aiRoutes';


const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow the server to understand JSON data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/expense-claims', expenseClaimRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/journal-entries', journalEntryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// A simple test route that also checks DB connection
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    return res.json({
      status: 'ok',
      message: 'Backend is running!',
      db: {
        status: 'ok',
        timestamp: rows[0].now,
      }
    });
  } catch (e) {
    console.error('Database connection error:', e);
    return res.status(500).json({
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