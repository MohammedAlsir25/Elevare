import React from 'react';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import LoginPage from './components/LoginPage.tsx';
import AuthenticatedApp from './AuthenticatedApp.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { I18nProvider } from './contexts/I18nContext.tsx';
import { CompanyProvider } from './contexts/CompanyContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';

const App: React.FC = () => {
  return (
    <I18nProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </SettingsProvider>
    </I18nProvider>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <CompanyProvider>
      <DataProvider>
        <AuthenticatedApp />
      </DataProvider>
    </CompanyProvider>
  );
};


export default App;