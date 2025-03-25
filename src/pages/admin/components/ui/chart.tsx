import * as React from "react"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        return <div className={cn("relative", className)} ref={ref} {...props} />
    },
)
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        return <div className={cn("grid w-full max-w-sm gap-2", className)} ref={ref} {...props} />
    },
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                className={cn("bg-popover text-popover-foreground border rounded-md shadow-sm py-1.5 px-3", className)}
                ref={ref}
                {...props}
            />
        )
    },
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
    ({ className, content, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col space-y-1", className)} ref={ref} {...props}>
                {content}
            </div>
        )
    },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        return <div className={cn("flex items-center space-x-2", className)} ref={ref} {...props} />
    },
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendItem = React.forwardRef<
    React.ElementRef<"div">,
    { name: string; color: string } & React.ComponentPropsWithoutRef<"div">
>(({ className, name, color, ...props }, ref) => {
    return (
        <div className={cn("flex items-center space-x-1 text-sm", className)} ref={ref} {...props}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="10" height="10" fill={color} rx="2" />
            </svg>
            <span>{name}</span>
        </div>
    )
})
ChartLegendItem.displayName = "ChartLegendItem"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }

