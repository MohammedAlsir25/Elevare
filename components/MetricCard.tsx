import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  format?: 'currency' | 'number';
  trend: string;
  isNegative?: boolean;
}

const TrendIcon: React.FC<{ isNegative?: boolean }> = ({ isNegative }) => {
    const rotation = isNegative ? 'rotate-180' : '';
    const color = isNegative ? 'text-accent-red' : 'text-accent-green';
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${rotation} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    );
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, format = 'number', trend, isNegative = false }) => {
  const formattedValue = format === 'currency'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(value))
    : value.toLocaleString();
  
  const trendColor = isNegative ? 'text-accent-red' : 'text-accent-green';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{formattedValue}</p>
        <div className={`flex items-center text-sm font-semibold ${trendColor}`}>
          <TrendIcon isNegative={isNegative} />
          <span className="ml-1">{trend}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;