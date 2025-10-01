import React from 'react';

const SkeletonBase = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}></div>
);

const PageHeaderSkeleton = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <SkeletonBase className="h-9 w-64 mb-2" />
            <SkeletonBase className="h-5 w-80" />
        </div>
        <SkeletonBase className="h-10 w-48 rounded-md" />
    </div>
);

const FilterBarSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
        <SkeletonBase className="h-10 w-full md:w-1/3 rounded-md" />
        <SkeletonBase className="h-10 w-40 rounded-md" />
    </div>
);

const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-200 dark:border-gray-600">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="p-3"><SkeletonBase className="h-5 w-24" /></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                            {Array.from({ length: cols }).map((_, j) => (
                                <td key={j} className="p-3"><SkeletonBase className="h-6 w-full" /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <SkeletonBase className="h-5 w-1/3 mb-4" />
        <SkeletonBase className="h-8 w-1/2" />
    </div>
);

export const PageWithTableSkeleton = () => (
    <div className="space-y-6">
        <PageHeaderSkeleton />
        <FilterBarSkeleton />
        <TableSkeleton />
    </div>
);

export const CardGridSkeleton = () => (
    <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
                <TableSkeleton rows={3} />
            </div>
            <div className="lg:col-span-1">
                <CardSkeleton />
            </div>
        </div>
    </div>
);

export const AnalyticsSkeleton = () => (
    <div className="space-y-6">
        <PageHeaderSkeleton />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
        </div>
        <CardSkeleton />
    </div>
);

export const ReportsSkeleton = () => (
     <div className="space-y-6">
        <PageHeaderSkeleton />
        <FilterBarSkeleton />
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
            <SkeletonBase className="h-8 w-1/2 mx-auto mb-2" />
            <SkeletonBase className="h-5 w-1/3 mx-auto mb-8" />
            <SkeletonBase className="h-6 w-1/4 mb-4" />
            <SkeletonBase className="h-40 w-full mb-8" />
            <SkeletonBase className="h-6 w-1/4 mb-4" />
            <SkeletonBase className="h-40 w-full" />
        </div>
    </div>
);
