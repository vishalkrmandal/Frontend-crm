import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, TrendingUp, Eye } from 'lucide-react'
import { adminDashboardAPI } from './adminDashboardAPI'

interface TopClient {
    _id: string
    totalDeposited: number
    depositCount: number
    user: {
        firstname: string
        lastname: string
        email: string
        createdAt: string
    }
    accountsCount: number
}

export const TopClientsTable = () => {
    const [topClients, setTopClients] = useState<TopClient[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTopClients = async () => {
            try {
                const response = await adminDashboardAPI.getTopPerformingClients(10)
                if (response.success) {
                    setTopClients(response.data)
                }
            } catch (error) {
                console.error('Error fetching top clients:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTopClients()
    }, [])

    if (loading) {
        return (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        Top Performing Clients
                    </h3>
                    <p className="text-sm text-muted-foreground">By total deposits</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-500">
                        ${topClients.reduce((sum, client) => sum + client.totalDeposited, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {topClients.map((client, index) => (
                    <div
                        key={client._id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-slate-200/50 dark:hover:bg-gray-700/50  hover:text-accent-foreground transition-colors duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 text-white text-sm font-bold shadow-sm">
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-medium text-sm text-card-foreground flex items-center">
                                    {client.user.firstname} {client.user.lastname}
                                    {index === 0 && <Crown className="inline h-4 w-4 text-yellow-500 dark:text-yellow-400 ml-1" />}
                                </p>
                                <p className="text-xs text-muted-foreground">{client.user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded">
                                        {client.accountsCount} accounts
                                    </span>
                                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded">
                                        {client.depositCount} deposits
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-lg text-green-600 dark:text-green-500">
                                ${client.totalDeposited.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Member since {new Date(client.user.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                                <TrendingUp className="h-3 w-3" />
                                Top {Math.round(((index + 1) / topClients.length) * 100)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-border mt-4">
                <button
                    onClick={() => navigate('/admin/features/clients')}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 w-full justify-center transition-colors hover:bg-accent/50 py-2 px-4 rounded-md"
                >
                    <Eye className="h-4 w-4" />
                    View All Clients
                </button>
            </div>
        </div>
    )
}