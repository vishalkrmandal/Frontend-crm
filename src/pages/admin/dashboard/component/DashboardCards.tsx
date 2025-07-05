// Frontend/src/components/admin/dashboard/DashboardCards.tsx
import React from 'react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpDown,
    UserPlus,
    CreditCard,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardsProps {
    stats: {
        clients: {
            total: number;
            today: number;
            thisWeek: number;
            thisMonth: number;
            growth: number;
            pending: number;
        };
        deposits: {
            total: number;
            count: number;
            today: number;
            pending: number;
            growth: number;
        };
        withdrawals: {
            total: number;
            count: number;
            pending: number;
            growth: number;
        };
        transactions: {
            total: number;
            growth: number;
        };
        ibPartners: {
            total: number;
            pending: number;
            growth: number;
        };
        accounts: {
            total: number;
            today: number;
        };
    };
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    const navigate = useNavigate();
    const handleCardClick = (cardTitle: string) => {
        switch (cardTitle) {
            case 'Total Clients':
                navigate('/admin/features/clients');
                break;
            case 'Total Deposits':
                navigate('/admin/features/deposits');
                break;
            case 'Total Withdrawals':
                navigate('/admin/features/withdrawals');
                break;
            case 'Total Transactions':
                navigate('/admin/features/transactions');
                break;
            default:
                break;
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600 dark:text-green-400';
        if (growth < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <ArrowUp className="w-4 h-4" />;
        if (growth < 0) return <ArrowDown className="w-4 h-4" />;
        return <ArrowUpDown className="w-4 h-4" />;
    };

    const cards = [
        {
            title: 'Total Clients',
            value: formatNumber(stats.clients.total),
            change: `${stats.clients.growth >= 0 ? '+' : ''}${stats.clients.growth}%`,
            changeValue: stats.clients.growth,
            icon: Users,
            color: 'bg-blue-500',
            lightBg: 'bg-blue-50 dark:bg-blue-900/20',
            today: stats.clients.today,
            pending: stats.clients.pending,
            subtitle: `${stats.clients.today} today, ${stats.clients.pending} pending`
        },
        {
            title: 'Total Deposits',
            value: formatCurrency(stats.deposits.total),
            change: `${stats.deposits.growth >= 0 ? '+' : ''}${stats.deposits.growth}%`,
            changeValue: stats.deposits.growth,
            icon: TrendingUp,
            color: 'bg-green-500',
            lightBg: 'bg-green-50 dark:bg-green-900/20',
            today: stats.deposits.today,
            pending: stats.deposits.pending,
            subtitle: `${formatCurrency(stats.deposits.today)} today, ${stats.deposits.pending} pending`
        },
        {
            title: 'Total Withdrawals',
            value: formatCurrency(stats.withdrawals.total),
            change: `${stats.withdrawals.growth >= 0 ? '+' : ''}${stats.withdrawals.growth}%`,
            changeValue: stats.withdrawals.growth,
            icon: TrendingDown,
            color: 'bg-red-500',
            lightBg: 'bg-red-50 dark:bg-red-900/20',
            today: 0,
            pending: stats.withdrawals.pending,
            subtitle: `${stats.withdrawals.pending} pending withdrawals`
        },
        {
            title: 'Total Transactions',
            value: formatNumber(stats.transactions.total),
            change: `${stats.transactions.growth >= 0 ? '+' : ''}${stats.transactions.growth}%`,
            changeValue: stats.transactions.growth,
            icon: ArrowUpDown,
            color: 'bg-purple-500',
            lightBg: 'bg-purple-50 dark:bg-purple-900/20',
            today: 0,
            pending: 0,
            subtitle: 'All transaction types combined'
        },
        {
            title: 'IB Partners',
            value: formatNumber(stats.ibPartners.total),
            change: `${stats.ibPartners.growth >= 0 ? '+' : ''}${stats.ibPartners.growth}%`,
            changeValue: stats.ibPartners.growth,
            icon: UserPlus,
            color: 'bg-indigo-500',
            lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
            today: 0,
            pending: stats.ibPartners.pending,
            subtitle: `${stats.ibPartners.pending} pending approvals`
        },
        {
            title: 'Active Accounts',
            value: formatNumber(stats.accounts.total),
            change: '+0%',
            changeValue: 0,
            icon: CreditCard,
            color: 'bg-orange-500',
            lightBg: 'bg-orange-50 dark:bg-orange-900/20',
            today: stats.accounts.today,
            pending: 0,
            subtitle: `${stats.accounts.today} created today`
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-card rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                    onClick={() => handleCardClick(card.title)}
                >
                    <div className="flex items-center justify-between mb-1">
                        <div className={`p-1.5 rounded-xl ${card.lightBg}`}>
                            <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${card.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${getGrowthColor(card.changeValue)}`}>
                            {getGrowthIcon(card.changeValue)}
                            {card.change}
                        </div>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                            {card.title}
                        </h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                            {card.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {card.subtitle}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>Growth this month</span>
                            <span className={`font-medium ${getGrowthColor(card.changeValue)}`}>
                                {Math.abs(card.changeValue)}%
                            </span>
                        </div>
                        <div className="mt-1 sm:mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                            <div
                                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${card.changeValue >= 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(Math.abs(card.changeValue), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardCards;