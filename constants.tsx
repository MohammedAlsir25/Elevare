import React from 'react';
import { Transaction, Category, Wallet, TransactionType, Contact, CustomerStatus, Invoice, InvoiceStatus, Budget, BudgetPeriod, Employee, Account, AccountType, Product, JournalEntry, PurchaseOrder, PurchaseOrderStatus, TimesheetEntry, TimesheetStatus, ExpenseClaim, ExpenseClaimStatus, ContactType, FinancialGoal, RecurringTransaction, Frequency, AdminUser, UserRole, Company } from './types.ts';

type IconProps = { className?: string; style?: React.CSSProperties };

// Icons
export const ArrowPathIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 19v-5h-5M4 19h5v-5M20 4h-5v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 2-2" />
    </svg>
);
export const HomeIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
export const ChartBarIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
export const WalletIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
export const CreditCardIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
export const UsersIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.973" /></svg>
);
export const ShoppingCartIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
export const DocumentTextIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
export const CogIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
export const EyeIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
export const PiggyBankIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.936 10.522a7.5 7.5 0 1 0-11.872 0A7.502 7.502 0 0 0 2.5 18.106V21h19v-2.894a7.502 7.502 0 0 0-3.564-7.584z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25a3 3 0 0 1-6 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.75v-.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V4.5" />
    </svg>
);
export const BriefcaseIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
export const BookOpenIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);
export const ArchiveBoxIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);
export const PresentationChartLineIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
);
export const AdjustmentsHorizontalIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v.01M18 18v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v.01M6 12v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v.01M18 6v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v.01" />
    </svg>
);
export const LogoutIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
export const FlagIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-13.25a.75.75 0 01.75-.75h14.5a.75.75 0 01.75.75V15M3 21h18M3 7.75h14.5" />
    </svg>
);
export const ExternalLinkIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);
export const ArrowUpTrayIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
export const ShieldCheckIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);
export const ChevronUpIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);
export const ChevronDownIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
export const ChevronUpDownIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
  </svg>
);
export const QuestionMarkCircleIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);
export const DeleteIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
export const DocumentDownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);


// Mock Data
export const CATEGORIES: { [key: string]: Category } = {
  // Income
  sales: { id: 'cat-inc1', name: 'Sales Revenue', icon: ShoppingCartIcon, color: '#10b981', type: TransactionType.INCOME },
  investment: { id: 'cat-inc2', name: 'Investment Income', icon: ChartBarIcon, color: '#14b8a6', type: TransactionType.INCOME },
  // Expenses
  cogs: { id: 'cat-exp1', name: 'Cost of Goods Sold', icon: ArchiveBoxIcon, color: '#f59e0b', type: TransactionType.EXPENSE },
  payroll: { id: 'cat-exp2', name: 'Payroll', icon: UsersIcon, color: '#3b82f6', type: TransactionType.EXPENSE },
  marketing: { id: 'cat-exp3', name: 'Marketing & Ads', icon: PresentationChartLineIcon, color: '#ec4899', type: TransactionType.EXPENSE },
  utilities: { id: 'cat-exp4', name: 'Utilities', icon: CogIcon, color: '#6366f1', type: TransactionType.EXPENSE },
  rent: { id: 'cat-exp5', name: 'Rent & Lease', icon: HomeIcon, color: '#a855f7', type: TransactionType.EXPENSE },
  travel: { id: 'cat-exp6', name: 'Business Travel', icon: BriefcaseIcon, color: '#8b5cf6', type: TransactionType.EXPENSE },
  supplies: { id: 'cat-exp7', name: 'Office Supplies', icon: DocumentTextIcon, color: '#f43f5e', type: TransactionType.EXPENSE },
  software: { id: 'cat-exp8', name: 'Software & Subscriptions', icon: CreditCardIcon, color: '#0ea5e9', type: TransactionType.EXPENSE },
  services: { id: 'cat-exp9', name: 'Professional Services', icon: BookOpenIcon, color: '#d946ef', type: TransactionType.EXPENSE },
  transfers: { id: 'cat-exp10', name: 'Bank Transfers & Fees', icon: ArrowPathIcon, color: '#14b8a6', type: TransactionType.EXPENSE },
  uncategorized: { id: 'cat-exp99', name: 'Uncategorized', icon: DocumentTextIcon, color: '#7a7a7a', type: TransactionType.EXPENSE },
};

export const WALLETS: { [key: string]: Wallet } = {
  bank: { id: 'wal1', name: 'Main Bank Account', balance: 12500.75, currency: 'USD', companyId: 'comp1' },
  cash: { id: 'wal2', name: 'Cash', balance: 345.50, currency: 'USD', companyId: 'comp1' },
  card: { id: 'wal3', name: 'Credit Card', balance: -500.00, currency: 'USD', companyId: 'comp1' },
  euro: { id: 'wal4', name: 'Euro Account', balance: 5230.10, currency: 'EUR', companyId: 'comp2' },
};

export const TRANSACTIONS: Transaction[] = [
  { id: 'txn1', date: '2024-07-25', description: 'Sales from Innovate Inc.', amount: 7500, currency: 'USD', type: TransactionType.INCOME, category: CATEGORIES.sales, wallet: WALLETS.bank, companyId: 'comp1', color: '#10b981' },
  { id: 'txn2', date: '2024-07-25', description: 'Google Ads Campaign', amount: -500.00, currency: 'USD', type: TransactionType.EXPENSE, category: CATEGORIES.marketing, wallet: WALLETS.card, companyId: 'comp1', color: '#ec4899' },
  { id: 'txn3', date: '2024-07-24', description: 'Office Supplies Purchase', amount: -175.50, currency: 'USD', type: TransactionType.EXPENSE, category: CATEGORIES.supplies, wallet: WALLETS.bank, companyId: 'comp1', color: '#f43f5e' },
  { id: 'txn4', date: '2024-07-23', description: 'Legal Consultation', amount: -1200.00, currency: 'USD', type: TransactionType.EXPENSE, category: CATEGORIES.services, wallet: WALLETS.bank, companyId: 'comp1', color: '#d946ef' },
  { id: 'txn5', date: '2024-07-22', description: 'Electricity Bill', amount: -85.20, currency: 'USD', type: TransactionType.EXPENSE, category: CATEGORIES.utilities, wallet: WALLETS.bank, companyId: 'comp1', color: '#6366f1' },
  { id: 'txn6', date: '2024-07-21', description: 'Adobe Creative Cloud Subscription', amount: -59.99, currency: 'EUR', type: TransactionType.EXPENSE, category: CATEGORIES.software, wallet: WALLETS.euro, companyId: 'comp2', color: '#0ea5e9' },
];

export const RECURRING_TRANSACTIONS: RecurringTransaction[] = [
    { id: 'rtxn1', description: 'Adobe Creative Cloud', amount: -59.99, currency: 'USD', type: TransactionType.EXPENSE, category: CATEGORIES.software, wallet: WALLETS.card, frequency: Frequency.MONTHLY, startDate: '2024-07-10', nextDueDate: '2024-08-10', companyId: 'comp1' },
    { id: 'rtxn2', description: 'Monthly Office Rent', amount: -2500.00, currency: 'USD', type: TransactionType.EXPENSE, category: CATEGORIES.rent, wallet: WALLETS.bank, frequency: Frequency.MONTHLY, startDate: '2024-07-01', nextDueDate: '2024-08-01', companyId: 'comp2' },
];

export const CONTACTS: Contact[] = [
    { id: 'cust1', name: 'Jane Doe', company: 'Innovate Inc.', email: 'jane.doe@innovate.com', phone: '555-1234', status: CustomerStatus.ACTIVE, dateAdded: '2024-06-15', contactType: [ContactType.CUSTOMER], companyId: 'comp1' },
    { id: 'cust2', name: 'John Smith', company: 'Solutions Co.', email: 'john.smith@solutions.co', phone: '555-5678', status: CustomerStatus.ACTIVE, dateAdded: '2024-05-20', contactType: [ContactType.CUSTOMER], companyId: 'comp1' },
    { id: 'cust3', name: 'Alice Johnson', company: 'Tech Gadgets', email: 'alice.j@techgadgets.com', phone: '555-8765', status: CustomerStatus.OPPORTUNITY, dateAdded: '2024-07-10', contactType: [ContactType.CUSTOMER, ContactType.LEAD], companyId: 'comp2' },
    { id: 'cust4', name: 'Robert Brown', company: 'Global Exports', email: 'r.brown@globalexports.net', phone: '555-4321', status: CustomerStatus.INACTIVE, dateAdded: '2023-11-30', contactType: [ContactType.CUSTOMER], companyId: 'comp2' },
    { id: 'supp1', name: 'Supplier One', company: 'Hardware & Co.', email: 'sales@hardwareco.com', phone: '555-0011', status: CustomerStatus.ACTIVE, dateAdded: '2022-01-01', contactType: [ContactType.SUPPLIER], companyId: 'comp1' },
    { id: 'supp2', name: 'Creative Supplies', company: 'Creative Supplies LLC', email: 'contact@creativesupp.com', phone: '555-0022', status: CustomerStatus.ACTIVE, dateAdded: '2022-03-15', contactType: [ContactType.SUPPLIER], companyId: 'comp2' },
];

export const INVOICES: Invoice[] = [
    {
        id: 'inv1', invoiceNumber: 'INV-001', customer: CONTACTS[0], issueDate: '2024-07-20', dueDate: '2024-08-19',
        lineItems: [{ id: 'li1', description: 'Web Development Services', quantity: 1, unitPrice: 2500, total: 2500 }],
        totalAmount: 2500, status: InvoiceStatus.PAID, pdfUrl: '#', companyId: 'comp1',
    },
    {
        id: 'inv2', invoiceNumber: 'INV-002', customer: CONTACTS[1], issueDate: '2024-07-22', dueDate: '2024-08-21',
        lineItems: [
            { id: 'li2', description: 'Graphic Design Package', quantity: 1, unitPrice: 1200, total: 1200 },
            { id: 'li3', description: 'Social Media Assets', quantity: 5, unitPrice: 150, total: 750 },
        ],
        totalAmount: 1950, status: InvoiceStatus.SENT, pdfUrl: '#', companyId: 'comp1',
    },
     {
        id: 'inv3', invoiceNumber: 'INV-003', customer: CONTACTS[2], issueDate: '2024-06-15', dueDate: '2024-07-15',
        lineItems: [{ id: 'li4', description: 'Consulting Hours', quantity: 10, unitPrice: 150, total: 1500 }],
        totalAmount: 1500, status: InvoiceStatus.OVERDUE, pdfUrl: '#', companyId: 'comp2',
    },
    {
        id: 'inv4', invoiceNumber: 'INV-004', customer: CONTACTS[2], issueDate: '2024-07-25', dueDate: '2024-08-24',
        lineItems: [{ id: 'li5', description: 'Initial Project Deposit', quantity: 1, unitPrice: 3000, total: 3000 }],
        totalAmount: 3000, status: InvoiceStatus.DRAFT, companyId: 'comp2',
        // No pdfUrl for draft invoices
    },
];

export const BUDGETS: Budget[] = [
    { id: 'bud1', categoryId: 'cat-exp3', period: BudgetPeriod.MONTHLY, amount: 1000, startDate: '2024-07-01', companyId: 'comp1' }, // Marketing
    { id: 'bud2', categoryId: 'cat-exp7', period: BudgetPeriod.MONTHLY, amount: 250, startDate: '2024-07-01', companyId: 'comp1' }, // Office Supplies
    { id: 'bud3', categoryId: 'cat-exp6', period: BudgetPeriod.MONTHLY, amount: 1500, startDate: '2024-07-01', companyId: 'comp2' }, // Business Travel
];

export const GOALS: FinancialGoal[] = [
    { id: 'goal1', name: 'New Laptop', targetAmount: 2000, currentAmount: 750, companyId: 'comp1' },
    { id: 'goal2', name: 'Vacation Fund', targetAmount: 5000, currentAmount: 3200, companyId: 'comp2' },
];

export const EMPLOYEES: Employee[] = [
    { id: 'emp1', name: 'Michael Scott', employeeId: 'E-001', email: 'm.scott@acme.com', phone: '555-0101', department: 'Sales', role: 'Regional Manager', joiningDate: '2018-04-01', salary: 75000, companyId: 'comp1' },
    { id: 'emp2', name: 'Dwight Schrute', employeeId: 'E-002', email: 'd.schrute@acme.com', phone: '555-0102', department: 'Sales', role: 'Assistant Regional Manager', joiningDate: '2019-01-15', salary: 55000, companyId: 'comp1' },
    { id: 'emp3', name: 'Pam Beesly', employeeId: 'E-003', email: 'p.beesly@acme.com', phone: '555-0103', department: 'Administration', role: 'Office Administrator', joiningDate: '2020-08-20', salary: 45000, companyId: 'comp2' },
    { id: 'emp4', name: 'Jim Halpert', employeeId: 'E-004', email: 'j.halpert@acme.com', phone: '555-0104', department: 'Sales', role: 'Sales Representative', joiningDate: '2021-02-10', salary: 60000, companyId: 'comp2' },
];

export const ACCOUNTS: Account[] = [
    { id: 'acc1', code: '1010', name: 'Cash', type: AccountType.ASSET, companyId: 'comp1' },
    { id: 'acc2', code: '1200', name: 'Accounts Receivable', type: AccountType.ASSET, companyId: 'comp1' },
    { id: 'acc3', code: '2010', name: 'Accounts Payable', type: AccountType.LIABILITY, companyId: 'comp1' },
    { id: 'acc4', code: '3000', name: 'Owner\'s Equity', type: AccountType.EQUITY, companyId: 'comp1' },
    { id: 'acc5', code: '4000', name: 'Sales Revenue', type: AccountType.INCOME, companyId: 'comp2' },
    { id: 'acc6', code: '5010', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, companyId: 'comp2' },
    { id: 'acc7', code: '5050', name: 'Rent Expense', type: AccountType.EXPENSE, companyId: 'comp2' },
];

export const PRODUCTS: Product[] = [
    { id: 'prod1', sku: 'WD-001', name: 'Web Development Services', description: '10 hours of premium web development.', price: 1500, cost: 500, stock: 999, companyId: 'comp1' },
    { id: 'prod2', sku: 'GD-001', name: 'Graphic Design Package', description: 'Logo design and brand guidelines.', price: 800, cost: 250, stock: 999, companyId: 'comp1' },
    { id: 'prod3', sku: 'HW-KBD-01', name: 'Mechanical Keyboard', description: 'RGB Mechanical Keyboard with blue switches.', price: 120, cost: 75, stock: 85, companyId: 'comp2' },
    { id: 'prod4', sku: 'HW-MSE-01', name: 'Ergonomic Mouse', description: 'Wireless ergonomic mouse with 8 buttons.', price: 85, cost: 50, stock: 120, companyId: 'comp2' },
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
    {
        id: 'je1', date: '2024-07-25', ref: 'Payment for rent', companyId: 'comp1',
        lines: [
            { id: 'jel1-1', accountId: 'acc7', debit: 1200, credit: 0, description: 'Monthly rent' },
            { id: 'jel1-2', accountId: 'acc1', debit: 0, credit: 1200, description: 'Paid from cash' },
        ]
    },
    {
        id: 'je2', date: '2024-07-20', ref: 'Received payment for INV-001', companyId: 'comp2',
        lines: [
            { id: 'jel2-1', accountId: 'acc1', debit: 2500, credit: 0 },
            { id: 'jel2-2', accountId: 'acc2', debit: 0, credit: 2500 },
        ]
    }
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: 'po1', poNumber: 'PO-001', supplierId: 'supp1', orderDate: '2024-07-15', expectedDate: '2024-07-30',
        status: PurchaseOrderStatus.RECEIVED, totalCost: 1150, companyId: 'comp1',
        lineItems: [
            { id: 'poli1', productId: 'prod3', quantity: 10, unitCost: 75 },
            { id: 'poli2', productId: 'prod4', quantity: 10, unitCost: 40 },
        ]
    },
    {
        id: 'po2', poNumber: 'PO-002', supplierId: 'supp2', orderDate: '2024-07-20', expectedDate: '2024-08-05',
        status: PurchaseOrderStatus.ORDERED, totalCost: 250, companyId: 'comp2',
        lineItems: [
            { id: 'poli3', productId: 'prod2', quantity: 1, unitCost: 250 },
        ]
    }
];

export const TIMESHEETS: TimesheetEntry[] = [
    { id: 'ts1', employeeId: 'emp4', date: '2024-07-22', hours: 8, description: 'Client meeting and sales calls', status: TimesheetStatus.APPROVED, companyId: 'comp2' },
    { id: 'ts2', employeeId: 'emp3', date: '2024-07-23', hours: 6, description: 'Office administration and scheduling', status: TimesheetStatus.PENDING, companyId: 'comp2' },
];

export const EXPENSE_CLAIMS: ExpenseClaim[] = [
    { id: 'ec1', employeeId: 'emp2', date: '2024-07-18', categoryId: 'cat-exp6', amount: 45.50, description: 'Fuel for client visit', status: ExpenseClaimStatus.APPROVED, companyId: 'comp1' },
    { id: 'ec2', employeeId: 'emp4', date: '2024-07-20', categoryId: 'cat-exp6', amount: 120.00, description: 'Train ticket for conference', status: ExpenseClaimStatus.PENDING, companyId: 'comp2' },
    { id: 'ec3', employeeId: 'emp1', date: '2024-07-21', categoryId: 'cat-exp6', amount: 85.00, description: 'Client lunch meeting', status: ExpenseClaimStatus.REJECTED, companyId: 'comp1' },
];

export const COMPANIES: Company[] = [
    { id: 'comp1', name: 'Acme Inc.' },
    { id: 'comp2', name: 'Innovate LLC' },
];

export const ADMIN_USERS: AdminUser[] = [
    { id: 'user1', name: 'Admin User', email: 'admin@elevare.com', role: UserRole.ADMIN, lastLogin: '2024-07-26', companyId: 'comp1' },
    { id: 'user2', name: 'Accountant User', email: 'accountant@elevare.com', role: UserRole.ACCOUNTANT, lastLogin: '2024-07-25', companyId: 'comp1' },
    { id: 'user3', name: 'Employee User', email: 'employee@elevare.com', role: UserRole.EMPLOYEE, lastLogin: '2024-07-26', companyId: 'comp2' },
    { id: 'user4', name: 'HR Manager User', email: 'hr@elevare.com', role: UserRole.HR_MANAGER, lastLogin: '2024-07-26', companyId: 'comp1' },
];

export const SIDEBAR_LINKS = [
    { name: 'Dashboard', icon: HomeIcon },
    { name: 'Analytics', icon: ChartBarIcon },
    { name: 'Transactions', icon: DocumentTextIcon },
    { name: 'Wallets', icon: WalletIcon },
    { name: 'Budgets', icon: PiggyBankIcon },
    { name: 'Contacts', icon: UsersIcon },
    { name: 'Sales', icon: ShoppingCartIcon },
    { name: 'Accounting', icon: BookOpenIcon },
    { name: 'Inventory', icon: ArchiveBoxIcon },
    { name: 'HR', icon: BriefcaseIcon },
    { name: 'Reports', icon: PresentationChartLineIcon },
    { name: 'Admin', icon: ShieldCheckIcon },
];