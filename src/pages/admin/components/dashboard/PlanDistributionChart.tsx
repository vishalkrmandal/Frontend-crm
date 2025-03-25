import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/pages/admin/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
    { name: "Basic", value: 60, color: "#f97316" },
    { name: "Premium", value: 20, color: "#facc15" },
    { name: "Enterprise", value: 20, color: "#3b82f6" },
]

export function PlanDistributionChart() {
    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Current active plans</CardDescription>
            </CardHeader>
            <CardContent className="w-full h-full flex flex-col items-center">
                <ChartContainer className="w-full h-[300px] flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}  // Increased size
                                outerRadius={140} // Increased size
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <ChartTooltip>
                                                <ChartTooltipContent
                                                    content={
                                                        <div>
                                                            <div className="text-sm font-bold">${payload[0].name}</div>
                                                            <div className="text-xs font-semibold text-muted-foreground">${payload[0].value}%</div>
                                                        </div>
                                                    }
                                                />
                                            </ChartTooltip>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center w-full">
                    {data.map((item) => (
                        <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <div className="text-sm font-bold">{item.value}%</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
