// Frontend/src/components/admin/dashboard/index.ts

// Main Dashboard Components
export { default as DashboardCards } from './DashboardCards';
export { default as RevenueChart } from './RevenueChart';
export { default as ClientDistributionChart } from './ClientDistributionChart';
export { default as RecentTransactions } from './RecentTransactions';
export { default as TopPerformingClients } from './TopPerformingClients';
export { default as DailyStatsChart } from './DailyStatsChart';

// Utility Components
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as SkeletonLoader } from './SkeletonLoader';

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

