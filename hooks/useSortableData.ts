import { useMemo, useState } from 'react';
import { SortConfig } from '../types.ts';

// FIX: Added 'as any' to handle nested keys like 'category.name' gracefully in the sort function.
export const useSortableData = <T,>(items: T[], config: SortConfig | null = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const getNestedValue = (obj: any, key: string) => key.split('.').reduce((o, k) => (o || {})[k], obj);

                const aValue = getNestedValue(a as any, sortConfig.key);
                const bValue = getNestedValue(b as any, sortConfig.key);

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};