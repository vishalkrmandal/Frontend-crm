// Frontend/src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import DashboardCards from '../dash/component/DashboardCards';
import RevenueChart from '../dash/component/RevenueChart';
import ClientDistributionChart from '../dash/component/ClientDistributionChart';
import RecentTransactions from '../dash/component/RecentTransactions';
import TopPerformingClients from '../dash/component/TopPerformingClients';
import DailyStatsChart from '../dash/component/DailyStatsChart';
import adminDashboardApi from '../../../services/adminDashboardApi';
import {
    Activity,
    RefreshCw,
    AlertCircle,
    Wifi,
    WifiOff
} from 'lucide-react';

interface DashboardData {
    stats: {
        clients: {
            total: number;
            today: number;
            thisWeek: number;
            thisMonth: number;
            growth: number;
            pending: number;
        };
        deposits: {
            total: number;
            count: number;
            today: number;
            pending: number;
            growth: number;
        };
        withdrawals: {
            total: number;
            count: number;
            pending: number;
            growth: number;
        };
        transactions: {
            total: number;
            growth: number;
        };
        ibPartners: {
            total: number;
            pending: number;
            growth: number;
        };
        accounts: {
            total: number;
            today: number;
        };
    };
    revenueData: Array<{
        month: string;
        deposits: number;
        withdrawals: number;
        net: number;
    }>;
    clientDistribution: Array<{
        name: string;
        value: number;
        percentage: string;
    }>;
    recentTransactions: Array<{
        id: string;
        type: string;
        amount: number;
        user: {
            name: string;
            email: string;
        };
        account: string;
        status: string;
        date: string;
        paymentMethod: string;
    }>;
    dailyStats: Array<{
        date: string;
        clients: number;
        deposits: number;
        withdrawals: number;
        transactions: number;
        ibPartners: number;
    }>;
    topClients: Array<{
        _id: string;
        totalDeposited: number;
        depositCount: number;
        user: {
            firstname: string;
            lastname: string;
            email: string;
            createdAt: string;
        };
        accountsCount: number;
    }>;
}

const AdminDashboard: React.FC = () => {
    useTheme();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const fetchDashboardData = async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            setError(null);

            const data = await adminDashboardApi.getAllDashboardData();
            if (data && data.stats) {
                setDashboardData(data as DashboardData);
            } else {
                setDashboardData(null);
                setError('Dashboard data is incomplete or malformed.');
            }
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 5 * 60 * 1000);

        // Online/offline detection
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const handleRetry = () => {
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error && !dashboardData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to Load Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <div className=" lg:p-6 max-w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Admin Dashboard
                            </h1>
                            <div className="flex items-center gap-4">
                                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Real-time business insights and analytics
                                </p>
                                <div className="flex pr-4 items-center gap-2">
                                    {isOnline ? (
                                        <Wifi className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <WifiOff className="w-4 h-4 text-red-500" />
                                    )}
                                    <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {lastUpdated && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Updated: {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}

                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && dashboardData && (
                    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {dashboardData && (
                    <div className="space-y-6">
                        {/* Dashboard Cards */}
                        <DashboardCards stats={dashboardData.stats} />

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {/* Revenue Chart */}
                            <div className="xl:col-span-1">
                                <RevenueChart data={dashboardData.revenueData} />
                            </div>

                            {/* Client Distribution */}
                            <div className="xl:col-span-1">
                                <ClientDistributionChart data={dashboardData.clientDistribution} />
                            </div>
                        </div>

                        {/* Daily Stats Chart */}
                        <div className="w-full">
                            <DailyStatsChart data={dashboardData.dailyStats} />
                        </div>

                        {/* Recent Transactions and Top Clients */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[600px]">
                            <RecentTransactions transactions={dashboardData.recentTransactions} />
                            <TopPerformingClients clients={dashboardData.topClients} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;