import React, { useState, useEffect } from 'react';
import { Budget, BudgetPeriod, Category } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { useModal } from '../hooks/useModal.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (budget: Omit<Budget, 'id'> & { id?: string }) => void;
    budget: Budget | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSave, budget }) => {
    const { isSubmitting } = useData();
    const { addNotification } = useNotification();
    const modalRef = useModal(isOpen, onClose);
    const [formData, setFormData] = useState({
        categoryId: Object.values(CATEGORIES).filter(c => c.type === 'Expense')[0]?.id || '',
        amount: 100,
        period: BudgetPeriod.MONTHLY,
        startDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (budget) {
            setFormData({
                categoryId: budget.categoryId,
                amount: budget.amount,
                period: budget.period,
                startDate: budget.startDate,
            });
        } else {
            // Reset for new budget
            setFormData({
                categoryId: Object.values(CATEGORIES).filter(c => c.type === 'Expense')[0]?.id || '',
                amount: 100,
                period: BudgetPeriod.MONTHLY,
                startDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [budget, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(formData.amount) <= 0) {
            addNotification('Budget amount must be greater than zero.', 'error');
            return;
        }

        const budgetData = {
            id: budget?.id,
            ...formData,
            amount: parseFloat(String(formData.amount))
        };
        onSave(budgetData);
    };

    const expenseCategories = Object.values(CATEGORIES).filter(c => c.type === 'Expense');

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="budget-modal-title">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <h2 id="budget-modal-title" className="text-2xl font-bold text-white mb-4">{budget ? 'Edit' : 'Add'} Budget</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300">Category</label>
                        <select 
                            name="categoryId" 
                            id="categoryId"
                            value={formData.categoryId} 
                            onChange={handleChange} 
                            required
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                        >
                            {expenseCategories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Budget Amount</label>
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="period" className="block text-sm font-medium text-gray-300">Period</label>
                            <select 
                                name="period" 
                                id="period"
                                value={formData.period} 
                                onChange={handleChange}
                                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                            >
                                {Object.values(BudgetPeriod).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            id="startDate"
                            value={formData.startDate} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                        />
                         <p className="text-xs text-gray-500 mt-1">Spending will be tracked from this date for the selected period.</p>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-32 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save Budget'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetModal;