// Frontend/src/services/adminDashboardApi.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

class AdminDashboardApi {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('adminToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    private async fetchWithAuth<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    async getDashboardStats() {
        return this.fetchWithAuth<{
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
        }>('/api/admin/dashboard/stats');
    }

    async getRevenueChartData() {
        return this.fetchWithAuth<Array<{
            month: string;
            deposits: number;
            withdrawals: number;
            net: number;
        }>>('/api/admin/dashboard/revenue-chart');
    }

    async getClientDistribution() {
        return this.fetchWithAuth<Array<{
            name: string;
            value: number;
            percentage: string;
        }>>('/api/admin/dashboard/client-distribution');
    }

    async getRecentTransactions(limit: number = 10) {
        return this.fetchWithAuth<Array<{
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
        }>>(`/api/admin/dashboard/recent-transactions?limit=${limit}`);
    }

    async getDailyStats() {
        return this.fetchWithAuth<Array<{
            date: string;
            clients: number;
            deposits: number;
            withdrawals: number;
            transactions: number;
            ibPartners: number;
        }>>('/api/admin/dashboard/daily-stats');
    }

    async getTopPerformingClients(limit: number = 10) {
        return this.fetchWithAuth<Array<{
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
        }>>(`/api/admin/dashboard/top-clients?limit=${limit}`);
    }

    async getAllDashboardData() {
        try {
            const [
                statsResponse,
                revenueResponse,
                distributionResponse,
                transactionsResponse,
                dailyStatsResponse,
                topClientsResponse
            ] = await Promise.all([
                this.getDashboardStats(),
                this.getRevenueChartData(),
                this.getClientDistribution(),
                this.getRecentTransactions(10),
                this.getDailyStats(),
                this.getTopPerformingClients(10)
            ]);

            return {
                stats: statsResponse.data,
                revenueData: revenueResponse.data,
                clientDistribution: distributionResponse.data,
                recentTransactions: transactionsResponse.data,
                dailyStats: dailyStatsResponse.data,
                topClients: topClientsResponse.data
            };
        } catch (error) {
            console.error('Error fetching all dashboard data:', error);
            throw error;
        }
    }
}

export const adminDashboardApi = new AdminDashboardApi();
export default adminDashboardApi;