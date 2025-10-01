import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as api from '../services/api.ts';
import { Company } from '../types.ts';

interface CompanyContextType {
    companies: Company[];
    selectedCompanyId: string | null;
    setSelectedCompanyId: (id: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const COMPANY_STORAGE_KEY = 'elevare-company-id';

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

    useEffect(() => {
        api.getCompanies().then(data => {
            setCompanies(data);
            const storedCompanyId = localStorage.getItem(COMPANY_STORAGE_KEY);
            if (storedCompanyId && data.some(c => c.id === storedCompanyId)) {
                setSelectedCompanyId(storedCompanyId);
            } else if (data.length > 0) {
                const defaultId = data[0].id;
                setSelectedCompanyId(defaultId);
                localStorage.setItem(COMPANY_STORAGE_KEY, defaultId);
            }
        });
    }, []);

    const handleSetSelectedCompanyId = (id: string) => {
        setSelectedCompanyId(id);
        localStorage.setItem(COMPANY_STORAGE_KEY, id);
    };

    return (
        <CompanyContext.Provider value={{ companies, selectedCompanyId, setSelectedCompanyId: handleSetSelectedCompanyId }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = (): CompanyContextType => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};