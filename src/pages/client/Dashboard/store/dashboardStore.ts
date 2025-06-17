// Frontend\src\pages\client\Dashboard\store\dashboardStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Dashboard API Class
class DashboardAPI {
    baseURL: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    }

    getToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');
    }

    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async handleResponse(response: Response) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
        }

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('clientToken');
                sessionStorage.removeItem('clientToken');
                window.location.href = '/';
                throw new Error('Authentication failed');
            }
            throw new Error(data.message || `API request failed with status ${response.status}`);
        }

        return data;
    }

    async getDashboardData() {
        try {
            const response = await fetch(`${this.baseURL}/api/client/dashboard`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    async getTransactionHistory(filters: { [key: string]: any } = {}) {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });

            const response = await fetch(`${this.baseURL}/api/client/dashboard/transactions?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw error;
        }
    }

    async getAccountDetails(accountId: string) {
        try {
            const response = await fetch(`${this.baseURL}/api/client/dashboard/account/${accountId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching account details:', error);
            throw error;
        }
    }
}

const dashboardAPI = new DashboardAPI();

// Theme Store
type ThemeStore = {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'light',
            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', newTheme === 'dark');
                }
            },
            setTheme: (theme: 'light' | 'dark') => {
                set({ theme });
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                }
            },
        }),
        {
            name: 'dashboard-theme',
        }
    )
);

// Dashboard Store
const initialState = {
    stats: {
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalActiveTrades: 0,
        totalProfit: 0,
        totalLoss: 0
    },
    recentTransactions: [],
    activeAccounts: [],
    tradingPerformance: [],
    loading: false,
    refreshing: false,
    error: null as string | null,
    lastUpdated: null as string | null,
    autoRefreshEnabled: true,
    refreshInterval: 10000,
};

type DashboardStore = Omit<typeof initialState, 'error' | 'lastUpdated'> & {
    error: string | null;
    lastUpdated: string | null;
    setLoading: (loading: boolean) => void;
    setRefreshing: (refreshing: boolean) => void;
    setError: (error: string) => void;
    clearError: () => void;
    setAutoRefresh: (enabled: boolean) => void;
    setRefreshInterval: (interval: number) => void;
    fetchDashboardData: (showRefreshing?: boolean) => Promise<void>;
    fetchTransactionHistory: (filters?: Record<string, any>) => Promise<void>;
    fetchAccountDetails: (accountId: string) => Promise<void>;
    toggleAutoRefresh: () => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    ...initialState,

    // Actions
    setLoading: (loading: boolean) => set({ loading }),
    setRefreshing: (refreshing: boolean) => set({ refreshing }),
    setError: (error: string) => set({ error }),
    clearError: () => set({ error: null }),
    setAutoRefresh: (enabled: boolean) => set({ autoRefreshEnabled: enabled }),
    setRefreshInterval: (interval: number) => set({ refreshInterval: interval }),

    fetchDashboardData: async (showRefreshing = false) => {
        const state = get() as typeof initialState & {
            setLoading: (loading: boolean) => void;
            setRefreshing: (refreshing: boolean) => void;
            setError: (error: string) => void;
            clearError: () => void;
            setAutoRefresh: (enabled: boolean) => void;
            setRefreshInterval: (interval: number) => void;
            fetchDashboardData: (showRefreshing?: boolean) => Promise<void>;
            fetchTransactionHistory: (filters?: Record<string, any>) => Promise<void>;
            fetchAccountDetails: (accountId: string) => Promise<void>;
            toggleAutoRefresh: () => void;
        };
        if (showRefreshing) {
            set({ refreshing: true });
        } else if (!state.stats.totalBalance) {
            set({ loading: true });
        }

        try {
            const response = await dashboardAPI.getDashboardData();

            if (response.success) {
                set({
                    stats: response.data.stats,
                    recentTransactions: response.data.recentTransactions,
                    activeAccounts: response.data.activeAccounts,
                    tradingPerformance: response.data.tradingPerformance,
                    lastUpdated: new Date().toISOString(),
                    loading: false,
                    refreshing: false,
                    error: null
                });
            } else {
                throw new Error(response.message || 'Failed to fetch dashboard data');
            }
        } catch (error: any) {
            set({
                loading: false,
                refreshing: false,
                error: error.message
            });
        }
    },

    fetchTransactionHistory: async (filters = {}) => {
        try {
            const response = await dashboardAPI.getTransactionHistory(filters);
            if (response.success) {
                set({ recentTransactions: response.data });
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
        }
    },

    fetchAccountDetails: async (accountId: string) => {
        try {
            const response = await dashboardAPI.getAccountDetails(accountId);
            if (response.success) {
                console.log('Account details loaded:', response.data);
            }
        } catch (error) {
            console.error('Error fetching account details:', error);
        }
    },

    toggleAutoRefresh: () => {
        const current = get().autoRefreshEnabled;
        set({ autoRefreshEnabled: !current });
    }
}));