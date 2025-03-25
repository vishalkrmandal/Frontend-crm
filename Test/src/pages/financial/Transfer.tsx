import { ArrowLeftRight, AlertCircle } from "lucide-react"

export default function Transfer() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Transfer Funds</h1>
                <p className="text-muted-foreground">Transfer funds between your trading accounts.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-medium">Transfer Form</h2>
                    <form className="mt-4 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="from-account">
                                From Account
                            </label>
                            <select id="from-account" className="w-full rounded-md border border-input bg-background px-3 py-2">
                                <option>MT4-12345 (Standard) - $10,250.00</option>
                                <option>MT5-67890 (ECN) - $5,430.00</option>
                                <option>MT4-54321 (VIP) - $25,000.00</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="rounded-full border p-2">
                                <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="to-account">
                                To Account
                            </label>
                            <select id="to-account" className="w-full rounded-md border border-input bg-background px-3 py-2">
                                <option>MT5-67890 (ECN) - $5,430.00</option>
                                <option>MT4-12345 (Standard) - $10,250.00</option>
                                <option>MT4-54321 (VIP) - $25,000.00</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="amount">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                <input
                                    id="amount"
                                    type="number"
                                    className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2"
                                    placeholder="Enter amount"
                                    min="10"
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Minimum transfer: $10</p>
                        </div>
                        <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Transfers between accounts are processed instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            Transfer Funds
                        </button>
                    </form>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-medium">Account Balances</h2>
                    <div className="mt-4 space-y-4">
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">MT4-12345</h3>
                                <span className="rounded-md bg-secondary px-2 py-1 text-xs">Standard</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Available Balance</p>
                                <p className="text-lg font-bold">$10,250.00</p>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">MT5-67890</h3>
                                <span className="rounded-md bg-secondary px-2 py-1 text-xs">ECN</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Available Balance</p>
                                <p className="text-lg font-bold">$5,430.00</p>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">MT4-54321</h3>
                                <span className="rounded-md bg-secondary px-2 py-1 text-xs">VIP</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Available Balance</p>
                                <p className="text-lg font-bold">$25,000.00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-medium">Recent Transfers</h2>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-left font-medium">Date</th>
                                <th className="pb-2 text-left font-medium">From</th>
                                <th className="pb-2 text-left font-medium">To</th>
                                <th className="pb-2 text-left font-medium">Amount</th>
                                <th className="pb-2 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { date: "Mar 14, 2023", from: "MT4-12345", to: "MT5-67890", amount: "$500.00", status: "Completed" },
                                { date: "Mar 10, 2023", from: "MT5-67890", to: "MT4-54321", amount: "$1,000.00", status: "Completed" },
                                { date: "Mar 5, 2023", from: "MT4-54321", to: "MT4-12345", amount: "$2,500.00", status: "Completed" },
                            ].map((transfer, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-3 text-sm">{transfer.date}</td>
                                    <td className="py-3 text-sm">{transfer.from}</td>
                                    <td className="py-3 text-sm">{transfer.to}</td>
                                    <td className="py-3 text-sm">{transfer.amount}</td>
                                    <td className="py-3 text-sm">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                            {transfer.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

