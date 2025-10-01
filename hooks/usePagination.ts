import { useState, useMemo, useEffect } from 'react';

export const usePagination = <T,>(data: T[], itemsPerPage: number = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => {
        if (data.length === 0) return 1;
        return Math.ceil(data.length / itemsPerPage);
    }, [data.length, itemsPerPage]);

    useEffect(() => {
        // Reset to page 1 if data changes and current page becomes invalid
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [data.length, totalPages, currentPage]);

    const currentPageData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    }, [data, currentPage, itemsPerPage]);

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };
    
    return {
        currentPageData,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        goToPage,
    };
};
