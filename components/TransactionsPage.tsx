import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, Category, Wallet, RecurringTransaction, SortConfig } from '../types.ts';
import TransactionsTable from './TransactionsTable.tsx';
import TransactionModal from './TransactionModal.tsx';
import RecurringTransactionModal from './RecurringTransactionModal.tsx';
import StatementImportModal from './StatementImportModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { ArrowPathIcon, ArrowUpTrayIcon, EditIcon, DeleteIcon } from '../constants.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { usePagination } from '../hooks/usePagination.ts';
import Pagination from './Pagination.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

type Tab = 'single' | 'recurring';

const TransactionsPage: React.FC = () => {
    const { 
        loading, 
        transactions, 
        recurringTransactions, 
        categories, 
        wallets, 
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        refetchData,
    } = useData();
    
    const { addNotification } = useNotification();
    const permissions = usePermissions();

    // UI State
    const [activeTab, setActiveTab] = useState<Tab>('single');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    
    // Single Transaction Handlers
    const handleSave = async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
        try {
            if (transaction.id) {
                await updateTransaction(transaction as Transaction);
                addNotification('Transaction updated.', 'success');
            } else {
                await addTransaction(transaction as Omit<Transaction, 'id'>);
                addNotification('Transaction added.', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            addNotification('Failed to save transaction.', 'error');
            console.error(error);
        }
    };

    const handleDelete = async (transactionId: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(transactionId);
                addNotification('Transaction deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete transaction.', 'error');
                console.error(error);
            }
        }
    };
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = typeFilter === 'all' || t.type === typeFilter;
            const categoryMatch = categoryFilter === 'all' || t.category.id === categoryFilter;
            return searchMatch && typeMatch && categoryMatch;
        });
    }, [transactions, searchTerm, typeFilter, categoryFilter]);

    const { items: sortedTransactions, requestSort, sortConfig } = useSortableData(filteredTransactions);

    const {
        currentPageData: paginatedTransactions,
        currentPage,
        totalPages,
        goToPage,
    } = usePagination(sortedTransactions, 10);
    
    // Recurring Transaction Handlers
    const handleSaveRecurring = async (rt: Omit<RecurringTransaction, 'id' | 'nextDueDate'> & { id?: string }) => {
        try {
            if (rt.id) {
                await updateRecurringTransaction(rt as RecurringTransaction);
                addNotification('Recurring transaction updated.', 'success');
            } else {
                await addRecurringTransaction(rt as Omit<RecurringTransaction, 'id' | 'nextDueDate'>);
                addNotification('Recurring transaction added.', 'success');
            }
            setIsRecurringModalOpen(false);
        } catch (error) {
            addNotification('Failed to save recurring transaction.', 'error');
            console.error(error);
        }
    };

    const handleDeleteRecurring = async (rtId: string) => {
        if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
            try {
                await deleteRecurringTransaction(rtId);
                 addNotification('Recurring transaction deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete recurring transaction.', 'error');
                console.error(error);
            }
        }
    };

    const onImportSuccess = () => {
        setIsImportModalOpen(false);
        refetchData(); // Refetch all data to show imported transactions
    };

    const {
        currentPageData: paginatedRecurring,
        currentPage: recurringCurrentPage,
        totalPages: recurringTotalPages,
        goToPage: recurringGoToPage,
    } = usePagination(recurringTransactions, 10);
    
    if (loading) return <PageWithTableSkeleton />;

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => { setActiveTab('single'); setSearchTerm(''); }}
                    className={`${activeTab === 'single' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Single Transactions
                </button>
                <button
                    onClick={() => { setActiveTab('recurring'); setSearchTerm(''); }}
                    className={`${activeTab === 'recurring' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Recurring
                </button>
            </nav>
        </div>
    );

    const renderRecurringContent = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-gray-600">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Description</th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Frequency</th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Next Due</th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Category</th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Amount</th>
                            {permissions.canEditTransactions && <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecurring.map(rt => (
                             <tr key={rt.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-full mr-3 bg-gray-200 dark:bg-gray-700">
                                            <ArrowPathIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
                                        </div>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{rt.description}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-500 dark:text-gray-400">{rt.frequency}</td>
                                <td className="p-3 text-gray-500 dark:text-gray-400">{rt.nextDueDate}</td>
                                <td className="p-3 text-gray-800 dark:text-gray-300">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: rt.category.color+'20', color: rt.category.color }}>
                                        {rt.category.name}
                                    </span>
                                </td>
                                <td className={`p-3 font-semibold text-right ${rt.type === TransactionType.INCOME ? 'text-accent-green' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: rt.currency }).format(rt.amount)}
                                </td>
                                {permissions.canEditTransactions && (
                                    <td className="p-3 text-center">
                                        <button onClick={() => { setEditingRecurring(rt); setIsRecurringModalOpen(true); }} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDeleteRecurring(rt.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                    </td>
                                )}
                             </tr>
                        ))}
                        {recurringTransactions.length === 0 && (
                            <tr>
                                <td colSpan={permissions.canEditTransactions ? 6 : 5} className="text-center py-8 text-gray-500">
                                    No recurring transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
            {recurringTransactions.length > 0 && (
                <Pagination currentPage={recurringCurrentPage} totalPages={recurringTotalPages} onPageChange={recurringGoToPage} />
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your financial activities.</p>
                </div>
                {permissions.canEditTransactions && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md shadow transition-colors">
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            Import Statement
                        </button>
                        <button onClick={() => activeTab === 'single' ? (setEditingTransaction(null), setIsModalOpen(true)) : (setEditingRecurring(null), setIsRecurringModalOpen(true))} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg transition-colors">
                            {activeTab === 'single' ? 'Add Transaction' : 'Add Recurring'}
                        </button>
                    </div>
                )}
            </header>
            
            {renderTabs()}

            {activeTab === 'single' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                    <input type="text" placeholder="Search by description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"/>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                        <option value="all">All Types</option>
                        <option value={TransactionType.INCOME}>Income</option>
                        <option value={TransactionType.EXPENSE}>Expense</option>
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                        <option value="all">All Categories</option>
                        {categories.map((cat: Category) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                </div>
            )}
            
            <div className="mt-4">
                {activeTab === 'single' ? (
                    <>
                    <TransactionsTable 
                        transactions={paginatedTransactions} 
                        onEdit={permissions.canEditTransactions ? (t) => {setEditingTransaction(t); setIsModalOpen(true);} : undefined} 
                        onDelete={permissions.canEditTransactions ? handleDelete : undefined} 
                        title="All Transactions"
                        requestSort={requestSort}
                        sortConfig={sortConfig}
                    />
                     {filteredTransactions.length > 0 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />
                    )}
                    </>
                ) : (
                    renderRecurringContent()
                )}
            </div>

            {isModalOpen && (
                <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} transaction={editingTransaction} categories={categories} wallets={wallets} />
            )}
            {isRecurringModalOpen && (
                 <RecurringTransactionModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} onSave={handleSaveRecurring} transaction={editingRecurring} categories={categories} wallets={wallets} />
            )}
            {isImportModalOpen && (
                <StatementImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImportSuccess={onImportSuccess} />
            )}
        </div>
    );
};

export default TransactionsPage;
