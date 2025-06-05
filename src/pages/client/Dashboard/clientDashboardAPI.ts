// Frontend\src\services\clientDashboardAPI.ts - OPTIMIZED VERSION

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('clientToken')
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

// Helper function to get current user ID (you might need to implement this based on your auth)
const getCurrentUserId = () => {
    // This should return the current user's ID from your auth state
    // You might need to decode the JWT token or fetch from your auth context
    const token = localStorage.getItem('clientToken')
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.id || payload.userId || payload._id
        } catch (error) {
            console.error('Error parsing token:', error)
            return null
        }
    }
    return null
}

export const clientDashboardAPI = {
    // OPTIMIZED: Get client dashboard overview with pre-account update
    getDashboardOverview: async () => {
        try {
            console.log('Starting optimized dashboard overview fetch...')

            // Step 1: Get current user ID
            const userId = getCurrentUserId()
            if (!userId) {
                throw new Error('User ID not found. Please login again.')
            }

            // Step 2: First update accounts to get latest balance/equity data
            console.log('Updating accounts before dashboard fetch...')
            try {
                await fetch(`${API_BASE_URL}/api/clients/users/${userId}/accounts`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                })
                console.log('Account update completed')
            } catch (updateError) {
                console.warn('Account update failed, proceeding with dashboard fetch:', updateError)
                // Continue even if account update fails
            }

            // Step 3: Fetch dashboard overview with updated data
            console.log('Fetching dashboard overview...')
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/overview`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })

            const result = await handleResponse(response)
            console.log('Dashboard overview fetch completed')
            return result
        } catch (error) {
            console.error('Error fetching optimized dashboard overview:', error)
            throw error
        }
    },

    // SIMPLIFIED: Get trading performance data with caching
    getTradingPerformance: async (period: string = '30d') => {
        try {
            // Check if we have cached data for this period
            const cacheKey = `performance_${period}`
            const cached = sessionStorage.getItem(cacheKey)
            const cacheTime = sessionStorage.getItem(`${cacheKey}_time`)

            if (cached && cacheTime) {
                const timeDiff = Date.now() - parseInt(cacheTime)
                if (timeDiff < 60000) { // Cache for 1 minute
                    console.log('Using cached performance data')
                    return JSON.parse(cached)
                }
            }

            console.log('Fetching fresh performance data...')
            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/trading-performance?period=${period}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })

            const result = await handleResponse(response)

            // Cache the result
            sessionStorage.setItem(cacheKey, JSON.stringify(result))
            sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString())

            return result
        } catch (error) {
            console.error('Error fetching trading performance:', error)
            throw error
        }
    },

    // SIMPLIFIED: Get account summary (lightweight version)
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

    // OPTIMIZED: Get transaction history with smaller page size
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

            // Default to smaller page size for faster loading
            queryParams.append('page', (params?.page || 1).toString())
            queryParams.append('limit', (params?.limit || 10).toString())

            if (params?.type && params.type !== 'all') queryParams.append('type', params.type)
            if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
            if (params?.startDate) queryParams.append('startDate', params.startDate)
            if (params?.endDate) queryParams.append('endDate', params.endDate)

            const url = `${API_BASE_URL}/api/client/dashboard/transaction-history?${queryParams.toString()}`

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

    // CACHED: Real-time updates subscription with reconnection logic
    subscribeToAccountUpdates: (callback: (data: any) => void) => {
        const token = localStorage.getItem('clientToken')
        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}?token=${token}&type=client_dashboard`

        let reconnectAttempts = 0
        const maxReconnectAttempts = 5
        const reconnectInterval = 3000

        const connect = () => {
            try {
                const ws = new WebSocket(wsUrl)

                ws.onopen = () => {
                    console.log('WebSocket connected')
                    reconnectAttempts = 0
                }

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

                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++
                        const timeout = reconnectInterval * Math.pow(2, reconnectAttempts - 1)
                        console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttempts})`)

                        setTimeout(() => {
                            connect()
                        }, timeout)
                    } else {
                        console.error('Max reconnection attempts reached')
                    }
                }

                return () => {
                    ws.close()
                }
            } catch (error) {
                console.error('Error establishing WebSocket connection:', error)
                return () => { }
            }
        }

        return connect()
    },

    // OPTIMIZED: Export transaction data with progress feedback
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

            // Handle file download
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

    // OPTIMIZED: Get account balance with caching
    getAccountBalance: async (accountId: string) => {
        try {
            const cacheKey = `balance_${accountId}`
            const cached = sessionStorage.getItem(cacheKey)
            const cacheTime = sessionStorage.getItem(`${cacheKey}_time`)

            if (cached && cacheTime) {
                const timeDiff = Date.now() - parseInt(cacheTime)
                if (timeDiff < 30000) { // Cache for 30 seconds
                    return JSON.parse(cached)
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/account-balance/${accountId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })

            const result = await handleResponse(response)

            // Cache the result
            sessionStorage.setItem(cacheKey, JSON.stringify(result))
            sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString())

            return result
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

    // CACHED: Get market overview data
    getMarketOverview: async () => {
        try {
            const cacheKey = 'market_overview'
            const cached = sessionStorage.getItem(cacheKey)
            const cacheTime = sessionStorage.getItem(`${cacheKey}_time`)

            if (cached && cacheTime) {
                const timeDiff = Date.now() - parseInt(cacheTime)
                if (timeDiff < 120000) { // Cache for 2 minutes
                    return JSON.parse(cached)
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/client/dashboard/market-overview`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })

            const result = await handleResponse(response)

            // Cache the result
            sessionStorage.setItem(cacheKey, JSON.stringify(result))
            sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString())

            return result
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
    },

    // UTILITY: Clear all cached data
    clearCache: () => {
        const keys = Object.keys(sessionStorage)
        keys.forEach(key => {
            if (key.startsWith('performance_') || key.startsWith('balance_') || key === 'market_overview') {
                sessionStorage.removeItem(key)
                sessionStorage.removeItem(`${key}_time`)
            }
        })
        console.log('Dashboard cache cleared')
    },

    // UTILITY: Get cache status
    getCacheStatus: () => {
        const keys = Object.keys(sessionStorage)
        const cacheKeys = keys.filter(key =>
            key.startsWith('performance_') || key.startsWith('balance_') || key === 'market_overview'
        )

        return {
            totalCacheItems: cacheKeys.length,
            cacheSize: new Blob(cacheKeys.map(key => sessionStorage.getItem(key) || '')).size,
            keys: cacheKeys
        }
    }
}