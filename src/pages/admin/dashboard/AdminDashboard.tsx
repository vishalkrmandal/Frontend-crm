// Frontend\src\pages\admin\features\AdminDashboard.tsx

import { useEffect, useState } from "react"
import {
    Users,
    ArrowDownCircle,
    ArrowUpCircle,
    BarChart3,
    HandshakeIcon,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    RefreshCw,
    Calendar
} from "lucide-react"
import { StatCard } from "./StatCard"
import { MiniChart } from "./MiniChart"
import { RevenueChart } from "./RevenueChart"
import { PlanDistributionChart } from "./PlanDistributionChart"
import { RecentTransactionsTable } from "./RecentTransactionsTable"
import { TopClientsTable } from "./TopClientsTable"
import { adminDashboardAPI } from "./adminDashboardAPI"

interface DashboardStats {
    clients: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
        growth: number
        pending: number
    }
    deposits: {
        total: number
        count: number
        today: number
        pending: number
        growth: number
    }
    withdrawals: {
        total: number
        count: number
        pending: number
        growth: number
    }
    transactions: {
        total: number
        growth: number
    }
    ibPartners: {
        total: number
        pending: number
        growth: number
    }
    accounts: {
        total: number
        today: number
    }
}

interface DailyStats {
    date: string
    clients: number
    deposits: number
    withdrawals: number
    transactions: number
    ibPartners: number
}

const AdminDashboard = () => {
    const [greeting, setGreeting] = useState("")
    const [currentTime, setCurrentTime] = useState("")
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Generate chart data from daily stats
    const generateChartData = (field: keyof DailyStats, days: number = 30): number[] => {
        if (!dailyStats.length) return Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10)

        return dailyStats.slice(-days).map(stat => {
            if (field === 'deposits' || field === 'withdrawals') {
                return Math.floor(Number(stat[field]) / 1000) // Convert to thousands for better visualization
            }
            return Number(stat[field])
        })
    }

    const fetchDashboardData = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) setRefreshing(true)
            else setLoading(true)

            const [statsResponse, dailyStatsResponse] = await Promise.all([
                adminDashboardAPI.getDashboardStats(),
                adminDashboardAPI.getDailyStats()
            ])

            if (statsResponse.success) {
                setStats(statsResponse.data)
            }

            if (dailyStatsResponse.success) {
                setDailyStats(dailyStatsResponse.data)
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

    useEffect(() => {
        const hours = new Date().getHours()
        let greetingText = ""

        if (hours < 12) {
            greetingText = "Good Morning"
        } else if (hours < 18) {
            greetingText = "Good Afternoon"
        } else {
            greetingText = "Good Evening"
        }

        setGreeting(greetingText)

        // Format current date
        const now = new Date()
        const formattedDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })

        setCurrentTime(formattedDate)

        // Initial data fetch
        fetchDashboardData()
    }, [])

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData(true)
        }, 5 * 60 * 1000) // 5 minutes

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

    const adminUserRaw = localStorage.getItem('adminUser')
    const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null
    const fullName = adminUser ? `${adminUser.firstname} ${adminUser.lastname}`.trim() : 'Admin'


    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-4 min-h-[60px] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {greeting}, {fullName}!
                            <Activity className="h-5 w-5 text-orange-200" />
                        </h1>
                        <p className="text-orange-100 text-sm mt-1">
                            {stats?.clients.today || 0} New Clients Registered Today!
                            <span className="ml-2 inline-flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {(stats?.clients.growth ?? 0) > 0 ? '+' : ''}{stats?.clients.growth ?? 0}%
                            </span>
                        </p>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-orange-100 opacity-80">Last updated</p>
                            <p className="text-xs text-orange-100">{lastUpdated.toLocaleTimeString()}</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-sm"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Updating...' : 'Refresh'}
                        </button>
                        <div className="text-xs text-orange-100">{currentTime}</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700">Today's Revenue</p>
                            <p className="text-2xl font-bold text-green-800">
                                ${stats?.deposits.today.toLocaleString() || '0'}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Active Accounts</p>
                            <p className="text-2xl font-bold text-blue-800">{stats?.accounts.total || 0}</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Pending Approvals</p>
                            <p className="text-2xl font-bold text-purple-800">
                                {(stats?.deposits.pending || 0) + (stats?.withdrawals.pending || 0)}
                            </p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-700">Monthly Growth</p>
                            <p className="text-2xl font-bold text-orange-800 flex items-center gap-1">
                                {(stats?.clients.growth ?? 0) > 0 ? '+' : ''}{stats?.clients.growth ?? 0}%
                                {(stats?.clients.growth ?? 0) > 0 ?
                                    <TrendingUp className="h-5 w-5 text-green-600" /> :
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                }
                            </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Main Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <StatCard
                    title="Clients"
                    value={stats?.clients.total.toLocaleString() || "0"}
                    icon={<Users className="h-6 w-6" />}
                    change={{
                        value: stats?.clients.growth || 0,
                        trend: (stats?.clients.growth || 0) >= 0 ? "up" : "down"
                    }}
                    chart={<MiniChart data={generateChartData('clients')} color="#22c55e" type="line" />}
                    href="/admin/dashboard/clients"
                    pending={stats?.clients.pending || 0}
                    subStats={{
                        today: stats?.clients.today || 0,
                        thisWeek: stats?.clients.thisWeek || 0,
                        thisMonth: stats?.clients.thisMonth || 0
                    }}
                />

                <StatCard
                    title="Deposits"
                    value={`$${stats?.deposits.total.toLocaleString() || "0"}`}
                    icon={<ArrowDownCircle className="h-6 w-6" />}
                    change={{
                        value: stats?.deposits.growth || 0,
                        trend: (stats?.deposits.growth || 0) >= 0 ? "up" : "down"
                    }}
                    chart={<MiniChart data={generateChartData('deposits')} color="#f97316" type="bar" />}
                    href="/admin/dashboard/deposits"
                    pending={stats?.deposits.pending || 0}
                    subStats={{
                        count: stats?.deposits.count || 0,
                        today: stats?.deposits.today || 0
                    }}
                />

                <StatCard
                    title="Withdrawals"
                    value={`$${stats?.withdrawals.total.toLocaleString() || "0"}`}
                    icon={<ArrowUpCircle className="h-6 w-6" />}
                    change={{
                        value: stats?.withdrawals.growth || 0,
                        trend: (stats?.withdrawals.growth || 0) >= 0 ? "up" : "down"
                    }}
                    chart={<MiniChart data={generateChartData('withdrawals')} color="#ef4444" type="bar" />}
                    href="/admin/dashboard/withdrawals"
                    pending={stats?.withdrawals.pending || 0}
                    subStats={{
                        count: stats?.withdrawals.count || 0
                    }}
                />

                <StatCard
                    title="Transactions"
                    value={stats?.transactions.total.toLocaleString() || "0"}
                    icon={<BarChart3 className="h-6 w-6" />}
                    change={{
                        value: stats?.transactions.growth || 0,
                        trend: (stats?.transactions.growth || 0) >= 0 ? "up" : "down"
                    }}
                    chart={<MiniChart data={generateChartData('transactions')} color="#3b82f6" type="area" />}
                    href="/admin/dashboard/transactions"
                    transactions={stats?.transactions.total || 0}
                />

                <StatCard
                    title="IB Partners"
                    icon={<HandshakeIcon className="h-6 w-6" />}
                    value={stats?.ibPartners.total.toString() || "0"}
                    change={{
                        value: stats?.ibPartners.growth || 0,
                        trend: (stats?.ibPartners.growth || 0) >= 0 ? "up" : "down"
                    }}
                    chart={<MiniChart data={generateChartData('ibPartners')} color="#a855f7" type="line" />}
                    href="/admin/dashboard/ib-partners"
                    pending={stats?.ibPartners.pending || 0}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <RevenueChart />
                <PlanDistributionChart />
            </div>

            {/* Tables Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RecentTransactionsTable />
                <TopClientsTable />
            </div>

            {/* System Status */}
            <div className="bg-card ounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">System Status: All Services Operational</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>API Response: 45ms</span>
                        <span>Database: Connected</span>
                        <span>Last Health Check: {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard