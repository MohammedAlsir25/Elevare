import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types.ts';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: Omit<Account, 'id'> & { id?: string }) => void;
    account: Account | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, account }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: AccountType.ASSET,
    });

    useEffect(() => {
        if (account) {
            setFormData({
                code: account.code,
                name: account.name,
                type: account.type,
            });
        } else {
            setFormData({
                code: '',
                name: '',
                type: AccountType.ASSET,
            });
        }
    }, [account, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: account?.id, ...formData });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">{account ? 'Edit' : 'Add'} Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-300">Account Code</label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-300">Account Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200">
                                {Object.values(AccountType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Account Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold">Save Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountModal;