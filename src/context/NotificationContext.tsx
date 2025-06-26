// Frontend/src/context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export interface Notification {
    id: string
    title: string
    message: string
    type: 'account_created' | 'deposit_status' | 'withdrawal_status' | 'transfer_success' | 'new_referral' | 'ticket_update' | 'profile_update' | 'new_signup'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    data: any
    read: boolean
    readAt?: Date
    createdAt: Date
    timeAgo: string
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    socket: Socket | null
    isConnected: boolean
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (notificationId: string) => Promise<void>
    fetchNotifications: (page?: number, limit?: number) => Promise<void>
    loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
    children: React.ReactNode
    userType: 'client' | 'admin'
}

export function NotificationProvider({ children, userType }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [loading, setLoading] = useState(false)

    const { user, getToken, activeRole, isAuthenticated } = useAuth()

    // Get API base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    // Initialize socket connection
    const initializeSocket = useCallback(() => {
        if (!user || !isAuthenticated) return

        const token = getToken(userType)
        if (!token) return

        try {
            const socketInstance = io(API_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            })

            socketInstance.on('connect', () => {
                console.log('Socket connected for notifications')
                setIsConnected(true)

                // Join appropriate rooms based on user type and role
                if (userType === 'admin' && ['admin', 'superadmin'].includes(activeRole || '')) {
                    socketInstance.emit('joinAdminRoom', 'notifications')
                }
            })

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected')
                setIsConnected(false)
            })

            socketInstance.on('connect_error', (error) => {
                console.error('Socket connection error:', error)
                setIsConnected(false)
            })

            // Listen for new notifications
            socketInstance.on('newNotification', (notification: Notification) => {
                console.log('New notification received:', notification)

                setNotifications(prev => [notification, ...prev])
                setUnreadCount(prev => prev + 1)

                // Show toast notification
                const getToastIcon = (type: string) => {
                    switch (type) {
                        case 'account_created': return '🎉'
                        case 'deposit_status': return '💰'
                        case 'withdrawal_status': return '💸'
                        case 'transfer_success': return '💱'
                        case 'new_referral': return '👥'
                        case 'ticket_update': return '🎫'
                        case 'profile_update': return '👤'
                        case 'new_signup': return '🆕'
                        default: return '🔔'
                    }
                }

                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">{getToastIcon(notification.type)}</span>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ), {
                    duration: 5000,
                    position: 'top-right',
                })
            })

            // Listen for notification updates
            socketInstance.on('notificationRead', ({ notificationId }) => {
                setNotifications(prev =>
                    prev.filter(n => n.id !== notificationId)
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
            })

            socketInstance.on('allNotificationsRead', () => {
                setNotifications([])
                setUnreadCount(0)
            })

            socketInstance.on('notificationDeleted', ({ notificationId }) => {
                setNotifications(prev =>
                    prev.filter(n => n.id !== notificationId)
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
            })

            setSocket(socketInstance)

            return () => {
                socketInstance.disconnect()
            }
        } catch (error) {
            console.error('Socket initialization error:', error)
        }
    }, [user, userType, API_URL, getToken, activeRole, isAuthenticated])

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
        if (!user || !isAuthenticated) return

        const token = getToken(userType)
        if (!token) return

        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/notifications?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch notifications')
            }

            const data = await response.json()

            if (data.success) {
                setNotifications(data.data.notifications || [])
                setUnreadCount(data.data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [user, userType, API_URL, getToken, isAuthenticated])

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        const token = getToken(userType)
        if (!token) return

        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to mark notification as read')
            }

            // Update local state
            setNotifications(prev =>
                prev.filter(n => n.id !== notificationId)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))

        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }, [userType, API_URL, getToken])

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        const token = getToken(userType)
        if (!token) return

        try {
            const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read')
            }

            // Update local state
            setNotifications([])
            setUnreadCount(0)

        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }, [userType, API_URL, getToken])

    // Delete notification
    const deleteNotification = useCallback(async (notificationId: string) => {
        const token = getToken(userType)
        if (!token) return

        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete notification')
            }

            // Update local state
            setNotifications(prev =>
                prev.filter(n => n.id !== notificationId)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))

        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }, [userType, API_URL, getToken])

    // Initialize socket and fetch notifications when user changes
    useEffect(() => {
        if (user && isAuthenticated) {
            const cleanup = initializeSocket()
            fetchNotifications()
            return cleanup
        } else {
            // Cleanup when user logs out
            if (socket) {
                socket.disconnect()
                setSocket(null)
            }
            setNotifications([])
            setUnreadCount(0)
            setIsConnected(false)
        }
    }, [user, isAuthenticated, activeRole, initializeSocket, fetchNotifications])

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        socket,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        loading
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}