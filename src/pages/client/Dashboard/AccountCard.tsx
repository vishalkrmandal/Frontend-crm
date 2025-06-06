// Frontend\src\pages\client\components\dashboard\AccountCard.tsx

import { MoreHorizontal } from "lucide-react"

interface AccountCardProps {
    account: {
        id: string
        mt5Account: string
        name: string
        accountType: string
        balance: number
        equity: number
        profit: number
        leverage: string
        status: string
    }
}

export const AccountCard = ({ account }: AccountCardProps) => {
    const isProfit = account.profit >= 0
    const profitPercentage = account.balance > 0 ? ((account.profit / account.balance) * 100).toFixed(2) : '0.00'

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="font-medium text-sm">{account.name}</h4>
                    <p className="text-xs text-muted-foreground">#{account.mt5Account}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${account.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {account.status}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Balance</span>
                    <span className="font-medium">${account.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Equity</span>
                    <span className="font-medium">${account.equity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">P&L</span>
                    <div className="flex items-center gap-1">
                        <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {isProfit ? '+' : ''}${account.profit.toLocaleString()}
                        </span>
                        <span className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            ({isProfit ? '+' : ''}{profitPercentage}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Type: {account.accountType}</span>
                    <span className="text-muted-foreground">Leverage: {account.leverage}</span>
                </div>
            </div>
        </div>
    )
}