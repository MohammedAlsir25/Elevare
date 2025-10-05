import React, { useState, useEffect } from 'react';
import { FinancialGoal } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useModal } from '../hooks/useModal.ts';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<FinancialGoal, 'id'> & { id?: string }) => void;
    goal: FinancialGoal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, goal }) => {
    const { isSubmitting } = useData();
    const modalRef = useModal(isOpen, onClose);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: 1000,
        currentAmount: 0,
    });

    useEffect(() => {
        if (goal) {
            setFormData({
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
            });
        } else {
            setFormData({
                name: '',
                targetAmount: 1000,
                currentAmount: 0,
            });
        }
    }, [goal, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : parseFloat(value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: goal?.id, ...formData });
    };

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="goal-modal-title">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <h2 id="goal-modal-title" className="text-2xl font-bold text-white mb-4">{goal ? 'Edit' : 'Add'} Financial Goal</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Goal Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2" placeholder="e.g., New Laptop" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300">Target Amount</label>
                            <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} required min="0" step="1" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                        <div>
                            <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-300">Currently Saved</label>
                            <input type="number" name="currentAmount" value={formData.currentAmount} onChange={handleChange} required min="0" step="0.01" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-28 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save Goal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalModal;