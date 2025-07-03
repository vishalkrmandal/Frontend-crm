// Frontend/src/pages/client/Dashboard/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DashboardStats from './components/DashboardStats';
import TradingViewWidget from './components/TradingViewWidget';
import RecentTransactions from './components/RecentTransactions';
import ActiveAccounts from './components/ActiveAccounts';
import { dashboardApi } from './dashboardApi';
import { useTheme } from '@/context/ThemeContext';
import LoadingSpinner from './components/LoadingSpinner';

interface DashboardData {
  overview: {
    totalBalance: string;
    totalEquity: string;
    totalDeposits: string;
    totalWithdrawals: string;
    totalMt5Accounts: number;
    netBalance: string;
  };
  recentTransactions: any[];
  activeAccounts: any[];
}

const ClientDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(5);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = async (showRefreshLoader = false, isAutoRefresh = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else if (!isAutoRefresh) {
        setLoading(true);
      }

      const [overviewResponse, transactionsResponse, accountsResponse] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getRecentTransactions(),
        dashboardApi.getActiveAccounts()
      ]);

      setDashboardData({
        overview: overviewResponse.data,
        recentTransactions: transactionsResponse.data.transactions,
        activeAccounts: accountsResponse.data.accounts
      });

      setLastRefresh(new Date());
      setCountdown(5); // Reset countdown

      if (showRefreshLoader && !isAutoRefresh) {
        toast.success('Dashboard refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!isAutoRefresh) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format last refresh time
  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Handle open account navigation
  const handleOpenAccount = () => {
    navigate('/client/account/new');
  };

  // Setup auto-refresh and countdown
  useEffect(() => {
    // Initial load
    fetchDashboardData();

    // Setup auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchDashboardData(false, true);
    }, 5000);

    // Setup countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 5; // Reset to 5 when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup intervals on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleManualRefresh = () => {
    // Clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Fetch data with refresh loader
    fetchDashboardData(true, false);

    // Restart intervals
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        fetchDashboardData(false, true);
      }, 5000);

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-0 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Welcome back! Here's your trading overview.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Last refresh info */}
            {lastRefresh && (
              <div className="text-xs text-muted-foreground text-center sm:text-right">
                <div>Last updated: {formatLastRefresh(lastRefresh)}</div>
                <div>Next refresh in: {countdown}s</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Open Account button */}
              <button
                onClick={handleOpenAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Open Account</span>
              </button>

              {/* Manual refresh button */}
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboardData?.overview && (
          <DashboardStats
            data={dashboardData.overview}
            theme={theme}
          />
        )}

        {/* Trading View Widget */}
        <div className="mb-8">
          <TradingViewWidget theme={theme} />
        </div>

        {/* Recent Transactions and Active Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Recent Transactions */}
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
            theme={theme}
            onRefresh={() => fetchDashboardData(true)}
          />

          {/* Active Accounts */}
          <ActiveAccounts
            accounts={dashboardData?.activeAccounts || []}
            theme={theme}
            onRefresh={() => fetchDashboardData(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;