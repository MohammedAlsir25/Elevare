import React, { useState, useEffect } from 'react';
import { RecurringTransaction, TransactionType, Category, Wallet, Frequency } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useModal } from '../hooks/useModal.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';

interface RecurringTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<RecurringTransaction, 'id' | 'nextDueDate'> & { id?: string }) => void;
    transaction: RecurringTransaction | null;
    categories: Category[];
    wallets: Wallet[];
}

const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({ isOpen, onClose, onSave, transaction, categories, wallets }) => {
    const { isSubmitting } = useData();
    const { addNotification } = useNotification();
    const modalRef = useModal(isOpen, onClose);
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        type: TransactionType.EXPENSE,
        categoryId: categories[0]?.id || '',
        walletId: wallets[0]?.id || '',
        frequency: Frequency.MONTHLY,
        startDate: today,
        endDate: '',
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: Math.abs(transaction.amount),
                type: transaction.type,
                categoryId: transaction.category.id,
                walletId: transaction.wallet.id,
                frequency: transaction.frequency,
                startDate: transaction.startDate,
                endDate: transaction.endDate || '',
            });
        } else {
            setFormData({
                description: '',
                amount: 0,
                type: TransactionType.EXPENSE,
                categoryId: categories.find(c => c.type === TransactionType.EXPENSE)?.id || '',
                walletId: wallets[0]?.id || '',
                frequency: Frequency.MONTHLY,
                startDate: today,
                endDate: '',
            });
        }
    }, [transaction, isOpen, categories, wallets]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.amount <= 0) {
            addNotification('Amount must be greater than zero.', 'error');
            return;
        }

        const category = categories.find(c => c.id === formData.categoryId)!;
        const wallet = wallets.find(w => w.id === formData.walletId)!;
        
        onSave({
            id: transaction?.id,
            description: formData.description,
            amount: formData.type === TransactionType.EXPENSE ? -Math.abs(formData.amount) : Math.abs(formData.amount),
            currency: wallet.currency,
            type: formData.type,
            category,
            wallet,
            frequency: formData.frequency,
            startDate: formData.startDate,
            endDate: formData.endDate || undefined,
        });
    };
    
    const filteredCategories = formData.type === TransactionType.INCOME 
        ? categories.filter(c => c.type === TransactionType.INCOME)
        : categories.filter(c => c.type === TransactionType.EXPENSE);

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="recurring-txn-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <h2 id="recurring-txn-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{transaction ? 'Edit' : 'Add'} Recurring Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" step="0.01" className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                                <option value={TransactionType.EXPENSE}>Expense</option>
                                <option value={TransactionType.INCOME}>Income</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                                {filteredCategories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet</label>
                            <select name="walletId" value={formData.walletId} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                                {wallets.map((wal: Wallet) => <option key={wal.id} value={wal.id}>{wal.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                        <select name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                            {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date (Optional)</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-28 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecurringTransactionModal;