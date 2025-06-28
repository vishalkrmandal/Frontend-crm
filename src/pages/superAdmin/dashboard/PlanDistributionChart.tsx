// Frontend\src\pages\admin\components\dashboard\PlanDistributionChart.tsx

import { useEffect, useState } from 'react'
import { PieChart } from 'lucide-react'
import { adminDashboardAPI } from './adminDashboardAPI'

interface DistributionData {
    name: string
    value: number
    percentage: string
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export const PlanDistributionChart = () => {
    const [distributionData, setDistributionData] = useState<DistributionData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDistributionData = async () => {
            try {
                const response = await adminDashboardAPI.getClientDistribution()
                if (response.success) {
                    setDistributionData(response.data)
                }
            } catch (error) {
                console.error('Error fetching distribution data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDistributionData()
    }, [])

    if (loading) {
        return (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-300 rounded"></div>
                </div>
            </div>
        )
    }

    const totalAccounts = distributionData.reduce((sum, item) => sum + item.value, 0)
    const centerX = 100
    const centerY = 100
    const radius = 70

    let cumulativePercentage = 0

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        Account Distribution
                    </h3>
                    <p className="text-sm text-muted-foreground">By account type</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{totalAccounts}</p>
                    <p className="text-sm text-muted-foreground">Total Accounts</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                {/* Pie Chart */}
                <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {distributionData.map((item, index) => {
                            const percentage = parseFloat(item.percentage)
                            const startAngle = (cumulativePercentage / 100) * 360
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360

                            const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180)

                            const x1 = centerX + radius * Math.cos(startAngleRad)
                            const y1 = centerY + radius * Math.sin(startAngleRad)
                            const x2 = centerX + radius * Math.cos(endAngleRad)
                            const y2 = centerY + radius * Math.sin(endAngleRad)

                            const largeArcFlag = percentage > 50 ? 1 : 0

                            const pathData = [
                                `M ${centerX} ${centerY}`,
                                `L ${x1} ${y1}`,
                                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z'
                            ].join(' ')

                            cumulativePercentage += percentage

                            return (
                                <path
                                    key={index}
                                    d={pathData}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="white"
                                    strokeWidth="2"
                                />
                            )
                        })}
                        {/* Center circle */}
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r="30"
                            fill="white"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                        />
                        <text
                            x={centerX}
                            y={centerY - 5}
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-600"
                        >
                            Total
                        </text>
                        <text
                            x={centerX}
                            y={centerY + 8}
                            textAnchor="middle"
                            className="text-sm font-bold fill-gray-800"
                        >
                            {totalAccounts}
                        </text>
                    </svg>
                </div>

                {/* Legend */}
                <div className="space-y-3 flex-1 ml-6">
                    {distributionData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">{item.value}</p>
                                <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
