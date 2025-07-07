// Frontend/src/hooks/useDashboardData.ts  --> admin dashboard data fetching hook
import { useState, useEffect, useCallback } from 'react';
import adminDashboardApi from '../services/adminDashboardApi';

// Types
export interface DashboardStats {
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
}

export interface RevenueData {
    month: string;
    deposits: number;
    withdrawals: number;
    net: number;
}

export interface ClientDistribution {
    name: string;
    value: number;
    percentage: string;
}

export interface Transaction {
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
}

export interface DailyStats {
    date: string;
    clients: number;
    deposits: number;
    withdrawals: number;
    transactions: number;
    ibPartners: number;
}

export interface TopClient {
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
}

export interface DashboardData {
    stats: DashboardStats;
    revenueData: RevenueData[];
    clientDistribution: ClientDistribution[];
    recentTransactions: Transaction[];
    dailyStats: DailyStats[];
    topClients: TopClient[];
}

// Hook options
interface UseDashboardDataOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
    retryOnError?: boolean;
    maxRetries?: number;
}

// Hook return type
interface UseDashboardDataReturn {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    lastUpdated: Date | null;
    retryCount: number;
    refetch: () => void;
    clearError: () => void;
}

// Custom hook
export const useDashboardData = (options: UseDashboardDataOptions = {}): UseDashboardDataReturn => {
    const {
        autoRefresh = true,
        refreshInterval = 5 * 60 * 1000, // 5 minutes
        retryOnError = true,
        maxRetries = 3
    } = options;

    // State
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Fetch data function
    const fetchData = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            if (!showRefresh && !data) setLoading(true);

            setError(null);

            const result = await adminDashboardApi.getAllDashboardData();

            if (
                result &&
                result.stats &&
                result.revenueData &&
                result.clientDistribution &&
                result.recentTransactions &&
                result.dailyStats &&
                result.topClients
            ) {
                setData(result as DashboardData);
                setLastUpdated(new Date());
                setRetryCount(0); // Reset retry count on success
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            setError(errorMessage);

            // Retry logic
            if (retryOnError && retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    fetchData(showRefresh);
                }, Math.pow(2, retryCount) * 1000); // Exponential backoff
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [data, retryOnError, retryCount, maxRetries]);

    // Manual refetch function
    const refetch = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    // Clear error function
    const clearError = useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    // Initial fetch and auto-refresh setup
    useEffect(() => {
        fetchData();

        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [fetchData, autoRefresh, refreshInterval]);

    // Online/offline handling
    useEffect(() => {
        const handleOnline = () => {
            if (error) {
                fetchData();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && autoRefresh) {
                fetchData();
            }
        };

        window.addEventListener('online', handleOnline);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [error, autoRefresh, fetchData]);

    return {
        data,
        loading,
        error,
        refreshing,
        lastUpdated,
        retryCount,
        refetch,
        clearError
    };
};

// Individual data hooks for specific components
export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminDashboardApi.getDashboardStats();
                if (response.data) {
                    setStats(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};

export const useRevenueData = () => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await adminDashboardApi.getRevenueChartData();
                if (response.data) {
                    setRevenueData(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load revenue data');
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, []);

    return { revenueData, loading, error };
};

export const useClientDistribution = () => {
    const [clientDistribution, setClientDistribution] = useState<ClientDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClientDistribution = async () => {
            try {
                const response = await adminDashboardApi.getClientDistribution();
                if (response.data) {
                    setClientDistribution(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load client distribution');
            } finally {
                setLoading(false);
            }
        };

        fetchClientDistribution();
    }, []);

    return { clientDistribution, loading, error };
};

export const useRecentTransactions = (limit: number = 10) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await adminDashboardApi.getRecentTransactions(limit);
                if (response.data) {
                    setTransactions(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [limit]);

    return { transactions, loading, error };
};

export const useTopClients = (limit: number = 10) => {
    const [topClients, setTopClients] = useState<TopClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopClients = async () => {
            try {
                const response = await adminDashboardApi.getTopPerformingClients(limit);
                if (response.data) {
                    setTopClients(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load top clients');
            } finally {
                setLoading(false);
            }
        };

        fetchTopClients();
    }, [limit]);

    return { topClients, loading, error };
};

export const useDailyStats = () => {
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDailyStats = async () => {
            try {
                const response = await adminDashboardApi.getDailyStats();
                if (response.data) {
                    setDailyStats(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load daily stats');
            } finally {
                setLoading(false);
            }
        };

        fetchDailyStats();
    }, []);

    return { dailyStats, loading, error };
};

export default useDashboardData;