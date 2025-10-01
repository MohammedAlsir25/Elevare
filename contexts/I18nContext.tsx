import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

// Define the shape of the context
interface I18nContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Define available languages
const availableLanguages = ['en', 'es'];

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<string>('en');
    const [translations, setTranslations] = useState<Record<string, any>>({});

    useEffect(() => {
        const savedLang = localStorage.getItem('wiseerp-language');
        const browserLang = navigator.language.split('-')[0];
        const initialLang = savedLang || (availableLanguages.includes(browserLang) ? browserLang : 'en');
        setLanguage(initialLang);
    }, []);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const response = await fetch(`/locales/${language}.json`);
                if (!response.ok) {
                    throw new Error(`Could not load ${language}.json`);
                }
                const data = await response.json();
                setTranslations(data);
                localStorage.setItem('wiseerp-language', language);
            } catch (error) {
                console.error("Failed to fetch translations:", error);
                // Fallback to English if the selected language file fails
                if (language !== 'en') {
                    setLanguage('en');
                }
            }
        };

        fetchTranslations();
    }, [language]);
    
    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        let result = translations;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key; // Return the key itself if not found
            }
        }
        return typeof result === 'string' ? result : key;
    }, [translations]);


    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
