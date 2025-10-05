import React, { useState, useEffect } from 'react';
import { Wallet } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useModal } from '../hooks/useModal.ts';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (wallet: Omit<Wallet, 'id' | 'currency'> & { id?: string; currency?: 'USD' | 'EUR' }) => void;
    wallet: Wallet | null;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onSave, wallet }) => {
    const { isSubmitting } = useData();
    const modalRef = useModal(isOpen, onClose);
    const [name, setName] = useState('');
    const [balance, setBalance] = useState(0);
    const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

    useEffect(() => {
        if (wallet) {
            setName(wallet.name);
            setBalance(wallet.balance);
            setCurrency(wallet.currency);
        } else {
            setName('');
            setBalance(0);
            setCurrency('USD');
        }
    }, [wallet, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const walletData = {
            id: wallet?.id,
            name,
            balance,
            currency
        };
        onSave(walletData);
    };

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog" aria-labelledby="wallet-modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 id="wallet-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{wallet ? 'Edit' : 'Add'} Wallet</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                            placeholder="e.g., Main Bank Account"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                               {wallet ? 'Current Balance' : 'Initial Balance'}
                            </label>
                            <input
                                type="number"
                                name="balance"
                                id="balance"
                                value={balance}
                                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                                required
                                step="0.01"
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                            <select
                                name="currency"
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')}
                                required
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-200"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>
                     {!!wallet && <p className="text-xs text-gray-500 dark:text-gray-500">Note: Editing balance will not affect past transactions.</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold flex items-center justify-center w-32 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                            ) : (
                                'Save Wallet'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WalletModal;