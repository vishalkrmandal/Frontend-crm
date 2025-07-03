// Frontend/src/components/admin/dashboard/TopPerformingClients.tsx
import React, { useState } from 'react';
import {
    Trophy,
    TrendingUp,
    User,
    Calendar,
    CreditCard,
    Medal,
    Award,
    Crown
} from 'lucide-react';

interface Client {
    _id: string;
    totalDeposited: number;
    depositCount: number;
    user: {
        firstname: string;
        lastname: string;
        email: string;
        createdAt: string;
    };
    accountsCount: number;
}

interface TopPerformingClientsProps {
    clients: Client[];
}

const TopPerformingClients: React.FC<TopPerformingClientsProps> = ({ clients }) => {
    const [sortBy, setSortBy] = useState<'amount' | 'deposits' | 'accounts'>('amount');

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
            case 2:
                return <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
            case 3:
                return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
            default:
                return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
            case 2:
                return 'bg-gradient-to-r from-gray-400 to-gray-600';
            case 3:
                return 'bg-gradient-to-r from-orange-400 to-orange-600';
            default:
                return 'bg-gradient-to-r from-blue-400 to-blue-600';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    const sortedClients = [...clients].sort((a, b) => {
        switch (sortBy) {
            case 'deposits':
                return b.depositCount - a.depositCount;
            case 'accounts':
                return b.accountsCount - a.accountsCount;
            default:
                return b.totalDeposited - a.totalDeposited;
        }
    });

    return (
        <div className="bg-card rounded-xl shadow-sm p-3 sm:p-6 flex flex-col h-full max-h-[600px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0 w-full sm:w-auto">
                    <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1 sm:flex-none">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            Top Performing Clients
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Highest value clients by deposits
                        </p>
                    </div>
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent border border-gray-200 dark:border-gray-700"
                >
                    <option value="amount">Sort by Amount</option>
                    <option value="deposits">Sort by Deposits</option>
                    <option value="accounts">Sort by Accounts</option>
                </select>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 -mr-1 sm:p-2 sm:-mr-2">
                <div className="space-y-3 sm:space-y-4">
                    {sortedClients.length === 0 ? (
                        <div className="text-center py-8">
                            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No clients found</p>
                        </div>
                    ) : (
                        sortedClients.map((client, index) => (
                            <div
                                key={client._id}
                                className={`relative p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${index < 3
                                    ? 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                    }`}
                            >
                                {/* Rank Badge */}
                                <div className="absolute -top-2 -left-2">
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${getRankColor(index + 1)}`}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="block sm:hidden ml-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(index + 1)}
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {client.user.firstname} {client.user.lastname}
                                            </h4>
                                            {index < 3 && (
                                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded-full font-medium">
                                                    {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(client.totalDeposited)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                                        <p className="flex items-center gap-1 truncate">
                                            <User className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{client.user.email}</span>
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Joined {formatDate(client.user.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {client.depositCount} deposits
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" />
                                                {client.accountsCount} accounts
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Performance Score</span>
                                            <span>
                                                {Math.round((client.totalDeposited / (sortedClients[0]?.totalDeposited || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-blue-500'
                                                    }`}
                                                style={{
                                                    width: `${(client.totalDeposited / (sortedClients[0]?.totalDeposited || 1)) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:block ml-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {getRankIcon(index + 1)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {client.user.firstname} {client.user.lastname}
                                                    </h4>
                                                    {index < 3 && (
                                                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded-full font-medium">
                                                            {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    <p className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {client.user.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Joined {formatDate(client.user.createdAt)}
                                                        </span>
                                                    </p>
                                                    <p className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            {client.depositCount} deposits
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CreditCard className="w-3 h-3" />
                                                            {client.accountsCount} accounts
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(client.totalDeposited)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Total Deposited
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Performance Score</span>
                                            <span>
                                                {Math.round((client.totalDeposited / (sortedClients[0]?.totalDeposited || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-blue-500'
                                                    }`}
                                                style={{
                                                    width: `${(client.totalDeposited / (sortedClients[0]?.totalDeposited || 1)) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Summary Stats - Fixed at bottom */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(
                                clients.reduce((sum, client) => sum + client.totalDeposited, 0)
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg. Deposits</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {clients.length > 0
                                ? Math.round(clients.reduce((sum, client) => sum + client.depositCount, 0) / clients.length)
                                : 0
                            }
                        </p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Top Clients</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {clients.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopPerformingClients;