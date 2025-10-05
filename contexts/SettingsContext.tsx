import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { DashboardLayout, User, UserRole } from '../types.ts';

interface CompanySettings {
    name: string;
    address: string;
    logo: string | null;
}

type Theme = 'light' | 'dark';

interface ThemeColors {
    primary: string;
    secondary: string;
}

interface AppSettings {
    company: CompanySettings;
    dashboardLayout: DashboardLayout;
    theme: Theme;
    themeColors: ThemeColors;
}

interface SettingsContextType {
    settings: AppSettings;
    updateCompanySettings: (newSettings: CompanySettings) => void;
    updateDashboardLayout: (newLayout: Partial<DashboardLayout>) => void;
    toggleTheme: () => void;
    updateThemeColors: (colors: Partial<ThemeColors>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'elevare-settings-v3';

const defaultLayouts: Record<UserRole, DashboardLayout> = {
    [UserRole.ADMIN]: { netWorth: true, income: true, expenses: true, transactions: true, categoryChart: true, aiAssistant: true },
    [UserRole.ACCOUNTANT]: { netWorth: true, income: true, expenses: true, transactions: true, categoryChart: true, aiAssistant: false },
    [UserRole.HR_MANAGER]: { netWorth: false, income: false, expenses: false, transactions: true, categoryChart: false, aiAssistant: false },
    [UserRole.EMPLOYEE]: { netWorth: false, income: false, expenses: false, transactions: true, categoryChart: false, aiAssistant: false },
    [UserRole.VIEWER]: { netWorth: false, income: false, expenses: false, transactions: true, categoryChart: false, aiAssistant: false },
};

const initialSettings: AppSettings = {
    company: { name: 'Your Company', address: '123 Main St, Anytown, USA', logo: null },
    dashboardLayout: defaultLayouts[UserRole.ADMIN], // Default fallback
    theme: 'dark', // Default to dark theme
    themeColors: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
    }
};


const getInitialSettings = (user: User): AppSettings => {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            // Ensure themeColors exists for backward compatibility
            if (!parsed.themeColors) {
                parsed.themeColors = initialSettings.themeColors;
            }
            return parsed;
        }
        // No stored settings, create defaults based on role and system preferences
        const preferredTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
        const roleLayout = defaultLayouts[user.role] || defaultLayouts[UserRole.VIEWER];

        return {
            ...initialSettings,
            dashboardLayout: roleLayout,
            theme: preferredTheme,
        };
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        return initialSettings;
    }
};


export const SettingsProvider: React.FC<{ children: ReactNode; user: User }> = ({ children, user }) => {
    const [settings, setSettings] = useState<AppSettings>(() => getInitialSettings(user));

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, [settings]);

    const updateCompanySettings = (newCompanySettings: CompanySettings) => {
        setSettings(prev => ({ ...prev, company: newCompanySettings }));
    };

    const updateDashboardLayout = (newLayout: Partial<DashboardLayout>) => {
        setSettings(prev => ({
            ...prev,
            dashboardLayout: { ...prev.dashboardLayout, ...newLayout }
        }));
    };
    
    const toggleTheme = () => {
        setSettings(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark'}));
    };

    const updateThemeColors = (colors: Partial<ThemeColors>) => {
        setSettings(prev => ({
            ...prev,
            themeColors: { ...prev.themeColors, ...colors }
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateCompanySettings, updateDashboardLayout, toggleTheme, updateThemeColors }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};