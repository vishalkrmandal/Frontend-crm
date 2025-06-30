// Frontend/src/services/api/dashboardApi.ts
import { apiClient } from './apiClient';

export interface DashboardOverview {
    totalBalance: string;
    totalEquity: string;
    totalDeposits: string;
    totalWithdrawals: string;
    totalMt5Accounts: number;
    netBalance: string;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Processing';
    date: string;
    processedDate?: string;
    account?: string;
    paymentMethod?: string;
    fromAccount?: string;
    toAccount?: string;
    createdAt: string;
}

export interface Account {
    id: string;
    mt5Account: string;
    name: string;
    balance: string;
    equity: string;
    leverage: string;
    accountType: string;
    groupName: string;
    platform: string;
    status: boolean;
    kycStatus: 'Verified' | 'Pending';
    createdAt: string;
    totalValue: string;
}

export interface TransactionsResponse {
    transactions: Transaction[];
    pagination: {
        currentPage: number;
        totalTransactions: number;
        hasMore: boolean;
    };
}

export interface AccountsResponse {
    accounts: Account[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalAccounts: number;
        hasMore: boolean;
    };
    filterOptions: {
        accountTypes: string[];
        leverages: string[];
    };
}

export interface AccountPerformance {
    accounts: Array<{
        accountNumber: string;
        currentValue: string;
        balance: string;
        equity: string;
        performance: {
            dailyChange: number;
            weeklyChange: number;
            monthlyChange: number;
            totalReturn: number;
        };
    }>;
    period: string;
    summary: {
        totalAccounts: number;
        totalValue: string;
        averagePerformance: number;
    };
}

export interface GetTransactionsParams {
    limit?: number;
    page?: number;
}

export interface GetAccountsParams {
    search?: string;
    accountType?: string;
    leverage?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface GetPerformanceParams {
    period?: '1d' | '7d' | '30d' | '90d';
}

class DashboardApiService {
    /**
     * Get dashboard overview statistics
     */
    async getOverview(): Promise<{ success: boolean; data: DashboardOverview }> {
        try {
            const response = await apiClient.get('api/client/dashboard/overview');
            if (!response.data || typeof response.data.data === 'undefined') {
                throw new Error('Invalid API response: missing data');
            }
            if (!response.data || typeof response.data.data === 'undefined') {
                throw new Error('Invalid API response: missing data');
            }
            return {
                success: response.data.success === undefined ? true : response.data.success,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            throw error;
        }
    }

    /**
     * Get recent transactions
     */
    async getRecentTransactions(params?: GetTransactionsParams): Promise<{
        success: boolean;
        data: TransactionsResponse
    }> {
        try {
            const response = await apiClient.get('api/client/dashboard/transactions', {
                params
            });
            if (!response.data || typeof response.data.data === 'undefined') {
                throw new Error('Invalid API response: missing data');
            }
            return {
                success: response.data.success === undefined ? true : response.data.success,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error fetching recent transactions:', error);
            throw error;
        }
    }

    /**
     * Get active accounts with search and filter
     */
    async getActiveAccounts(params?: GetAccountsParams): Promise<{
        success: boolean;
        data: AccountsResponse
    }> {
        try {
            const response = await apiClient.get('api/client/dashboard/accounts', {
                params
            });
            if (!response.data || typeof response.data.data === 'undefined') {
                throw new Error('Invalid API response: missing data');
            }
            return {
                success: response.data.success === undefined ? true : response.data.success,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error fetching active accounts:', error);
            throw error;
        }
    }

    /**
     * Get account performance data
     */
    async getAccountPerformance(params?: GetPerformanceParams): Promise<{
        success: boolean;
        data: AccountPerformance
    }> {
        try {
            const response = await apiClient.get('api/client/dashboard/performance', {
                params
            });
            if (!response.data || typeof response.data.data === 'undefined') {
                throw new Error('Invalid API response: missing data');
            }
            return {
                success: response.data.success === undefined ? true : response.data.success,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error fetching account performance:', error);
            throw error;
        }
    }

    /**
     * Refresh all dashboard data
     */
    async refreshDashboard(): Promise<{
        overview: DashboardOverview;
        transactions: TransactionsResponse;
        accounts: AccountsResponse;
    }> {
        try {
            const [overviewRes, transactionsRes, accountsRes] = await Promise.all([
                this.getOverview(),
                this.getRecentTransactions({ limit: 10 }),
                this.getActiveAccounts({ limit: 10 })
            ]);

            return {
                overview: overviewRes.data,
                transactions: transactionsRes.data,
                accounts: accountsRes.data
            };
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            throw error;
        }
    }
}

export const dashboardApi = new DashboardApiService();