import React, { useState, useMemo } from 'react';
import { TransactionType } from '../types.ts';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useData } from '../contexts/DataContext.tsx';
import { ReportsSkeleton } from './Skeletons.tsx';

type ReportType = 'pnl' | 'balance-sheet';

const ReportsPage: React.FC = () => {
    const { loading, transactions, wallets, exchangeRates } = useData();

    const permissions = usePermissions();
    const [reportType, setReportType] = useState<ReportType>('pnl');
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const convertToUSD = (amount: number, currency: 'USD' | 'EUR') => {
        return amount * (exchangeRates[currency] || 1);
    };

    const handlePrint = () => {
        window.print();
    };

    const reportData = useMemo(() => {
        const transactionsInPeriod = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= new Date(startDate) && tDate <= new Date(endDate);
        });

        // P&L Calculations
        const income = transactionsInPeriod.filter(t => t.type === TransactionType.INCOME);
        const expense = transactionsInPeriod.filter(t => t.type === TransactionType.EXPENSE);
        const totalIncome = income.reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
        const totalExpense = expense.reduce((sum, t) => sum + Math.abs(convertToUSD(t.amount, t.currency)), 0);
        const netProfit = totalIncome - totalExpense;
        
        const incomeByCategory = income.reduce((acc, t) => {
            acc[t.category.name] = (acc[t.category.name] || 0) + convertToUSD(t.amount, t.currency);
            return acc;
        }, {} as Record<string, number>);
        const expenseByCategory = expense.reduce((acc, t) => {
            acc[t.category.name] = (acc[t.category.name] || 0) + Math.abs(convertToUSD(t.amount, t.currency));
            return acc;
        }, {} as Record<string, number>);

        // Balance Sheet Calculations (as of End Date)
        const transactionsUpToEndDate = transactions.filter(t => new Date(t.date) <= new Date(endDate));
        
        const assets = {
            cash: 0,
            accountsReceivable: 1500, // Mocked value
        };
        assets.cash = wallets.filter(w => !w.name.toLowerCase().includes('card')).reduce((sum, w) => {
             const balance = transactionsUpToEndDate.filter(t => t.wallet.id === w.id)
                                          .reduce((acc, t) => acc + t.amount, w.balance);
            return sum + convertToUSD(balance, w.currency);
        }, 0);
        
        const liabilities = {
            creditCard: Math.abs(wallets.filter(w => w.name.toLowerCase().includes('card')).reduce((sum, w) => {
                const balance = transactionsUpToEndDate.filter(t => t.wallet.id === w.id)
                                          .reduce((acc, t) => acc + t.amount, w.balance);
                return sum + convertToUSD(balance, w.currency);
            }, 0)),
            accountsPayable: 85.20, // Mocked from utilities bill
        };

        const totalAssets = Object.values(assets).reduce((s, v) => s + v, 0);
        const totalLiabilities = Object.values(liabilities).reduce((s, v) => s + v, 0);
        
        const initialEquity = 12500; // Mocked starting equity
        const retainedEarnings = netProfit;
        const totalEquity = initialEquity + retainedEarnings;
        
        const equityPlug = totalAssets - totalLiabilities - totalEquity;
        const finalTotalEquity = totalEquity + equityPlug;

        return { 
            totalIncome, totalExpense, incomeByCategory, expenseByCategory, netProfit,
            assets, liabilities, totalAssets, totalLiabilities, 
            equity: { initialEquity, retainedEarnings: retainedEarnings + equityPlug },
            totalEquity: finalTotalEquity
        };
    }, [startDate, endDate, transactions, wallets, exchangeRates]);
    
    if (loading) return <ReportsSkeleton />;

    const renderPnlReport = () => (
        <>
            <h2 className="text-3xl font-bold text-center">Profit & Loss Statement</h2>
            <p className="text-center text-gray-600 mb-8">For the period from {startDate} to {endDate} (in USD)</p>

            <div className="mb-8">
                <h3 className="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-2">Revenue</h3>
                <table className="w-full">
                    <tbody>
                        {Object.entries(reportData.incomeByCategory).map(([category, amount]) => (
                            <tr key={category}>
                                <td className="py-2 pl-4">{category}</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount as number)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold border-t border-gray-400">
                            <td className="py-2 pl-4">Total Revenue</td>
                            <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.totalIncome)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-2">Expenses</h3>
                <table className="w-full">
                    <tbody>
                        {Object.entries(reportData.expenseByCategory).map(([category, amount]) => (
                            <tr key={category}>
                                <td className="py-2 pl-4">{category}</td>
                                <td className="py-2 pr-4 text-right">({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount as number)})</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold border-t border-gray-400">
                            <td className="py-2 pl-4">Total Expenses</td>
                            <td className="py-2 pr-4 text-right">({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.totalExpense)})</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end mt-8">
                <div className="w-full max-w-sm">
                    <div className={`flex justify-between py-3 px-4 rounded-lg ${reportData.netProfit >= 0 ? 'bg-accent-green/20' : 'bg-accent-red/20'}`}>
                        <span className="font-bold text-lg">{reportData.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                        <span className="font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.netProfit)}</span>
                    </div>
                </div>
            </div>
        </>
    );

    const renderBalanceSheet = () => (
        <>
            <h2 className="text-3xl font-bold text-center">Balance Sheet</h2>
            <p className="text-center text-gray-600 mb-8">As of {endDate} (in USD)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                    <h3 className="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-2">Assets</h3>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py-2 pl-4">Cash</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.assets.cash)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 pl-4">Accounts Receivable</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.assets.accountsReceivable)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="font-bold border-t-2 border-gray-800">
                                <td className="py-3 pl-4">Total Assets</td>
                                <td className="py-3 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.totalAssets)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Liabilities & Equity */}
                <div>
                    <h3 className="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-2">Liabilities & Equity</h3>
                    <table className="w-full mb-6">
                        <thead><tr><th className="text-left font-semibold py-1 pl-4">Liabilities</th></tr></thead>
                        <tbody>
                            <tr>
                                <td className="py-2 pl-4">Credit Card Payable</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.liabilities.creditCard)}</td>
                            </tr>
                             <tr>
                                <td className="py-2 pl-4">Accounts Payable</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.liabilities.accountsPayable)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                             <tr className="font-bold border-t border-gray-400">
                                <td className="py-2 pl-4">Total Liabilities</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.totalLiabilities)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <table className="w-full">
                        <thead><tr><th className="text-left font-semibold py-1 pl-4">Equity</th></tr></thead>
                        <tbody>
                            <tr>
                                <td className="py-2 pl-4">Owner's Equity</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.equity.initialEquity)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 pl-4">Retained Earnings</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.equity.retainedEarnings)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                             <tr className="font-bold border-t border-gray-400">
                                <td className="py-2 pl-4">Total Equity</td>
                                <td className="py-2 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.totalEquity)}</td>
                            </tr>
                        </tfoot>
                    </table>
                     <table className="w-full mt-6">
                        <tfoot>
                             <tr className="font-bold border-t-2 border-gray-800">
                                <td className="py-3 pl-4">Total Liabilities & Equity</td>
                                <td className="py-3 pr-4 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.totalLiabilities + reportData.totalEquity)}</td>
                            </tr>
                        </tfoot>
                     </table>
                </div>
            </div>
        </>
    );
    
    const renderContent = () => {
        const reportContent = reportType === 'pnl' ? renderPnlReport() : renderBalanceSheet();
        return (
            <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg printable-area">
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .printable-area, .printable-area * { visibility: visible; }
                        .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 1.5rem; }
                        .no-print { display: none; }
                    }
                `}</style>
                {reportContent}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Financial Reports</h1>
                    <p className="text-gray-400 mt-1">Generate and view key financial statements.</p>
                </div>
                {permissions.canViewReports && (
                    <button onClick={handlePrint} className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 font-semibold shadow-lg">
                        Print Report
                    </button>
                )}
            </header>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between no-print">
                <div className="flex items-center space-x-4">
                    <label htmlFor="reportType" className="text-sm font-medium text-gray-300">Report Type:</label>
                    <select
                        id="reportType"
                        value={reportType}
                        onChange={e => setReportType(e.target.value as ReportType)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-200"
                    >
                        <option value="pnl">Profit & Loss</option>
                        <option value="balance-sheet">Balance Sheet</option>
                    </select>
                </div>
                 <div className="flex items-center space-x-4">
                     <label htmlFor="startDate" className="text-sm font-medium text-gray-300">From:</label>
                     <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200"/>
                      <label htmlFor="endDate" className="text-sm font-medium text-gray-300">To:</label>
                     <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200"/>
                 </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default ReportsPage;
