import React, { useState, useEffect } from 'react';
import { ExpenseClaim, ExpenseClaimStatus, TransactionType, Employee } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';

interface ExpenseClaimModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (claim: Omit<ExpenseClaim, 'id'> & { id?: string }) => void;
    claim: ExpenseClaim | null;
    employees: Employee[];
}

const ExpenseClaimModal: React.FC<ExpenseClaimModalProps> = ({ isOpen, onClose, onSave, claim, employees }) => {
    const expenseCategories = Object.values(CATEGORIES).filter(c => c.type === TransactionType.EXPENSE);
    const today = new Date().toISOString().split('T')[0];
    
    const [formData, setFormData] = useState({
        employeeId: '',
        date: today,
        categoryId: '',
        amount: 0,
        description: '',
        status: ExpenseClaimStatus.PENDING,
    });

    useEffect(() => {
        if (claim) {
            setFormData(claim);
        } else {
            setFormData({
                employeeId: employees[0]?.id || '',
                date: today,
                categoryId: expenseCategories[0]?.id || '',
                amount: 0,
                description: '',
                status: ExpenseClaimStatus.PENDING,
            });
        }
    }, [claim, isOpen, employees]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: claim?.id, amount: Number(formData.amount) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{claim ? 'Edit' : 'Submit'} Expense Claim</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee</label>
                        <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200">
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200">
                                {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" step="0.01" className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Expense</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold">Submit Claim</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseClaimModal;