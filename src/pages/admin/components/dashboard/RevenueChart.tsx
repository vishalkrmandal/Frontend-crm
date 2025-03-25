import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem } from "@/pages/admin/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const data = [
    { name: "Jan", value: 35000 },
    { name: "Feb", value: 25000 },
    { name: "Mar", value: 40000 },
    { name: "Apr", value: 75000 },
    { name: "May", value: 80000 },
    { name: "Jun", value: 85000 },
    { name: "Jul", value: 75000 },
    { name: "Aug", value: 78000 },
    { name: "Sep", value: 77000 },
    { name: "Oct", value: 82000 },
    { name: "Nov", value: 20000 },
    { name: "Dec", value: 75000 },
]

export function RevenueChart() {
    return (
        <Card className="w-full h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                    <CardTitle>Revenue</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Monthly revenue overview</CardDescription>
                    <div className="mt-2">
                        <div className="text-2xl font-bold">$745,000</div>
                        <div className="text-xs text-green-500 font-medium">+40% increased from last year</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <ChartLegend>
                        <ChartLegendItem name="Revenue" color="#f97316" />
                    </ChartLegend>
                </div>
            </CardHeader>
            <CardContent className="w-full h-full flex flex-col items-center">
                <ChartContainer className="w-full h-[300px] flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <ChartTooltip>
                                                <ChartTooltipContent
                                                    content={
                                                        <div>
                                                            <div className="text-sm font-bold">${payload[0].payload.name}</div>
                                                            <div className="text-xs font-semibold text-muted-foreground">
                                                                $${payload[0].value?.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </ChartTooltip>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
