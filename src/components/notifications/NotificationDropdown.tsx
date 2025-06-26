// Frontend/src/components/notifications/NotificationDropdown.tsx
import { useState } from 'react'
import { Notification } from '@/context/NotificationContext'
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Clock,
    User,
    CreditCard,
    ArrowRightLeft,
    Users,
    Ticket,
    UserPlus,
    X,
    Loader2,
    Circle
} from 'lucide-react'

interface NotificationDropdownProps {
    notifications: Notification[]
    onClose: () => void
    onMarkAsRead: (notificationId: string) => Promise<void>
    onMarkAllAsRead: () => Promise<void>
    onDeleteNotification: (notificationId: string) => Promise<void>
    loading: boolean
    unreadCount: number
}

export default function NotificationDropdown({
    notifications,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    loading,
    unreadCount
}: NotificationDropdownProps) {
    const [actionsLoading, setActionsLoading] = useState<Set<string>>(new Set())

    // Safe render function to prevent object rendering errors
    const safeRender = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        if (typeof value === 'object') {
            if (value._id) return String(value._id);
            return JSON.stringify(value);
        }
        return String(value);
    }

    // Safe notification ID extraction
    const getNotificationId = (notification: Notification): string => {
        if (typeof notification.id === 'string') return notification.id;
        if (notification.id && typeof notification.id === 'object' && notification.id) {
            return String(notification.id);
        }
        if ((notification as any)._id) {
            return String((notification as any)._id);
        }
        return String(notification.id || '');
    }

    const getNotificationIcon = (type: string, priority: string) => {
        const iconClass = `h-3 w-3 sm:h-3.5 sm:w-3.5 ${priority === 'high' || priority === 'urgent' ? 'text-red-500' : 'text-blue-500'}`

        switch (type) {
            case 'account_created':
                return <CreditCard className={iconClass} />
            case 'deposit_status':
            case 'withdrawal_status':
                return <CreditCard className={iconClass} />
            case 'transfer_success':
                return <ArrowRightLeft className={iconClass} />
            case 'new_referral':
                return <Users className={iconClass} />
            case 'ticket_update':
                return <Ticket className={iconClass} />
            case 'profile_update':
                return <User className={iconClass} />
            case 'new_signup':
                return <UserPlus className={iconClass} />
            default:
                return <Bell className={iconClass} />
        }
    }

    const getPriorityBadge = (priority: string, isMobile: boolean = false) => {
        const badges = {
            urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            low: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }

        const mobileText = {
            urgent: 'U',
            high: 'H',
            medium: 'M',
            low: 'L'
        }

        const safePriority = safeRender(priority).toLowerCase();

        return (
            <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${badges[safePriority as keyof typeof badges] || badges.medium}`}>
                {isMobile ? mobileText[safePriority as keyof typeof mobileText] || 'M' : safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
            </span>
        )
    }

    // Get notification styling based on read status
    const getNotificationStyling = (notification: Notification) => {
        const isRead = Boolean(notification.read);

        if (isRead) {
            return {
                container: 'group relative p-2 hover:bg-muted/20 transition-colors bg-muted/10 opacity-75',
                title: 'text-xs font-normal text-muted-foreground line-clamp-1',
                message: 'text-xs text-muted-foreground/70 line-clamp-2 mb-1'
            }
        } else {
            return {
                container: 'group relative p-2 hover:bg-muted/30 transition-colors bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-500',
                title: 'text-xs font-medium text-foreground line-clamp-1',
                message: 'text-xs text-foreground/90 line-clamp-2 mb-1'
            }
        }
    }

    const handleMarkAsRead = async (notificationId: string) => {
        if (actionsLoading.has(notificationId)) return

        setActionsLoading(prev => new Set(prev).add(notificationId))
        try {
            await onMarkAsRead(notificationId)
        } finally {
            setActionsLoading(prev => {
                const newSet = new Set(prev)
                newSet.delete(notificationId)
                return newSet
            })
        }
    }

    const handleDelete = async (notificationId: string) => {
        if (actionsLoading.has(notificationId)) return

        setActionsLoading(prev => new Set(prev).add(notificationId))
        try {
            await onDeleteNotification(notificationId)
        } finally {
            setActionsLoading(prev => {
                const newSet = new Set(prev)
                newSet.delete(notificationId)
                return newSet
            })
        }
    }

    const handleMarkAllAsRead = async () => {
        if (actionsLoading.has('markAll')) return

        setActionsLoading(prev => new Set(prev).add('markAll'))
        try {
            await onMarkAllAsRead()
        } finally {
            setActionsLoading(prev => {
                const newSet = new Set(prev)
                newSet.delete('markAll')
                return newSet
            })
        }
    }

    // Format time safely
    const formatTime = (timeAgo: any): string => {
        if (!timeAgo) return 'Just now';
        return safeRender(timeAgo);
    }

    // Detect if mobile view
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // Safe notifications array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    return (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-card backdrop-blur-xl shadow-xl z-50 translate-x-[50px]">
            {/* Header */}
            <div className="flex items-center justify-between p-2.5 border-b border-border/50">
                <div className="flex items-center space-x-1.5">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="font-medium text-foreground text-xs">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-1">
                    {safeNotifications.length > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={actionsLoading.has('markAll')}
                            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
                            title="Mark all as read"
                        >
                            {actionsLoading.has('markAll') ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <CheckCheck className="h-3 w-3" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-h-64 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">Loading notifications...</span>
                        </div>
                    </div>
                ) : safeNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Bell className="h-6 w-6 text-muted-foreground/30 mb-2" />
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">No notifications</h4>
                        <p className="text-xs text-muted-foreground/70">
                            You're all caught up! Check back later for updates.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {safeNotifications.map((notification, index) => {
                            const styling = getNotificationStyling(notification);
                            const notificationId = getNotificationId(notification);
                            const isRead = Boolean(notification.read);

                            return (
                                <div
                                    key={notificationId || `notification-${index}`}
                                    className={styling.container}
                                >
                                    <div className="flex items-start space-x-2">
                                        {/* Unread indicator */}
                                        <div className="flex-shrink-0 mt-1">
                                            {!isRead && (
                                                <Circle className="h-1.5 w-1.5 fill-blue-500 text-blue-500" />
                                            )}
                                            {isRead && (
                                                <div className="h-1.5 w-1.5" />
                                            )}
                                        </div>

                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(safeRender(notification.type), safeRender(notification.priority))}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-0.5">
                                                <h4 className={styling.title}>
                                                    {safeRender(notification.title)}
                                                    {!isRead && (
                                                        <span className="ml-1 text-blue-600 dark:text-blue-400 font-normal">
                                                            {isMobile ? '•' : 'New'}
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex items-center space-x-1 ml-1">
                                                    {getPriorityBadge(notification.priority, isMobile)}
                                                </div>
                                            </div>

                                            <p className={styling.message}>
                                                {safeRender(notification.message)}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    <span className="text-xs">{formatTime(notification.timeAgo)}</span>
                                                    {isRead && notification.readAt && !isMobile && (
                                                        <span className="text-green-600 dark:text-green-400 ml-2 text-xs">
                                                            ✓ Read
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isRead && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notificationId)}
                                                            disabled={actionsLoading.has(notificationId)}
                                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-background rounded transition-colors disabled:opacity-50"
                                                            title="Mark as read"
                                                        >
                                                            {actionsLoading.has(notificationId) ? (
                                                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                            ) : (
                                                                <Check className="h-2.5 w-2.5" />
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notificationId)}
                                                        disabled={actionsLoading.has(notificationId)}
                                                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-background rounded transition-colors disabled:opacity-50"
                                                        title="Delete notification"
                                                    >
                                                        {actionsLoading.has(notificationId) ? (
                                                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-2.5 w-2.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Additional data display - Desktop full version */}
                                            {notification.data && typeof notification.data === 'object' && Object.keys(notification.data).length > 0 && !isMobile && (
                                                <div className="mt-1.5 p-1.5 bg-muted/50 rounded text-xs">
                                                    {safeRender(notification.type) === 'account_created' && notification.data.mt5Account && (
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">MT5 Account:</span> {safeRender(notification.data.mt5Account)}
                                                        </div>
                                                    )}
                                                    {safeRender(notification.type) === 'account_created' && notification.data.accountType && (
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">Account Type:</span> {safeRender(notification.data.accountType)}
                                                        </div>
                                                    )}
                                                    {safeRender(notification.type) === 'account_created' && notification.data.leverage && (
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">Leverage:</span> {safeRender(notification.data.leverage)}
                                                        </div>
                                                    )}
                                                    {(safeRender(notification.type) === 'deposit_status' || safeRender(notification.type) === 'withdrawal_status') && notification.data.amount && (
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">Amount:</span> ${safeRender(notification.data.amount)}
                                                            {notification.data.status && (
                                                                <span className="ml-2">
                                                                    <span className="font-medium">Status:</span> {safeRender(notification.data.status)}
                                                                </span>
                                                            )}
                                                            {/* {notification.data.paymentMethod && (
                                                                <span className="ml-2">
                                                                    <span className="font-medium">Method:</span> {safeRender(notification.data.paymentMethod)}
                                                                </span>
                                                            )} */}
                                                        </div>
                                                    )}
                                                    {safeRender(notification.type) === 'ticket_update' && (
                                                        <div className="text-muted-foreground">
                                                            {notification.data.ticketNumber && (
                                                                <span>
                                                                    <span className="font-medium">Ticket:</span> {safeRender(notification.data.ticketNumber)}
                                                                </span>
                                                            )}
                                                            {notification.data.subject && (
                                                                <span className="ml-2">
                                                                    <span className="font-medium">Subject:</span> {safeRender(notification.data.subject)}
                                                                </span>
                                                            )}
                                                            {notification.data.status && (
                                                                <span className="ml-2">
                                                                    <span className="font-medium">Status:</span> {safeRender(notification.data.status)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Additional data display - Mobile compact version */}
                                            {notification.data && typeof notification.data === 'object' && Object.keys(notification.data).length > 0 && isMobile && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {safeRender(notification.type) === 'account_created' && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {notification.data.mt5Account && (
                                                                <span>MT5: {safeRender(notification.data.mt5Account)}</span>
                                                            )}
                                                            {notification.data.accountType && (
                                                                <span>Type: {safeRender(notification.data.accountType)}</span>
                                                            )}
                                                            {notification.data.leverage && (
                                                                <span>Leverage: {safeRender(notification.data.leverage)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(safeRender(notification.type) === 'deposit_status' || safeRender(notification.type) === 'withdrawal_status') && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {notification.data.amount && (
                                                                <span>${safeRender(notification.data.amount)}</span>
                                                            )}
                                                            {notification.data.status && (
                                                                <span>{safeRender(notification.data.status)}</span>
                                                            )}
                                                            {/* {notification.data.paymentMethod && (
                                                                <span>{safeRender(notification.data.paymentMethod)}</span>
                                                            )} */}
                                                        </div>
                                                    )}
                                                    {safeRender(notification.type) === 'ticket_update' && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {notification.data.ticketNumber && (
                                                                <span>#{safeRender(notification.data.ticketNumber)}</span>
                                                            )}
                                                            {notification.data.subject && (
                                                                <span>{safeRender(notification.data.subject)}</span>
                                                            )}
                                                            {notification.data.status && (
                                                                <span>{safeRender(notification.data.status)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {safeNotifications.length > 0 && (
                <div className="p-2 border-t border-border/50 bg-muted/30">
                    <button className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1">
                        Notifications
                    </button>
                </div>
            )}
        </div>
    )
}