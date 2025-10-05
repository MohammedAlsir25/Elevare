import { COMPANIES, CATEGORIES } from '../constants.tsx';
import { Wallet, Transaction, Contact, Invoice, Budget, FinancialGoal, Category, TransactionType, Employee, TimesheetEntry, ExpenseClaim, ExpenseClaimStatus, Account, JournalEntry, Product, PurchaseOrder, PurchaseOrderStatus, RecurringTransaction, Company, AdminUser, User, ApiTransaction, ApiTransactionData, ApiContact, ApiContactData, ApiInvoice, ApiInvoiceData, ApiBudgetData, ApiFinancialGoalData, ApiEmployeeData, ApiEmployee, ApiTimesheetEntryData, ApiTimesheetEntry, ApiExpenseClaimData, ApiExpenseClaim, ApiAccountData, ApiAccount, ApiJournalEntryData, ApiJournalEntry, ApiProductData, ApiProduct, ApiPurchaseOrderData, ApiPurchaseOrder, ApiAdminUserData, ApiAdminUser } from '../types.ts';
import { WALLETS, TRANSACTIONS, CONTACTS, INVOICES, BUDGETS, GOALS, EMPLOYEES, ACCOUNTS, PRODUCTS, JOURNAL_ENTRIES, PURCHASE_ORDERS, TIMESHEETS, EXPENSE_CLAIMS, RECURRING_TRANSACTIONS, ADMIN_USERS } from '../constants.tsx';

// Simulate realistic network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const API_BASE_URL = 'http://localhost:4000/api';

// --- AUTH & API INTERCEPTOR ---

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('elevare-token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// This function will wrap all protected API calls
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const makeRequest = async () => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers,
            },
        });
        return response;
    };

    let response = await makeRequest();

    if (response.status === 401) {
        if (isRefreshing) {
            // Wait for the token to be refreshed
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
            .then(() => makeRequest()) // Retry the original request
            .then(res => {
                if (!res.ok) throw new Error('Request failed after token refresh');
                return res;
            });
        }

        isRefreshing = true;
        const refreshToken = localStorage.getItem('elevare-refresh-token');
        if (!refreshToken) {
            processQueue(new Error('No refresh token available'));
            // Hard logout
            localStorage.clear();
            window.location.href = '/'; 
            return Promise.reject('No refresh token');
        }

        try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: refreshToken }),
            });

            if (!refreshResponse.ok) {
                throw new Error('Refresh token is invalid');
            }

            const { accessToken } = await refreshResponse.json();
            localStorage.setItem('elevare-token', accessToken);
            processQueue(null, accessToken);
            
            // Retry the original request with the new token
            response = await makeRequest();

        } catch (error) {
            processQueue(error);
             // Hard logout
            localStorage.clear();
            window.location.href = '/'; 
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        throw new Error(errorData.message || 'An API error occurred');
    }

    return response;
};

// Generic apiCall function that uses the interceptor
const apiCall = async <T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> => {
    const options: RequestInit = { method };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetchWithAuth(endpoint, options);
    
    // For DELETE requests that might return 204 No Content
    if (method === 'DELETE' && response.status === 204) {
         return { id: endpoint.split('/').pop() } as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        // Handle empty responses for methods other than DELETE
        return {} as T;
    }
};


// --- AUTH API (Public endpoints) ---
export const login = async (email: string, pass: string): Promise<{ accessToken: string, refreshToken: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
    });
    if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Login failed');
    }
    return response.json();
};

export const logout = async (refreshToken: string): Promise<void> => {
     await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refreshToken })
    });
};


// --- AI & AUTOMATION API ---

export const processNaturalLanguageQuery = async (prompt: string): Promise<string> => {
    const response = await apiCall<{ answer: string }>('/ai/query', 'POST', { prompt });
    return response.answer;
};

export const getCashFlowForecast = async (): Promise<{ date: string, balance: number }[]> => {
    await delay(500);
    const forecast = [];
    let lastBalance = 15000;
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

// --- DATA API ---

export const getCompanies = async (): Promise<Company[]> => {
    await delay(100);
    return COMPANIES;
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
export const getWallets = (companyId: string): Promise<Wallet[]> => apiCall('/wallets');
export const addWallet = (wallet: Omit<Wallet, 'id'>): Promise<Wallet> => apiCall('/wallets', 'POST', wallet);
export const updateWallet = (wallet: Wallet): Promise<Wallet> => apiCall(`/wallets/${wallet.id}`, 'PUT', wallet);
export const deleteWallet = (id: string): Promise<{ id: string }> => apiCall(`/wallets/${id}`, 'DELETE');

// Transactions
export const getTransactions = (): Promise<ApiTransaction[]> => apiCall('/transactions');
export const addTransaction = (transaction: ApiTransactionData): Promise<ApiTransaction> => apiCall('/transactions', 'POST', transaction);
export const updateTransaction = (transaction: Omit<ApiTransaction, 'companyId'>): Promise<ApiTransaction> => apiCall(`/transactions/${transaction.id}`, 'PUT', transaction);
export const deleteTransaction = (id: string): Promise<{ id: string }> => apiCall(`/transactions/${id}`, 'DELETE');

// Recurring Transactions (MOCKED - requires backend implementation)
let mockRecurringTransactions = RECURRING_TRANSACTIONS;
export const getRecurringTransactions = async (companyId: string): Promise<RecurringTransaction[]> => {
    await delay(100);
    return mockRecurringTransactions.filter(rt => rt.companyId === companyId)
};
export const addRecurringTransaction = async (rt: Omit<RecurringTransaction, 'id' | 'nextDueDate'>, companyId: string) => {
    await delay(400);
    const today = new Date();
    const nextDueDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];
    const newRt = { ...rt, id: `new${Date.now()}`, companyId, nextDueDate };
    mockRecurringTransactions.unshift(newRt as RecurringTransaction);
    return newRt as RecurringTransaction;
};
export const updateRecurringTransaction = async (rt: RecurringTransaction) => {
    await delay(400);
    const index = mockRecurringTransactions.findIndex(i => i.id === rt.id);
    if (index > -1) {
        mockRecurringTransactions[index] = rt;
        return rt;
    }
    throw new Error("Item not found");
};
export const deleteRecurringTransaction = async (id: string) => {
    await delay(400);
    mockRecurringTransactions = mockRecurringTransactions.filter(i => i.id !== id);
    return { id };
};

// Contacts
export const getContacts = (companyId: string): Promise<Contact[]> => apiCall('/contacts');
export const addContact = (contact: ApiContactData): Promise<Contact> => apiCall('/contacts', 'POST', contact);
export const updateContact = (contact: Contact): Promise<Contact> => apiCall(`/contacts/${contact.id}`, 'PUT', contact);
export const deleteContact = (id: string): Promise<{ id: string }> => apiCall(`/contacts/${id}`, 'DELETE');

// Invoices
export const getInvoices = (companyId: string): Promise<ApiInvoice[]> => apiCall('/invoices');
export const getInvoicesForCustomer = async (customerId: string): Promise<Invoice[]> => {
    // This is a mock for the customer portal, a real backend would have an endpoint for this
    await delay(200);
    const allInvoices = await getInvoices("mock"); // Company ID doesn't matter for this mock
    const customerInvoices = allInvoices.filter(inv => inv.customerId === customerId);
    // Enrich with customer data for frontend
    const allContacts = await getContacts("mock");
    const customer = allContacts.find(c => c.id === customerId);
    return customerInvoices.map(inv => ({...inv, customer: customer!}));
};
export const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>, companyId: string): Promise<ApiInvoice> => {
    const { customer, ...rest } = invoice;
    const apiInvoiceData: ApiInvoiceData = { ...rest, customerId: customer.id };
    return apiCall('/invoices', 'POST', apiInvoiceData);
};
export const updateInvoice = (invoice: Invoice): Promise<ApiInvoice> => {
    const { customer, companyId, invoiceNumber, ...rest } = invoice; 
    const apiInvoiceData: ApiInvoiceData = { ...rest, customerId: customer.id };
    return apiCall(`/invoices/${invoice.id}`, 'PUT', apiInvoiceData);
};
export const deleteInvoice = (id: string): Promise<{ id: string }> => apiCall(`/invoices/${id}`, 'DELETE');

// Budgets
export const getBudgets = (companyId: string): Promise<Budget[]> => apiCall('/budgets');
export const addBudget = (budget: ApiBudgetData, companyId: string): Promise<Budget> => apiCall('/budgets', 'POST', budget);
export const updateBudget = (budget: Budget): Promise<Budget> => apiCall(`/budgets/${budget.id}`, 'PUT', budget);
export const deleteBudget = (id: string): Promise<{ id: string }> => apiCall(`/budgets/${id}`, 'DELETE');

// Goals
export const getGoals = (companyId: string): Promise<FinancialGoal[]> => apiCall('/goals');
export const addGoal = (goal: ApiFinancialGoalData, companyId: string): Promise<FinancialGoal> => apiCall('/goals', 'POST', goal);
export const updateGoal = (goal: FinancialGoal): Promise<FinancialGoal> => apiCall(`/goals/${goal.id}`, 'PUT', goal);
export const deleteGoal = (id: string): Promise<{ id: string }> => apiCall(`/goals/${id}`, 'DELETE');
export const addContributionToGoal = (goalId: string, amount: number, walletId: string): Promise<{ updatedGoal: FinancialGoal, newTransaction: ApiTransaction }> => apiCall(`/goals/${goalId}/contribute`, 'POST', { amount, walletId });

// Employees
export const getEmployees = (companyId: string): Promise<ApiEmployee[]> => apiCall('/employees');
export const addEmployee = (employee: ApiEmployeeData): Promise<ApiEmployee> => apiCall('/employees', 'POST', employee);
export const updateEmployee = (employee: ApiEmployee): Promise<ApiEmployee> => apiCall(`/employees/${employee.id}`, 'PUT', employee);
export const deleteEmployee = (id: string): Promise<{ id: string }> => apiCall(`/employees/${id}`, 'DELETE');

// Accounts
export const getAccounts = (companyId: string): Promise<ApiAccount[]> => apiCall('/accounts');
export const addAccount = (account: ApiAccountData): Promise<ApiAccount> => apiCall('/accounts', 'POST', account);
export const updateAccount = (account: ApiAccount): Promise<ApiAccount> => apiCall(`/accounts/${account.id}`, 'PUT', account);
export const deleteAccount = (id: string): Promise<{ id: string }> => apiCall(`/accounts/${id}`, 'DELETE');

// Products
export const getProducts = (companyId: string): Promise<ApiProduct[]> => apiCall('/products');
export const addProduct = (product: ApiProductData): Promise<ApiProduct> => apiCall('/products', 'POST', product);
export const updateProduct = (product: ApiProduct): Promise<ApiProduct> => apiCall(`/products/${product.id}`, 'PUT', product);
export const deleteProduct = (id: string): Promise<{ id: string }> => apiCall(`/products/${id}`, 'DELETE');

// Journal Entries
export const getJournalEntries = (companyId: string): Promise<ApiJournalEntry[]> => apiCall('/journal-entries');
export const addJournalEntry = (entry: ApiJournalEntryData): Promise<ApiJournalEntry> => apiCall('/journal-entries', 'POST', entry);
export const updateJournalEntry = (entry: ApiJournalEntry): Promise<ApiJournalEntry> => apiCall(`/journal-entries/${entry.id}`, 'PUT', entry);
export const deleteJournalEntry = (id: string): Promise<{ id: string }> => apiCall(`/journal-entries/${id}`, 'DELETE');

// Purchase Orders
export const getPurchaseOrders = (companyId: string): Promise<ApiPurchaseOrder[]> => apiCall('/purchase-orders');
export const addPurchaseOrder = (po: ApiPurchaseOrderData): Promise<ApiPurchaseOrder> => apiCall('/purchase-orders', 'POST', po);
export const updatePurchaseOrder = (po: ApiPurchaseOrder): Promise<ApiPurchaseOrder> => apiCall(`/purchase-orders/${po.id}`, 'PUT', po);
export const deletePurchaseOrder = (id: string): Promise<{ id: string }> => apiCall(`/purchase-orders/${id}`, 'DELETE');
export const receivePurchaseOrder = (poId: string): Promise<{ updatedPO: PurchaseOrder, updatedProducts: Product[] }> => apiCall(`/purchase-orders/${poId}/receive`, 'POST');


// Timesheets
export const getTimesheets = (companyId: string): Promise<ApiTimesheetEntry[]> => apiCall('/timesheets');
export const addTimesheet = (entry: ApiTimesheetEntryData): Promise<ApiTimesheetEntry> => apiCall('/timesheets', 'POST', entry);
export const updateTimesheet = (entry: ApiTimesheetEntry): Promise<ApiTimesheetEntry> => apiCall(`/timesheets/${entry.id}`, 'PUT', entry);
export const deleteTimesheet = (id: string): Promise<{ id: string }> => apiCall(`/timesheets/${id}`, 'DELETE');

// Expense Claims
export const getExpenseClaims = (companyId: string): Promise<ApiExpenseClaim[]> => apiCall('/expense-claims');
export const addExpenseClaim = (claim: ApiExpenseClaimData): Promise<ApiExpenseClaim> => apiCall('/expense-claims', 'POST', claim);
export const updateExpenseClaim = (claim: ApiExpenseClaim): Promise<ApiExpenseClaim> => apiCall(`/expense-claims/${claim.id}`, 'PUT', claim);
export const approveExpenseClaim = (claimId: string): Promise<{ updatedClaim: ExpenseClaim, newTransaction: ApiTransaction }> => apiCall(`/expense-claims/${claimId}/approve`, 'POST');

// Users (Admin)
export const getUsers = (companyId: string): Promise<ApiAdminUser[]> => apiCall('/users');
export const addUser = (user: ApiAdminUserData): Promise<ApiAdminUser> => apiCall('/users', 'POST', user);
export const updateUser = (user: ApiAdminUser): Promise<ApiAdminUser> => apiCall(`/users/${user.id}`, 'PUT', user);
export const deleteUser = (id: string): Promise<{ id: string }> => apiCall(`/users/${id}`, 'DELETE');