// Frontend/src/components/admin/dashboard/ClientDistributionChart.tsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Eye, EyeOff } from 'lucide-react';

interface ClientDistributionChartProps {
    data: Array<{
        name: string;
        value: number;
        percentage: string;
    }>;
}

const ClientDistributionChart: React.FC<ClientDistributionChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

    const COLORS = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#F97316', // Orange
        '#84CC16', // Lime
        '#EC4899', // Pink
        '#6B7280', // Gray
    ];

    const filteredData = data.filter(item => !hiddenItems.has(item.name));

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const toggleItemVisibility = (name: string) => {
        const newHiddenItems = new Set(hiddenItems);
        if (newHiddenItems.has(name)) {
            newHiddenItems.delete(name);
        } else {
            newHiddenItems.add(name);
        }
        setHiddenItems(newHiddenItems);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{data.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Accounts: {data.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Percentage: {data.percentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // Don't show label for slices less than 5%

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const totalAccounts = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-card rounded-xl shadow-sm  p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Account Distribution
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        By account type ({totalAccounts} total accounts)
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={filteredData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                            >
                                {filteredData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke={activeIndex === index ? '#374151' : 'none'}
                                        strokeWidth={activeIndex === index ? 2 : 0}
                                        style={{
                                            filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend and Stats */}
                <div className="space-y-4">
                    <div className="space-y-3">
                        {data.map((entry, index) => {
                            const isHidden = hiddenItems.has(entry.name);
                            return (
                                <div
                                    key={entry.name}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${isHidden
                                        ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-50'
                                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {entry.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {entry.value} accounts
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {entry.percentage}%
                                        </span>
                                        <button
                                            onClick={() => toggleItemVisibility(entry.name)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                        >
                                            {isHidden ? (
                                                <EyeOff className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Stats */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {data.length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Account Types
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {totalAccounts}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Accounts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDistributionChart;