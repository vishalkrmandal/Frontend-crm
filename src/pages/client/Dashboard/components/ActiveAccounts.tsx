// Frontend/src/pages/client/Dashboard/components/ActiveAccounts.tsx

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, MoreHorizontal, RefreshCw } from "lucide-react";

// Active Accounts
type ActiveAccount = {
    _id: string;
    name: string;
    accountType: string;
    mt5Account: string;
    balance: number;
    equity: number;
    profitLoss: number;
    leverage: string;
    groupName: string;
};

interface ActiveAccountsProps {
    accounts: ActiveAccount[];
    theme: any; // You can replace 'any' with your Theme type
    onRefresh: () => Promise<void>;
}

const ActiveAccounts: React.FC<ActiveAccountsProps> = ({
    accounts,
    // theme, 
    onRefresh
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    const getAccountTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'standard': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400';
            case 'pro': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400';
            case 'vip': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-3">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Active Accounts</h3>
                    <p className="text-sm text-muted-foreground">{accounts.length} accounts connected</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors rounded-lg hover:bg-muted"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {accounts.length > 0 ? accounts.map((account) => (
                    <div
                        key={account._id}
                        className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-foreground">{account.name}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.accountType)}`}>
                                        {account.accountType}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">MT5: {account.mt5Account}</p>
                            </div>
                            <button className="p-1 hover:bg-muted rounded">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Balance</p>
                                <p className="font-semibold text-foreground">${(account.balance || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Equity</p>
                                <p className="font-semibold text-foreground">${(account.equity || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">P&L</p>
                                <p className={`font-semibold flex items-center ${(account.profitLoss || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {(account.profitLoss || 0) >= 0 ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                                    {(account.profitLoss || 0) >= 0 ? '+' : ''}${(account.profitLoss || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Leverage: {account.leverage}</span>
                                <span>Group: {account.groupName}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No active accounts found</p>
                        <p className="text-sm mt-1">Connect your trading accounts to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveAccounts;