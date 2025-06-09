// Frontend\src\services\adminDashboardAPI.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken") // Adjust based on your auth implementation
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

export const adminDashboardAPI = {
    // Get dashboard overview statistics
    getDashboardStats: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
            throw error
        }
    },

    // Get revenue chart data for last 12 months
    getRevenueChartData: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/revenue-chart`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching revenue chart data:', error)
            throw error
        }
    },

    // Get client distribution by account type
    getClientDistribution: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/client-distribution`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching client distribution:', error)
            throw error
        }
    },

    // Get recent transactions
    getRecentTransactions: async (limit = 10) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/recent-transactions?limit=${limit}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching recent transactions:', error)
            throw error
        }
    },

    // Get daily statistics for last 30 days
    getDailyStats: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/daily-stats`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching daily stats:', error)
            throw error
        }
    },

    // Get top performing clients
    getTopPerformingClients: async (limit = 10) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/top-clients?limit=${limit}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching top performing clients:', error)
            throw error
        }
    },

    // Additional utility methods for real-time updates
    subscribeToRealTimeUpdates: (callback: (data: any) => void) => {
        // WebSocket implementation for real-time updates
        const token = localStorage.getItem('token')
        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}?token=${token}`

        try {
            const ws = new WebSocket(wsUrl)

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === 'dashboard_update') {
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
                // Attempt to reconnect after 5 seconds
                setTimeout(() => {
                    adminDashboardAPI.subscribeToRealTimeUpdates(callback)
                }, 5000)
            }

            return () => {
                ws.close()
            }
        } catch (error) {
            console.error('Error establishing WebSocket connection:', error)
            return () => { }
        }
    },

    // Export dashboard data
    exportDashboardData: async (format: 'csv' | 'excel' | 'pdf' = 'csv', dateRange?: { start: string, end: string }) => {
        try {
            const queryParams = new URLSearchParams({
                format,
                ...(dateRange && { startDate: dateRange.start, endDate: dateRange.end })
            })

            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/export?${queryParams}`, {
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
            link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.${format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return { success: true, message: 'Data exported successfully' }
        } catch (error) {
            console.error('Error exporting dashboard data:', error)
            throw error
        }
    },

    // Get dashboard performance metrics
    getPerformanceMetrics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/performance-metrics`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching performance metrics:', error)
            throw error
        }
    },

    // Get system health status
    getSystemHealth: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/system-health`, {
                method: 'GET',
                headers: getAuthHeaders(),
            })
            return await handleResponse(response)
        } catch (error) {
            console.error('Error fetching system health:', error)
            throw error
        }
    }
}