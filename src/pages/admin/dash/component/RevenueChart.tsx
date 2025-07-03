// Frontend/src/components/admin/dashboard/RevenueChart.tsx
import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    Area,
    AreaChart
} from 'recharts';
import { TrendingUp, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface RevenueChartProps {
    data: Array<{
        month: string;
        deposits: number;
        withdrawals: number;
        net: number;
    }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card p-4 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        };

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="month"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="deposits" fill="#10B981" name="Deposits" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="withdrawals" fill="#EF4444" name="Withdrawals" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="month"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="deposits"
                            stackId="1"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.6}
                            name="Deposits"
                        />
                        <Area
                            type="monotone"
                            dataKey="withdrawals"
                            stackId="1"
                            stroke="#EF4444"
                            fill="#EF4444"
                            fillOpacity={0.6}
                            name="Withdrawals"
                        />
                    </AreaChart>
                );

            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="month"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="deposits"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                            name="Deposits"
                        />
                        <Line
                            type="monotone"
                            dataKey="withdrawals"
                            stroke="#EF4444"
                            strokeWidth={3}
                            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                            name="Withdrawals"
                        />
                        <Line
                            type="monotone"
                            dataKey="net"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                            name="Net Revenue"
                        />
                    </LineChart>
                );
        }
    };

    const totalDeposits = data.reduce((sum, item) => sum + item.deposits, 0);
    const totalWithdrawals = data.reduce((sum, item) => sum + item.withdrawals, 0);
    const netRevenue = totalDeposits - totalWithdrawals;

    return (
        <div className="bg-card rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Revenue Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last 12 months performance
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setChartType('line')}
                        className={`p-2 rounded-lg transition-colors ${chartType === 'line'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <LineChartIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`p-2 rounded-lg transition-colors ${chartType === 'bar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType('area')}
                        className={`p-2 rounded-lg transition-colors ${chartType === 'area'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Deposits</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(totalDeposits)}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {formatCurrency(totalWithdrawals)}
                    </p>
                </div>
                <div className={`rounded-lg p-4 ${netRevenue >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <p className={`text-sm font-medium ${netRevenue >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        Net Revenue
                    </p>
                    <p className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                        {formatCurrency(netRevenue)}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;