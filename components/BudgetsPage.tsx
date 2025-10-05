import React, { useState, useMemo } from 'react';
import { Budget, TransactionType, Category, FinancialGoal, Wallet } from '../types.ts';
import BudgetModal from './BudgetModal.tsx';
import GoalModal from './GoalModal.tsx';
import ContributionModal from './ContributionModal.tsx';
import { FlagIcon, EditIcon, DeleteIcon } from '../constants.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useData } from '../contexts/DataContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { CardGridSkeleton } from './Skeletons.tsx';

type Tab = 'budgets' | 'goals';

const BudgetsContent: React.FC<{
    budgets: Budget[];
    transactions: any[];
    categories: Category[];
    permissions: ReturnType<typeof usePermissions>;
    onEdit: (budget: Budget) => void;
    onDelete: (id: string) => void;
}> = ({ budgets, transactions, categories, permissions, onEdit, onDelete }) => {
    const budgetDetails = useMemo(() => {
        return budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            if (!category) return null;
            const budgetMonth = new Date(budget.startDate).getMonth();
            const budgetYear = new Date(budget.startDate).getFullYear();
            const spent = transactions.filter(t => t.category.id === budget.categoryId && t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === budgetMonth && new Date(t.date).getFullYear() === budgetYear).reduce((acc, t) => acc + Math.abs(t.amount), 0);
            const remaining = budget.amount - spent;
            const progress = Math.min((spent / budget.amount) * 100, 100);
            let progressBarColor = 'bg-accent-green';
            if (progress > 90) progressBarColor = 'bg-accent-red';
            else if (progress > 70) progressBarColor = 'bg-accent-yellow';
            return { ...budget, category, spent, remaining, progress, progressBarColor };
        }).filter(Boolean) as (Budget & { category: Category; spent: number; remaining: number; progress: number; progressBarColor: string })[];
    }, [budgets, transactions, categories]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {budgetDetails.map(budget => (
                <div key={budget.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    {/* Budget Card Content */}
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center">
                            <div className="p-2 rounded-full mr-3" style={{ backgroundColor: budget.category.color + '33' }}><budget.category.icon className="h-6 w-6" style={{ color: budget.category.color }}/></div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{budget.category.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{budget.period} Budget</p>
                            </div>
                        </div>
                        {permissions.canEditBudgets && (
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onEdit(budget)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                <button onClick={() => onDelete(budget.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1"><DeleteIcon className="h-5 w-5" /></button>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget.spent)}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400"> of {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><div className={`${budget.progressBarColor} h-2.5 rounded-full`} style={{ width: `${budget.progress}%` }}></div></div>
                        <p className={`text-sm mt-2 text-right ${budget.remaining < 0 ? 'text-accent-red' : 'text-gray-500 dark:text-gray-400'}`}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget.remaining)} {budget.remaining >= 0 ? 'left' : 'over'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const GoalsContent: React.FC<{
    goals: FinancialGoal[];
    permissions: ReturnType<typeof usePermissions>;
    onEdit: (goal: FinancialGoal) => void;
    onDelete: (id: string) => void;
    onAddContribution: (goal: FinancialGoal) => void;
}> = ({ goals, permissions, onEdit, onDelete, onAddContribution }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map(goal => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                    <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                                {permissions.canEditBudgets && (
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => onEdit(goal)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => onDelete(goal.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1"><DeleteIcon className="h-5 w-5" /></button>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.currentAmount)}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400"> of {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.targetAmount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-sm mt-2 text-right text-gray-500 dark:text-gray-400">{progress.toFixed(1)}% complete</p>
                        </div>
                        {permissions.canEditBudgets && (
                            <button onClick={() => onAddContribution(goal)} className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-secondary/20 text-brand-secondary font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary/30">
                                <FlagIcon className="h-5 w-5" />
                                Add Contribution
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    );
};

const BudgetsPage: React.FC = () => {
    const { 
        loading, 
        budgets, 
        transactions, 
        goals, 
        wallets, 
        categories,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addContributionToGoal,
    } = useData();

    const permissions = usePermissions();
    const { addNotification } = useNotification();
    
    const [activeTab, setActiveTab] = useState<Tab>('budgets');

    // Budget modal state
    const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    // Goal modal state
    const [isGoalModalOpen, setGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

    // Contribution modal state
    const [isContributionModalOpen, setContributionModalOpen] = useState(false);
    const [contributingToGoal, setContributingToGoal] = useState<FinancialGoal | null>(null);

    const handleSaveBudget = async (budget: Omit<Budget, 'id'> & { id?: string }) => {
        try {
            if (budget.id) {
                await updateBudget(budget as Budget);
                addNotification('Budget updated.', 'success');
            } else {
                await addBudget(budget as Omit<Budget, 'id'>);
                addNotification('Budget added.', 'success');
            }
            setBudgetModalOpen(false);
        } catch (error) {
            addNotification('Failed to save budget.', 'error');
            console.error(error);
        }
    };

    const handleDeleteBudget = async (budgetId: string) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await deleteBudget(budgetId);
                addNotification('Budget deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete budget.', 'error');
                console.error(error);
            }
        }
    };
    
    const handleSaveGoal = async (goal: Omit<FinancialGoal, 'id'> & { id?: string }) => {
        try {
            if (goal.id) {
                await updateGoal(goal as FinancialGoal);
                addNotification('Goal updated.', 'success');
            } else {
                await addGoal(goal as Omit<FinancialGoal, 'id'>);
                addNotification('Goal added.', 'success');
            }
            setGoalModalOpen(false);
        } catch (error) {
            addNotification('Failed to save goal.', 'error');
            console.error(error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await deleteGoal(goalId);
                addNotification('Goal deleted.', 'success');
            } catch (error) {
                addNotification('Failed to delete goal.', 'error');
                console.error(error);
            }
        }
    };
    
    const handleSaveContribution = async (contribution: { amount: number, walletId: string }) => {
        if (contributingToGoal) {
            try {
                await addContributionToGoal(contributingToGoal.id, contribution.amount, contribution.walletId);
                addNotification(`Contribution added to ${contributingToGoal.name}.`, 'success');
                setContributionModalOpen(false);
            } catch (error) {
                addNotification('Failed to add contribution.', 'error');
                console.error(error);
            }
        }
    };

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('budgets')}
                    className={`${activeTab === 'budgets' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Budgets
                </button>
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`${activeTab === 'goals' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Goals
                </button>
            </nav>
        </div>
    );
    
    if (loading) return <CardGridSkeleton />;

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Planning</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage budgets and track progress towards your savings goals.</p>
                </div>
                {permissions.canEditBudgets && (
                    <button onClick={() => activeTab === 'budgets' ? setBudgetModalOpen(true) : setGoalModalOpen(true)} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                        {activeTab === 'budgets' ? 'Add New Budget' : 'Add New Goal'}
                    </button>
                )}
            </header>
            
            {renderTabs()}

            <div className="mt-6">
                {activeTab === 'budgets' ? 
                    <BudgetsContent 
                        budgets={budgets}
                        transactions={transactions}
                        categories={categories}
                        permissions={permissions}
                        onEdit={(budget) => { setEditingBudget(budget); setBudgetModalOpen(true); }}
                        onDelete={handleDeleteBudget}
                    /> : 
                    <GoalsContent 
                        goals={goals}
                        permissions={permissions}
                        onEdit={(goal) => { setEditingGoal(goal); setGoalModalOpen(true); }}
                        onDelete={handleDeleteGoal}
                        onAddContribution={(goal) => { setContributingToGoal(goal); setContributionModalOpen(true); }}
                    />
                }
            </div>

            {isBudgetModalOpen && <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setBudgetModalOpen(false)} onSave={handleSaveBudget} budget={editingBudget} />}
            {isGoalModalOpen && <GoalModal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} onSave={handleSaveGoal} goal={editingGoal} />}
            {isContributionModalOpen && <ContributionModal isOpen={isContributionModalOpen} onClose={() => setContributionModalOpen(false)} onSave={handleSaveContribution} goal={contributingToGoal} wallets={wallets} />}
        </div>
    );
};

export default BudgetsPage;