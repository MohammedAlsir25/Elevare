import React, { useState, useMemo } from 'react';
import { Account, AccountType, JournalEntry } from '../types.ts';
import AccountModal from './AccountModal.tsx';
import JournalEntryModal from './JournalEntryModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { EditIcon, DeleteIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '../constants.tsx';
import { useSortableData } from '../hooks/useSortableData.ts';
import { PageWithTableSkeleton } from './Skeletons.tsx';

const typeColors: { [key in AccountType]: string } = {
    [AccountType.ASSET]: 'bg-blue-500/20 text-blue-400',
    [AccountType.LIABILITY]: 'bg-orange-500/20 text-orange-400',
    [AccountType.EQUITY]: 'bg-purple-500/20 text-purple-400',
    [AccountType.INCOME]: 'bg-accent-green/20 text-accent-green',
    [AccountType.EXPENSE]: 'bg-accent-red/20 text-accent-red',
};

type Tab = 'accounts' | 'journal';

// --- Accounts Content Component ---
const AccountsContent: React.FC<{
    accounts: Account[];
    searchTerm: string;
    permissions: ReturnType<typeof usePermissions>;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
}> = ({ accounts, searchTerm, permissions, onEdit, onDelete }) => {
    const filteredAccounts = useMemo(() => accounts.filter(acc => acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.code.toLowerCase().includes(searchTerm.toLowerCase())), [accounts, searchTerm]);
    const { items: sortedAccounts, requestSort, sortConfig } = useSortableData(filteredAccounts);

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />;
        if (sortConfig.direction === 'ascending') return <ChevronUpIcon className="h-4 w-4 ml-1" />;
        return <ChevronDownIcon className="h-4 w-4 ml-1" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-gray-600">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('code')} className="flex items-center group">Code {getSortIndicator('code')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('name')} className="flex items-center group">Account Name {getSortIndicator('name')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('type')} className="flex items-center group">Type {getSortIndicator('type')}</button></th>
                            {permissions.canEditAccounting && <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAccounts.map(account => (
                            <tr key={account.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 font-mono text-gray-500 dark:text-gray-400">{account.code}</td>
                                <td className="p-3 font-medium text-gray-900 dark:text-white">{account.name}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[account.type]}`}>{account.type}</span>
                                </td>
                                {permissions.canEditAccounting && (
                                    <td className="p-3 text-center">
                                        <button onClick={() => onEdit(account)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => onDelete(account.id)} className="text-gray-400 dark:text-gray-500 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Journal Content Component ---
const JournalContent: React.FC<{
    journalEntries: JournalEntry[];
    searchTerm: string;
    permissions: ReturnType<typeof usePermissions>;
    onEdit: (entry: JournalEntry) => void;
    onDelete: (id: string) => void;
}> = ({ journalEntries, searchTerm, permissions, onEdit, onDelete }) => {
     const filteredJournalEntries = useMemo(() => journalEntries.filter(je => je.ref.toLowerCase().includes(searchTerm.toLowerCase())), [journalEntries, searchTerm]);
     const { items: sortedJournalEntries, requestSort, sortConfig } = useSortableData(filteredJournalEntries);
     const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />;
        if (sortConfig.direction === 'ascending') return <ChevronUpIcon className="h-4 w-4 ml-1" />;
        return <ChevronDownIcon className="h-4 w-4 ml-1" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-gray-600">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('date')} className="flex items-center group">Date {getSortIndicator('date')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400"><button onClick={() => requestSort('ref')} className="flex items-center group">Reference {getSortIndicator('ref')}</button></th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Total Debit</th>
                            <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Total Credit</th>
                            {permissions.canEditAccounting && <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedJournalEntries.map(entry => {
                            const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
                            return (
                                <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 text-gray-500 dark:text-gray-400">{entry.date}</td>
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">{entry.ref}</td>
                                    <td className="p-3 text-right text-gray-800 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDebit)}</td>
                                    <td className="p-3 text-right text-gray-800 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDebit)}</td>
                                    {permissions.canEditAccounting && (
                                        <td className="p-3 text-center">
                                            <button onClick={() => onEdit(entry)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                            <button onClick={() => onDelete(entry.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2"><DeleteIcon className="h-5 w-5" /></button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const AccountingPage: React.FC = () => {
    const { 
        loading, 
        accounts, 
        journalEntries,
        addAccount, updateAccount, deleteAccount,
        addJournalEntry, updateJournalEntry, deleteJournalEntry
    } = useData();
    const { addNotification } = useNotification();
    const permissions = usePermissions();
    
    const [activeTab, setActiveTab] = useState<Tab>('accounts');
    const [searchTerm, setSearchTerm] = useState('');

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);

    const handleSaveAccount = async (account: Omit<Account, 'id'> & { id?: string }) => {
        try {
            if (account.id) {
                await updateAccount(account as Account);
                addNotification('Account updated.', 'success');
            } else {
                await addAccount(account as Omit<Account, 'id'>);
                addNotification('Account added.', 'success');
            }
            setIsAccountModalOpen(false);
        } catch (error) {
            addNotification('Failed to save account.', 'error');
            console.error(error);
        }
    };
    
    const handleDeleteAccount = async (accountId: string) => {
        if(window.confirm('Are you sure? This could affect existing journal entries.')) {
            try {
                await deleteAccount(accountId);
                addNotification('Account deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete account.', 'error');
                console.error(error);
            }
        }
    };
    
    const handleSaveJournal = async (entry: Omit<JournalEntry, 'id'> & { id?: string }) => {
        try {
            if (entry.id) {
                await updateJournalEntry(entry as JournalEntry);
                addNotification('Journal entry updated.', 'success');
            } else {
                await addJournalEntry(entry as Omit<JournalEntry, 'id'>);
                addNotification('Journal entry added.', 'success');
            }
            setIsJournalModalOpen(false);
        } catch (error) {
            addNotification('Failed to save journal entry.', 'error');
            console.error(error);
        }
    };
    
     const handleDeleteJournal = async (entryId: string) => {
        if(window.confirm('Are you sure?')) {
            try {
                await deleteJournalEntry(entryId);
                addNotification('Journal entry deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete journal entry.', 'error');
                console.error(error);
            }
        }
    };
    
    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => { setActiveTab('accounts'); setSearchTerm(''); }}
                    className={`${activeTab === 'accounts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Chart of Accounts
                </button>
                <button
                    onClick={() => { setActiveTab('journal'); setSearchTerm(''); }}
                    className={`${activeTab === 'journal' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Journal Entries
                </button>
            </nav>
        </div>
    );
    
    if (loading) return <PageWithTableSkeleton />;

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Accounting</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your Chart of Accounts and Journal Entries.</p>
                </div>
                {permissions.canEditAccounting && (
                    <button 
                        onClick={() => {
                            if (activeTab === 'accounts') { setEditingAccount(null); setIsAccountModalOpen(true); }
                            else { setEditingJournalEntry(null); setIsJournalModalOpen(true); }
                        }} 
                        className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg"
                    >
                        {activeTab === 'accounts' ? 'Add Account' : 'Add Journal Entry'}
                    </button>
                )}
            </header>
            
            {renderTabs()}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                <input
                    type="text"
                    placeholder={activeTab === 'accounts' ? "Search by account name or code..." : "Search by reference..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                />
            </div>
            
            <div className="mt-4">
                {activeTab === 'accounts' ? (
                    <AccountsContent 
                        accounts={accounts} 
                        searchTerm={searchTerm} 
                        permissions={permissions}
                        onEdit={(account) => { setEditingAccount(account); setIsAccountModalOpen(true); }}
                        onDelete={handleDeleteAccount}
                    />
                ) : (
                    <JournalContent 
                        journalEntries={journalEntries}
                        searchTerm={searchTerm}
                        permissions={permissions}
                        onEdit={(entry) => { setEditingJournalEntry(entry); setIsJournalModalOpen(true); }}
                        onDelete={handleDeleteJournal}
                    />
                )}
            </div>

            {isAccountModalOpen && <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={handleSaveAccount} account={editingAccount}/>}
            {isJournalModalOpen && <JournalEntryModal isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} onSave={handleSaveJournal} entry={editingJournalEntry} accounts={accounts} />}
        </div>
    );
};

export default AccountingPage;