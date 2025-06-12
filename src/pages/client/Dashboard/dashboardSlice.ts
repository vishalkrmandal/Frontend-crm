import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      await response.text();
      throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('clientToken');
        sessionStorage.removeItem('clientToken');
        window.location.href = '/login';
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

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getDashboardData();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : String(error));
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'dashboard/fetchTransactionHistory',
  async (filters: { [key: string]: any } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTransactionHistory(filters);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch transaction history');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : String(error));
    }
  }
);

export const fetchAccountDetails = createAsyncThunk(
  'dashboard/fetchAccountDetails',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getAccountDetails(accountId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch account details');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : String(error));
    }
  }
);

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

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAutoRefresh: (state, action) => {
      state.autoRefreshEnabled = action.payload;
    },
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        if (!state.stats.totalBalance && !state.refreshing) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.stats = action.payload.stats;
        state.recentTransactions = action.payload.recentTransactions;
        state.activeAccounts = action.payload.activeAccounts;
        state.tradingPerformance = action.payload.tradingPerformance;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string | null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
      })
      .addCase(fetchAccountDetails.fulfilled, (_state, action) => {
        console.log('Account details loaded:', action.payload);
      });
  },
});

export const {
  setRefreshing,
  clearError,
  setAutoRefresh,
  setRefreshInterval,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;