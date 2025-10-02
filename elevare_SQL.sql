-- Full Database Schema for Elevare
-- Please execute this entire script in the pgAdmin Query Tool.

-- Drop all existing tables to ensure a clean start.
-- The 'CASCADE' option automatically removes dependent objects.
DROP TABLE IF EXISTS
    expense_claims,
    timesheet_entries,
    purchase_order_line_items,
    purchase_orders,
    journal_entry_lines,
    journal_entries,
    products,
    accounts,
    employees,
    financial_goals,
    budgets,
    invoice_line_items,
    invoices,
    contacts,
    recurring_transactions,
    transactions,
    categories,
    wallets,
    users,
    companies
CASCADE;

-- Create all tables in the correct order to respect dependencies.

CREATE TABLE companies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE wallets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE contacts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    date_added DATE NOT NULL,
    contact_type VARCHAR(50)[] NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE accounts (
    id VARCHAR(255) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL,
    cost NUMERIC(15, 2),
    stock INTEGER NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE employees (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    role VARCHAR(100),
    joining_date DATE,
    salary NUMERIC(15, 2),
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(id),
    wallet_id VARCHAR(255) REFERENCES wallets(id),
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE,
    color VARCHAR(7)
);

CREATE TABLE recurring_transactions (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(id),
    wallet_id VARCHAR(255) REFERENCES wallets(id),
    frequency VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id VARCHAR(255) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id VARCHAR(255) REFERENCES contacts(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    pdf_url TEXT,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE invoice_line_items (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    total NUMERIC(15, 2) NOT NULL
);

CREATE TABLE budgets (
    id VARCHAR(255) PRIMARY KEY,
    category_id VARCHAR(255) REFERENCES categories(id),
    period VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE financial_goals (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) NOT NULL,
    deadline DATE,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE journal_entries (
    id VARCHAR(255) PRIMARY KEY,
    date DATE NOT NULL,
    ref TEXT NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE journal_entry_lines (
    id VARCHAR(255) PRIMARY KEY,
    journal_entry_id VARCHAR(255) REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id VARCHAR(255) REFERENCES accounts(id),
    debit NUMERIC(15, 2) NOT NULL,
    credit NUMERIC(15, 2) NOT NULL,
    description TEXT
);

CREATE TABLE purchase_orders (
    id VARCHAR(255) PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL,
    supplier_id VARCHAR(255) REFERENCES contacts(id),
    order_date DATE NOT NULL,
    expected_date DATE,
    status VARCHAR(50) NOT NULL,
    total_cost NUMERIC(15, 2) NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE purchase_order_line_items (
    id VARCHAR(255) PRIMARY KEY,
    po_id VARCHAR(255) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(15, 2) NOT NULL
);

CREATE TABLE timesheet_entries (
    id VARCHAR(255) PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id),
    date DATE NOT NULL,
    hours NUMERIC(5, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE expense_claims (
    id VARCHAR(255) PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id),
    date DATE NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(id),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    company_id VARCHAR(255) REFERENCES companies(id) ON DELETE CASCADE
);


-- Seed essential data for the application to function.
INSERT INTO companies (id, name) VALUES
('comp1', 'Acme Inc.'),
('comp2', 'Innovate LLC');

INSERT INTO categories (id, name, type, color) VALUES
('cat-inc1', 'Sales Revenue', 'Income', '#10b981'),
('cat-inc2', 'Investment Income', 'Income', '#14b8a6'),
('cat-exp1', 'Cost of Goods Sold', 'Expense', '#f59e0b'),
('cat-exp2', 'Payroll', 'Expense', '#3b82f6'),
('cat-exp3', 'Marketing & Ads', 'Expense', '#ec4899'),
('cat-exp4', 'Utilities', 'Expense', '#6366f1'),
('cat-exp5', 'Rent & Lease', 'Expense', '#a855f7'),
('cat-exp6', 'Business Travel', 'Expense', '#8b5cf6'),
('cat-exp7', 'Office Supplies', 'Expense', '#f43f5e'),
('cat-exp8', 'Software & Subscriptions', 'Expense', '#0ea5e9'),
('cat-exp9', 'Professional Services', 'Expense', '#d946ef'),
('cat-exp10', 'Bank Transfers & Fees', 'Expense', '#14b8a6'),
('cat-exp99', 'Uncategorized', 'Expense', '#7a7a7a');