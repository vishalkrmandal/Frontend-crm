import { useEffect, useState } from 'react'
import { Activity, Eye, Filter } from 'lucide-react'
import { adminDashboardAPI } from './adminDashboardAPI'
import { useNavigate } from 'react-router-dom'

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
    const navigate = useNavigate()

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
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'rejected':
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'deposit':
                return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
            case 'withdrawal':
                return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
            case 'transfer':
                return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
            default:
                return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Recent Transactions
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Latest 15 transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="text-sm border bg-card rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
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
                    <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                {transaction.type}
                            </div>
                            <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{transaction.user.name}</p>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">{transaction.user.email}</p>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">Account: {transaction.account}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-sm text-gray-900 dark:text-white">${transaction.amount.toLocaleString()}</p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                                {new Date(transaction.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-border dark:border-gray-600 mt-4">
                <button
                    onClick={() => navigate('/admin/features/transactions')}
                    className="text-sm text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 font-medium flex items-center gap-1 w-full justify-center transition-colors hover:bg-accent/50 dark:hover:bg-gray-700/50 py-2 px-4 rounded-md"
                >
                    <Eye className="h-4 w-4" />
                    View All Transactions
                </button>
            </div>
        </div>
    )
}