// Frontend\src\pages\admin\components\dashboard\RevenueChart.tsx

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface RevenueData {
    month: string
    deposits: number
    withdrawals: number
    net: number
}

interface ApiResponse {
    success: boolean
    data: RevenueData[]
    message?: string
    error?: string
}

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API service for admin dashboard
const adminDashboardAPI = {
    getRevenueChartData: async (): Promise<ApiResponse> => {
        try {
            const token = localStorage.getItem('adminToken') // Adjust based on your auth implementation

            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/revenue-chart`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Adjust based on your auth implementation
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error fetching revenue chart data:', error)
            throw error
        }
    }
}

export const RevenueChart = () => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hoveredBar, setHoveredBar] = useState<number | null>(null)
    const [animationComplete, setAnimationComplete] = useState(false)

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await adminDashboardAPI.getRevenueChartData()

                if (response.success && response.data) {
                    setRevenueData(response.data)
                    // Trigger animation after data loads
                    setTimeout(() => setAnimationComplete(true), 100)
                } else {
                    setError(response.message || 'Failed to fetch revenue data')
                }
            } catch (error) {
                console.error('Error fetching revenue data:', error)
                setError(error instanceof Error ? error.message : 'An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchRevenueData()
    }, [])

    // Retry function for error state
    const handleRetry = () => {
        const fetchRevenueData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await adminDashboardAPI.getRevenueChartData()

                if (response.success && response.data) {
                    setRevenueData(response.data)
                    setTimeout(() => setAnimationComplete(true), 100)
                } else {
                    setError(response.message || 'Failed to fetch revenue data')
                }
            } catch (error) {
                console.error('Error fetching revenue data:', error)
                setError(error instanceof Error ? error.message : 'An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchRevenueData()
    }

    const totalRevenue = revenueData.reduce((sum, month) => sum + month.net, 0)
    const totalDeposits = revenueData.reduce((sum, month) => sum + month.deposits, 0)
    const totalWithdrawals = revenueData.reduce((sum, month) => sum + month.withdrawals, 0)
    const lastMonthRevenue = revenueData[revenueData.length - 1]?.net || 0
    const previousMonthRevenue = revenueData[revenueData.length - 2]?.net || 0
    const monthlyGrowth = previousMonthRevenue !== 0
        ? ((lastMonthRevenue - previousMonthRevenue) / Math.abs(previousMonthRevenue) * 100)
        : 0

    const isGrowthPositive = monthlyGrowth >= 0

    // Loading state
    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-3">
                            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded-lg w-48"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded-lg w-32"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        </div>
                    </div>
                    <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl mb-6"></div>
                    <div className="flex justify-center gap-8">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-8 shadow-xl border border-red-200/50 dark:border-red-700/50">
                <div className="text-center">
                    <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                        Failed to Load Revenue Data
                    </h3>
                    <p className="text-red-700 dark:text-red-300 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Empty state
    if (revenueData.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-center">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        No Revenue Data Available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        Revenue data will appear here once transactions are processed.
                    </p>
                </div>
            </div>
        )
    }

    const maxValue = Math.max(...revenueData.map(d => Math.max(d.deposits, d.withdrawals)))
    const chartHeight = 300
    const chartWidth = 800
    const barWidth = (chartWidth - 100) / revenueData.length * 0.7
    const barSpacing = (chartWidth - 100) / revenueData.length * 0.3

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 shadow-xl border backdrop-blur-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r bg-card"></div>

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-8">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        Revenue Analytics
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Monthly performance overview (Last 12 months)
                    </p>
                </div>

                <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                            ${Math.abs(totalRevenue).toLocaleString()}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isGrowthPositive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {isGrowthPositive ? (
                            <ArrowUpRight className="h-4 w-4" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span>{Math.abs(monthlyGrowth).toFixed(1)}% vs last month</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-400/20 dark:to-emerald-500/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Deposits</p>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                ${totalDeposits.toLocaleString()}
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-400/20 dark:to-red-500/20 rounded-xl p-4 border border-red-200/50 dark:border-red-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Withdrawals</p>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                ${totalWithdrawals.toLocaleString()}
                            </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative z-10 mb-6">
                <div className="relative bg-background rounded-xl p-6 border backdrop-blur-sm">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="overflow-visible"
                        style={{ filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))' }}
                    >
                        {/* Background grid */}
                        <defs>
                            <linearGradient id="depositGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="withdrawalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.9" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Grid lines */}
                        {[0, 20, 40, 60, 80, 100].map(percent => (
                            <line
                                key={percent}
                                x1="50"
                                y1={chartHeight - 50 - (percent / 100) * (chartHeight - 100)}
                                x2={chartWidth - 50}
                                y2={chartHeight - 50 - (percent / 100) * (chartHeight - 100)}
                                stroke="rgb(148 163 184 / 0.3)"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />
                        ))}

                        {/* Bars */}
                        {revenueData.map((data, index) => {
                            const x = 50 + (index * (chartWidth - 100)) / revenueData.length + barSpacing / 2
                            const depositHeight = animationComplete ? (data.deposits / maxValue) * (chartHeight - 100) : 0
                            const withdrawalHeight = animationComplete ? (data.withdrawals / maxValue) * (chartHeight - 100) : 0
                            const isHovered = hoveredBar === index

                            return (
                                <g key={index}>
                                    {/* Deposit bar */}
                                    <rect
                                        x={x}
                                        y={chartHeight - 50 - depositHeight}
                                        width={barWidth / 2.2}
                                        height={depositHeight}
                                        fill="url(#depositGradient)"
                                        rx="6"
                                        ry="6"
                                        className="transition-all duration-500 ease-out cursor-pointer"
                                        style={{
                                            transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                                            transformOrigin: 'bottom',
                                            filter: isHovered ? 'url(#glow)' : 'none'
                                        }}
                                        onMouseEnter={() => setHoveredBar(index)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    />

                                    {/* Withdrawal bar */}
                                    <rect
                                        x={x + barWidth / 2.2 + 4}
                                        y={chartHeight - 50 - withdrawalHeight}
                                        width={barWidth / 2.2}
                                        height={withdrawalHeight}
                                        fill="url(#withdrawalGradient)"
                                        rx="6"
                                        ry="6"
                                        className="transition-all duration-500 ease-out cursor-pointer"
                                        style={{
                                            transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                                            transformOrigin: 'bottom',
                                            filter: isHovered ? 'url(#glow)' : 'none'
                                        }}
                                        onMouseEnter={() => setHoveredBar(index)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    />

                                    {/* Hover tooltip */}
                                    {isHovered && (
                                        <g>
                                            <rect
                                                x={x - 20}
                                                y={chartHeight - 50 - Math.max(depositHeight, withdrawalHeight) - 80}
                                                width={barWidth + 40}
                                                height="70"
                                                fill="rgba(0, 0, 0, 0.9)"
                                                rx="8"
                                                ry="8"
                                            />
                                            <text
                                                x={x + barWidth / 2}
                                                y={chartHeight - 50 - Math.max(depositHeight, withdrawalHeight) - 55}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="12"
                                                fontWeight="bold"
                                            >
                                                {data.month}
                                            </text>
                                            <text
                                                x={x + barWidth / 2}
                                                y={chartHeight - 50 - Math.max(depositHeight, withdrawalHeight) - 40}
                                                textAnchor="middle"
                                                fill="#10b981"
                                                fontSize="10"
                                            >
                                                Deposits: ${data.deposits.toLocaleString()}
                                            </text>
                                            <text
                                                x={x + barWidth / 2}
                                                y={chartHeight - 50 - Math.max(depositHeight, withdrawalHeight) - 28}
                                                textAnchor="middle"
                                                fill="#ef4444"
                                                fontSize="10"
                                            >
                                                Withdrawals: ${data.withdrawals.toLocaleString()}
                                            </text>
                                            <text
                                                x={x + barWidth / 2}
                                                y={chartHeight - 50 - Math.max(depositHeight, withdrawalHeight) - 16}
                                                textAnchor="middle"
                                                fill={data.net >= 0 ? "#10b981" : "#ef4444"}
                                                fontSize="10"
                                                fontWeight="bold"
                                            >
                                                Net: ${data.net.toLocaleString()}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )
                        })}

                        {/* X-axis labels */}
                        {revenueData.map((data, index) => {
                            const x = 50 + (index * (chartWidth - 100)) / revenueData.length + barWidth / 2
                            return (
                                <text
                                    key={index}
                                    x={x}
                                    y={chartHeight - 20}
                                    textAnchor="middle"
                                    fill="rgb(100 116 139)"
                                    fontSize="12"
                                    fontWeight="medium"
                                >
                                    {data.month}
                                </text>
                            )
                        })}
                    </svg>
                </div>
            </div>

            {/* Enhanced Legend */}
            <div className="relative z-10 flex items-center justify-center gap-8">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm"></div>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Deposits</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm"></div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Withdrawals</span>
                </div>
            </div>
        </div>
    )
}