"use client"

import { useEffect, useState } from "react"
import { Users, ArrowDownCircle, ArrowUpCircle, BarChart3, HandshakeIcon } from "lucide-react"
import { StatCard } from "../components/dashboard/StatCard"
import { MiniChart } from "../components/dashboard/MiniChart"
import { RevenueChart } from "../components/dashboard/RevenueChart"
import { PlanDistributionChart } from "../components/dashboard/PlanDistributionChart"
import { RecentTransactionsTable } from "../components/dashboard/RecentTransactionsTable"

// Sample data for mini charts
const clientChartData = [5, 8, 12, 10, 15, 18, 20, 25, 23, 28, 30, 32]
const depositChartData = [10, 15, 12, 18, 22, 25, 30, 35, 32, 38, 42, 45]
const withdrawalChartData = [8, 10, 12, 15, 13, 18, 20, 22, 25, 23, 28, 30]
const transactionChartData = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
const ibPartnerChartData = [5, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32]


const AdminDashboard = () => {
    const [greeting, setGreeting] = useState("")
    const [currentTime, setCurrentTime] = useState("")

    useEffect(() => {
        const hours = new Date().getHours()
        let greetingText = ""

        if (hours < 12) {
            greetingText = "Good Morning"
        } else if (hours < 18) {
            greetingText = "Good Afternoon"
        } else {
            greetingText = "Good Evening"
        }

        setGreeting(greetingText)

        // Format current date
        const now = new Date()
        const formattedDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })

        setCurrentTime(formattedDate)
    }, [])

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-2 min-h-[40px] text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-lg font-bold">Welcome Back, Adrian</h1>
                        <p className="text-orange-100 text-xs">8 New Clients Registered Today!</p>
                    </div>
                    <div className="mt-2 md:mt-0 text-xs text-orange-100">{currentTime}</div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <StatCard
                    title="Clients"
                    value="1,248"
                    icon={<Users className="h-6 w-6" />}
                    change={{ value: 12.5, trend: "up" }}
                    chart={<MiniChart data={clientChartData} color="#22c55e" type="line" />}
                    href="/admin/dashboard/clients"
                    pending={12}
                />
                <StatCard
                    title="Deposits"
                    value="$845,290"
                    icon={<ArrowDownCircle className="h-6 w-6" />}
                    change={{ value: 8.2, trend: "up" }}
                    chart={<MiniChart data={depositChartData} color="#f97316" type="bar" />}
                    href="/admin/dashboard/deposits"
                    pending={12}
                />
                <StatCard
                    title="Withdrawals"
                    value="$325,480"
                    icon={<ArrowUpCircle className="h-6 w-6" />}
                    change={{ value: -3.8, trend: "down" }}
                    chart={<MiniChart data={withdrawalChartData} color="#ef4444" type="bar" />}
                    href="/admin/dashboard/withdrawals"
                    pending={5}
                />
                <StatCard
                    title="Transactions"
                    value="12,584"
                    icon={<BarChart3 className="h-6 w-6" />}
                    change={{ value: 15.3, trend: "up" }}
                    chart={<MiniChart data={transactionChartData} color="#3b82f6" type="area" />}
                    href="/admin/dashboard/transactions"
                    transactions={12}
                />
                <StatCard
                    title="IB Partners"
                    icon={<HandshakeIcon className="h-6 w-6" />}
                    value="248"

                    change={{ value: 5.7, trend: "up" }}
                    chart={<MiniChart data={ibPartnerChartData} color="#a855f7" type="line" />}
                    href="/admin/dashboard/ib-partners"
                    pending={3}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <RevenueChart />
                <PlanDistributionChart />
            </div>

            {/* Recent Transactions */}
            <div className="grid gap-6 md:grid-cols-1">
                <RecentTransactionsTable />
            </div>
        </div>
    )
}

export default AdminDashboard