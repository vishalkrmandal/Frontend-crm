// Frontend\src\pages\client\Dashboard\Dashboard.tsx

import { useEffect, useState } from "react"
import {
  BarChart2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  CreditCard,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Award,
  Calendar,
  Filter,
  Download
} from "lucide-react"
import { AccountCard } from "./AccountCard"
import { PerformanceChart } from "./PerformanceChart"
import { RecentTransactions } from "./RecentTransactions"
import { ReferralWidget } from "./ReferralWidget"
import { clientDashboardAPI } from "./clientDashboardAPI"

interface DashboardData {
  totalBalance: number
  totalEquity: number
  totalProfit: number
  activeTrades: number
  accounts: any[]
  recentActivity: any[]
  referrals: number
  referralEarnings: number
  performanceMetrics: {
    profitLoss: number
    marginLevel: number
    freeMargin: number
  }
}

interface PerformanceData {
  performanceChart: Array<{
    date: string
    profit: number
    balance: number
    trades: number
  }>
  totalTrades: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  sharpeRatio: number
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true)
      else setLoading(true)

      const [overviewResponse, performanceResponse] = await Promise.all([
        clientDashboardAPI.getDashboardOverview(),
        clientDashboardAPI.getTradingPerformance(selectedPeriod)
      ])

      if (overviewResponse.success) {
        setDashboardData(overviewResponse.data)
      }

      if (performanceResponse.success) {
        setPerformanceData(performanceResponse.data)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (selectedPeriod) {
      fetchDashboardData(true)
    }
  }, [selectedPeriod])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true)
    }, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-lg font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const profitLossPercentage = dashboardData?.totalBalance && dashboardData.totalBalance > 0
    ? ((dashboardData.totalProfit / dashboardData.totalBalance) * 100).toFixed(2)
    : '0.00'

  const isProfit = dashboardData?.totalProfit && dashboardData.totalProfit >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your trading overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={`$${dashboardData?.totalBalance?.toLocaleString() || '0.00'}`}
          change={profitLossPercentage}
          icon={DollarSign}
          trend={isProfit ? "up" : "down"}
          subtitle="Across all accounts"
        />
        <StatCard
          title="Total Equity"
          value={`$${dashboardData?.totalEquity?.toLocaleString() || '0.00'}`}
          change={"+2.5%"}
          icon={Wallet}
          trend="up"
          subtitle="Current market value"
        />
        <StatCard
          title="Active Trades"
          value={dashboardData?.activeTrades?.toString() || '0'}
          change="+8.2%"
          icon={Activity}
          trend="up"
          subtitle={`${performanceData?.totalTrades || 0} total this period`}
        />
        <StatCard
          title="Total Profit/Loss"
          value={`${isProfit ? '+' : ''}$${Math.abs(dashboardData?.totalProfit || 0).toLocaleString()}`}
          change={`${isProfit ? '+' : '-'}${profitLossPercentage}%`}
          icon={isProfit ? TrendingUp : TrendingDown}
          trend={isProfit ? "up" : "down"}
          subtitle="Realized + Unrealized"
        />
      </div>

      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-green-600" />
            <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{performanceData?.winRate || 0}%</p>
          <p className="text-sm text-green-600">Success rate</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-blue-600" />
            <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">Profit Factor</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{performanceData?.profitFactor || 0}</p>
          <p className="text-sm text-blue-600">Risk ratio</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-purple-600" />
            <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full">Referrals</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{dashboardData?.referrals || 0}</p>
          <p className="text-sm text-purple-600">${dashboardData?.referralEarnings || 0} earned</p>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trading Performance Chart */}
        <div className="lg:col-span-2">
          <PerformanceChart
            data={performanceData?.performanceChart || []}
            period={selectedPeriod}
            metrics={{
              totalTrades: performanceData?.totalTrades || 0,
              winRate: performanceData?.winRate || 0,
              profitFactor: performanceData?.profitFactor || 0,
              sharpeRatio: performanceData?.sharpeRatio || 0
            }}
          />
        </div>

        {/* Account Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Account Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Free Margin</span>
                <span className="font-medium">${dashboardData?.performanceMetrics?.freeMargin?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Margin Level</span>
                <span className="font-medium">{dashboardData?.performanceMetrics?.marginLevel?.toFixed(1) || '0'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Drawdown</span>
                <span className="font-medium text-red-600">${performanceData?.maxDrawdown || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Win</span>
                <span className="font-medium text-green-600">+${performanceData?.avgWin || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Loss</span>
                <span className="font-medium text-red-600">${performanceData?.avgLoss || 0}</span>
              </div>
            </div>
          </div>

          <ReferralWidget referrals={dashboardData?.referrals || 0} earnings={dashboardData?.referralEarnings || 0} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={dashboardData?.recentActivity || []} />
        </div>

        {/* Active Accounts */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Accounts</h3>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Manage accounts
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData?.accounts?.slice(0, 3).map((account, index) => (
              <AccountCard key={index} account={account} />
            )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No accounts found</p>
                  <button className="text-primary hover:underline text-sm mt-2">
                    Create your first account
                  </button>
                </div>
              )}
          </div>

          {dashboardData?.accounts && dashboardData.accounts.length > 3 && (
            <div className="pt-3 border-t border-border mt-3">
              <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 w-full justify-center">
                <Eye className="h-4 w-4" />
                View {dashboardData.accounts.length - 3} more accounts
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <button className="flex items-center gap-3 p-4 rounded-lg border border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 transition-colors">
          <ArrowDownRight className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <p className="font-medium text-green-800">Deposit</p>
            <p className="text-xs text-green-600">Add funds</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 transition-colors">
          <ArrowUpRight className="h-5 w-5 text-red-600" />
          <div className="text-left">
            <p className="font-medium text-red-800">Withdraw</p>
            <p className="text-xs text-red-600">Transfer funds</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 rounded-lg border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors">
          <BarChart2 className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <p className="font-medium text-blue-800">Analytics</p>
            <p className="text-xs text-blue-600">View reports</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 rounded-lg border border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 transition-colors">
          <Download className="h-5 w-5 text-purple-600" />
          <div className="text-left">
            <p className="font-medium text-purple-800">Export</p>
            <p className="text-xs text-purple-600">Download data</p>
          </div>
        </button>
      </div>

      {/* System Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Market Status: Open</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Last Updated: {lastUpdated.toLocaleTimeString()}</span>
            <span>Server: Online</span>
            <span>Latency: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ElementType
  trend: "up" | "down"
  subtitle?: string
}

function StatCard({ title, value, change, icon: Icon, trend, subtitle }: StatCardProps) {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600"
  const trendBg = trend === "up" ? "bg-green-50" : "bg-red-50"

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} ${trendBg} px-2 py-1 rounded-full`}>
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}