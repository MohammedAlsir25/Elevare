import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, Wallet } from '../types.ts';
import * as api from '../services/api.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useModal } from '../hooks/useModal.ts';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
    transaction: Transaction | null;
    categories: Category[];
    wallets: Wallet[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, categories, wallets }) => {
    const { isSubmitting } = useData();
    const modalRef = useModal(isOpen, onClose);
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.EXPENSE,
        categoryId: categories[0]?.id || '',
        walletId: wallets[0]?.id || '',
        receipt: null as File | null,
        color: '#7a7a7a',
    });
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: Math.abs(transaction.amount), // Amount should be positive in the form
                date: transaction.date,
                type: transaction.type,
                categoryId: transaction.category.id,
                walletId: transaction.wallet.id,
                receipt: null,
                color: transaction.color || '#7a7a7a',
            });
        } else {
            // Reset for new transaction
            setFormData({
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                type: TransactionType.EXPENSE,
                categoryId: categories.find(c => c.type === TransactionType.EXPENSE)?.id || '',
                walletId: wallets[0]?.id || '',
                receipt: null,
                color: '#7a7a7a',
            });
        }
    }, [transaction, isOpen, categories, wallets]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, receipt: file }));
            setIsOcrLoading(true);
            try {
                const ocrResult = await api.performOcrOnReceipt(file);
                setFormData(prev => ({
                    ...prev,
                    description: ocrResult.vendor,
                    amount: ocrResult.amount,
                    date: ocrResult.date,
                }));
            } catch (error) {
                console.error("OCR failed", error);
                alert("Failed to scan receipt. Please enter details manually.");
            } finally {
                setIsOcrLoading(false);
            }
        }
    };

    const handleDescriptionBlur = async () => {
        if (!transaction && formData.description.trim().length > 3) {
            setIsSuggestingCategory(true);
            try {
                const suggestedCategoryId = await api.suggestCategoryForTransaction(formData.description);
                if (suggestedCategoryId) {
                    const suggestedCategory = categories.find(c => c.id === suggestedCategoryId);
                    // Ensure the suggestion matches the current transaction type
                    if (suggestedCategory && suggestedCategory.type === formData.type) {
                        setFormData(prev => ({ ...prev, categoryId: suggestedCategoryId }));
                    }
                }
            } catch (error) {
                console.error("Category suggestion failed", error);
            } finally {
                setIsSuggestingCategory(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const category = categories.find(c => c.id === formData.categoryId)!;
        const wallet = wallets.find(w => w.id === formData.walletId)!;
        
        const transactionData = {
            id: transaction?.id,
            description: formData.description,
            amount: formData.type === TransactionType.EXPENSE ? -Math.abs(formData.amount) : Math.abs(formData.amount),
            currency: wallet.currency,
            date: formData.date,
            type: formData.type as TransactionType,
            category,
            wallet,
            color: formData.color,
        };
        onSave(transactionData);
    };
    
    const filteredCategories = formData.type === TransactionType.INCOME 
        ? categories.filter(c => c.type === TransactionType.INCOME)
        : categories.filter(c => c.type === TransactionType.EXPENSE);

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="transaction-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <h2 id="transaction-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{transaction ? 'Edit' : 'Add'} Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} onBlur={handleDescriptionBlur} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" step="0.01" className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                                <option value={TransactionType.EXPENSE}>Expense</option>
                                <option value={TransactionType.INCOME}>Income</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="categoryId" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                                {isSuggestingCategory && (
                                    <svg className="animate-spin ml-2 h-4 w-4 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                                {filteredCategories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet</label>
                            <select name="walletId" value={formData.walletId} onChange={handleChange} className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200">
                                {wallets.map((wal: Wallet) => <option key={wal.id} value={wal.id}>{wal.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color Tag</label>
                            <div className="mt-1 flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                <input type="color" name="color" id="color" value={formData.color} onChange={handleChange} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent appearance-none" style={{'WebkitAppearance': 'none'}}/>
                                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{formData.color}</span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receipt (Optional)</label>
                        <div className="relative mt-1">
                            <input type="file" name="receipt" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-800 dark:file:text-gray-300 hover:file:bg-gray-300 dark:hover:file:bg-gray-600"/>
                             {isOcrLoading && (
                                <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center rounded-md">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="ml-2 text-white text-sm">Scanning...</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-36 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save Transaction'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;