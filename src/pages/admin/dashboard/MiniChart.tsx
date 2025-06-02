// Frontend\src\pages\admin\components\dashboard\MiniChart.tsx

import { useMemo } from 'react'

interface MiniChartProps {
    data: number[]
    color: string
    type: 'line' | 'bar' | 'area'
}

export const MiniChart = ({ data, color, type }: MiniChartProps) => {
    const chartData = useMemo(() => {
        if (!data.length) return []

        const max = Math.max(...data)
        const min = Math.min(...data)
        const range = max - min || 1

        return data.map((value, index) => ({
            value,
            normalized: ((value - min) / range) * 100,
            index
        }))
    }, [data])

    const width = 100
    const height = 60
    const padding = 4

    const renderLineChart = () => {
        if (chartData.length < 2) return null

        const pathData = chartData.map((point, index) => {
            const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding)
            const y = height - padding - (point.normalized / 100) * (height - 2 * padding)
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')

        return (
            <g>
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {chartData.map((point, index) => {
                    const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding)
                    const y = height - padding - (point.normalized / 100) * (height - 2 * padding)
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill={color}
                        />
                    )
                })}
            </g>
        )
    }

    const renderBarChart = () => {
        const barWidth = (width - 2 * padding) / chartData.length - 1

        return (
            <g>
                {chartData.map((point, index) => {
                    const x = padding + index * (barWidth + 1)
                    const barHeight = (point.normalized / 100) * (height - 2 * padding)
                    const y = height - padding - barHeight

                    return (
                        <rect
                            key={index}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={color}
                            rx="1"
                        />
                    )
                })}
            </g>
        )
    }

    const renderAreaChart = () => {
        if (chartData.length < 2) return null

        const pathData = chartData.map((point, index) => {
            const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding)
            const y = height - padding - (point.normalized / 100) * (height - 2 * padding)
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')

        const areaPath = `${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`

        return (
            <g>
                <path
                    d={areaPath}
                    fill={color}
                    fillOpacity="0.3"
                />
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                {type === 'line' && renderLineChart()}
                {type === 'bar' && renderBarChart()}
                {type === 'area' && renderAreaChart()}
            </svg>
        </div>
    )
}