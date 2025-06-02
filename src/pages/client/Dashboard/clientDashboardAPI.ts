// Frontend\src\services\clientDashboardAPI.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('clientToken') // Adjust based on your auth implementation
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
}

export const clientDashboardAPI = {
    // Get client dashboard overview
    getDashboardOverview: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/overview`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching dashboard overview:', error)
            throw error
        }
    },

    // Get trading performance data
    getTradingPerformance: async (period: string = '30d') => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/trading-performance?period=${period}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching trading performance:', error)
            throw error
        }
    },

    // Get account summary
    getAccountSummary: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/account-summary`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching account summary:', error)
            throw error
        }
    },

    // Get transaction history with filters
    getTransactionHistory: async (params?: {
        page?: number
        limit?: number
        type?: 'all' | 'deposit' | 'withdrawal' | 'transfer'
        status?: 'all' | 'pending' | 'approved' | 'rejected'
        startDate?: string
        endDate?: string
    }) => {
        try {
            const queryParams = new URLSearchParams()

            if (params?.page) queryParams.append('page', params.page.toString())
            if (params?.limit) queryParams.append('limit', params.limit.toString())
            if (params?.type && params.type !== 'all') queryParams.append('type', params.type)
            if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
            if (params?.startDate) queryParams.append('startDate', params.startDate)
            if (params?.endDate) queryParams.append('endDate', params.endDate)

            const url = `${API_BASE_URL}/api/client/dashboard/transaction-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`

            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching transaction history:', error)
            throw error
        }
    },

    // Get referral statistics
    getReferralStats: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/referral-stats`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching referral stats:', error)
            throw error
        }
    },

    // Real-time updates subscription
    subscribeToAccountUpdates: (callback: (data: any) => void) => {
        const token = localStorage.getItem('token')
        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}?token=${token}&type=client_dashboard`

        try {
            const ws = new WebSocket(wsUrl)

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === 'account_update' || data.type === 'balance_update') {
                        callback(data.payload)
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
            }

            ws.onclose = () => {
                console.log('WebSocket connection closed')
                // Attempt to reconnect after 3 seconds
                setTimeout(() => {
                    clientDashboardAPI.subscribeToAccountUpdates(callback)
                }, 3000)
            }

            return () => {
                ws.close()
            }
        } catch (error) {
            console.error('Error establishing WebSocket connection:', error)
            return () => { }
        }
    },

    // Export transaction data
    exportTransactionData: async (format: 'csv' | 'excel' | 'pdf' = 'csv', filters?: {
        type?: string
        status?: string
        startDate?: string
        endDate?: string
    }) => {
        try {
            const queryParams = new URLSearchParams({
                format,
                ...(filters?.type && { type: filters.type }),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.startDate && { startDate: filters.startDate }),
                ...(filters?.endDate && { endDate: filters.endDate })
            })

            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/export-transactions?${queryParams}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`)
            }

            // Create download link
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `transactions-${new Date().toISOString().split('T')[0]}.${format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return { success: true, message: 'Transactions exported successfully' }
        } catch (error) {
            console.error('Error exporting transaction data:', error)
            throw error
        }
    },

    // Get account balance in real-time
    getAccountBalance: async (accountId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/account-balance/${accountId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching account balance:', error)
            throw error
        }
    },

    // Get portfolio allocation
    getPortfolioAllocation: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/portfolio-allocation`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching portfolio allocation:', error)
            throw error
        }
    },

    // Get trading signals or recommendations
    getTradingSignals: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/trading-signals`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching trading signals:', error)
            throw error
        }
    },

    // Update user preferences for dashboard
    updateDashboardPreferences: async (preferences: {
        defaultPeriod?: string
        defaultCurrency?: string
        showRealTimeUpdates?: boolean
        notificationSettings?: {
            email?: boolean
            push?: boolean
            sms?: boolean
        }
    }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/preferences`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(preferences),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error updating dashboard preferences:', error)
            throw error
        }
    },

    // Get market overview data
    getMarketOverview: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/market-overview`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching market overview:', error)
            throw error
        }
    },

    // Get news and announcements
    getNewsAndAnnouncements: async (limit = 5) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/news?limit=${limit}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching news and announcements:', error)
            throw error
        }
    },

    // Validate trading session
    validateTradingSession: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/validate-session`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error validating trading session:', error)
            throw error
        }
    }
}