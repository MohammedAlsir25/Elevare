import React, { useState, useMemo } from 'react';
import { WalletIcon as DefaultWalletIcon, CreditCardIcon, EditIcon, DeleteIcon } from '../constants.tsx';
import { Wallet } from '../types.ts';
import WalletModal from './WalletModal.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { CardGridSkeleton } from './Skeletons.tsx';
import { useConfirmation } from '../contexts/ConfirmationContext.tsx';
import EmptyState from './EmptyState.tsx';

const WalletsPage: React.FC = () => {
    const { loading, wallets, transactions, addWallet, updateWallet, deleteWallet } = useData();
    const permissions = usePermissions();
    const { addNotification } = useNotification();
    const confirm = useConfirmation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

    const walletBalances = useMemo(() => {
        return wallets.map(wallet => {
             const balance = transactions.filter(t => t.wallet.id === wallet.id)
                                          .reduce((acc, t) => acc + t.amount, wallet.balance);
             return { ...wallet, balance };
        });
    }, [wallets, transactions]);

    const handleAddNew = () => {
        setEditingWallet(null);
        setIsModalOpen(true);
    };

    const handleEdit = (wallet: Wallet) => {
        setEditingWallet(wallet);
        setIsModalOpen(true);
    };

    const handleDelete = async (walletId: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Wallet',
            message: 'Are you sure you want to delete this wallet? This action cannot be undone.',
            confirmText: 'Delete',
            confirmVariant: 'danger',
        });
        if (!isConfirmed) return;

        try {
            await deleteWallet(walletId);
            addNotification('Wallet deleted successfully.', 'success');
        } catch (error) {
            addNotification('Failed to delete wallet.', 'error');
            console.error(error);
        }
    };

    const handleSave = async (walletData: Omit<Wallet, 'id' | 'currency'> & { id?: string; currency?: 'USD' | 'EUR' }) => {
        try {
            if (walletData.id) {
                await updateWallet(walletData as Wallet);
                addNotification('Wallet updated successfully.', 'success');
            } else {
                await addWallet(walletData as Omit<Wallet, 'id'>);
                addNotification('Wallet added successfully.', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            addNotification('Failed to save wallet.', 'error');
            console.error(error);
        }
    };

    const getWalletIcon = (name: string) => {
        if (name.toLowerCase().includes('card')) return CreditCardIcon;
        return DefaultWalletIcon;
    }
    
    if (loading) {
        return <CardGridSkeleton />;
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Wallets</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your accounts and sources of funds.</p>
                </div>
                {permissions.canEditWallets && (
                    <button onClick={handleAddNew} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                        Add New Wallet
                    </button>
                )}
            </header>
            
            {walletBalances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {walletBalances.map(wallet => {
                        const Icon = getWalletIcon(wallet.name);
                        return (
                            <div key={wallet.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Icon className="h-8 w-8 text-brand-secondary mr-3" />
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{wallet.name}</h3>
                                        </div>
                                        {permissions.canEditWallets && (
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleEdit(wallet)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1" aria-label={`Edit wallet ${wallet.name}`}>
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(wallet.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1" aria-label={`Delete wallet ${wallet.name}`}>
                                                    <DeleteIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Current Balance</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <EmptyState
                    icon={DefaultWalletIcon}
                    title="No Wallets Found"
                    message="Get started by adding your first bank account, credit card, or cash wallet."
                    action={permissions.canEditWallets ? {
                        label: 'Add New Wallet',
                        onClick: handleAddNew
                    } : undefined}
                />
            )}


            {isModalOpen && (
                <WalletModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    wallet={editingWallet}
                />
            )}
        </div>
    );
};

export default WalletsPage;
