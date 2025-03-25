import { CreditCard, DollarSign, Wallet, ArrowRight } from "lucide-react"

export default function Deposit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">
          Add funds to your trading account using one of the available payment methods.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Select Payment Method</h2>
          <div className="mt-4 grid gap-4">
            <div className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary">
              <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Credit/Debit Card</h3>
                <p className="text-sm text-muted-foreground">Instant deposit with Visa, Mastercard</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary">
              <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">E-Wallet</h3>
                <p className="text-sm text-muted-foreground">Deposit using Skrill, Neteller, or PayPal</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary">
              <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Bank Transfer</h3>
                <p className="text-sm text-muted-foreground">Direct bank transfer (1-3 business days)</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Deposit Details</h2>
          <form className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="account">
                Select Account
              </label>
              <select id="account" className="w-full rounded-md border border-input bg-background px-3 py-2">
                <option>MT4-12345 (Standard)</option>
                <option>MT5-67890 (ECN)</option>
                <option>MT4-54321 (VIP)</option>
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
                  min="100"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Minimum deposit: $100</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="upload">
                Upload Proof of Payment (PDF, JPG, JPEG)
              </label>
              <input
                id="upload"
                type="file"
                accept=".pdf,.jpg,.jpeg"
                className="w-full border border-input rounded-md bg-background px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Continue to Payment
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Recent Deposits</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">Method</th>
                <th className="pb-2 text-left font-medium">Amount</th>
                <th className="pb-2 text-left font-medium">Account</th>
                <th className="pb-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  date: "Mar 15, 2023",
                  method: "Credit Card",
                  amount: "$1,000.00",
                  account: "MT4-12345",
                  status: "Completed",
                },
                {
                  date: "Mar 10, 2023",
                  method: "Bank Transfer",
                  amount: "$2,500.00",
                  account: "MT5-67890",
                  status: "Completed",
                },
                {
                  date: "Mar 5, 2023",
                  method: "E-Wallet",
                  amount: "$500.00",
                  account: "MT4-54321",
                  status: "Completed",
                },
              ].map((deposit, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 text-sm">{deposit.date}</td>
                  <td className="py-3 text-sm">{deposit.method}</td>
                  <td className="py-3 text-sm">{deposit.amount}</td>
                  <td className="py-3 text-sm">{deposit.account}</td>
                  <td className="py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800/20 dark:text-green-400">
                      {deposit.status}
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

