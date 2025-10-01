import React, { useState, useMemo } from 'react';
import MetricCard from './MetricCard.tsx';
import CategoryChart from './CategoryChart.tsx';
import TransactionsTable from './TransactionsTable.tsx';
import { useSettings } from '../contexts/SettingsContext.tsx';
import CustomizeDashboardModal from './CustomizeDashboardModal.tsx';
import { AdjustmentsHorizontalIcon } from '../constants.tsx';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useI18n } from '../contexts/I18nContext.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { DashboardSkeleton } from './Skeletons.tsx';

const Dashboard: React.FC = () => {
    const { loading, transactions, wallets, exchangeRates } = useData();
    const { t } = useI18n();

    const { settings: { dashboardLayout } } = useSettings();
    const permissions = usePermissions();
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const convertToUSD = (amount: number, currency: 'USD' | 'EUR') => {
        return amount * (exchangeRates[currency] || 1);
    };

    const { totalIncome, totalExpense, netWorth } = useMemo(() => {
        if (!transactions || !wallets || !permissions.canViewFinancialWidgets) return { totalIncome: 0, totalExpense: 0, netWorth: 0 };
        
        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);

        const expense = transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);
        
        const worth = wallets.reduce((acc, w) => acc + convertToUSD(w.balance, w.currency), 0);
        
        return { totalIncome: income, totalExpense: expense, netWorth: worth };
    }, [transactions, wallets, exchangeRates, permissions.canViewFinancialWidgets]);


    const displayedTransactions = categoryFilter 
        ? transactions.filter(t => t.category.name === categoryFilter)
        : transactions.slice(0, 5); // Show latest 5 by default
        
    if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        {permissions.canEditSettings && (
            <button
              onClick={() => setIsCustomizeModalOpen(true)}
              className="flex items-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md shadow"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {t('dashboard.customize')}
            </button>
        )}
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left and Center Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metric Cards */}
          {permissions.canViewFinancialWidgets && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardLayout.netWorth && <MetricCard title="Net Worth (USD)" value={netWorth} format="currency" trend="+2.5%" />}
                {dashboardLayout.income && <MetricCard title="Monthly Income (USD)" value={totalIncome} format="currency" trend="+10%" />}
                {dashboardLayout.expenses && <MetricCard title="Monthly Expenses (USD)" value={totalExpense} format="currency" trend="-5%" isNegative />}
            </div>
          )}
          
          {/* Filter Badge */}
          {categoryFilter && (
             <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">Filtered by:</span>
                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-brand-secondary text-white">
                        {categoryFilter}
                    </span>
                </div>
                <button 
                    onClick={() => setCategoryFilter(null)} 
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
                    aria-label={`Clear filter for category ${categoryFilter}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear
                </button>
             </div>
          )}

          {/* Transactions Table */}
          {dashboardLayout.transactions && <TransactionsTable transactions={displayedTransactions} title="Recent Transactions" />}
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Category Chart */}
          {dashboardLayout.categoryChart && permissions.canViewFinancialWidgets && (
            <CategoryChart 
              data={transactions.filter(t => t.amount < 0)} 
              onCategoryClick={setCategoryFilter}
              activeCategory={categoryFilter}
            />
          )}
        </div>
      </div>
      
      <CustomizeDashboardModal 
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
