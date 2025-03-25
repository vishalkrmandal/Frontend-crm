import { Eye, MoreHorizontal, RefreshCw, ExternalLink } from "lucide-react"

export default function AccountList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trading Accounts</h1>
          <p className="text-muted-foreground">Manage and monitor all your trading accounts.</p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
          Open New Account
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Account</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Platform</th>
                <th className="px-4 py-3 text-left font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Equity</th>
                <th className="px-4 py-3 text-left font-medium">Margin</th>
                <th className="px-4 py-3 text-left font-medium">Free Margin</th>
                <th className="px-4 py-3 text-left font-medium">Profit/Loss</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "MT4-12345",
                  type: "Standard",
                  platform: "MetaTrader 4",
                  balance: "$10,250.00",
                  equity: "$10,320.50",
                  margin: "$1,200.00",
                  freeMargin: "$9,120.50",
                  pl: "+$70.50",
                  status: "Active",
                },
                {
                  id: "MT5-67890",
                  type: "ECN",
                  platform: "MetaTrader 5",
                  balance: "$5,430.00",
                  equity: "$5,380.25",
                  margin: "$800.00",
                  freeMargin: "$4,580.25",
                  pl: "-$49.75",
                  status: "Active",
                },
                {
                  id: "MT4-54321",
                  type: "VIP",
                  platform: "MetaTrader 4",
                  balance: "$25,000.00",
                  equity: "$25,750.00",
                  margin: "$3,500.00",
                  freeMargin: "$22,250.00",
                  pl: "+$750.00",
                  status: "Active",
                },
              ].map((account, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-4 text-sm font-medium">{account.id}</td>
                  <td className="px-4 py-4 text-sm">{account.type}</td>
                  <td className="px-4 py-4 text-sm">{account.platform}</td>
                  <td className="px-4 py-4 text-sm">{account.balance}</td>
                  <td className="px-4 py-4 text-sm">{account.equity}</td>
                  <td className="px-4 py-4 text-sm">{account.margin}</td>
                  <td className="px-4 py-4 text-sm">{account.freeMargin}</td>
                  <td
                    className={`px-4 py-4 text-sm font-medium ${account.pl.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {account.pl}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800/20 dark:text-green-400">
                      {account.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="Refresh"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="Open in Platform"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="More Options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Account Summary</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="font-medium">$40,680.00</p>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-sm text-muted-foreground">Total Equity</p>
              <p className="font-medium">$41,450.75</p>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-sm text-muted-foreground">Total Margin</p>
              <p className="font-medium">$5,500.00</p>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-sm text-muted-foreground">Total Free Margin</p>
              <p className="font-medium">$35,950.75</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
              <p className="font-medium text-green-600">+$770.75</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Quick Actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Deposit Funds
            </button>
            <button className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Withdraw Funds
            </button>
            <button className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Internal Transfer
            </button>
            <button className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Download Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

