import React from 'react';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import LoginPage from './components/LoginPage.tsx';
import AuthenticatedApp from './AuthenticatedApp.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { I18nProvider } from './contexts/I18nContext.tsx';
import { CompanyProvider } from './contexts/CompanyContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';
import { ConfirmationProvider } from './contexts/ConfirmationContext.tsx';
import { TourProvider } from './contexts/TourContext.tsx';

const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <SettingsProvider user={user}>
      <NotificationProvider>
        <ConfirmationProvider>
          <CompanyProvider>
            <DataProvider>
              <TourProvider>
                <AuthenticatedApp />
              </TourProvider>
            </DataProvider>
          </CompanyProvider>
        </ConfirmationProvider>
      </NotificationProvider>
    </SettingsProvider>
  );
};


export default App;