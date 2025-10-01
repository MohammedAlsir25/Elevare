import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TransactionType } from '../types.ts';
import MetricCard from './MetricCard.tsx';
import { useSettings } from '../contexts/SettingsContext.tsx';
import * as api from '../services/api.ts';
import { useData } from '../contexts/DataContext.tsx';
import { AnalyticsSkeleton } from './Skeletons.tsx';

type DateRange = 'month' | '30days' | 'year';

const Analytics: React.FC = () => {
  const { loading, transactions, exchangeRates } = useData();
  const [forecastData, setForecastData] = useState<{ date: string, balance: number }[]>([]);
  const { settings: { theme } } = useSettings();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // Forecast data is specific to analytics, so we can fetch it here.
  // It could also be moved to DataContext if used elsewhere.
  useMemo(() => {
    api.getCashFlowForecast().then(setForecastData);
  }, [transactions]); // Re-run forecast if transactions change

  const convertToUSD = (amount: number, currency: 'USD' | 'EUR') => {
    return amount * (exchangeRates[currency] || 1);
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '30days':
        startDate = new Date();
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [dateRange, transactions]);

  const kpis = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const totalExpenses = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const netSavings = totalIncome + totalExpenses;
    return { totalIncome, totalExpenses, netSavings };
  }, [filteredTransactions, exchangeRates]);

  const trendData = useMemo(() => {
     const dataMap = new Map<string, { income: number, expense: number }>();
     filteredTransactions.forEach(t => {
        const date = t.date;
        if (!dataMap.has(date)) {
            dataMap.set(date, { income: 0, expense: 0 });
        }
        const entry = dataMap.get(date)!;
        if (t.type === TransactionType.INCOME) {
            entry.income += convertToUSD(t.amount, t.currency);
        } else {
            entry.expense += Math.abs(convertToUSD(t.amount, t.currency));
        }
     });

     return Array.from(dataMap.entries())
        .map(([date, values]) => ({ date, ...values }))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [filteredTransactions, exchangeRates]);

  const topSpendingCategories = useMemo(() => {
    const categoryMap = new Map<string, { amount: number, color: string }>();
    filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        const { name, color } = t.category;
        const current = categoryMap.get(name) || { amount: 0, color };
        current.amount += Math.abs(convertToUSD(t.amount, t.currency));
        categoryMap.set(name, current);
      });

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, amount: data.amount, fill: data.color }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTransactions, exchangeRates]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-lg">
          <p className="label text-gray-600 dark:text-gray-300">{`${label}`}</p>
          {payload.map((pld: any) => (
              <p key={pld.dataKey} style={{ color: pld.color }}>
                  {`${pld.name}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pld.value)}`}
              </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderFilterButtons = () => (
    <div className="flex space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg border border-gray-300 dark:border-gray-700 self-start">
        {(['month', '30days', 'year'] as DateRange[]).map(range => (
            <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${dateRange === range ? 'bg-brand-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                {range === 'month' ? 'This Month' : range === '30days' ? 'Last 30 Days' : 'This Year'}
            </button>
        ))}
    </div>
  );
  
  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">An overview of your financial trends.</p>
        </div>
        {renderFilterButtons()}
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Income (USD)" value={kpis.totalIncome} format="currency" trend="+15%" />
        <MetricCard title="Total Expenses (USD)" value={kpis.totalExpenses} format="currency" trend="+8%" isNegative />
        <MetricCard title="Net Savings (USD)" value={kpis.netSavings} format="currency" trend={kpis.netSavings >= 0 ? "+20%" : "-10%"} isNegative={kpis.netSavings < 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Trend</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#3a3a3a" : "#e0e0e0"} />
                        <XAxis dataKey="date" stroke={theme === 'dark' ? "#9a9a9a" : "#7a7a7a"} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={theme === 'dark' ? "#9a9a9a" : "#7a7a7a"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${value}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSpendingCategories} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#3a3a3a" : "#e0e0e0"} />
                        <XAxis type="number" stroke={theme === 'dark' ? "#9a9a9a" : "#7a7a7a"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${value}`} />
                        <YAxis type="category" dataKey="name" stroke={theme === 'dark' ? "#9a9a9a" : "#7a7a7a"} fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip cursor={{fill: theme === 'dark' ? '#2a2a2a' : '#f5f5f5'}} content={<CustomTooltip />} />
                        <Bar dataKey="amount" name="Spent" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cash Flow Forecast (Next 30 Days)</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#3a3a3a" : "#e0e0e0"} />
                        <XAxis dataKey="date" stroke={theme === 'dark' ? "#9a9a9a" : "#7a7a7a"} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={theme === 'dark' ? "#9a9a9a" : "#7a7a7a"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${Math.round(value/1000)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Line type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={2} name="Projected Balance" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Analytics;
