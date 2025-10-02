-- Safely drop tables if they already exist to ensure a clean slate
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    last_login TIMESTAMPTZ,
    company_id UUID REFERENCES companies(id)
);

-- Insert sample data
INSERT INTO companies (id, name) VALUES
('comp1', 'Acme Inc.'),
('comp2', 'Innovate LLC');

-- The password for all users is 'password', hashed using bcrypt.
-- Hash: $2a$10$vES.35jso2n5238PZ3kmW./CwhvW5802W88ROmX.jWBdJ823S5w.K
INSERT INTO users (id, name, email, password_hash, role, last_login, company_id) VALUES
('user1', 'Admin User', 'admin@elevare.com', '$2a$10$vES.35jso2n5238PZ3kmW./CwhvW5802W88ROmX.jWBdJ823S5w.K', 'Admin', '2024-07-26', 'comp1'),
('user2', 'Accountant User', 'accountant@elevare.com', '$2a$10$vES.35jso2n5238PZ3kmW./CwhvW5802W88ROmX.jWBdJ823S5w.K', 'Accountant', '2024-07-25', 'comp1'),
('user3', 'Employee User', 'employee@elevare.com', '$2a$10$vES.35jso2n5238PZ3kmW./CwhvW5802W88ROmX.jWBdJ823S5w.K', 'Employee', '2024-07-26', 'comp2'),
('user4', 'HR Manager User', 'hr@elevare.com', '$2a$10$vES.35jso2n5238PZ3kmW./CwhvW5802W88ROmX.jWBdJ823S5w.K', 'HR Manager', '2024-07-26', 'comp1');