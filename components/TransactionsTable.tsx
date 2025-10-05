import React from 'react';
import { Transaction, TransactionType, SortConfig } from '../types.ts';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, EditIcon, DeleteIcon } from '../constants.tsx';
import { useLocalizedDate } from '../hooks/useLocalizedDate.ts';

interface TransactionsTableProps {
  transactions: Transaction[];
  title?: string;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  requestSort?: (key: string) => void;
  sortConfig?: SortConfig | null;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, title = "Transactions", onEdit, onDelete, requestSort, sortConfig }) => {
  const showActions = !!onEdit && !!onDelete;
  const formatDate = useLocalizedDate();

  const getSortIndicator = (key: string) => {
    if (!requestSort) return null;
    if (!sortConfig || sortConfig.key !== key) {
        return <ChevronUpDownIcon className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ChevronUpIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
    }
    return <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-800 dark:text-gray-200" />;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                <button onClick={() => requestSort && requestSort('description')} className="flex items-center group w-full text-left">
                    Description {getSortIndicator('description')}
                </button>
              </th>
              <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                 <button onClick={() => requestSort && requestSort('date')} className="flex items-center group w-full text-left">
                    Date {getSortIndicator('date')}
                </button>
              </th>
              <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                <button onClick={() => requestSort && requestSort('category.name')} className="flex items-center group w-full text-left">
                    Category {getSortIndicator('category.name')}
                </button>
              </th>
              <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">
                <button onClick={() => requestSort && requestSort('amount')} className="flex items-center group w-full justify-end">
                    Amount {getSortIndicator('amount')}
                </button>
              </th>
              {showActions && <th scope="col" className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50" style={{ borderLeft: `4px solid ${tx.color || 'transparent'}` }}>
                <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full mr-3" style={{ backgroundColor: tx.category.color+'33' }}>
                            <tx.category.icon className="h-5 w-5" style={{ color: tx.category.color }}/>
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{tx.description}</span>
                    </div>
                </td>
                <td className="p-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                <td className="p-3 text-gray-800 dark:text-gray-300 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: tx.category.color+'20', color: tx.category.color }}>
                        {tx.category.name}
                    </span>
                </td>
                <td className={`p-3 font-semibold text-right whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-accent-green' : 'text-gray-800 dark:text-gray-200'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                </td>
                {showActions && (
                    <td className="p-3 whitespace-nowrap text-center">
                        <button onClick={() => onEdit(tx)} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary p-1" aria-label={`Edit transaction ${tx.description}`}>
                            <EditIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => onDelete(tx.id)} className="text-gray-500 dark:text-gray-400 hover:text-accent-red p-1 ml-2" aria-label={`Delete transaction ${tx.description}`}>
                            <DeleteIcon className="h-5 w-5" />
                        </button>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;