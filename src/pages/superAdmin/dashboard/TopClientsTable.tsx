// Frontend\src\pages\admin\components\dashboard\TopClientsTable.tsx

import { useEffect, useState } from 'react'
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
                        <Crown className="h-5 w-5 text-yellow-600" />
                        Top Performing Clients
                    </h3>
                    <p className="text-sm text-muted-foreground">By total deposits</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold text-green-600">
                        ${topClients.reduce((sum, client) => sum + client.totalDeposited, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {topClients.map((client, index) => (
                    <div key={client._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-bold">
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-medium text-sm">
                                    {client.user.firstname} {client.user.lastname}
                                    {index === 0 && <Crown className="inline h-4 w-4 text-yellow-500 ml-1" />}
                                </p>
                                <p className="text-xs text-muted-foreground">{client.user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {client.accountsCount} accounts
                                    </span>
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                        {client.depositCount} deposits
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-lg text-green-600">
                                ${client.totalDeposited.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Member since {new Date(client.user.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                                <TrendingUp className="h-3 w-3" />
                                Top {Math.round(((index + 1) / topClients.length) * 100)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-border mt-4">
                <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 w-full justify-center">
                    <Eye className="h-4 w-4" />
                    View All Clients
                </button>
            </div>
        </div>
    )
}