// Frontend/src/pages/client/Dashboard/components/DashboardStats.tsx
import React from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
} from 'lucide-react';

interface DashboardStatsProps {
    data: {
        totalBalance: string;
        totalEquity: string;
        totalDeposits: string;
        totalWithdrawals: string;
        totalMt5Accounts: number;
        netBalance: string;
    };
    theme: 'light' | 'dark';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, theme }) => {
    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(parseFloat(amount));
    };

    const statsCards = [
        {
            id: 'balance',
            title: 'Total Balance',
            value: formatCurrency(data.totalBalance),
            icon: Wallet,
            color: 'blue',
            bgColor: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
            iconColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
            // change: '+2.5%',
            trend: 'up'
        },
        {
            id: 'deposits',
            title: 'Total Deposits',
            value: formatCurrency(data.totalDeposits),
            icon: TrendingUp,
            color: 'green',
            bgColor: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
            iconColor: theme === 'dark' ? 'text-green-400' : 'text-green-600',
            // change: '+12.3%',
            trend: 'up'
        },
        {
            id: 'withdrawals',
            title: 'Total Withdrawals',
            value: formatCurrency(data.totalWithdrawals),
            icon: TrendingDown,
            color: 'red',
            bgColor: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
            iconColor: theme === 'dark' ? 'text-red-400' : 'text-red-600',
            // change: '-5.1%',
            trend: 'down'
        },
        {
            id: 'accounts',
            title: 'MT5 Accounts',
            value: data.totalMt5Accounts.toString(),
            icon: CreditCard,
            color: 'purple',
            bgColor: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
            iconColor: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
            change: 'Active',
            trend: 'neutral'
        }
    ];

    return (
        <div className="mb-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsCards.map((stat) => {
                    const IconComponent = stat.icon;
                    return (
                        <div
                            key={stat.id}
                            className="p-6 rounded-xl border transition-all duration-200 hover:shadow-lg bg-card hover:bg-card/80"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold mt-2">
                                        {stat.value}
                                    </p>
                                    {stat.change && (
                                        <div className={`flex items-center mt-2 text-xs ${stat.trend === 'up'
                                            ? 'text-green-500'
                                            : stat.trend === 'down'
                                                ? 'text-red-500'
                                                : 'text-muted-foreground'
                                            }`}>
                                            {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                                            {stat.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                                            <span>{stat.change}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Card */}
            {/* <div className="p-6 rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-background/50">
                            <PieChart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Portfolio Overview</h3>
                            <p className="text-sm text-muted-foreground">
                                Total account value including balance and equity
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-2xl font-bold text-green-500">
                                {formatCurrency(data.netBalance)}
                            </span>
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">
                            Net Portfolio Value
                        </p>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default DashboardStats;