// Frontend/src/pages/client/layout/notifications/NotificationProvider.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface Notification {
    _id: string
    userId: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'account' | 'system'
    category: 'deposit' | 'withdrawal' | 'transfer' | 'account' | 'profile' | 'system' | 'trading'
    isRead: boolean
    metadata?: {
        transactionId?: string
        accountId?: string
        amount?: number
        currency?: string
        [key: string]: any
    }
    createdAt: string
    readAt?: string
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (notificationId: string) => Promise<void>
    refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
    children: React.ReactNode
    userId?: string
}

export default function NotificationProvider({ children, userId }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [, setSocket] = useState<Socket | null>(null)

    const unreadCount = notifications.filter(n => !n.isRead).length

    // Initialize socket connection
    useEffect(() => {
        if (!userId) return

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
                token: localStorage.getItem('clientToken')
            }
        })

        newSocket.on('connect', () => {
            console.log('Connected to socket server')
            newSocket.emit('join-user-room', userId)
        })

        // Listen for new notifications
        newSocket.on('new-notification', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev])

            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo.png',
                    badge: '/logo.png'
                })
            }
        })

        // Listen for notification updates
        newSocket.on('notification-updated', (updatedNotification: Notification) => {
            setNotifications(prev =>
                prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
            )
        })

        // Listen for notification marked as read
        newSocket.on('notification-marked-read', (notificationId: string) => {
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId
                        ? { ...n, isRead: true, readAt: new Date().toISOString() }
                        : n
                )
            )
        })

        // Listen for all notifications marked as read
        newSocket.on('all-notifications-marked-read', () => {
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
            )
        })

        // Listen for unread count updates
        newSocket.on('unread-count', (count: number) => {
            // This is handled automatically by the unreadCount computed property
            console.log('Unread count received:', count)
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [userId])

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const token = localStorage.getItem('clientToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('clientToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notificationId
                            ? { ...n, isRead: true, readAt: new Date().toISOString() }
                            : n
                    )
                )
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('clientToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
                )
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error)
        }
    }

    // Delete notification
    const deleteNotification = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('clientToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId))
            }
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const refreshNotifications = fetchNotifications

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
    }, [userId])

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

// Hook to use notifications
export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}