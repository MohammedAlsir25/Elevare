import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricCard from '../../components/MetricCard.tsx';

describe('MetricCard', () => {
  it('renders the title, formatted currency value, and trend', () => {
    render(
      <MetricCard
        title="Net Worth"
        value={123456.78}
        format="currency"
        trend="+2.5%"
      />
    );

    expect(screen.getByText('Net Worth')).toBeInTheDocument();
    expect(screen.getByText('$123,456.78')).toBeInTheDocument();
    expect(screen.getByText('+2.5%')).toBeInTheDocument();
  });

  it('renders a negative trend with red color', () => {
    render(
      <MetricCard
        title="Expenses"
        value={-5000}
        format="currency"
        trend="-5%"
        isNegative
      />
    );

    const trendElement = screen.getByText('-5%');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement.parentElement).toHaveClass('text-accent-red');
  });

   it('formats value as a plain number', () => {
    render(
      <MetricCard
        title="Transaction Count"
        value={1500}
        format="number"
        trend="+10"
      />
    );
    
    // toLocaleString() adds commas
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });
});