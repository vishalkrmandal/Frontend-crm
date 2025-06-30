// Frontend\src\pages\client\components\dashboard\RecentTransactions.tsx

import { Activity, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Eye, Filter } from 'lucide-react'
import { useState } from 'react'

interface Transaction {
    id: string
    type: string
    amount: number
    status: string
    date: string
    account: string
    description: string
}

interface RecentTransactionsProps {
    transactions: Transaction[]
}

export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
    const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all')

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true
        return transaction.type.toLowerCase() === filter
    })

    console.log('Filtered Transactions:', filteredTransactions)

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'rejected':
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'deposit':
                return <ArrowDownRight className="h-4 w-4 text-green-600" />
            case 'withdrawal':
                return <ArrowUpRight className="h-4 w-4 text-red-600" />
            case 'transfer':
                return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
            default:
                return <Activity className="h-4 w-4 text-gray-600" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'deposit':
                return 'text-green-600 bg-green-50'
            case 'withdrawal':
                return 'text-red-600 bg-red-50'
            case 'transfer':
                return 'text-blue-600 bg-blue-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Recent Transactions
                    </h3>
                    <p className="text-sm text-muted-foreground">Your latest activity</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposits</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="transfer">Transfers</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${getTypeColor(transaction.type)}`}>
                                    {getTypeIcon(transaction.type)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{transaction.description}</p>
                                    <p className="text-xs text-muted-foreground">Account: {transaction.account}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-bold text-sm">${transaction.amount.toLocaleString()}</p>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                    {transaction.status}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No transactions found</p>
                        <p className="text-xs">Your transaction history will appear here</p>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-border mt-4">
                <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 w-full justify-center">
                    <Eye className="h-4 w-4" />
                    View All Transactions
                </button>
            </div>
        </div>
    )
}