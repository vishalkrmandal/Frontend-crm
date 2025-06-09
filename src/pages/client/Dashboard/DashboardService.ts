// Frontend/services/dashboardService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DashboardService {
    private token: string | null;

    constructor() {
        this.token = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');
    }

    // Update token if needed
    updateToken(token: string) {
        this.token = token;
    }

    // Get authorization headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    // Handle API responses
    async handleResponse(response: Response) {
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    }

    // Get complete dashboard data
    async getDashboardData() {
        try {
            const response = await fetch(`${API_BASE_URL}/client/dashboard`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    // Get transaction history with filters
    async getTransactionHistory(filters: { [key: string]: string | number | undefined } = {}) {
        try {
            const params = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    params.append(key, String(filters[key]));
                }
            });

            const response = await fetch(`${API_BASE_URL}/client/dashboard/transactions?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw error;
        }
    }

    // Get specific account details
    async getAccountDetails(accountId: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/client/dashboard/account/${accountId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching account details:', error);
            throw error;
        }
    }

    // Get trading data (if you have separate trading endpoints)
    async getTradingData() {
        try {
            const response = await fetch(`${API_BASE_URL}/trading`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching trading data:', error);
            throw error;
        }
    }

    // Get open trades
    async getOpenTrades() {
        try {
            const response = await fetch(`${API_BASE_URL}/trading/open`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching open trades:', error);
            throw error;
        }
    }

    // Get closed trades
    async getClosedTrades() {
        try {
            const response = await fetch(`${API_BASE_URL}/trading/closed`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching closed trades:', error);
            throw error;
        }
    }

    // Export transactions
    async exportTransactions(format = 'xlsx', filters = {}) {
        try {
            const params = new URLSearchParams({ format, ...filters });

            const response = await fetch(`${API_BASE_URL}/transactions/export?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true };
        } catch (error) {
            console.error('Error exporting transactions:', error);
            throw error;
        }
    }
}

// Create singleton instance
const dashboardService = new DashboardService();

export default dashboardService;

// Export individual methods for easier importing
export const {
    getDashboardData,
    getTransactionHistory,
    getAccountDetails,
    getTradingData,
    getOpenTrades,
    getClosedTrades,
    exportTransactions
} = dashboardService;

// ---------------------------------------------
// Usage in React components:
// ---------------------------------------------

/*
import dashboardService from '../services/dashboardService';

// In your component:
const fetchData = async () => {
  try {
    const response = await dashboardService.getDashboardData();
    if (response.success) {
      setDashboardData(response.data);
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
};

// Get filtered transactions:
const fetchTransactions = async () => {
  try {
    const filters = {
      page: 1,
      limit: 20,
      type: 'deposit',
      status: 'approved',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };
    
    const response = await dashboardService.getTransactionHistory(filters);
    if (response.success) {
      setTransactions(response.data);
    }
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  }
};
*/