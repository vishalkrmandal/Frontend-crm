// Frontend/src/pages/admin/layout/notifications/NotificationProvider.tsx
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { io, Socket } from 'socket.io-client'

interface Notification {
    id: string
    title: string
    message: string
    type: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    data: any
    timeAgo: string
    createdAt: string
    read: boolean
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    isConnected: boolean
    markAsRead: (notificationId: string) => void
    markAllAsRead: () => void
    deleteNotification: (notificationId: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
    children: ReactNode
    userId?: string
}

export default function AdminNotificationProvider({ children, userId }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [socket, setSocket] = useState<Socket | null>(null)
    const { getToken } = useAuth()

    // Initialize socket connection
    useEffect(() => {
        const adminToken = getToken('admin')

        if (!adminToken || !userId) {
            return
        }

        const socketInstance = io(import.meta.env.VITE_API_URL, {
            auth: {
                token: adminToken
            },
            transports: ['websocket', 'polling']
        })

        socketInstance.on('connect', () => {
            console.log('Admin connected to notification service')
            setIsConnected(true)
            // Join admin room
            socketInstance.emit('joinAdminRoom', 'general')
            // Request notification count on connect
            socketInstance.emit('getNotificationCount')
        })

        socketInstance.on('disconnect', () => {
            console.log('Admin disconnected from notification service')
            setIsConnected(false)
        })

        socketInstance.on('connected', (data) => {
            console.log('Admin notification service ready:', data)
        })

        // Listen for new notifications
        socketInstance.on('newNotification', (notification: Notification) => {
            console.log('New admin notification received:', notification)
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)

            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new window.Notification(notification.title, {
                    body: notification.message,
                    icon: '/favicon.ico'
                })
            }
        })

        // Listen for notification updates
        socketInstance.on('notificationRead', ({ notificationId }) => {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        })

        socketInstance.on('allNotificationsRead', () => {
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            )
            setUnreadCount(0)
        })

        socketInstance.on('notificationDeleted', ({ notificationId }) => {
            setNotifications(prev =>
                prev.filter(notif => notif.id !== notificationId)
            )
            setUnreadCount(prev => {
                const deletedNotif = notifications.find(n => n.id === notificationId)
                return deletedNotif && !deletedNotif.read ? Math.max(0, prev - 1) : prev
            })
        })

        socketInstance.on('notificationCount', ({ count }) => {
            setUnreadCount(count)
        })

        socketInstance.on('error', (error) => {
            console.error('Admin socket error:', error)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [userId])

    // Fetch initial notifications
    useEffect(() => {
        const adminToken = getToken('admin')

        if (!adminToken) return

        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications?limit=50`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const result = await response.json()
                    if (result.success) {
                        setNotifications(result.data.notifications || [])
                        setUnreadCount(result.data.unreadCount || 0)
                    }
                }
            } catch (error) {
                console.error('Error fetching admin notifications:', error)
            }
        }

        fetchNotifications()
    }, [])

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const markAsRead = async (notificationId: string) => {
        const adminToken = getToken('admin')

        if (!adminToken) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                // Socket will handle the UI update
                if (socket) {
                    socket.emit('markNotificationAsRead', { notificationId })
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        const adminToken = getToken('admin')

        if (!adminToken) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                // Socket will handle the UI update
                if (socket) {
                    socket.emit('markAllNotificationsAsRead')
                }
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        const adminToken = getToken('admin')

        if (!adminToken) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                // Socket will handle the UI update
                if (socket) {
                    socket.emit('deleteNotification', { notificationId })
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useAdminNotifications = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useAdminNotifications must be used within an AdminNotificationProvider')
    }
    return context
}