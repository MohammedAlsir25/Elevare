import { COMPANIES, CATEGORIES } from '../constants.tsx';
// FIX: Import 'Company' type.
import { Wallet, Transaction, Contact, Invoice, Budget, FinancialGoal, Category, TransactionType, Employee, TimesheetEntry, ExpenseClaim, ExpenseClaimStatus, Account, JournalEntry, Product, PurchaseOrder, PurchaseOrderStatus, RecurringTransaction, Company, AdminUser, User } from '../types.ts';
import { WALLETS, TRANSACTIONS, CONTACTS, INVOICES, BUDGETS, GOALS, EMPLOYEES, ACCOUNTS, PRODUCTS, JOURNAL_ENTRIES, PURCHASE_ORDERS, TIMESHEETS, EXPENSE_CLAIMS, RECURRING_TRANSACTIONS, ADMIN_USERS } from '../constants.tsx';

const API_BASE_URL = 'http://localhost:4000/api';

// --- REAL AUTH API ---
export const login = async (email: string, pass: string): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    return data;
};


// Simulate realistic network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// In-memory store to simulate a database
let db = {
    wallets: Object.values(WALLETS),
    transactions: TRANSACTIONS,
    recurringTransactions: RECURRING_TRANSACTIONS,
    contacts: CONTACTS,
    invoices: INVOICES,
    budgets: BUDGETS,
    goals: GOALS,
    employees: EMPLOYEES,
    timesheets: TIMESHEETS,
    expenseClaims: EXPENSE_CLAIMS,
    accounts: ACCOUNTS,
    journalEntries: JOURNAL_ENTRIES,
    products: PRODUCTS,
    purchaseOrders: PURCHASE_ORDERS,
    users: ADMIN_USERS,
    // FIX: Add companies to the in-memory database.
    companies: COMPANIES,
};

const filterByCompany = <T extends { companyId?: string }>(items: T[], companyId: string): T[] => {
    return items.filter(item => item.companyId === companyId);
};

// --- AI & AUTOMATION API ---

export const processNaturalLanguageQuery = async (prompt: string, companyId: string): Promise<{ handled: boolean; answer: string | null }> => {
    await delay(1500);
    const lowerPrompt = prompt.toLowerCase();
    
    const companyTransactions = db.transactions.filter(t => t.companyId === companyId);

    if (lowerPrompt.includes('biggest expense')) {
        const biggestExpense = companyTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .sort((a, b) => a.amount - b.amount)[0];
        if (biggestExpense) {
            return {
                handled: true,
                answer: `Your biggest expense was for "${biggestExpense.description}" on ${biggestExpense.date}, amounting to ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(biggestExpense.amount))}.`
            };
        }
        return { handled: true, answer: "I couldn't find any expenses to analyze." };
    }

    const categoryMatch = lowerPrompt.match(/how much did i spend on (\w+)/);
    if (categoryMatch) {
        const categoryQuery = categoryMatch[1].toLowerCase();
        const category = Object.values(CATEGORIES).find(c => c.name.toLowerCase().includes(categoryQuery));
        if (category) {
            const total = companyTransactions
                .filter(t => t.category.id === category.id && t.type === TransactionType.EXPENSE)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
             return {
                handled: true,
                answer: `You've spent ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)} on ${category.name}.`
            };
        }
    }
    
    return { handled: false, answer: null };
};

export const getCashFlowForecast = async (): Promise<{ date: string, balance: number }[]> => {
    await delay(500);
    const forecast = [];
    let lastBalance = db.wallets.reduce((acc, w) => acc + w.balance, 0);
    for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        lastBalance += (Math.random() - 0.4) * 500; // Simulate daily fluctuations
        forecast.push({ date: date.toISOString().split('T')[0], balance: lastBalance });
    }
    return forecast;
};

export const performOcrOnReceipt = async (file: File): Promise<{ vendor: string, amount: number, date: string }> => {
    await delay(2000);
    console.log('Simulating OCR for file:', file.name);
    return {
        vendor: 'Starbucks',
        amount: 12.75,
        date: new Date().toISOString().split('T')[0],
    };
};

export const suggestCategoryForTransaction = async (description: string): Promise<string | null> => {
    await delay(800);
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('adobe') || lowerDesc.includes('saas') || lowerDesc.includes('subscription') || lowerDesc.includes('aws')) {
        return 'cat-exp8'; // Software & Subscriptions
    }
    if (lowerDesc.includes('ads') || lowerDesc.includes('marketing') || lowerDesc.includes('campaign')) {
        return 'cat-exp3'; // Marketing & Ads
    }
    if (lowerDesc.includes('office') || lowerDesc.includes('staples') || lowerDesc.includes('supplies')) {
        return 'cat-exp7'; // Office Supplies
    }
    return null;
};


// --- Generic CRUD Helpers ---
const getItems = async <T extends { companyId?: string }>(store: T[], companyId: string): Promise<T[]> => {
    await delay(300);
    return filterByCompany(store, companyId);
};

const createItem = async <T extends { id: string, companyId?: string }, U>(store: T[], item: U, companyId: string): Promise<T> => {
    await delay(400);
    // FIX: Corrected a potentially unsafe type assertion by casting to 'unknown' first. This satisfies TypeScript's strictness about generic type conversions.
    const newItem = { ...item, id: `new${Date.now()}`, companyId } as unknown as T;
    store.unshift(newItem);
    return newItem;
};

const updateItem = async <T extends { id: string }>(store: T[], item: T): Promise<T> => {
    await delay(400);
    const index = store.findIndex(i => i.id === item.id);
    if (index > -1) {
        store[index] = item;
        return item;
    }
    throw new Error("Item not found");
};

const deleteItem = async <T extends { id: string }>(store: T[], id: string): Promise<{ id: string }> => {
    await delay(400);
    db[store as any] = store.filter(i => i.id !== id);
    return { id };
};

// --- DATA API ---

export const getCompanies = async (): Promise<Company[]> => {
    await delay(100);
    return db.companies;
};

export const getCategories = async (): Promise<Category[]> => {
    await delay(100);
    return Object.values(CATEGORIES);
};

export const getExchangeRates = async (): Promise<{ [key: string]: number }> => {
    await delay(100);
    return { USD: 1, EUR: 1.08 };
};

// Wallets
export const getWallets = (companyId: string) => getItems(db.wallets, companyId);
export const addWallet = (wallet: Omit<Wallet, 'id'>, companyId: string) => createItem(db.wallets, wallet, companyId);
export const updateWallet = (wallet: Wallet) => updateItem(db.wallets, wallet);
export const deleteWallet = (id: string) => deleteItem(db.wallets, id);

// Transactions
export const getTransactions = (companyId: string) => getItems(db.transactions, companyId);
export const addTransaction = (transaction: Omit<Transaction, 'id'>, companyId: string) => createItem(db.transactions, transaction, companyId);
export const updateTransaction = (transaction: Transaction) => updateItem(db.transactions, transaction);
export const deleteTransaction = (id: string) => deleteItem(db.transactions, id);

// Recurring Transactions
export const getRecurringTransactions = (companyId: string) => getItems(db.recurringTransactions, companyId);
export const addRecurringTransaction = (rt: Omit<RecurringTransaction, 'id' | 'nextDueDate'>, companyId: string) => {
    const today = new Date();
    const nextDueDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];
    return createItem(db.recurringTransactions, {...rt, nextDueDate}, companyId);
};
export const updateRecurringTransaction = (rt: RecurringTransaction) => updateItem(db.recurringTransactions, rt);
export const deleteRecurringTransaction = (id: string) => deleteItem(db.recurringTransactions, id);

// Contacts
export const getContacts = (companyId: string) => getItems(db.contacts, companyId);
export const addContact = (contact: Omit<Contact, 'id' | 'dateAdded'>, companyId: string) => createItem(db.contacts, {...contact, dateAdded: new Date().toISOString().split('T')[0]}, companyId);
export const updateContact = (contact: Contact) => updateItem(db.contacts, contact);
export const deleteContact = (id: string) => deleteItem(db.contacts, id);

// Invoices
export const getInvoices = (companyId: string) => getItems(db.invoices, companyId);
export const getInvoicesForCustomer = async (customerId: string): Promise<Invoice[]> => {
    await delay(300);
    return db.invoices.filter(inv => inv.customer.id === customerId);
};
export const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>, companyId: string) => {
    const newInvoiceNumber = `INV-${(db.invoices.length + 1).toString().padStart(3, '0')}`;
    return createItem(db.invoices, {...invoice, invoiceNumber: newInvoiceNumber}, companyId);
};
export const updateInvoice = (invoice: Invoice) => updateItem(db.invoices, invoice);
export const deleteInvoice = (id: string) => deleteItem(db.invoices, id);

// Budgets
export const getBudgets = (companyId: string) => getItems(db.budgets, companyId);
export const addBudget = (budget: Omit<Budget, 'id'>, companyId: string) => createItem(db.budgets, budget, companyId);
export const updateBudget = (budget: Budget) => updateItem(db.budgets, budget);
export const deleteBudget = (id: string) => deleteItem(db.budgets, id);

// Goals
export const getGoals = (companyId: string) => getItems(db.goals, companyId);
export const addGoal = (goal: Omit<FinancialGoal, 'id'>, companyId: string) => createItem(db.goals, goal, companyId);
export const updateGoal = (goal: FinancialGoal) => updateItem(db.goals, goal);
export const deleteGoal = (id: string) => deleteItem(db.goals, id);

// Employees
export const getEmployees = (companyId: string) => getItems(db.employees, companyId);
export const addEmployee = (employee: Omit<Employee, 'id' | 'employeeId'>, companyId: string) => {
    const newEmployeeId = `E-${(db.employees.length + 1).toString().padStart(3, '0')}`;
    return createItem(db.employees, {...employee, employeeId: newEmployeeId}, companyId);
};
export const updateEmployee = (employee: Employee) => updateItem(db.employees, employee);
export const deleteEmployee = (id: string) => deleteItem(db.employees, id);

// Accounts
export const getAccounts = (companyId: string) => getItems(db.accounts, companyId);
export const addAccount = (account: Omit<Account, 'id'>, companyId: string) => createItem(db.accounts, account, companyId);
export const updateAccount = (account: Account) => updateItem(db.accounts, account);
export const deleteAccount = (id: string) => deleteItem(db.accounts, id);

// Products
export const getProducts = (companyId: string) => getItems(db.products, companyId);
export const addProduct = (product: Omit<Product, 'id'>, companyId: string) => createItem(db.products, product, companyId);
export const updateProduct = (product: Product) => updateItem(db.products, product);
export const deleteProduct = (id: string) => deleteItem(db.products, id);

// Journal Entries
export const getJournalEntries = (companyId: string) => getItems(db.journalEntries, companyId);
export const addJournalEntry = (entry: Omit<JournalEntry, 'id'>, companyId: string) => createItem(db.journalEntries, entry, companyId);
export const updateJournalEntry = (entry: JournalEntry) => updateItem(db.journalEntries, entry);
export const deleteJournalEntry = (id: string) => deleteItem(db.journalEntries, id);

// Purchase Orders
export const getPurchaseOrders = (companyId: string) => getItems(db.purchaseOrders, companyId);
export const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'poNumber'>, companyId: string) => {
    const newPoNumber = `PO-${(db.purchaseOrders.length + 1).toString().padStart(3, '0')}`;
    return createItem(db.purchaseOrders, {...po, poNumber: newPoNumber}, companyId);
};
export const updatePurchaseOrder = (po: PurchaseOrder) => updateItem(db.purchaseOrders, po);
export const deletePurchaseOrder = (id: string) => deleteItem(db.purchaseOrders, id);

// Timesheets
export const getTimesheets = (companyId: string) => getItems(db.timesheets, companyId);
export const addTimesheet = (entry: Omit<TimesheetEntry, 'id'>, companyId: string) => createItem(db.timesheets, entry, companyId);
export const updateTimesheet = (entry: TimesheetEntry) => updateItem(db.timesheets, entry);
export const deleteTimesheet = (id: string) => deleteItem(db.timesheets, id);

// Expense Claims
export const getExpenseClaims = (companyId: string) => getItems(db.expenseClaims, companyId);
export const addExpenseClaim = (claim: Omit<ExpenseClaim, 'id'>, companyId: string) => createItem(db.expenseClaims, claim, companyId);
export const updateExpenseClaim = (claim: ExpenseClaim) => updateItem(db.expenseClaims, claim);

// Users (Admin)
export const getUsers = (companyId: string) => getItems(db.users, companyId);
export const addUser = (user: Omit<AdminUser, 'id' | 'lastLogin' | 'companyId'>, companyId: string) => {
    const newUser = { 
        ...user, 
        lastLogin: new Date().toISOString().split('T')[0],
    };
    return createItem(db.users, newUser, companyId);
};
export const updateUser = (user: AdminUser) => updateItem(db.users, user);
export const deleteUser = (id: string) => deleteItem(db.users, id);


// --- Business Logic Functions ---

export const approveExpenseClaim = async (claimId: string): Promise<{ updatedClaim: ExpenseClaim, newTransaction: Transaction }> => {
    await delay(500);
    const claim = db.expenseClaims.find(c => c.id === claimId);
    if (!claim) throw new Error("Claim not found");

    claim.status = ExpenseClaimStatus.APPROVED;
    const updatedClaim = await updateExpenseClaim(claim);

    const category = Object.values(CATEGORIES).find(c => c.id === claim.categoryId)!;
    const wallet = db.wallets[0]; // Assume payment from first wallet for simplicity
    
    const newTransaction: Omit<Transaction, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        description: `Expense claim: ${claim.description}`,
        amount: -claim.amount,
        currency: 'USD',
        type: TransactionType.EXPENSE,
        category: category,
        wallet: wallet,
        companyId: claim.companyId,
        color: category.color,
    };
    const createdTransaction = await addTransaction(newTransaction, claim.companyId!);
    
    return { updatedClaim, newTransaction: createdTransaction };
};

export const receivePurchaseOrder = async (poId: string): Promise<{ updatedPO: PurchaseOrder, updatedProducts: Product[] }> => {
    await delay(500);
    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) throw new Error("Purchase Order not found");

    po.status = PurchaseOrderStatus.RECEIVED;
    const updatedPO = await updatePurchaseOrder(po);

    const updatedProducts: Product[] = [];
    for (const item of po.lineItems) {
        const product = db.products.find(p => p.id === item.productId);
        if (product) {
            product.stock += item.quantity;
            const updated = await updateProduct(product);
            updatedProducts.push(updated);
        }
    }

    return { updatedPO, updatedProducts };
};

export const addContributionToGoal = async (goalId: string, amount: number, walletId: string): Promise<{ updatedGoal: FinancialGoal, newTransaction: Transaction }> => {
    await delay(500);
    const goal = db.goals.find(g => g.id === goalId);
    if (!goal) throw new Error("Goal not found");

    goal.currentAmount += amount;
    const updatedGoal = await updateGoal(goal);

    const wallet = db.wallets.find(w => w.id === walletId)!;
    const category = Object.values(CATEGORIES).find(c => c.id === 'cat-exp10')!; // Bank Transfers & Fees

    const newTransaction: Omit<Transaction, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        description: `Contribution to goal: ${goal.name}`,
        amount: -amount,
        currency: wallet.currency,
        type: TransactionType.EXPENSE,
        category: category,
        wallet: wallet,
        companyId: goal.companyId,
        color: category.color,
    };
    const createdTransaction = await addTransaction(newTransaction, goal.companyId!);

    return { updatedGoal, newTransaction: createdTransaction };
};