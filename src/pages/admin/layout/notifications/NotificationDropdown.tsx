// Frontend/src/pages/admin/layout/notifications/NotificationDropdown.tsx
"use client"

import { useState } from 'react'
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Trash2,
    Clock,
    AlertCircle,
    Info,
    CheckCircle,
    AlertTriangle,
    Users,
    CreditCard,
    UserPlus
} from 'lucide-react'

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

interface NotificationDropdownProps {
    notifications: Notification[]
    onClose: () => void
    onMarkAsRead: (notificationId: string) => void
    onMarkAllAsRead?: () => void
    onDeleteNotification?: (notificationId: string) => void
}

export default function AdminNotificationDropdown({
    notifications,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification
}: NotificationDropdownProps) {
    const [hoveredNotification, setHoveredNotification] = useState<string | null>(null)

    const getNotificationIcon = (type: string, priority: string) => {
        const iconClass = "h-4 w-4"

        switch (type) {
            case 'account_created':
                return <CheckCircle className={`${iconClass} text-green-500`} />
            case 'deposit_status':
                return <CreditCard className={`${iconClass} text-blue-500`} />
            case 'withdrawal_status':
                return <CreditCard className={`${iconClass} text-orange-500`} />
            case 'transfer_success':
                return <CheckCircle className={`${iconClass} text-green-500`} />
            case 'new_referral':
                return <Users className={`${iconClass} text-purple-500`} />
            case 'ticket_update':
                return <AlertCircle className={`${iconClass} text-yellow-500`} />
            case 'profile_update':
                return <Info className={`${iconClass} text-blue-500`} />
            case 'new_signup':
                return <UserPlus className={`${iconClass} text-green-500`} />
            default:
                if (priority === 'high' || priority === 'urgent') {
                    return <AlertTriangle className={`${iconClass} text-red-500`} />
                }
                return <Bell className={`${iconClass} text-gray-500`} />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'border-l-red-500'
            case 'high':
                return 'border-l-orange-500'
            case 'medium':
                return 'border-l-blue-500'
            case 'low':
                return 'border-l-gray-400'
            default:
                return 'border-l-gray-400'
        }
    }

    const getNotificationTypeLabel = (type: string) => {
        switch (type) {
            case 'account_created':
                return 'Account Created'
            case 'deposit_status':
                return 'Deposit Update'
            case 'withdrawal_status':
                return 'Withdrawal Update'
            case 'transfer_success':
                return 'Transfer'
            case 'new_referral':
                return 'New Referral'
            case 'ticket_update':
                return 'Support Ticket'
            case 'profile_update':
                return 'Profile Update'
            case 'new_signup':
                return 'New Registration'
            default:
                return 'Notification'
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id)
        }
    }

    const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        onMarkAsRead(notificationId)
    }

    const handleDelete = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        if (onDeleteNotification) {
            onDeleteNotification(notificationId)
        }
    }

    const unreadNotifications = notifications.filter(n => !n.read)

    return (
        <div className="w-96 max-h-96 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Admin Notifications</h3>
                    {unreadNotifications.length > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                            {unreadNotifications.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-1">
                    {unreadNotifications.length > 0 && onMarkAllAsRead && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Mark all as read"
                        >
                            <CheckCheck className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground font-medium">No notifications</p>
                        <p className="text-sm text-muted-foreground/70">All quiet on the admin front!</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group relative rounded-lg border-l-4 ${getPriorityColor(notification.priority)} p-3 transition-all duration-200 cursor-pointer ${notification.read
                                        ? 'bg-muted/30 hover:bg-muted/50'
                                        : 'bg-primary/5 hover:bg-primary/10 border border-primary/20'
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                                onMouseEnter={() => setHoveredNotification(notification.id)}
                                onMouseLeave={() => setHoveredNotification(null)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type, notification.priority)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h4 className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'
                                                    } truncate`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-primary font-medium mt-0.5">
                                                    {getNotificationTypeLabel(notification.type)}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-1 flex-shrink-0">
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                )}

                                                {hoveredNotification === notification.id && (
                                                    <div className="flex items-center space-x-1">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                        {onDeleteNotification && (
                                                            <button
                                                                onClick={(e) => handleDelete(e, notification.id)}
                                                                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                                title="Delete notification"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className={`text-xs mt-1 ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
                                            } line-clamp-2`}>
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center space-x-1 text-xs text-muted-foreground/60">
                                                <Clock className="h-3 w-3" />
                                                <span>{notification.timeAgo}</span>
                                            </div>

                                            {notification.priority === 'urgent' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    Urgent
                                                </span>
                                            )}
                                            {notification.priority === 'high' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                    High
                                                </span>
                                            )}
                                        </div>

                                        {/* Additional data display for admin */}
                                        {notification.data && notification.data.clientId && (
                                            <div className="mt-1 text-xs text-muted-foreground/60">
                                                Client ID: {notification.data.clientId}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="border-t border-border/50 p-3">
                    <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    )
}