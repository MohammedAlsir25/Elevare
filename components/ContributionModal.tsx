import React, { useState } from 'react';
import { FinancialGoal, Wallet } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useModal } from '../hooks/useModal.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';

interface ContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contribution: { amount: number, walletId: string }) => void;
    goal: FinancialGoal | null;
    wallets: Wallet[];
}

const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose, onSave, goal, wallets }) => {
    const { addNotification } = useNotification();
    const { isSubmitting } = useData();
    const modalRef = useModal(isOpen, onClose);
    const [amount, setAmount] = useState(0);
    const [walletId, setWalletId] = useState(wallets[0]?.id || '');

    if (!isOpen || !goal) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0 && walletId) {
            onSave({ amount, walletId });
        } else {
            addNotification("Please enter a valid amount and select a wallet.", 'error');
        }
    };

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="contribution-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 id="contribution-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add Contribution</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">to "{goal.name}"</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                        <input type="number" name="amount" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} required min="0.01" step="0.01" className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    </div>
                    <div>
                        <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Wallet</label>
                        <select name="walletId" value={walletId} onChange={e => setWalletId(e.target.value)} required className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.name} ({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(wallet.balance)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-40 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save Contribution'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContributionModal;
