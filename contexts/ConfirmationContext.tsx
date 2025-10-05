import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import ConfirmationModal from '../components/ConfirmationModal.tsx';

interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'primary' | 'danger';
}

interface ConfirmationContextType {
    confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmationOptions | null>(null);
    const [resolve, setResolve] = useState<(value: boolean) => void>(() => () => {});

    const confirm = useCallback((options: ConfirmationOptions) => {
        return new Promise<boolean>((resolve) => {
            setOptions(options);
            setResolve(() => resolve);
        });
    }, []);

    const handleClose = () => {
        setOptions(null);
        resolve(false);
    };

    const handleConfirm = () => {
        setOptions(null);
        resolve(true);
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            {options && (
                <ConfirmationModal
                    isOpen={!!options}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={options.title}
                    message={options.message}
                    confirmText={options.confirmText}
                    confirmVariant={options.confirmVariant}
                />
            )}
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = (): ConfirmationContextType['confirm'] => {
    const context = useContext(ConfirmationContext);
    if (context === undefined) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context.confirm;
};
