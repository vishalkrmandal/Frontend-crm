import type React from "react"
import { BarChart2, DollarSign, TrendingUp, Users, Activity, CreditCard } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Balance" value="$24,563.00" change="+12.5%" icon={DollarSign} trend="up" />
        <StatCard title="Active Trades" value="32" change="+8.2%" icon={Activity} trend="up" />
        <StatCard title="Total Profit" value="$7,842.00" change="+23.1%" icon={TrendingUp} trend="up" />
        <StatCard title="Referrals" value="12" change="-2.5%" icon={Users} trend="down" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <button className="text-sm text-primary hover:underline">View all</button>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { type: "Deposit", amount: "$1,000.00", date: "Today, 10:45 AM", status: "Completed" },
              { type: "Withdrawal", amount: "$500.00", date: "Yesterday, 2:30 PM", status: "Pending" },
              { type: "Transfer", amount: "$250.00", date: "Mar 12, 9:15 AM", status: "Completed" },
              { type: "Deposit", amount: "$2,000.00", date: "Mar 10, 11:30 AM", status: "Completed" },
            ].map((transaction, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${transaction.type === "Deposit" ? "bg-green-100 text-green-600" : transaction.type === "Withdrawal" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{transaction.amount}</p>
                  <p className={`text-sm ${transaction.status === "Completed" ? "text-green-600" : "text-amber-600"}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Trading Performance</h3>
            <button className="text-sm text-primary hover:underline">View details</button>
          </div>
          <div className="mt-4 h-[250px] w-full rounded-md bg-muted/50 flex items-center justify-center">
            <BarChart2 className="h-16 w-16 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Active Accounts</h3>
          <button className="text-sm text-primary hover:underline">Manage accounts</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium">Account</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-left font-medium">Balance</th>
                <th className="pb-2 text-left font-medium">Equity</th>
                <th className="pb-2 text-left font-medium">Profit/Loss</th>
                <th className="pb-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "MT4-12345",
                  type: "Standard",
                  balance: "$10,250.00",
                  equity: "$10,320.50",
                  pl: "+$70.50",
                  status: "Active",
                },
                {
                  id: "MT5-67890",
                  type: "ECN",
                  balance: "$5,430.00",
                  equity: "$5,380.25",
                  pl: "-$49.75",
                  status: "Active",
                },
                {
                  id: "MT4-54321",
                  type: "VIP",
                  balance: "$25,000.00",
                  equity: "$25,750.00",
                  pl: "+$750.00",
                  status: "Active",
                },
              ].map((account, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 text-sm">{account.id}</td>
                  <td className="py-3 text-sm">{account.type}</td>
                  <td className="py-3 text-sm">{account.balance}</td>
                  <td className="py-3 text-sm">{account.equity}</td>
                  <td className={`py-3 text-sm ${account.pl.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {account.pl}
                  </td>
                  <td className="py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800/20 dark:text-green-400">
                      {account.status}
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

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ElementType
  trend: "up" | "down"
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-bold">{value}</h3>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <span
          className={`inline-flex items-center text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
        >
          {change}
          <svg
            className={`ml-1 h-3 w-3 ${trend === "up" ? "rotate-0 text-green-600" : "rotate-180 text-red-600"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </span>
        <span className="ml-1 text-sm text-muted-foreground">from last period</span>
      </div>
    </div>
  )
}

