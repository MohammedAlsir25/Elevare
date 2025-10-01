import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Analytics from './components/Analytics.tsx';
import TransactionsPage from './components/TransactionsPage.tsx';
import WalletsPage from './components/WalletsPage.tsx';
import BudgetsPage from './components/BudgetsPage.tsx';
import ContactsPage from './components/ContactsPage.tsx';
import SalesPage from './components/SalesPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import HrPage from './components/HrPage.tsx';
import AccountingPage from './components/AccountingPage.tsx';
import InventoryPage from './components/InventoryPage.tsx';
import ReportsPage from './components/ReportsPage.tsx';
import AdminPage from './components/AdminPage.tsx';
import { useSettings } from './contexts/SettingsContext.tsx';
import { usePermissions } from './hooks/usePermissions.ts';
import AccessDenied from './components/AccessDenied.tsx';
import Notification from './components/Notification.tsx';
import AIAssistant from './components/AIAssistant.tsx';

function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
}


const AuthenticatedApp: React.FC = () => {
  const [activeView, setActiveView] = useState('Dashboard');
  const { settings: { theme, dashboardLayout, themeColors } } = useSettings();
  const permissions = usePermissions();
  
  useEffect(() => {
    const root = document.documentElement;
    const primaryRgb = hexToRgb(themeColors.primary);
    const secondaryRgb = hexToRgb(themeColors.secondary);

    if (primaryRgb) {
      root.style.setProperty('--color-brand-primary-rgb', primaryRgb);
    }
    if (secondaryRgb) {
      root.style.setProperty('--color-brand-secondary-rgb', secondaryRgb);
    }
  }, [themeColors]);

  const checkPermissionForView = (view: string): boolean => {
    if (view === 'Admin' && permissions.canViewSettings) return true;
    const viewName = view.toLowerCase().replace(' ', '');
    const permissionKey = `canView${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
    return (permissions as any)[permissionKey] ?? true;
  };

  const renderContent = () => {
    if (!checkPermissionForView(activeView)) {
        return <AccessDenied />;
    }
    
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Analytics':
        return <Analytics />;
      case 'Transactions':
        return <TransactionsPage />;
      case 'Wallets':
        return <WalletsPage />;
      case 'Budgets':
        return <BudgetsPage />;
      case 'Contacts':
        return <ContactsPage />;
      case 'Sales':
        return <SalesPage />;
      case 'Accounting':
        return <AccountingPage />;
      case 'Inventory':
        return <InventoryPage />;
      case 'HR':
        return <HrPage />;
      case 'Reports':
        return <ReportsPage />;
      case 'Admin':
        return <AdminPage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <Dashboard />; // Fallback to dashboard
    }
  };

  return (
      <div className={`${theme} flex h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans`}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
        <Notification />
        {dashboardLayout.aiAssistant && <AIAssistant />}
      </div>
  );
};

export default AuthenticatedApp;