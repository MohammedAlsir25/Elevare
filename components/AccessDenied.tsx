import React from 'react';

const AccessDenied: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-4">Access Denied</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">You do not have permission to view this page.</p>
        </div>
    );
};

export default AccessDenied;
