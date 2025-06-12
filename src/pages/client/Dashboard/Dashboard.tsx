import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  RefreshCw, ArrowUpRight, ArrowDownRight, Search, MoreHorizontal,
  Eye, EyeOff, AlertCircle, Moon, Sun, Clock, ChevronUp, ChevronDown,
  Wifi, WifiOff
} from 'lucide-react';
import { useDashboardStore, useThemeStore } from './store/dashboardStore';

// Theme Toggle Component
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500" />
      )}
    </button>
  );
};

// Auto Refresh Toggle

const AutoRefreshToggle = () => {
  const { autoRefreshEnabled, toggleAutoRefresh } = useDashboardStore();

  return (
    <button
      onClick={toggleAutoRefresh}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${autoRefreshEnabled
        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
    >
      {autoRefreshEnabled ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Paused</span>
        </>
      )}
    </button>
  );
};

// Statistics Card
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'increase' | 'decrease';
  color: 'blue' | 'orange' | 'purple' | 'green' | 'red' | string;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  color
}: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const getColorClasses = (color: 'blue' | 'orange' | 'purple' | 'green' | 'red' | string) => {
    const colors: Record<'blue' | 'orange' | 'purple' | 'green' | 'red', string> = {
      blue: 'bg-blue-500 dark:bg-blue-600',
      orange: 'bg-orange-500 dark:bg-orange-600',
      purple: 'bg-purple-500 dark:bg-purple-600',
      green: 'bg-green-500 dark:bg-green-600',
      red: 'bg-red-500 dark:bg-red-600'
    };
    return (colors as Record<string, string>)[color] || 'bg-gray-500 dark:bg-gray-600';
  };

  const getChangeColor = (type?: 'increase' | 'decrease') => {
    return type === 'increase'
      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(changeType)}`}>
            {change}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isVisible ? value : '••••••'}
          </h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isVisible ?
              <Eye className="h-4 w-4 text-gray-400" /> :
              <EyeOff className="h-4 w-4 text-gray-400" />
            }
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      </div>
    </div>
  );
};

// Enhanced Performance Chart
const PerformanceChart = () => {
  const { tradingPerformance } = useDashboardStore();
  const [showProfit, setShowProfit] = useState(true);
  const [showLoss, setShowLoss] = useState(true);

  // Generate sample data if none from API
  const generateSampleData = () => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'EURGBP', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'];
    const data = [];

    for (let i = 0; i < 15; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const profit = (Math.random() - 0.5) * 500;

      data.push({
        profit: parseFloat(profit.toFixed(2)),
        symbol,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return data.reverse();
  };

  const data = tradingPerformance.length > 0 ? tradingPerformance : generateSampleData();

  const filteredData = data.filter(item => {
    if (!showProfit && item.profit > 0) return false;
    if (!showLoss && item.profit < 0) return false;
    return true;
  });

  const maxValue = Math.max(...filteredData.map(d => Math.abs(d.profit)));
  const totalProfit = filteredData.filter(d => d.profit > 0).reduce((sum, d) => sum + d.profit, 0);
  const totalLoss = Math.abs(filteredData.filter(d => d.profit < 0).reduce((sum, d) => sum + d.profit, 0));
  const winRate = filteredData.length > 0 ? (filteredData.filter(d => d.profit > 0).length / filteredData.length * 100).toFixed(1) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Performance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last {filteredData.length} trades • Real-time data</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowProfit(!showProfit)}
            className={`px-3 py-1 text-xs rounded transition-all ${showProfit ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
          >
            Profit
          </button>
          <button
            onClick={() => setShowLoss(!showLoss)}
            className={`px-3 py-1 text-xs rounded transition-all ${showLoss ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
          >
            Loss
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">${totalProfit.toFixed(2)}</p>
          <ChevronUp className="h-3 w-3 text-green-500 mx-auto" />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Loss</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">${totalLoss.toFixed(2)}</p>
          <ChevronDown className="h-3 w-3 text-red-500 mx-auto" />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{winRate}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 flex items-end justify-between space-x-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        {filteredData.map((item, index) => {
          const height = maxValue > 0 ? Math.abs(item.profit) / maxValue * 100 : 50;
          const isProfit = item.profit >= 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group relative"
            >
              <div className="relative flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer ${isProfit
                    ? 'bg-green-500 dark:bg-green-600'
                    : 'bg-red-500 dark:bg-red-600'
                    }`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <div className="font-medium">{item.symbol}</div>
                <div className={isProfit ? 'text-green-400' : 'text-red-400'}>
                  ${item.profit.toFixed(2)}
                </div>
                <div className="text-gray-300">{item.date}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Profitable Trades ({filteredData.filter(d => d.profit > 0).length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Loss Trades ({filteredData.filter(d => d.profit < 0).length})</span>
          </div>
        </div>
        <span>Hover bars for details</span>
      </div>
    </div>
  );
};

// Transaction History
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

const TransactionHistory = () => {
  const { recentTransactions } = useDashboardStore() as { recentTransactions: Transaction[] };
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = recentTransactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type.toLowerCase() === filter;
    const matchesSearch = transaction.account.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Latest activity on your accounts</p>
        </div>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
          <span>View All</span>
          <ArrowUpRight className="h-4 w-4" />
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
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
          <div key={transaction._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${transaction.type === 'Deposit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                {transaction.type === 'Deposit' ?
                  <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                  <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                }
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.account} • {transaction.method}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${transaction.type === 'Deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {transaction.formattedAmount || `${transaction.type === 'Deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Active Accounts
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

const ActiveAccounts = () => {
  const { activeAccounts, fetchDashboardData } = useDashboardStore() as { activeAccounts: ActiveAccount[]; fetchDashboardData: (force?: boolean) => Promise<void> };
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
    setRefreshing(false);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'standard': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400';
      case 'pro': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400';
      case 'vip': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Accounts</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{activeAccounts.length} accounts connected</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activeAccounts.length > 0 ? activeAccounts.map((account) => (
          <div
            key={account._id}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{account.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.accountType)}`}>
                    {account.accountType}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">MT5: {account.mt5Account}</p>
              </div>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Balance</p>
                <p className="font-semibold text-gray-900 dark:text-white">${account.balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Equity</p>
                <p className="font-semibold text-gray-900 dark:text-white">${account.equity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">P&L</p>
                <p className={`font-semibold flex items-center ${account.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {account.profitLoss >= 0 ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                  {account.profitLoss >= 0 ? '+' : ''}${account.profitLoss.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Leverage: {account.leverage}</span>
                <span>Group: {account.groupName}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No active accounts found</p>
            <p className="text-sm mt-1">Connect your trading accounts to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

// TradingView Widget
const TradingViewWidget = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('FX:EURUSD');
  const { theme } = useThemeStore();

  const symbols = [
    { label: 'EUR/USD', value: 'FX:EURUSD' },
    { label: 'GBP/USD', value: 'FX:GBPUSD' },
    { label: 'USD/JPY', value: 'FX:USDJPY' },
    { label: 'BTC/USD', value: 'COINBASE:BTCUSD' },
    { label: 'ETH/USD', value: 'COINBASE:ETHUSD' },
    { label: 'Gold', value: 'TVC:GOLD' },
    { label: 'Silver', value: 'TVC:SILVER' },
    { label: 'Oil', value: 'TVC:USOIL' }
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
      "theme": theme,
      "style": "1",
      "locale": "en",
      "toolbar_bg": theme === 'dark' ? "#1f2937" : "#f1f3f6",
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
  }, [selectedSymbol, theme]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Market Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time trading charts</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {symbols.map(symbol => (
              <option key={symbol.value} value={symbol.value}>{symbol.label}</option>
            ))}
          </select>
          <button
            onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${selectedSymbol}`, '_blank')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Open in TradingView"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
        <div id="tradingview_widget" className="h-full w-full"></div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const {
    stats,
    loading,
    error,
    refreshing,
    lastUpdated,
    autoRefreshEnabled,
    refreshInterval,
    fetchDashboardData,
    clearError
  } = useDashboardStore();

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    fetchDashboardData();

    // Set up auto-refresh
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchDashboardData, autoRefreshEnabled, refreshInterval]);

  // Initialize theme on mount
  useEffect(() => {
    const { theme } = useThemeStore.getState();
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  if (loading && !stats.totalBalance) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats.totalBalance) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500 dark:text-red-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Unable to load dashboard</h2>
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-700 dark:text-red-400 text-sm font-medium">Error Details:</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => fetchDashboardData()}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={clearError}
              className="w-full px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Clear Errors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back, Trader</h1>
              <p className="text-orange-100 dark:text-orange-200 mt-1">Your comprehensive trading overview</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="flex items-center space-x-2 text-orange-100 dark:text-orange-200 text-sm bg-white bg-opacity-10 dark:bg-black dark:bg-opacity-20 rounded-lg px-3 py-2">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                  {refreshing && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                </div>
              )}
              <AutoRefreshToggle />
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 dark:bg-black dark:bg-opacity-20 dark:hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
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

        {/* Trading Chart Widget */}
        <div className="mb-8">
          <TradingViewWidget />
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <PerformanceChart />
        </div>

        {/* Bottom Section - Transactions and Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionHistory />
          <ActiveAccounts />
        </div>
      </div>

      {/* Loading Overlay */}
      {refreshing && (
        <div className="fixed top-4 right-4 bg-blue-600 dark:bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm font-medium">Updating data...</span>
        </div>
      )}

      {/* Auto-refresh status indicator */}
      {autoRefreshEnabled && (
        <div className="fixed bottom-4 right-4 bg-green-600 dark:bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-40 text-xs">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span>Live updates enabled</span>
        </div>
      )}

      {/* Error notification */}
      {error && stats.totalBalance > 0 && (
        <div className="fixed top-4 left-4 bg-red-600 dark:bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 max-w-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Update failed</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;