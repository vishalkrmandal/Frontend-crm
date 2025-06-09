import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, BarChart3,
  RefreshCw, ArrowUpRight, ArrowDownRight,
  Search, MoreHorizontal, Eye, EyeOff, AlertCircle
} from 'lucide-react';

// Fixed API Service with proper error handling
class DashboardAPI {
  baseURL: string;
  token: string | null;

  constructor() {
    // Fixed: Use correct API URL format
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.token = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async handleResponse(response: Response) {
    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Received HTML instead of JSON:', text.substring(0, 200));
      throw new Error('Server returned HTML instead of JSON. Check API endpoint and authentication.');
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
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
      console.log('Fetching dashboard data from:', `${this.baseURL}/api/client/dashboard`);
      console.log('Using token:', this.token ? 'Present' : 'Missing');

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

// Initialize API service
const dashboardAPI = new DashboardAPI();

// Statistics Card Component
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease';
  color?: string;
  showValue?: boolean;
};

const StatCard = ({ title, value, icon: Icon, change, changeType, color, showValue = true }: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(showValue);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'orange': return 'bg-orange-500';
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses(color || 'gray')}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className={`px-2 py-1 rounded text-xs font-medium ${changeType === 'increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {change}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {isVisible ? value : '••••••'}
          </h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isVisible ? <Eye className="h-4 w-4 text-gray-400" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
};

// TradingView Widget Component
const TradingViewWidget = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('FX:EURUSD');

  const symbols = [
    { label: 'EUR/USD', value: 'FX:EURUSD' },
    { label: 'GBP/USD', value: 'FX:GBPUSD' },
    { label: 'USD/JPY', value: 'FX:USDJPY' },
    { label: 'BTC/USD', value: 'COINBASE:BTCUSD' },
    { label: 'ETH/USD', value: 'COINBASE:ETHUSD' },
    { label: 'Gold', value: 'TVC:GOLD' },
    { label: 'Silver', value: 'TVC:SILVER' },
    { label: 'Oil', value: 'TVC:USOIL' },
    { label: 'SPY', value: 'AMEX:SPY' },
    { label: 'QQQ', value: 'NASDAQ:QQQ' }
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": selectedSymbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    const container = document.getElementById('tradingview_widget');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, [selectedSymbol]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Market Data</h3>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {symbols.map(symbol => (
            <option key={symbol.value} value={symbol.value}>{symbol.label}</option>
          ))}
        </select>
      </div>
      <div className="h-96 rounded-lg overflow-hidden">
        <div id="tradingview_widget" className="h-full w-full"></div>
      </div>
    </div>
  );
};

// Performance Chart Component
type PerformanceChartData = { profit: number; symbol: string }[];

const PerformanceChart = ({
  data,
  title = "Trading Performance"
}: { data: PerformanceChartData; title?: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No trading performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.profit)));
  const minValue = Math.min(...data.map(d => d.profit));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Last {data.length} trades
        </div>
      </div>

      <div className="h-64 flex items-end justify-between space-x-1">
        {data.map((item, index) => {
          const height = maxValue > 0 ? Math.abs(item.profit) / maxValue * 100 : 50;
          const isProfit = item.profit >= 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group"
              title={`${item.symbol}: $${item.profit.toFixed(2)}`}
            >
              <div className="relative flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all duration-200 hover:opacity-80 ${isProfit ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-600 mt-1">
                ${item.profit.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Worst: <span className="text-red-600 font-medium">${minValue.toFixed(2)}</span></span>
        <span>Best: <span className="text-green-600 font-medium">${Math.max(...data.map(d => d.profit)).toFixed(2)}</span></span>
      </div>
    </div>
  );
};

// Transaction History Component
type Transaction = {
  _id: string;
  type: string;
  status: string;
  account: string;
  method: string;
  amount: number;
  formattedAmount?: string;
  date: string;
};

type TransactionHistoryProps = {
  transactions: Transaction[];
  onLoadMore: () => void;
};

const TransactionHistory = ({ transactions, onLoadMore }: TransactionHistoryProps) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type.toLowerCase() === filter;
    const matchesSearch = transaction.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.method.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button
          onClick={onLoadMore}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="max-h-80 overflow-y-auto space-y-3">
        {filteredTransactions.map((transaction) => (
          <div key={transaction._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${transaction.type === 'Deposit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {transaction.type === 'Deposit' ?
                  <ArrowUpRight className="h-4 w-4 text-green-600" /> :
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                }
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{transaction.type}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {transaction.account} • {transaction.method}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${transaction.type === 'Deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                {transaction.formattedAmount || `${transaction.type === 'Deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}`}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Active Accounts Component
type ActiveAccount = {
  _id: string;
  name: string;
  accountType: string;
  mt5Account: string;
  balance: number;
  equity: number;
  profitLoss: number;
  leverage: string;
  groupName: string;
};

type ActiveAccountsProps = {
  accounts: ActiveAccount[];
  onRefresh?: () => Promise<void> | void;
  onAccountClick?: (account: ActiveAccount) => void;
};

const ActiveAccounts = ({ accounts, onRefresh, onAccountClick }: ActiveAccountsProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setRefreshing(false);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'pro': return 'bg-purple-100 text-purple-700';
      case 'vip': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Accounts</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-4">
        {accounts.map((account) => (
          <div
            key={account._id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => onAccountClick && onAccountClick(account)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{account.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.accountType)}`}>
                      {account.accountType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">MT5: {account.mt5Account}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Balance</p>
                <p className="font-semibold text-gray-900">${account.balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Equity</p>
                <p className="font-semibold text-gray-900">${account.equity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">P&L</p>
                <p className={`font-semibold ${account.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {account.profitLoss >= 0 ? '+' : ''}${account.profitLoss.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Leverage: {account.leverage}</span>
                <span>Group: {account.groupName}</span>
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No active accounts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Debug Panel Component (for development)
const DebugPanel = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h4 className="font-bold mb-2">Debug Info:</h4>
      <div className="text-sm space-y-1">
        <p>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
        <p>Token: {localStorage.getItem('clientToken') ? 'Present' : 'Missing'}</p>
        <p>Environment: {import.meta.env.MODE}</p>
      </div>
    </div>
  );
};

// Main Dashboard Component
type DashboardStats = {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalActiveTrades: number;
  totalProfit: number;
  totalLoss: number;
};

type DashboardData = {
  stats: DashboardStats;
  recentTransactions: Transaction[];
  activeAccounts: ActiveAccount[];
  tradingPerformance: PerformanceChartData;
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      setRefreshing(true);

      // Add debug logging
      console.log('Starting dashboard data fetch...');

      const response = await dashboardAPI.getDashboardData();
      console.log('Dashboard API response:', response);

      if (response.success) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
        console.log('Dashboard data updated successfully');
      } else {
        throw new Error(response.message || 'API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle account click
  const handleAccountClick = async (account: ActiveAccount) => {
    try {
      const response = await dashboardAPI.getAccountDetails(account._id);
      if (response.success) {
        console.log('Account details:', response.data);
        // You can open a modal or navigate to account details page
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  // Handle load more transactions
  const handleLoadMoreTransactions = async () => {
    try {
      const response = await dashboardAPI.getTransactionHistory({
        page: 1,
        limit: 50
      });
      if (response.success) {
        console.log('All transactions:', response.data);
        // You can open a modal or navigate to transactions page
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Toggle debug panel with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <button
            onClick={() => setShowDebug(true)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Show Debug Info
          </button>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load dashboard</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm font-medium">Error Details:</p>
            <p className="text-red-600 text-sm mt-1">{error || 'Unknown error occurred'}</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block w-full"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowDebug(true)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors block w-full"
            >
              Show Debug Info
            </button>
          </div>
        </div>
        <DebugPanel show={showDebug} />
      </div>
    );
  }

  const { stats, recentTransactions, activeAccounts, tradingPerformance } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back, Trader</h1>
            <p className="text-orange-100">Your comprehensive trading overview</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-orange-100 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value={`${stats.totalBalance.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
            change="+2.5%"
            changeType="increase"
          />
          <StatCard
            title="Total Deposits"
            value={`${stats.totalDeposits.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
            change="+5.2%"
            changeType="increase"
          />
          <StatCard
            title="Total Withdrawals"
            value={`${stats.totalWithdrawals.toLocaleString()}`}
            icon={TrendingDown}
            color="red"
          />
          <StatCard
            title="Active Trades"
            value={stats.totalActiveTrades.toString()}
            icon={Activity}
            color="purple"
            change={stats.totalActiveTrades > 0 ? `${stats.totalActiveTrades} open` : 'No trades'}
          />
          <StatCard
            title="Total Profit"
            value={`${stats.totalProfit.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
            change="+12.8%"
            changeType="increase"
          />
          <StatCard
            title="Total Loss"
            value={`${stats.totalLoss.toLocaleString()}`}
            icon={TrendingDown}
            color="orange"
            change="-3.2%"
            changeType="decrease"
          />
        </div>

        {/* Trading Chart */}
        <div className="mb-8">
          <TradingViewWidget />
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <PerformanceChart data={tradingPerformance} />
        </div>

        {/* Bottom Section - Transactions and Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionHistory
            transactions={recentTransactions}
            onLoadMore={handleLoadMoreTransactions}
          />
          <ActiveAccounts
            accounts={activeAccounts}
            onRefresh={fetchDashboardData}
            onAccountClick={handleAccountClick}
          />
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel show={showDebug} />
    </div>
  );
};

export default Dashboard;