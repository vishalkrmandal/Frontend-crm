// Frontend/src/utils/dashboardHelpers.ts

/**
 * Utility functions for the admin dashboard
 */

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Number formatting with commas
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};

// Compact number formatting (1K, 1M, 1B)
export const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(num);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    return new Date(dateString).toLocaleDateString('en-US', options || defaultOptions);
};

// DateTime formatting
export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Relative time formatting (2 hours ago, 3 days ago)
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Get growth color based on value
export const getGrowthColor = (growth: number): string => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
};

// Get status color for badges
export const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'approved':
        case 'active':
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'pending':
        case 'processing':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'rejected':
        case 'failed':
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'inactive':
        case 'suspended':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        default:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Generate initials from name
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Theme-aware chart colors
export const getChartColors = (theme: 'light' | 'dark') => ({
    primary: theme === 'dark' ? '#60A5FA' : '#3B82F6',
    secondary: theme === 'dark' ? '#34D399' : '#10B981',
    accent: theme === 'dark' ? '#F59E0B' : '#F59E0B',
    danger: theme === 'dark' ? '#F87171' : '#EF4444',
    warning: theme === 'dark' ? '#FBBF24' : '#F59E0B',
    info: theme === 'dark' ? '#60A5FA' : '#3B82F6',
    success: theme === 'dark' ? '#34D399' : '#10B981',
    grid: theme === 'dark' ? '#374151' : '#E5E7EB',
    text: theme === 'dark' ? '#D1D5DB' : '#374151',
});

// Chart color palette
export const CHART_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
];

// Get color by index
export const getColorByIndex = (index: number): string => {
    return CHART_COLORS[index % CHART_COLORS.length];
};

// Convert bytes to human readable format
export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => void>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Check if value is a valid number
export const isValidNumber = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

// Safe division (avoid division by zero)
export const safeDivision = (numerator: number, denominator: number): number => {
    return denominator === 0 ? 0 : numerator / denominator;
};

// Generate random color
export const generateRandomColor = (): string => {
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Sort array by key
export const sortByKey = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
        if (direction === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
};

// Group array by key
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

// Get unique values from array
export const getUniqueValues = <T>(array: T[]): T[] => {
    return [...new Set(array)];
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
    return obj === null || obj === undefined ||
        (typeof obj === 'object' && Object.keys(obj).length === 0) ||
        (typeof obj === 'string' && obj.trim().length === 0);
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
    if (typeof obj === 'object') {
        const clonedObj = {} as any;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};

// Export all utilities as a single object
export const dashboardHelpers = {
    formatCurrency,
    formatNumber,
    formatCompactNumber,
    formatPercentage,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    getGrowthColor,
    getStatusColor,
    calculatePercentageChange,
    truncateText,
    getInitials,
    getChartColors,
    getColorByIndex,
    formatBytes,
    debounce,
    throttle,
    isValidNumber,
    safeDivision,
    generateRandomColor,
    sortByKey,
    groupBy,
    getUniqueValues,
    isEmpty,
    deepClone
};

export default dashboardHelpers;