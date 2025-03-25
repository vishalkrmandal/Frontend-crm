"use client"

import { useState } from "react"
import { Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TradingContest = () => {
    const [filter, setFilter] = useState("all")
    const [tradeStatus, setTradeStatus] = useState("all") // "all", "open", or "closed"

    // Sample data
    const transactions = [
        {
            account: "MT4-12345",
            type: "Basic",
            symbol: "EURUSD",
            openTime: "Mar 20, 2023 09:30 AM",
            closeTime: "Mar 20, 2023 10:45 AM",
            openPrice: "1.2000",
            closePrice: "1.2100",
            trade: "Sell",
            volume: "1.00",
            profit: "+$100.00",
            status: "closed",
        },
        {
            account: "MT4-12345",
            type: "Basic",
            symbol: "EURUSD",
            openTime: "Mar 20, 2023 09:30 AM",
            closeTime: "",
            openPrice: "1.2000",
            closePrice: "",
            trade: "Buy",
            volume: "1.00",
            profit: "+$100.00",
            status: "open",
        },
        {
            account: "MT4-67890",
            type: "Premium",
            symbol: "GBPUSD",
            openTime: "Mar 21, 2023 11:15 AM",
            closeTime: "Mar 21, 2023 03:30 PM",
            openPrice: "1.3800",
            closePrice: "1.3750",
            trade: "Sell",
            volume: "2.00",
            profit: "+$150.00",
            status: "closed",
        },
        {
            account: "MT4-54321",
            type: "Basic",
            symbol: "USDJPY",
            openTime: "Mar 22, 2023 02:45 PM",
            closeTime: "",
            openPrice: "110.50",
            closePrice: "",
            trade: "Buy",
            volume: "0.50",
            profit: "-$25.00",
            status: "open",
        },
    ]

    // Filter transactions based on both type and trade status
    const filteredTransactions = transactions.filter((transaction) => {
        // Filter by transaction type
        const typeMatch = filter === "all" || transaction.type.toLowerCase() === filter

        // Filter by trade status
        const statusMatch = tradeStatus === "all" || transaction.status === tradeStatus

        return typeMatch && statusMatch
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Trading Contest</h1>
                <p className="text-muted-foreground">View and filter all your account trades.</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="text" placeholder="Search transactions..." className="w-full pl-9" />
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Transactions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Transactions</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Trade status filter buttons */}
                <div className="mt-4 flex items-center gap-2">
                    <Button
                        variant={tradeStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTradeStatus("all")}
                    >
                        All Trades
                    </Button>
                    <Button
                        variant={tradeStatus === "open" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTradeStatus("open")}
                    >
                        Open Trades
                    </Button>
                    <Button
                        variant={tradeStatus === "closed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTradeStatus("closed")}
                    >
                        Closed Trades
                    </Button>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-left font-medium">Account</th>
                                <th className="pb-2 text-left font-medium">Type</th>
                                <th className="pb-2 text-left font-medium">Symbol</th>
                                <th className="pb-2 text-left font-medium">Trade</th>
                                <th className="pb-2 text-left font-medium">Open Time</th>
                                <th className="pb-2 text-left font-medium">Open Price</th>
                                {tradeStatus !== "open" && (
                                    <>
                                        <th className="pb-2 text-left font-medium">Close Time</th>
                                        <th className="pb-2 text-left font-medium">Close Price</th>
                                    </>
                                )}
                                <th className="pb-2 text-left font-medium">Volume</th>
                                <th className="pb-2 text-left font-medium">Profit</th>
                                <th className="pb-2 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-3 text-sm">{transaction.account}</td>
                                    <td className="py-3 text-sm">{transaction.type}</td>
                                    <td className="py-3 text-sm">{transaction.symbol}</td>
                                    <td className="py-3 text-sm">
                                        <Badge variant={transaction.trade === "Buy" ? "green" : "red"}>{transaction.trade}</Badge>
                                    </td>
                                    <td className="py-3 text-sm">{transaction.openTime}</td>
                                    <td className="py-3 text-sm">{transaction.openPrice}</td>
                                    {tradeStatus !== "open" && (
                                        <>
                                            <td className="py-3 text-sm">{transaction.closeTime}</td>
                                            <td className="py-3 text-sm">{transaction.closePrice}</td>
                                        </>
                                    )}
                                    <td className="py-3 text-sm">{transaction.volume}</td>
                                    <td
                                        className={`py-3 text-sm font-medium ${transaction.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {transaction.profit}
                                    </td>

                                    <td className="py-3 text-sm">
                                        <Badge variant={transaction.status === "closed" ? "red" : "green"}>
                                            {transaction.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredTransactions.length} of {transactions.length} transactions
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            Previous
                        </Button>
                        <Button variant="outline" size="sm">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TradingContest

