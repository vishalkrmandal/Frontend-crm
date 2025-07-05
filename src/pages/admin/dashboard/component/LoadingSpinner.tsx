// Frontend/src/components/admin/dashboard/LoadingSpinner.tsx
import React from 'react';
import { Activity, BarChart3, Users, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = "Loading dashboard...",
    fullScreen = false
}) => {
    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mx-auto mb-4"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
                    <div className="mt-4 flex justify-center gap-4">
                        <div className="animate-pulse flex items-center gap-2 text-gray-400">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-sm">Analytics</span>
                        </div>
                        <div className="animate-pulse flex items-center gap-2 text-gray-400" style={{ animationDelay: '0.2s' }}>
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Clients</span>
                        </div>
                        <div className="animate-pulse flex items-center gap-2 text-gray-400" style={{ animationDelay: '0.4s' }}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Revenue</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;