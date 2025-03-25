//Frontend\src\pages\client\account\OpenNewAccount.tsx

import { AlertCircle, Check } from "lucide-react"

export default function OpenNewAccount() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Open New Trading Account</h1>
        <p className="text-muted-foreground">Create a new trading account to diversify your trading strategy.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Basic Account</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Popular</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Spreads from 1.6 pips</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Leverage up to 1:500</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Min deposit $100</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">All major currency pairs</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">MT4 & MT5 platforms</span>
            </div>
          </div>
          <button className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            Select
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Elite Account</h3>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Spreads from 0.0 pips</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Leverage up to 1:200</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Min deposit $500</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Direct market access</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Commission-based pricing</span>
            </div>
          </div>
          <button className="mt-6 w-full rounded-md border border-primary bg-transparent px-4 py-2 text-primary hover:bg-primary/10">
            Select
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">ECN Account</h3>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Premium spreads</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Leverage up to 1:100</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Min deposit $10,000</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Dedicated account manager</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm">Premium trading signals</span>
            </div>
          </div>
          <button className="mt-6 w-full rounded-md border border-primary bg-transparent px-4 py-2 text-primary hover:bg-primary/10">
            Select
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Account Details</h2>
        <form className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="platform">
                Trading Platform
              </label>
              <select id="platform" className="w-full rounded-md border border-input bg-background px-3 py-2">
                <option>MetaTrader 4</option>
                <option>MetaTrader 5</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="account-type">
                Account Type
              </label>
              <select id="account-type" className="w-full rounded-md border border-input bg-background px-3 py-2">
                <option value="">Select Account Type</option>
                <option>BASIC</option>
                <option>CLASSIC</option>
                <option>ECN ACCOUNT</option>
                <option>ELITE</option>
                <option>RAW ACCOUNT</option>
                <option>STOCK TRADING</option>
                <option>LOT WISE</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="currency">
                Base Currency
              </label>
              <select id="currency" className="w-full rounded-md border border-input bg-background px-3 py-2">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="leverage">
                Leverage
              </label>
              <select id="leverage" className="w-full rounded-md border border-input bg-background px-3 py-2">
                <option value="">Select Leverage</option>
                <option>1:50</option>
                <option>1:100</option>
                <option>1:200</option>
                <option>1:300</option>
                <option>1:400</option>
                <option>1:500</option>
                <option>1:600</option>
                <option>1:700</option>
                <option>1:800</option>
                <option>1:900</option>
                <option>1:1000</option>
              </select>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your new trading account will be created instantly. You can fund it from your existing accounts or
                  make a new deposit.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}

