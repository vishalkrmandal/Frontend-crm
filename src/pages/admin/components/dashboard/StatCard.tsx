import type React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon: React.ReactNode
    change: {
        value: number
        trend: "up" | "down" | "neutral"
    }
    chart?: React.ReactNode
    href: string
    pending?: number
    transactions?: number
}

export function StatCard({ title, value, description, icon, change, chart, href, pending, transactions }: StatCardProps) {
    return (
        <Link to={href} className="block">
            <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
                <CardContent className="p-6 flex-grow">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <div className="h-6 w-6 text-primary">{icon}</div>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <h2 className="text-3xl font-bold">{value}</h2>
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    change.trend === "up" && "text-green-500",
                                    change.trend === "down" && "text-red-500",
                                    change.trend === "neutral" && "text-gray-500",
                                )}
                            >
                                {change.value > 0 && "+"}
                                {change.value}%
                            </span>
                        </div>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>

                    {/* This div ensures consistent height for pending state */}
                    {/* <div className="p-4 min-h-[40px] flex items-center justify-center"> */}
                    {pending !== undefined && pending > 0 && (
                        <div className="mt-2">
                            <hr />
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                {pending} pending
                            </span>
                        </div>
                    )}
                    {transactions !== undefined && transactions > 0 && (
                        <div className="mt-2">
                            <hr />
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                {transactions} transactions
                            </span>
                        </div>
                    )}
                    {/* </div> */}
                    {chart && <div className="h-8">{chart}</div>}
                </CardContent>
            </Card>

        </Link>
    )
}

