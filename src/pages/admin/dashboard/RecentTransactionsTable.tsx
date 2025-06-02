// Frontend\src\pages\admin\components\dashboard\RecentTransactionsTable.tsx

import { useEffect, useState } from 'react'
import { Activity, Eye, Calendar, Filter } from 'lucide-react'
import { adminDashboardAPI } from './adminDashboardAPI'

interface Transaction {
    id: string
    type: string
    amount: number
    user: {
        name: string
        email: string
    }
    account: string
    status: string
    date: string
    paymentMethod: string
}

export const RecentTransactionsTable = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all')

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await adminDashboardAPI.getRecentTransactions(15)
                if (response.success) {
                    setTransactions(response.data)
                }
            } catch (error) {
                console.error('Error fetching transactions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [])

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true
        return transaction.type.toLowerCase() === filter
    })

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

    if (loading) {
        return (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-300 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Recent Transactions
                    </h3>
                    <p className="text-sm text-muted-foreground">Latest 15 transactions</p>
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                {transaction.type}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{transaction.user.name}</p>
                                <p className="text-xs text-muted-foreground">{transaction.user.email}</p>
                                <p className="text-xs text-muted-foreground">Account: {transaction.account}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-sm">${transaction.amount.toLocaleString()}</p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(transaction.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
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
