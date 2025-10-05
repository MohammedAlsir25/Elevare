export const tourSteps = [
    {
        selector: '[data-tour-id="navigation-panel"]',
        title: 'Main Navigation',
        content: 'Use this panel to navigate between the main sections of the application, such as Transactions, Sales, and Reports.',
        placement: 'right',
    },
    {
        selector: '[data-tour-id="company-switcher"]',
        title: 'Company Switcher',
        content: 'If you manage multiple companies, you can easily switch between them here. All data displayed will be for the selected company.',
        placement: 'right',
    },
    {
        selector: '[data-tour-id="metric-cards-grid"]',
        title: 'Key Metrics',
        content: 'Get a quick overview of your key financial metrics for the current period, like Net Worth, Income, and Expenses.',
        placement: 'bottom',
    },
    {
        selector: '[data-tour-id="expense-chart"]',
        title: 'Expense Breakdown',
        content: 'This chart visualizes your spending by category. Click on a category slice to filter the transactions table below.',
        placement: 'left',
    },
    {
        selector: '[data-tour-id="ai-assistant"]',
        title: 'AI Assistant',
        content: 'Have a question about your finances? Click here to ask our AI assistant. You can ask things like "What was my biggest expense?"',
        placement: 'top',
    },
];
