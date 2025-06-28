// Frontend\src\pages\admin\components\dashboard\StatCard.tsx

import { ReactNode } from "react"
import { TrendingUp, TrendingDown, Eye, Clock } from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    icon: ReactNode
    change: {
        value: number
        trend: "up" | "down"
    }
    chart: ReactNode
    href: string
    pending?: number
    transactions?: number
    subStats?: {
        today?: number
        thisWeek?: number
        thisMonth?: number
        count?: number
    }
}

export const StatCard = ({
    title,
    value,
    icon,
    change,
    chart,
    href,
    pending,
    transactions,
    subStats
}: StatCardProps) => {
    const trendColor = change.trend === "up" ? "text-green-600" : "text-red-600"
    const trendBgColor = change.trend === "up" ? "bg-green-50" : "bg-red-50"
    const TrendIcon = change.trend === "up" ? TrendingUp : TrendingDown

    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow group">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20 transition-colors">
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="mb-3 h-16 rounded-md bg-muted/30">
                {chart}
            </div>

            {/* Statistics Row */}
            <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendBgColor} ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    {change.value > 0 ? '+' : ''}{change.value}%
                </div>

                {pending !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        {pending} pending
                    </div>
                )}

                {transactions !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Eye className="h-3 w-3" />
                        {transactions.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Sub Statistics */}
            {subStats && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {subStats.today !== undefined && (
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium">Today</p>
                            <p className="text-sm font-bold text-blue-800">{subStats.today}</p>
                        </div>
                    )}
                    {subStats.thisWeek !== undefined && (
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-medium">This Week</p>
                            <p className="text-sm font-bold text-green-800">{subStats.thisWeek}</p>
                        </div>
                    )}
                    {subStats.thisMonth !== undefined && (
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">This Month</p>
                            <p className="text-sm font-bold text-purple-800">{subStats.thisMonth}</p>
                        </div>
                    )}
                    {subStats.count !== undefined && (
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                            <p className="text-xs text-orange-600 font-medium">Total Count</p>
                            <p className="text-sm font-bold text-orange-800">{subStats.count}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Link */}
            <div className="pt-2 border-t border-border">
                <a
                    href={href}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                    View Details
                    <Eye className="h-3 w-3" />
                </a>
            </div>
        </div>
    )
}