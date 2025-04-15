//Frontend\src\pages\client\financial\Withdrawal.tsx
import { useState } from "react";
import { Wallet, AlertCircle } from "lucide-react"

export default function Withdrawal() {
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState({});

  const handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMethod(event.target.value);
    setDetails({}); // Reset details when method changes
  };

  const handleDetailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [event.target.name]: event.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
        <p className="text-muted-foreground">
          Withdraw funds from your trading account to your preferred payment method.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Withdrawal Form</h2>
          <form className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="account">
                From Account
              </label>
              <select id="account" className="w-full rounded-md border border-input bg-background px-3 py-2">
                <option>MT4-12345 (Standard) - $10,250.00</option>
                <option>MT5-67890 (ECN) - $5,430.00</option>
                <option>MT4-54321 (VIP) - $25,000.00</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="method">
                Withdrawal Method
              </label>
              <select id="method" className="w-full rounded-md border border-input bg-background px-3 py-2" value={method} onChange={handleMethodChange}>
                <option value="">Select a method</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Credit Card</option>
                <option value="skrill">E-Wallet (Skrill)</option>
                <option value="neteller">E-Wallet (Neteller)</option>
              </select>
            </div>

            {method === "bank" && (
              <div>
                <label className="block text-sm font-medium">Bank Name</label>
                <input type="text" name="bankName" className="w-full rounded-md border border-input bg-background px-3 py-2" onChange={handleDetailChange} />
                <label className="block text-sm font-medium">Account Number</label>
                <input type="text" name="accountNumber" className="w-full rounded-md border border-input bg-background px-3 py-2" onChange={handleDetailChange} />
                <label className="block text-sm font-medium">IFSC Code</label>
                <input type="text" name="ifscCode" className="w-full rounded-md border border-input bg-background px-3 py-2" onChange={handleDetailChange} />
              </div>
            )}

            {method === "card" && (
              <div>
                <label className="block text-sm font-medium">Card Number</label>
                <input type="text" name="cardNumber" className="w-full rounded-md border px-3 py-2" onChange={handleDetailChange} />
                <label className="block text-sm font-medium">Expiry Date</label>
                <input type="text" name="expiryDate" className="w-full rounded-md border px-3 py-2" onChange={handleDetailChange} />
              </div>
            )}

            {(method === "skrill" || method === "neteller") && (
              <div>
                <label className="block text-sm font-medium">E-Wallet ID</label>
                <input type="text" name="walletId" className="w-full rounded-md border px-3 py-2" onChange={handleDetailChange} />
              </div>
            )}

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
              <p className="mt-1 text-xs text-muted-foreground">Minimum withdrawal: $100</p>
            </div>
            <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div className="ml-3">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Withdrawals are processed within 1-3 business days. Bank transfers may take additional time.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Request Withdrawal
            </button>
          </form>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Available Balance</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">MT4-12345 (Standard)</h3>
                  <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">$10,250.00</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">MT5-67890 (ECN)</h3>
                  <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">$5,430.00</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">MT4-54321 (VIP)</h3>
                  <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">$25,000.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Recent Withdrawals</h2>
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
                  date: "Mar 12, 2023",
                  method: "Bank Transfer",
                  amount: "$1,500.00",
                  account: "MT4-12345",
                  status: "Completed",
                },
                {
                  date: "Mar 5, 2023",
                  method: "E-Wallet",
                  amount: "$800.00",
                  account: "MT5-67890",
                  status: "Completed",
                },
                {
                  date: "Feb 28, 2023",
                  method: "Credit Card",
                  amount: "$2,000.00",
                  account: "MT4-54321",
                  status: "Pending",
                },
              ].map((withdrawal, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 text-sm">{withdrawal.date}</td>
                  <td className="py-3 text-sm">{withdrawal.method}</td>
                  <td className="py-3 text-sm">{withdrawal.amount}</td>
                  <td className="py-3 text-sm">{withdrawal.account}</td>
                  <td className="py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${withdrawal.status === "Completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                        }`}
                    >
                      {withdrawal.status}
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

