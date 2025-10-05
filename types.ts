

import type React from 'react';

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
}

export interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  type: TransactionType.INCOME | TransactionType.EXPENSE;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: 'USD' | 'EUR';
  companyId?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: 'USD' | 'EUR';
  type: TransactionType;
  category: Category;
  wallet: Wallet;
  companyId?: string;
  color?: string;
}

// Type for data coming from the backend API
export interface ApiTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: 'USD' | 'EUR';
  type: TransactionType;
  categoryId: string;
  walletId: string;
  companyId: string;
  color?: string;
}

// Type for data sent to the backend API for creation/update
export type ApiTransactionData = Omit<ApiTransaction, 'id' | 'companyId'>;


export enum Frequency {
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly',
    YEARLY = 'Yearly',
}

export interface RecurringTransaction {
    id: string;
    description: string;
    amount: number;
    currency: 'USD' | 'EUR';
    type: TransactionType;
    category: Category;
    wallet: Wallet;
    frequency: Frequency;
    startDate: string;
    endDate?: string;
    nextDueDate: string;
    companyId?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export enum ContactType {
    CUSTOMER = 'Customer',
    SUPPLIER = 'Supplier',
    LEAD = 'Lead',
}

export enum CustomerStatus {
    LEAD = 'Lead',
    OPPORTUNITY = 'Opportunity',
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
}

export interface Contact {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    status: CustomerStatus;
    dateAdded: string;
    contactType: ContactType[];
    companyId?: string;
}

// Type for data coming from the backend API for contacts
export type ApiContact = Omit<Contact, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for contact creation/update
export type ApiContactData = Omit<ApiContact, 'id' | 'companyId' | 'dateAdded'>;


export enum InvoiceStatus {
    DRAFT = 'Draft',
    SENT = 'Sent',
    PAID = 'Paid',
    OVERDUE = 'Overdue',
}

export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customer: Contact;
    issueDate: string;
    dueDate: string;
    lineItems: InvoiceLineItem[];
    totalAmount: number;
    status: InvoiceStatus;
    pdfUrl?: string;
    companyId?: string;
}

// Type for data coming from the backend API for invoices
export interface ApiInvoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    issueDate: string;
    dueDate: string;
    lineItems: InvoiceLineItem[];
    totalAmount: number;
    status: InvoiceStatus;
    pdfUrl?: string;
    companyId: string;
}

// Type for data sent to the backend API for invoice creation/update
export type ApiInvoiceData = Omit<ApiInvoice, 'id' | 'invoiceNumber' | 'companyId' | 'pdfUrl'>;


export enum BudgetPeriod {
    MONTHLY = 'Monthly',
    QUARTERLY = 'Quarterly',
    YEARLY = 'Yearly',
}

export interface Budget {
    id: string;
    categoryId: string;
    period: BudgetPeriod;
    amount: number;
    startDate: string;
    companyId?: string;
}

// Type for data coming from the backend API for budgets
export type ApiBudget = Omit<Budget, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for budget creation/update
export type ApiBudgetData = Omit<ApiBudget, 'id' | 'companyId'>;


export interface Employee {
    id: string;
    name: string;
    employeeId: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    joiningDate: string;
    salary: number;
    companyId?: string;
}

// Type for data coming from the backend API for employees
export type ApiEmployee = Omit<Employee, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for employee creation/update
export type ApiEmployeeData = Omit<ApiEmployee, 'id' | 'employeeId' | 'companyId'>;


export enum AccountType {
    ASSET = 'Asset',
    LIABILITY = 'Liability',
    EQUITY = 'Equity',
    INCOME = 'Income',
    EXPENSE = 'Expense',
}

export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    companyId?: string;
}

// Type for data coming from the backend API for accounts
export type ApiAccount = Omit<Account, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for account creation/update
export type ApiAccountData = Omit<ApiAccount, 'id' | 'companyId'>;

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    stock: number;
    companyId?: string;
}

// Type for data coming from the backend API for products
export type ApiProduct = Omit<Product, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for product creation/update
export type ApiProductData = Omit<ApiProduct, 'id' | 'companyId'>;


export interface JournalEntryLine {
    id: string;
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    ref: string;
    lines: JournalEntryLine[];
    companyId?: string;
}

// Type for data coming from the backend API for journal entries
export type ApiJournalEntry = Omit<JournalEntry, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for journal entry creation/update
export type ApiJournalEntryData = Omit<ApiJournalEntry, 'id' | 'companyId'>;


export enum PurchaseOrderStatus {
    DRAFT = 'Draft',
    ORDERED = 'Ordered',
    RECEIVED = 'Received',
    CANCELLED = 'Cancelled',
}

export interface PurchaseOrderLineItem {
    id: string;
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    orderDate: string;
    expectedDate: string;
    status: PurchaseOrderStatus;
    lineItems: PurchaseOrderLineItem[];
    totalCost: number;
    companyId?: string;
}

// Type for data coming from the backend API for purchase orders
export type ApiPurchaseOrder = Omit<PurchaseOrder, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for PO creation/update
export type ApiPurchaseOrderData = Omit<ApiPurchaseOrder, 'id' | 'poNumber' | 'companyId'>;


export enum TimesheetStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
}

export interface TimesheetEntry {
    id: string;
    employeeId: string;
    date: string;
    hours: number;
    description: string;
    status: TimesheetStatus;
    companyId?: string;
}

// Type for data coming from the backend API for timesheets
export type ApiTimesheetEntry = Omit<TimesheetEntry, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for timesheet creation/update
export type ApiTimesheetEntryData = Omit<ApiTimesheetEntry, 'id' | 'companyId'>;


export enum ExpenseClaimStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface ExpenseClaim {
    id: string;
    employeeId: string;
    date: string;
    categoryId: string;
    amount: number;
    description: string;
    status: ExpenseClaimStatus;
    companyId?: string;
}

// Type for data coming from the backend API for expense claims
export type ApiExpenseClaim = Omit<ExpenseClaim, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for expense claim creation/update
export type ApiExpenseClaimData = Omit<ApiExpenseClaim, 'id' | 'companyId'>;


export interface DashboardLayout {
    netWorth: boolean;
    income: boolean;
    expenses: boolean;
    transactions: boolean;
    categoryChart: boolean;
    aiAssistant: boolean;
}

export enum UserRole {
  ADMIN = 'Admin',
  ACCOUNTANT = 'Accountant',
  HR_MANAGER = 'HR Manager',
  EMPLOYEE = 'Employee',
  VIEWER = 'Viewer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastLogin: string;
    companyId?: string;
}

// Type for data coming from the backend API for admin users
export type ApiAdminUser = Omit<AdminUser, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for admin user creation/update
export type ApiAdminUserData = Omit<ApiAdminUser, 'id' | 'lastLogin' | 'companyId'>;


export interface Company {
    id: string;
    name: string;
}

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    companyId?: string;
}

// Type for data coming from the backend API for goals
export type ApiFinancialGoal = Omit<FinancialGoal, 'companyId'> & { companyId: string };

// Type for data sent to the backend API for goal creation/update
export type ApiFinancialGoalData = Omit<ApiFinancialGoal, 'id' | 'companyId'>;


export interface SortConfig {
    key: string;
    direction: 'ascending' | 'descending';
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface DataContextType {
    loading: boolean;
    isSubmitting: boolean;
    transactions: Transaction[];
    recurringTransactions: RecurringTransaction[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addRecurringTransaction: (rt: Omit<RecurringTransaction, 'id' | 'nextDueDate'>) => Promise<void>;
    updateRecurringTransaction: (rt: RecurringTransaction) => Promise<void>;
    deleteRecurringTransaction: (id: string) => Promise<void>;
    wallets: Wallet[];
    addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
    updateWallet: (wallet: Wallet) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;
    contacts: Contact[];
    addContact: (contact: Omit<Contact, 'id' | 'dateAdded'>) => Promise<void>;
    updateContact: (contact: Contact) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    invoices: Invoice[];
    addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Promise<void>;
    updateInvoice: (invoice: Invoice) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    budgets: Budget[];
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    goals: FinancialGoal[];
    addGoal: (goal: Omit<FinancialGoal, 'id'>) => Promise<void>;
    updateGoal: (goal: FinancialGoal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addContributionToGoal: (goalId: string, amount: number, walletId: string) => Promise<void>;
    employees: Employee[];
    addEmployee: (employee: Omit<Employee, 'id' | 'employeeId'>) => Promise<void>;
    updateEmployee: (employee: Employee) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    accounts: Account[];
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    updateAccount: (account: Account) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    journalEntries: JournalEntry[];
    addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
    updateJournalEntry: (entry: JournalEntry) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
    purchaseOrders: PurchaseOrder[];
    addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => Promise<void>;
    updatePurchaseOrder: (po: PurchaseOrder) => Promise<void>;
    deletePurchaseOrder: (id: string) => Promise<void>;
    receivePurchaseOrder: (poId: string) => Promise<void>;
    timesheets: TimesheetEntry[];
    addTimesheet: (entry: Omit<TimesheetEntry, 'id'>) => Promise<void>;
    updateTimesheet: (entry: TimesheetEntry) => Promise<void>;
    deleteTimesheet: (id: string) => Promise<void>;
    expenseClaims: ExpenseClaim[];
    addExpenseClaim: (claim: Omit<ExpenseClaim, 'id'>) => Promise<void>;
    updateExpenseClaim: (claim: ExpenseClaim) => Promise<void>;
    approveExpenseClaim: (claimId: string) => Promise<void>;
    categories: Category[];
    exchangeRates: { [key: string]: number };
    refetchData: () => void;
    users: AdminUser[];
    addUser: (user: Omit<AdminUser, 'id' | 'lastLogin' | 'companyId'>) => Promise<void>;
    updateUser: (user: AdminUser) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}