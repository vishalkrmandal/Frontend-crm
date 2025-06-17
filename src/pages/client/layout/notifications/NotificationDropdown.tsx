// Frontend/src/pages/client/layout/notifications/NotificationDropdown.tsx
"use client"

import { formatDistanceToNow } from 'date-fns'
import {
    CheckCircle,
    AlertCircle,
    Info,
    XCircle,
    DollarSign,
    User,
    Settings,
    X,
    MailCheck,
    ExternalLink
} from 'lucide-react'
import { Notification } from './NotificationProvider'

interface NotificationDropdownProps {
    notifications: Notification[]
    onClose: () => void
    onMarkAsRead: (notificationId: string) => Promise<void>
}

const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "h-5 w-5"

    switch (type) {
        case 'success':
            return <CheckCircle className={`${iconClass} text-green-500`} />
        case 'error':
            return <XCircle className={`${iconClass} text-red-500`} />
        case 'warning':
            return <AlertCircle className={`${iconClass} text-yellow-500`} />
        case 'transaction':
            return <DollarSign className={`${iconClass} text-blue-500`} />
        case 'account':
            return <User className={`${iconClass} text-purple-500`} />
        case 'system':
            return <Settings className={`${iconClass} text-gray-500`} />
        default:
            return <Info className={`${iconClass} text-blue-500`} />
    }
}

const getCategoryColor = (category: Notification['category']) => {
    switch (category) {
        case 'deposit':
            return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
        case 'withdrawal':
            return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
        case 'transfer':
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
        case 'account':
            return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
        case 'trading':
            return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
        case 'system':
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
        default:
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    }
}

export default function NotificationDropdown({
    notifications,
    onClose,
    onMarkAsRead
}: NotificationDropdownProps) {
    // Filter notifications from last 5 days
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const recentNotifications = notifications.filter(
        notification => new Date(notification.createdAt) >= fiveDaysAgo
    )

    const unreadNotifications = recentNotifications.filter(n => !n.isRead)
    const readNotifications = recentNotifications.filter(n => n.isRead)

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await onMarkAsRead(notification._id)
        }

        // Handle navigation based on notification type/category
        if (notification.metadata?.transactionId) {
            // Navigate to transaction details
            console.log('Navigate to transaction:', notification.metadata.transactionId)
        } else if (notification.metadata?.accountId) {
            // Navigate to account details
            console.log('Navigate to account:', notification.metadata.accountId)
        }
    }

    return (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[32rem] overflow-hidden rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
                <div>
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                        {unreadNotifications.length} unread from last 5 days
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {unreadNotifications.length > 0 && (
                        <button
                            onClick={() => {
                                unreadNotifications.forEach(n => onMarkAsRead(n._id))
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Mark all as read"
                        >
                            <MailCheck className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Info className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No notifications from the last 5 days</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {/* Unread Notifications */}
                        {unreadNotifications.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                                    Unread ({unreadNotifications.length})
                                </h4>
                                <div className="space-y-1">
                                    {unreadNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onClick={() => handleNotificationClick(notification)}
                                            isUnread={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Read Notifications */}
                        {readNotifications.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                                    Earlier
                                </h4>
                                <div className="space-y-1">
                                    {readNotifications.slice(0, 10).map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onClick={() => handleNotificationClick(notification)}
                                            isUnread={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
                <div className="border-t border-border/50 p-3">
                    <button
                        onClick={() => {
                            // Navigate to full notifications page
                            console.log('Navigate to notifications page')
                            onClose()
                        }}
                        className="flex w-full items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <span>View all notifications</span>
                        <ExternalLink className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

interface NotificationItemProps {
    notification: Notification
    onClick: () => void
    isUnread: boolean
}

function NotificationItem({ notification, onClick, isUnread }: NotificationItemProps) {
    return (
        <div
            onClick={onClick}
            className={`
        group relative cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md
        ${isUnread
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    : 'border-border/30 bg-transparent hover:bg-muted/30'
                }
      `}
        >
            {/* Unread Indicator */}
            {isUnread && (
                <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
            )}

            <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                        </div>

                        {/* Category Badge */}
                        <span className={`
              ml-2 flex-shrink-0 inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium
              ${getCategoryColor(notification.category)}
            `}>
                            {notification.category}
                        </span>
                    </div>

                    {/* Metadata */}
                    {notification.metadata?.amount && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>
                                {notification.metadata.amount} {notification.metadata.currency || 'USD'}
                            </span>
                        </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </div>
    )
}