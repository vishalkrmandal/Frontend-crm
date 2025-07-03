// Frontend/src/components/admin/dashboard/RecentTransactions.tsx
import React, { useState } from 'react';
import {
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    ArrowRightLeft,
} from 'lucide-react';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    user: {
        name: string;
        email: string;
    };
    account: string;
    status: string;
    date: string;
    paymentMethod: string;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
    const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

    const getTransactionIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'deposit':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'withdrawal':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'transfer':
                return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
            default:
                return <ArrowUpDown className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true;
        return transaction.type.toLowerCase() === filter;
    });

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortBy === 'amount') {
            return b.amount - a.amount;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
        <div className="bg-card rounded-xl shadow-sm border p-3 sm:p-6 flex flex-col h-full max-h-[600px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0 w-full sm:w-auto">
                    <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 sm:flex-none">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Transactions
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Latest financial activities
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 bg-background rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent border border-gray-200 dark:border-gray-700"
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposits</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="transfer">Transfers</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 rounded-lg bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent border border-gray-200 dark:border-gray-700"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                    </select>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 -mr-1 sm:pr-2 sm:-mr-2">
                <div className="space-y-3 sm:space-y-4">
                    {sortedTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                        </div>
                    ) : (
                        sortedTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                            >
                                {/* Mobile Layout */}
                                <div className="block sm:hidden p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                {getTransactionIcon(transaction.type)}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {transaction.type}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                        <p className={`font-semibold text-sm ${transaction.type.toLowerCase() === 'deposit'
                                            ? 'text-green-600 dark:text-green-400'
                                            : transaction.type.toLowerCase() === 'withdrawal'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {transaction.type.toLowerCase() === 'withdrawal' ? '-' : '+'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>

                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <p className="truncate">
                                            <span className="font-medium">{transaction.user.name}</span> • {transaction.user.email}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="flex items-center gap-1">
                                                <span>Account: {transaction.account}</span>
                                                <span>•</span>
                                                <span>{transaction.paymentMethod}</span>
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            {getTransactionIcon(transaction.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {transaction.type}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <p className="mb-1">
                                                    <span className="font-medium">{transaction.user.name}</span> • {transaction.user.email}
                                                </p>
                                                <p className="flex items-center gap-4">
                                                    <span>Account: {transaction.account}</span>
                                                    <span>•</span>
                                                    <span>{transaction.paymentMethod}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-semibold ${transaction.type.toLowerCase() === 'deposit'
                                            ? 'text-green-600 dark:text-green-400'
                                            : transaction.type.toLowerCase() === 'withdrawal'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {transaction.type.toLowerCase() === 'withdrawal' ? '-' : '+'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Summary - Fixed at bottom */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Deposits</p>
                        <p className="text-sm sm:text-lg font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(
                                transactions
                                    .filter(t => t.type.toLowerCase() === 'deposit')
                                    .reduce((sum, t) => sum + t.amount, 0)
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Withdrawals</p>
                        <p className="text-sm sm:text-lg font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(
                                transactions
                                    .filter(t => t.type.toLowerCase() === 'withdrawal')
                                    .reduce((sum, t) => sum + t.amount, 0)
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Transfers</p>
                        <p className="text-sm sm:text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(
                                transactions
                                    .filter(t => t.type.toLowerCase() === 'transfer')
                                    .reduce((sum, t) => sum + t.amount, 0)
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecentTransactions;