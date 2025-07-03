// Frontend/src/components/admin/dashboard/SkeletonLoader.tsx
import React from 'react';

interface SkeletonLoaderProps {
    type: 'card' | 'chart' | 'table' | 'list';
    count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="w-28 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'chart':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div>
                                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div>
                                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                            <div>
                                                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div>
                                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div>
                                                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
};

export default SkeletonLoader;