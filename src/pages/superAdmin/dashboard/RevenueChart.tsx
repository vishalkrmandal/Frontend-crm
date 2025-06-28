// Frontend\src\pages\admin\components\dashboard\RevenueChart.tsx

import { useEffect, useState } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { adminDashboardAPI } from './adminDashboardAPI'

interface RevenueData {
    month: string
    deposits: number
    withdrawals: number
    net: number
}

export const RevenueChart = () => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await adminDashboardAPI.getRevenueChartData()
                if (response.success) {
                    setRevenueData(response.data)
                }
            } catch (error) {
                console.error('Error fetching revenue data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRevenueData()
    }, [])

    const totalRevenue = revenueData.reduce((sum, month) => sum + month.net, 0)
    const lastMonthRevenue = revenueData[revenueData.length - 1]?.net || 0
    const previousMonthRevenue = revenueData[revenueData.length - 2]?.net || 0
    const monthlyGrowth = previousMonthRevenue !== 0
        ? ((lastMonthRevenue - previousMonthRevenue) / Math.abs(previousMonthRevenue) * 100).toFixed(1)
        : '0'

    if (loading) {
        return (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-300 rounded"></div>
                </div>
            </div>
        )
    }

    const maxValue = Math.max(...revenueData.map(d => Math.max(d.deposits, d.withdrawals)))
    const chartHeight = 200
    const chartWidth = 100

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Revenue Overview
                    </h3>
                    <p className="text-sm text-muted-foreground">Monthly deposits vs withdrawals</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                        ${Math.abs(totalRevenue).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">+{monthlyGrowth}%</span>
                        <span className="text-muted-foreground">vs last month</span>
                    </div>
                </div>
            </div>

            <div className="relative h-64 mb-4">
                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(percent => (
                        <line
                            key={percent}
                            x1="0"
                            y1={chartHeight - (percent / 100) * chartHeight}
                            x2={chartWidth}
                            y2={chartHeight - (percent / 100) * chartHeight}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {/* Bars */}
                    {revenueData.map((data, index) => {
                        const barWidth = chartWidth / revenueData.length * 0.8
                        const barSpacing = chartWidth / revenueData.length * 0.2
                        const x = (index * chartWidth) / revenueData.length + barSpacing / 2

                        const depositHeight = (data.deposits / maxValue) * chartHeight * 0.8
                        const withdrawalHeight = (data.withdrawals / maxValue) * chartHeight * 0.8

                        return (
                            <g key={index}>
                                {/* Deposit bar */}
                                <rect
                                    x={x}
                                    y={chartHeight - depositHeight}
                                    width={barWidth / 2}
                                    height={depositHeight}
                                    fill="#22c55e"
                                    rx="2"
                                />
                                {/* Withdrawal bar */}
                                <rect
                                    x={x + barWidth / 2}
                                    y={chartHeight - withdrawalHeight}
                                    width={barWidth / 2}
                                    height={withdrawalHeight}
                                    fill="#ef4444"
                                    rx="2"
                                />
                            </g>
                        )
                    })}
                </svg>

                {/* Month labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-2">
                    {revenueData.slice(-6).map((data, index) => (
                        <span key={index} className="transform -rotate-45 origin-left">
                            {data.month}
                        </span>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Deposits</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Withdrawals</span>
                </div>
            </div>
        </div>
    )
}
