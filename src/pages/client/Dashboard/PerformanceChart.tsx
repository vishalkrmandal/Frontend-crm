// Frontend\src\pages\client\components\dashboard\PerformanceChart.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, BarChart3, Target, Award } from 'lucide-react'

interface PerformanceChartProps {
    data: Array<{
        date: string
        profit: number
        balance: number
        trades: number
    }>
    period: string
    metrics: {
        totalTrades: number
        winRate: number
        profitFactor: number
        sharpeRatio: number
    }
}

export const PerformanceChart = ({ data, period, metrics }: PerformanceChartProps) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`
    }

    const totalProfit = data.length > 0 ? data[data.length - 1].profit - data[0].profit : 0
    const isPositive = totalProfit >= 0

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Trading Performance
                    </h3>
                    <p className="text-sm text-muted-foreground">Profit/Loss over {period}</p>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}${Math.abs(totalProfit).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {period} change
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => [
                                name === 'profit' ? formatCurrency(value) : value,
                                name === 'profit' ? 'Profit' : 'Balance'
                            ]}
                            labelFormatter={(label) => `Date: ${formatDate(label)}`}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke={isPositive ? "#22c55e" : "#ef4444"}
                            fill={isPositive ? "#22c55e" : "#ef4444"}
                            fillOpacity={0.1}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-blue-600 font-medium">Total Trades</p>
                    <p className="text-lg font-bold text-blue-800">{metrics.totalTrades}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-600 font-medium">Win Rate</p>
                    <p className="text-lg font-bold text-green-800">{metrics.winRate.toFixed(1)}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-purple-600 font-medium">Profit Factor</p>
                    <p className="text-lg font-bold text-purple-800">{metrics.profitFactor.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-xs text-orange-600 font-medium">Sharpe Ratio</p>
                    <p className="text-lg font-bold text-orange-800">{metrics.sharpeRatio.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}