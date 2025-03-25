"use client"

import { useEffect, useRef } from "react"

interface MiniChartProps {
    data: number[]
    color: string
    type: "bar" | "line" | "area"
}

export function MiniChart({ data, color, type }: MiniChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Get parent dimensions
        const parent = canvas.parentElement
        if (!parent) return
        let width = parent.clientWidth
        let height = parent.clientHeight

        // Improve resolution for high-DPI screens (4x for ultra-sharpness)
        const scale = Math.min(4, window.devicePixelRatio || 1)
        canvas.width = width * scale
        canvas.height = height * scale
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(scale, scale)

        // Clear canvas
        ctx.clearRect(0, 0, width, height)
        ctx.imageSmoothingEnabled = true // Enable anti-aliasing for smooth lines

        const dataLength = data.length
        const max = Math.max(...data)
        const min = Math.min(...data)
        const range = max - min || 1

        const barWidth = width / dataLength - 4
        const spacing = width / (dataLength - 1)

        // Set styles
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 2.5 // Slightly thicker for clarity

        if (type === "bar") {
            data.forEach((value, index) => {
                const barHeight = ((value - min) / range) * height
                const x = index * (barWidth + 4)
                const y = height - barHeight
                ctx.fillRect(x, y, barWidth, barHeight)
            })
        } else if (type === "line" || type === "area") {
            ctx.beginPath()
            data.forEach((value, index) => {
                const x = index * spacing
                const y = height - ((value - min) / range) * height
                index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            })
            ctx.stroke()

            if (type === "area") {
                ctx.lineTo(width, height)
                ctx.lineTo(0, height)
                ctx.closePath()
                ctx.globalAlpha = 0.2
                ctx.fill()
                ctx.globalAlpha = 1
            }
        }
    }, [data, color, type])

    return <canvas ref={canvasRef} className="w-full h-full"></canvas>
}
