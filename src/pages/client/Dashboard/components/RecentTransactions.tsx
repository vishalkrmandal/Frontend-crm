// Frontend/src/pages/client/Dashboard/components/RecentTransactions.tsx
import React, { useState } from 'react';
import {
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    ArrowRightLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Processing';
    date: string;
    processedDate?: string;
    account?: string;
    paymentMethod?: string;
    fromAccount?: string;
    toAccount?: string;
    createdAt: string;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
    theme: 'light' | 'dark';
    onRefresh: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
    transactions,
    onRefresh
}) => {
    const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
            case 'withdrawal':
                return <ArrowUpCircle className="w-5 h-5 text-red-500" />;
            case 'transfer':
                return <ArrowRightLeft className="w-5 h-5 text-blue-500" />;
            default:
                return <History className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'text-green-500 bg-green-100 dark:bg-green-900/20';
            case 'pending':
                return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
            case 'rejected':
                return 'text-red-500 bg-red-100 dark:bg-red-900/20';
            case 'processing':
                return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
            default:
                return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
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

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(t => t.type === filter);

    return (
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-3">
            {/* Header - Fixed height */}
            <div className="flex-shrink-0 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Recent Transactions</h3>
                            <p className="text-sm text-muted-foreground">
                                Latest activity on your accounts
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {['all', 'deposit', 'withdrawal', 'transfer'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType as any)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === filterType
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            {filterType === 'all' && ` (${transactions.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions List - Scrollable */}
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 h-full">
                        <History className="w-12 h-12 mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            No transactions found
                        </p>
                    </div>
                ) : (
                    <div className="px-2 grid grid-cols-1 gap-2">
                        {filteredTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="border border-border rounded-lg p-2 hover:border-primary/50 transition-colors cursor-pointer hover:bg-muted/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            {getTransactionIcon(transaction.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium capitalize">
                                                    {transaction.type}
                                                </p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)
                                                    }`}>
                                                    {transaction.status}
                                                </span>
                                            </div>

                                            <div className="text-sm mt-1 text-muted-foreground">
                                                {transaction.type === 'transfer' ? (
                                                    <span>
                                                        {transaction.fromAccount} → {transaction.toAccount}
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {transaction.account} • {transaction.paymentMethod}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs mt-1 text-muted-foreground">
                                                {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className={`font-semibold ${transaction.type === 'withdrawal' || transaction.type === 'transfer'
                                                ? 'text-red-500'
                                                : 'text-green-500'
                                                }`}>
                                                {transaction.type === 'withdrawal' || transaction.type === 'transfer' ? '-' : '+'}
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


        </div>
    );
};

export default RecentTransactions;