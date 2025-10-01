import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types.ts';
import { useSettings } from '../contexts/SettingsContext.tsx';

interface CategoryChartProps {
  data: Transaction[];
  onCategoryClick: (category: string | null) => void;
  activeCategory: string | null;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data, onCategoryClick, activeCategory }) => {
  const { settings: { theme } } = useSettings();
  const expenseData = data.reduce((acc, transaction) => {
    const categoryName = transaction.category.name;
    const existing = acc.find(item => item.name === categoryName);
    if (existing) {
      existing.value += Math.abs(transaction.amount);
    } else {
      acc.push({ 
        name: categoryName, 
        value: Math.abs(transaction.amount),
        color: transaction.category.color 
      });
    }
    return acc;
  }, [] as { name: string; value: number, color: string }[]);

  const handlePieClick = (data: any) => {
    // If clicking the same slice again, clear the filter. Otherwise, set it.
    if (data.name === activeCategory) {
        onCategoryClick(null);
    } else {
        onCategoryClick(data.name);
    }
  };

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderColor: theme === 'dark' ? '#3a3a3a' : '#e0e0e0',
    color: theme === 'dark' ? '#e0e0e0' : '#121212',
  };

  const legendStyle = {
    color: theme === 'dark' ? '#e0e0e0' : '#121212',
    fontSize: '14px'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-full">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              onClick={handlePieClick}
              className="cursor-pointer focus:outline-none"
            >
              {expenseData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    opacity={activeCategory === null || activeCategory === entry.name ? 1 : 0.4}
                    stroke={activeCategory === entry.name ? (theme === 'dark' ? '#f5f5f5' : '#121212') : 'none'}
                    strokeWidth={2}
                    style={{ transition: 'opacity 0.2s ease-in-out' }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            />
            <Legend wrapperStyle={legendStyle}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;