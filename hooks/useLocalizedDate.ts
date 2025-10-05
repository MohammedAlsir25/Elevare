import { useCallback } from 'react';
import { useI18n } from '../contexts/I18nContext.tsx';

const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

/**
 * A hook that provides a function to format date strings according to the current locale.
 * @returns {function(dateString: string, options?: Intl.DateTimeFormatOptions): string} A memoized formatting function.
 */
export const useLocalizedDate = () => {
    const { language } = useI18n();

    const formatDate = useCallback((dateString: string | undefined | null, options: Intl.DateTimeFormatOptions = defaultOptions): string => {
        if (!dateString) return '';
        try {
            // Using new Date() with ISO 8601 format (YYYY-MM-DD) can have timezone issues
            // where it's treated as UTC midnight. Adding 'T00:00:00' makes it local time.
            // For full ISO strings with time, it's fine.
            const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
            return new Intl.DateTimeFormat(language, options).format(date);
        } catch (e) {
            console.error("Failed to format date:", dateString, e);
            return dateString; // Fallback to the original string on error
        }
    }, [language]);

    return formatDate;
};
