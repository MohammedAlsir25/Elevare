import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { DataContextType, Transaction, Wallet, Contact, Invoice, Budget, Employee, Account, Product, JournalEntry, PurchaseOrder, TimesheetEntry, ExpenseClaim, FinancialGoal, RecurringTransaction, Category, AdminUser } from '../types.ts';
import * as api from '../services/api.ts';
import { useCompany } from './CompanyContext.tsx';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { selectedCompanyId } = useCompany();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
    const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({ USD: 1 });
    const [users, setUsers] = useState<AdminUser[]>([]);

    const fetchData = useCallback(async (companyId: string) => {
        setLoading(true);
        try {
            const [
                transactionsData, recurringData, walletsData, contactsData, invoicesData, 
                budgetsData, goalsData, employeesData, accountsData, productsData, 
                journalData, poData, timesheetData, claimsData, categoriesData, ratesData,
                usersData,
            ] = await Promise.all([
                api.getTransactions(companyId),
                api.getRecurringTransactions(companyId),
                api.getWallets(companyId),
                api.getContacts(companyId),
                api.getInvoices(companyId),
                api.getBudgets(companyId),
                api.getGoals(companyId),
                api.getEmployees(companyId),
                api.getAccounts(companyId),
                api.getProducts(companyId),
                api.getJournalEntries(companyId),
                api.getPurchaseOrders(companyId),
                api.getTimesheets(companyId),
                api.getExpenseClaims(companyId),
                api.getCategories(),
                api.getExchangeRates(),
                api.getUsers(companyId),
            ]);
            setTransactions(transactionsData);
            setRecurringTransactions(recurringData);
            setWallets(walletsData);
            setContacts(contactsData);
            setInvoices(invoicesData);
            setBudgets(budgetsData);
            setGoals(goalsData);
            setEmployees(employeesData);
            setAccounts(accountsData);
            setProducts(productsData);
            setJournalEntries(journalData);
            setPurchaseOrders(poData);
            setTimesheets(timesheetData);
            setExpenseClaims(claimsData);
            setCategories(categoriesData);
            setExchangeRates(ratesData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch data for company:", companyId, error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            fetchData(selectedCompanyId);
        }
    }, [selectedCompanyId, fetchData]);

    // --- CRUD Handlers ---
    
    // Generic handlers that call API and update local state
    const createHandler = <T extends { id: string }, U>(
        setter: React.Dispatch<React.SetStateAction<T[]>>, 
        apiFunc: (data: U, companyId: string) => Promise<T>
    ) => async (item: U) => {
        if (!selectedCompanyId) throw new Error("No company selected");
        setIsSubmitting(true);
        try {
            const newItem = await apiFunc(item, selectedCompanyId);
            setter(prev => [newItem, ...prev]);
        } catch (error) {
            console.error("Create operation failed:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateHandler = <T extends { id: string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>, 
        apiFunc: (data: T) => Promise<T>
    ) => async (item: T) => {
        setIsSubmitting(true);
        try {
            const updatedItem = await apiFunc(item);
            setter(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        } catch (error) {
            console.error("Update operation failed:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteHandler = <T extends { id: string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>, 
        apiFunc: (id: string) => Promise<{ id: string }>
    ) => async (id: string) => {
        setIsSubmitting(true);
        try {
            await apiFunc(id);
            setter(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error("Delete operation failed:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Business Logic Handlers ---

    const approveExpenseClaim = async (claimId: string) => {
        setIsSubmitting(true);
        try {
            const { updatedClaim, newTransaction } = await api.approveExpenseClaim(claimId);
            setExpenseClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
            setTransactions(prev => [newTransaction, ...prev]);
        } catch(error) {
            console.error("Failed to approve expense claim:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const receivePurchaseOrder = async (poId: string) => {
        setIsSubmitting(true);
        try {
            const { updatedPO, updatedProducts } = await api.receivePurchaseOrder(poId);
            setPurchaseOrders(prev => prev.map(p => p.id === updatedPO.id ? updatedPO : p));
            setProducts(prev => prev.map(p => updatedProducts.find(up => up.id === p.id) || p));
        } catch(error) {
            console.error("Failed to receive PO:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const addContributionToGoal = async (goalId: string, amount: number, walletId: string) => {
        setIsSubmitting(true);
        try {
            const { updatedGoal, newTransaction } = await api.addContributionToGoal(goalId, amount, walletId);
            setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
            setTransactions(prev => [newTransaction, ...prev]);
        } catch(error) {
            console.error("Failed to add contribution:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const value: DataContextType = {
        loading,
        isSubmitting,
        transactions,
        recurringTransactions,
        wallets,
        contacts,
        invoices,
        budgets,
        goals,
        employees,
        accounts,
        products,
        journalEntries,
        purchaseOrders,
        timesheets,
        expenseClaims,
        categories,
        exchangeRates,
        users,
        refetchData: () => { if(selectedCompanyId) fetchData(selectedCompanyId) },
        
        // Transaction CRUD
        addTransaction: createHandler(setTransactions, api.addTransaction),
        updateTransaction: updateHandler(setTransactions, api.updateTransaction),
        deleteTransaction: deleteHandler(setTransactions, api.deleteTransaction),

        // Recurring Transaction CRUD
        addRecurringTransaction: createHandler(setRecurringTransactions, api.addRecurringTransaction),
        updateRecurringTransaction: updateHandler(setRecurringTransactions, api.updateRecurringTransaction),
        deleteRecurringTransaction: deleteHandler(setRecurringTransactions, api.deleteRecurringTransaction),

        // Wallet CRUD
        addWallet: createHandler(setWallets, api.addWallet),
        updateWallet: updateHandler(setWallets, api.updateWallet),
        deleteWallet: deleteHandler(setWallets, api.deleteWallet),

        // Contact CRUD
        addContact: createHandler(setContacts, api.addContact),
        updateContact: updateHandler(setContacts, api.updateContact),
        deleteContact: deleteHandler(setContacts, api.deleteContact),

        // Invoice CRUD
        addInvoice: createHandler(setInvoices, api.addInvoice),
        updateInvoice: updateHandler(setInvoices, api.updateInvoice),
        deleteInvoice: deleteHandler(setInvoices, api.deleteInvoice),

        // Budget CRUD
        addBudget: createHandler(setBudgets, api.addBudget),
        updateBudget: updateHandler(setBudgets, api.updateBudget),
        deleteBudget: deleteHandler(setBudgets, api.deleteBudget),

        // Goal CRUD
        addGoal: createHandler(setGoals, api.addGoal),
        updateGoal: updateHandler(setGoals, api.updateGoal),
        deleteGoal: deleteHandler(setGoals, api.deleteGoal),
        addContributionToGoal,
        
        // Employee CRUD
        addEmployee: createHandler(setEmployees, api.addEmployee),
        updateEmployee: updateHandler(setEmployees, api.updateEmployee),
        deleteEmployee: deleteHandler(setEmployees, api.deleteEmployee),
        
        // Account CRUD
        addAccount: createHandler(setAccounts, api.addAccount),
        updateAccount: updateHandler(setAccounts, api.updateAccount),
        deleteAccount: deleteHandler(setAccounts, api.deleteAccount),
        
        // Product CRUD
        addProduct: createHandler(setProducts, api.addProduct),
        updateProduct: updateHandler(setProducts, api.updateProduct),
        deleteProduct: deleteHandler(setProducts, api.deleteProduct),

        // Journal Entry CRUD
        addJournalEntry: createHandler(setJournalEntries, api.addJournalEntry),
        updateJournalEntry: updateHandler(setJournalEntries, api.updateJournalEntry),
        deleteJournalEntry: deleteHandler(setJournalEntries, api.deleteJournalEntry),

        // PO CRUD
        addPurchaseOrder: createHandler(setPurchaseOrders, api.addPurchaseOrder),
        updatePurchaseOrder: updateHandler(setPurchaseOrders, api.updatePurchaseOrder),
        deletePurchaseOrder: deleteHandler(setPurchaseOrders, api.deletePurchaseOrder),
        receivePurchaseOrder,

        // Timesheet CRUD
        addTimesheet: createHandler(setTimesheets, api.addTimesheet),
        updateTimesheet: updateHandler(setTimesheets, api.updateTimesheet),
        deleteTimesheet: deleteHandler(setTimesheets, api.deleteTimesheet),

        // Expense Claim CRUD
        addExpenseClaim: createHandler(setExpenseClaims, api.addExpenseClaim),
        updateExpenseClaim: updateHandler(setExpenseClaims, api.updateExpenseClaim),
        approveExpenseClaim,

        // User CRUD
        addUser: createHandler(setUsers, api.addUser),
        updateUser: updateHandler(setUsers, api.updateUser),
        deleteUser: deleteHandler(setUsers, api.deleteUser),
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};