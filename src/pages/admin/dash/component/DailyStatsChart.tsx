// Frontend/src/components/admin/dashboard/DailyStatsChart.tsx
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
    ComposedChart,
    Bar,
    Area,
    AreaChart
} from 'recharts';
import {
    BarChart3,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpDown,
    UserPlus,
} from 'lucide-react';

interface DailyStatsChartProps {
    data: Array<{
        date: string;
        clients: number;
        deposits: number;
        withdrawals: number;
        transactions: number;
        ibPartners: number;
    }>;
}

const DailyStatsChart: React.FC<DailyStatsChartProps> = ({ data }) => {
    const [activeMetric, setActiveMetric] = useState<'all' | 'financial' | 'users'>('all');
    const [chartType, setChartType] = useState<'line' | 'area' | 'composed'>('line');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        {formatDate(label)}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.dataKey === 'deposits' || entry.dataKey === 'withdrawals'
                                ? formatCurrency(entry.value)
                                : entry.value
                                }`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getFilteredData = () => {
        switch (activeMetric) {
            case 'financial':
                return data.map(item => ({
                    date: item.date,
                    deposits: item.deposits,
                    withdrawals: item.withdrawals,
                    transactions: item.transactions
                }));
            case 'users':
                return data.map(item => ({
                    date: item.date,
                    clients: item.clients,
                    ibPartners: item.ibPartners
                }));
            default:
                return data;
        }
    };

    const renderChart = () => {
        const chartData = getFilteredData();
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        };

        switch (chartType) {
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {activeMetric === 'financial' || activeMetric === 'all' ? (
                            <>
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
                            </>
                        ) : null}
                        {activeMetric === 'users' || activeMetric === 'all' ? (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="clients"
                                    stackId="2"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.6}
                                    name="New Clients"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ibPartners"
                                    stackId="2"
                                    stroke="#8B5CF6"
                                    fill="#8B5CF6"
                                    fillOpacity={0.6}
                                    name="IB Partners"
                                />
                            </>
                        ) : null}
                    </AreaChart>
                );

            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {activeMetric === 'financial' || activeMetric === 'all' ? (
                            <>
                                <Bar dataKey="transactions" fill="#F59E0B" name="Transactions" />
                                <Line
                                    type="monotone"
                                    dataKey="deposits"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Deposits"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="withdrawals"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    name="Withdrawals"
                                />
                            </>
                        ) : null}
                        {activeMetric === 'users' || activeMetric === 'all' ? (
                            <>
                                <Bar dataKey="clients" fill="#3B82F6" name="New Clients" />
                                <Line
                                    type="monotone"
                                    dataKey="ibPartners"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    name="IB Partners"
                                />
                            </>
                        ) : null}
                    </ComposedChart>
                );

            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {activeMetric === 'financial' || activeMetric === 'all' ? (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="deposits"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                                    name="Deposits"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="withdrawals"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                                    name="Withdrawals"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="transactions"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                                    name="Transactions"
                                />
                            </>
                        ) : null}
                        {activeMetric === 'users' || activeMetric === 'all' ? (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="clients"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                                    name="New Clients"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ibPartners"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                                    name="IB Partners"
                                />
                            </>
                        ) : null}
                    </LineChart>
                );
        }
    };

    const getTotalsByMetric = () => {
        const totals = data.reduce((acc, item) => ({
            deposits: acc.deposits + item.deposits,
            withdrawals: acc.withdrawals + item.withdrawals,
            transactions: acc.transactions + item.transactions,
            clients: acc.clients + item.clients,
            ibPartners: acc.ibPartners + item.ibPartners
        }), { deposits: 0, withdrawals: 0, transactions: 0, clients: 0, ibPartners: 0 });

        return totals;
    };

    const totals = getTotalsByMetric();

    return (
        <div className="bg-card rounded-xl shadow-sm border p-3 sm:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-0 w-full lg:w-auto">
                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 lg:flex-none">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            Daily Performance Trends
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Last 30 days activity overview
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:w-auto">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveMetric('all')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeMetric === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveMetric('financial')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeMetric === 'financial'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Financial
                        </button>
                        <button
                            onClick={() => setActiveMetric('users')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeMetric === 'users'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Users
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${chartType === 'line'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Line
                        </button>
                        <button
                            onClick={() => setChartType('area')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${chartType === 'area'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Area
                        </button>
                        <button
                            onClick={() => setChartType('composed')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${chartType === 'composed'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Mixed
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Deposits</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(totals.deposits)}
                    </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Withdrawals</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-red-700 dark:text-red-300">
                        {formatCurrency(totals.withdrawals)}
                    </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-medium">Transactions</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-yellow-700 dark:text-yellow-300">
                        {totals.transactions}
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">New Clients</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-blue-700 dark:text-blue-300">
                        {totals.clients}
                    </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-3 md:col-span-1">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">IB Partners</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-purple-700 dark:text-purple-300">
                        {totals.ibPartners}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 sm:h-80 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DailyStatsChart;