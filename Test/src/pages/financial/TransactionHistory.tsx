"use client"

import { useState } from "react"
import { Download, Filter, Search } from "lucide-react"

export default function TransactionHistory() {
    const [filter, setFilter] = useState("all")

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
                <p className="text-muted-foreground">View and filter all your account transactions.</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2"
                            />
                        </div>
                        <button className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="all">All Transactions</option>
                            <option value="deposit">Deposits</option>
                            <option value="withdrawal">Withdrawals</option>
                            <option value="transfer">Transfers</option>
                        </select>
                        <button className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-left font-medium">Date & Time</th>
                                <th className="pb-2 text-left font-medium">Type</th>
                                <th className="pb-2 text-left font-medium">Description</th>
                                <th className="pb-2 text-left font-medium">Amount</th>
                                <th className="pb-2 text-left font-medium">Account</th>
                                <th className="pb-2 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    date: "Mar 15, 2023 10:45 AM",
                                    type: "Deposit",
                                    description: "Credit Card Deposit",
                                    amount: "+$1,000.00",
                                    account: "MT4-12345",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 14, 2023 02:30 PM",
                                    type: "Transfer",
                                    description: "Internal Transfer",
                                    amount: "-$500.00",
                                    account: "MT4-12345",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 14, 2023 02:30 PM",
                                    type: "Transfer",
                                    description: "Internal Transfer",
                                    amount: "+$500.00",
                                    account: "MT5-67890",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 12, 2023 11:15 AM",
                                    type: "Withdrawal",
                                    description: "Bank Transfer Withdrawal",
                                    amount: "-$1,500.00",
                                    account: "MT4-12345",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 10, 2023 09:30 AM",
                                    type: "Deposit",
                                    description: "Bank Transfer Deposit",
                                    amount: "+$2,500.00",
                                    account: "MT5-67890",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 5, 2023 03:45 PM",
                                    type: "Withdrawal",
                                    description: "E-Wallet Withdrawal",
                                    amount: "-$800.00",
                                    account: "MT5-67890",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 5, 2023 01:20 PM",
                                    type: "Transfer",
                                    description: "Internal Transfer",
                                    amount: "-$2,500.00",
                                    account: "MT4-54321",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 5, 2023 01:20 PM",
                                    type: "Transfer",
                                    description: "Internal Transfer",
                                    amount: "+$2,500.00",
                                    account: "MT4-12345",
                                    status: "Completed",
                                },
                                {
                                    date: "Mar 1, 2023 10:00 AM",
                                    type: "Deposit",
                                    description: "E-Wallet Deposit",
                                    amount: "+$500.00",
                                    account: "MT4-54321",
                                    status: "Completed",
                                },
                                {
                                    date: "Feb 28, 2023 04:30 PM",
                                    type: "Withdrawal",
                                    description: "Credit Card Withdrawal",
                                    amount: "-$2,000.00",
                                    account: "MT4-54321",
                                    status: "Pending",
                                },
                            ]
                                .filter((transaction) => filter === "all" || transaction.type.toLowerCase() === filter)
                                .map((transaction, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                        <td className="py-3 text-sm">{transaction.date}</td>
                                        <td className="py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.type === "Deposit"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                                        : transaction.type === "Withdrawal"
                                                            ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                                    }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm">{transaction.description}</td>
                                        <td
                                            className={`py-3 text-sm font-medium ${transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {transaction.amount}
                                        </td>
                                        <td className="py-3 text-sm">{transaction.account}</td>
                                        <td className="py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "Completed"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                                        : "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                                                    }`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Showing 10 of 24 transactions</p>
                    <div className="flex items-center space-x-2">
                        <button className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            Previous
                        </button>
                        <button className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

