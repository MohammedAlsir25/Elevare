import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const MAX_PAGES_SHOWN = 5;
    let startPage: number, endPage: number;

    if (totalPages <= MAX_PAGES_SHOWN) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(MAX_PAGES_SHOWN / 2);
        const maxPagesAfterCurrent = Math.ceil(MAX_PAGES_SHOWN / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrent + 1) {
            startPage = 1;
            endPage = MAX_PAGES_SHOWN;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - MAX_PAGES_SHOWN + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex items-center justify-between mt-4 bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <div className="flex items-center space-x-1">
                {startPage > 1 && (
                     <>
                        <button onClick={() => onPageChange(1)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600">1</button>
                        {startPage > 2 && <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">...</span>}
                     </>
                )}
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`px-3 py-1 text-sm font-medium rounded-md border ${
                            currentPage === number
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-white dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        {number}
                    </button>
                ))}
                 {endPage < totalPages && (
                     <>
                        {endPage < totalPages - 1 && <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">...</span>}
                        <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600">{totalPages}</button>
                     </>
                )}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
