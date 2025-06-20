// Frontend\src\pages\client\account\TradingContest.tsx

import { useState, useEffect, useCallback } from "react"
import { Filter, Search, RefreshCw, Activity, TrendingUp, TrendingDown, ArrowUp, ArrowDown, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Trade = {
    ticket: string;
    account: string;
    accountName: string;
    accountType: string;
    symbol: string;
    trade: string;
    tradeType: string;
    openTime: string;
    openPrice: string;
    currentPrice?: string;
    closeTime?: string;
    closePrice?: string;
    volume: string;
    profit: string;
    profitFormatted: string;
    status: "open" | "closed";
    commission: number;
    swap: number;
    stopLoss: number;
    takeProfit: number;
    comment: string;
};

type TradesData = {
    openTrades?: Trade[];
    closedTrades?: Trade[];
    totalOpenTrades?: number;
    totalClosedTrades?: number;
    accountsCount?: number;
    statistics?: any;
    accounts?: any[];
};

type OpenTradesResponse = {
    trades: Trade[];
    total: number;
    totalProfit: number;
    totalProfitFormatted: string;
    accounts: any[];
};

type ClosedTradesResponse = {
    trades: Trade[];
    total: number;
    totalProfit: number;
    totalProfitFormatted: string;
    profitableTrades: number;
    losingTrades: number;
    winRate: number;
    accounts: any[];
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TradingContest = () => {
    const [activeTab, setActiveTab] = useState<"all" | "open" | "closed">("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [symbolFilter, setSymbolFilter] = useState("all")
    const [accountFilter, setAccountFilter] = useState("all")
    const [profitFilter, setProfitFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [isLoading, setIsLoading] = useState(false)
    const [isRequestPending, setIsRequestPending] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Separate state for each tab
    const [allTradesData, setAllTradesData] = useState<TradesData>({})
    const [openTradesData, setOpenTradesData] = useState<OpenTradesResponse | null>(null)
    const [closedTradesData, setClosedTradesData] = useState<ClosedTradesResponse | null>(null)

    // Custom Badge component using Lucide React with shadcn-like styling
    const CustomBadge = ({ variant, className = "", children }: {
        variant?: "default" | "destructive" | "secondary" | "outline",
        className?: string,
        children: React.ReactNode
    }) => {
        const getVariantStyles = () => {
            switch (variant) {
                case "destructive":
                    return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
                case "secondary":
                    return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                case "outline":
                    return "bg-transparent text-slate-900 border-slate-300 hover:bg-slate-50 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                default: // "default" - blue
                    return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900"
            }
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${getVariantStyles()} ${className}`}>
                {children}
            </span>
        )
    }

    const fetchAllTrades = useCallback(async () => {
        if (isRequestPending) return

        setIsLoading(true)
        setIsRequestPending(true)
        try {
            const clientToken = localStorage.getItem("clientToken") || "";

            const response = await fetch(`${API_BASE_URL}/api/trading/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${clientToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json()

            if (result.success && result.data) {
                setAllTradesData(result.data)
                setLastUpdated(new Date())
            }
        } catch (error) {
            console.error('Error fetching all trades:', error)
        } finally {
            setIsLoading(false)
            setIsRequestPending(false)
        }
    }, [isRequestPending])

    const fetchOpenTrades = useCallback(async () => {
        if (isRequestPending) return

        setIsLoading(true)
        setIsRequestPending(true)
        try {
            const clientToken = localStorage.getItem("clientToken") || "";

            const response = await fetch(`${API_BASE_URL}/api/trading/open`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${clientToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json()

            if (result.success && result.data) {
                setOpenTradesData(result.data)
                setLastUpdated(new Date())
            }
        } catch (error) {
            console.error('Error fetching open trades:', error)
        } finally {
            setIsLoading(false)
            setIsRequestPending(false)
        }
    }, [isRequestPending])

    const fetchClosedTrades = useCallback(async () => {
        if (isRequestPending) return

        setIsLoading(true)
        setIsRequestPending(true)
        try {
            const clientToken = localStorage.getItem("clientToken") || "";

            const response = await fetch(`${API_BASE_URL}/api/trading/closed`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${clientToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json()

            if (result.success && result.data) {
                setClosedTradesData(result.data)
                setLastUpdated(new Date())
            }
        } catch (error) {
            console.error('Error fetching closed trades:', error)
        } finally {
            setIsLoading(false)
            setIsRequestPending(false)
        }
    }, [isRequestPending])

    // Fetch data based on active tab
    const fetchCurrentTabData = useCallback(() => {
        switch (activeTab) {
            case "all":
                fetchAllTrades()
                break
            case "open":
                fetchOpenTrades()
                break
            case "closed":
                fetchClosedTrades()
                break
        }
    }, [activeTab, fetchAllTrades, fetchOpenTrades, fetchClosedTrades])

    // Initial load and tab change
    useEffect(() => {
        fetchCurrentTabData()
        setCurrentPage(1) // Reset page when tab changes
    }, [activeTab])

    // Auto-refresh with 10 second interval but only if no request is pending
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isRequestPending) {
                fetchCurrentTabData()
            }
        }, 10000) // 10 seconds

        return () => clearInterval(interval)
    }, [fetchCurrentTabData, isRequestPending])

    // Get current trades based on active tab
    const getCurrentTrades = (): Trade[] => {
        switch (activeTab) {
            case "all":
                return [
                    ...(allTradesData.openTrades || []),
                    ...(allTradesData.closedTrades || [])
                ]
            case "open":
                return openTradesData?.trades || []
            case "closed":
                return closedTradesData?.trades || []
            default:
                return []
        }
    }

    const currentTrades = getCurrentTrades()

    // Get all unique symbols for filter
    const availableSymbols = [...new Set(currentTrades.map(trade => trade.symbol))].filter(Boolean)

    // Get all unique accounts for filter (using account number, not account name)
    const availableAccounts = [...new Set(currentTrades.map(trade => trade.account))].filter(Boolean)

    // Filter trades
    const filteredTrades = currentTrades.filter((trade) => {
        const searchMatch = searchTerm === "" ||
            trade.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trade.account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trade.accountName?.toLowerCase().includes(searchTerm.toLowerCase())

        const symbolMatch = symbolFilter === "all" || trade.symbol === symbolFilter
        const accountMatch = accountFilter === "all" || trade.account === accountFilter

        let profitMatch = true
        if (profitFilter !== "all") {
            const profitValue = getProfitNumber(trade.profit)
            switch (profitFilter) {
                case "profit":
                    profitMatch = profitValue > 0
                    break
                case "loss":
                    profitMatch = profitValue < 0
                    break
                case "breakeven":
                    profitMatch = profitValue === 0
                    break
            }
        }

        return searchMatch && symbolMatch && accountMatch && profitMatch
    })

    // Pagination
    const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedTrades = filteredTrades.slice(startIndex, startIndex + itemsPerPage)

    const formatPrice = (price: string | number | undefined) => {
        if (!price) return 'N/A'
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return isNaN(numPrice) ? price : numPrice.toFixed(5)
    }

    const formatProfit = (profit: string | number) => {
        if (!profit) return '$0.00'

        if (typeof profit === 'string' && profit.includes('$')) {
            return profit
        }

        const value = typeof profit === 'number' ? profit : parseFloat(profit || "0")
        return value >= 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`
    }

    const getProfitNumber = (profit: string | number) => {
        if (!profit) return 0

        if (typeof profit === 'string' && profit.includes('$')) {
            const numStr = profit.replace(/[$+\-,]/g, '')
            const num = parseFloat(numStr)
            return profit.includes('-') ? -num : num
        }

        return typeof profit === 'number' ? profit : parseFloat(profit || "0")
    }

    const formatDateTime = (dateTime: string | undefined) => {
        if (!dateTime || dateTime === 'N/A') return '-'
        try {
            let date: Date
            if (dateTime.includes(' ')) {
                const normalizedDate = dateTime.replace(/\./g, '-').replace(' ', 'T')
                date = new Date(normalizedDate)
            } else {
                date = new Date(dateTime)
            }

            if (isNaN(date.getTime())) {
                return dateTime
            }

            return date.toLocaleString()
        } catch {
            return dateTime
        }
    }

    // Get statistics based on current tab
    const getStatistics = () => {
        switch (activeTab) {
            case "all":
                return {
                    openTrades: allTradesData.totalOpenTrades || 0,
                    closedTrades: allTradesData.totalClosedTrades || 0,
                    profitableTrades: currentTrades.filter(t => getProfitNumber(t.profit) > 0).length,
                    lossTrades: currentTrades.filter(t => getProfitNumber(t.profit) < 0).length,
                    totalProfit: currentTrades.reduce((sum, t) => sum + getProfitNumber(t.profit), 0)
                }
            case "open":
                return {
                    openTrades: openTradesData?.total || 0,
                    closedTrades: 0,
                    profitableTrades: (openTradesData?.trades || []).filter(t => getProfitNumber(t.profit) > 0).length,
                    lossTrades: (openTradesData?.trades || []).filter(t => getProfitNumber(t.profit) < 0).length,
                    totalProfit: openTradesData?.totalProfit || 0
                }
            case "closed":
                return {
                    openTrades: 0,
                    closedTrades: closedTradesData?.total || 0,
                    profitableTrades: closedTradesData?.profitableTrades || 0,
                    lossTrades: closedTradesData?.losingTrades || 0,
                    totalProfit: closedTradesData?.totalProfit || 0
                }
            default:
                return {
                    openTrades: 0,
                    closedTrades: 0,
                    profitableTrades: 0,
                    lossTrades: 0,
                    totalProfit: 0
                }
        }
    }

    const stats = getStatistics()

    const clearFilters = () => {
        setSearchTerm("")
        setSymbolFilter("all")
        setAccountFilter("all")
        setProfitFilter("all")
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen transition-colors duration-200">
            <div className="space-y-6 p-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Trading Contest
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            View and monitor all your account trades in real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchCurrentTabData}
                            disabled={isLoading}
                            className="bg-card border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </Button>
                        {lastUpdated && (
                            <div className="text-sm text-slate-500 dark:text-slate-400 bg-card px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {activeTab === 'open' ? 'Open Trades' : activeTab === 'closed' ? 'Closed Trades' : 'Total Trades'}
                                </span>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {activeTab === 'open' ? stats.openTrades : activeTab === 'closed' ? stats.closedTrades : stats.openTrades + stats.closedTrades}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Profitable</span>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.profitableTrades}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Loss Trades</span>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lossTrades}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total P&L</span>
                                <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatProfit(stats.totalProfit)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-card border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    {/* Tab Navigation */}
                    <div className="border-b border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant={activeTab === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("all")}
                                className={`transition-all duration-200 ${activeTab === "all"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                    : "bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                                    }`}
                            >
                                <Activity className="mr-2 h-4 w-4" />
                                All Trades ({(allTradesData.totalOpenTrades || 0) + (allTradesData.totalClosedTrades || 0)})
                            </Button>
                            <Button
                                variant={activeTab === "open" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("open")}
                                className={`transition-all duration-200 ${activeTab === "open"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                    : "bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                                    }`}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Open ({openTradesData?.total || allTradesData.totalOpenTrades || 0})
                            </Button>
                            <Button
                                variant={activeTab === "closed" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("closed")}
                                className={`transition-all duration-200 ${activeTab === "closed"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                    : "bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                                    }`}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Closed ({closedTradesData?.total || allTradesData.totalClosedTrades || 0})
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-card">
                        <div className="space-y-4">
                            {/* Search and Clear */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="text"
                                        placeholder="Search by symbol, account, or account name..."
                                        className="pl-10 bg-card border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                                    <SelectTrigger className="bg-card border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                                        <SelectValue placeholder="Filter by Symbol" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-slate-200 dark:border-slate-700">
                                        <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Symbols</SelectItem>
                                        {availableSymbols.map(symbol => (
                                            <SelectItem key={symbol} value={symbol} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{symbol}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={accountFilter} onValueChange={setAccountFilter}>
                                    <SelectTrigger className="bg-card border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                                        <SelectValue placeholder="Filter by Account" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-slate-200 dark:border-slate-700">
                                        <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Accounts</SelectItem>
                                        {availableAccounts.map(account => (
                                            <SelectItem key={account} value={account} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{account}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={profitFilter} onValueChange={setProfitFilter}>
                                    <SelectTrigger className="bg-card border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                                        <SelectValue placeholder="Filter by P&L" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-slate-200 dark:border-slate-700">
                                        <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All P&L</SelectItem>
                                        <SelectItem value="profit" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Profitable Only</SelectItem>
                                        <SelectItem value="loss" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Loss Only</SelectItem>
                                        <SelectItem value="breakeven" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Break Even</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="p-6 block md:hidden space-y-4">
                        {paginatedTrades.map((trade, i) => (
                            <div key={`${trade.ticket}-${i}`} className="bg-card border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg text-slate-900 dark:text-slate-100">{trade.symbol}</span>
                                        <CustomBadge
                                            variant={trade.trade === "Buy" ? "default" : "destructive"}
                                        >
                                            {trade.trade === "Buy" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                            {trade.trade}
                                        </CustomBadge>
                                    </div>
                                    <CustomBadge variant={trade.status === "closed" ? "secondary" : "default"}>
                                        {trade.status === "closed" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                        {trade.status}
                                    </CustomBadge>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Account:</span>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{trade.account}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{trade.accountName}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Volume:</span>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{trade.volume}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500 dark:text-slate-400">P&L:</span>
                                        <p className={`text-lg font-bold ${getProfitNumber(trade.profit) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                            {formatProfit(trade.profit)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-card">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symbol</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Time</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Price</th>
                                    {activeTab !== "open" && (
                                        <>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Close Time</th>
                                            <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Close Price</th>
                                        </>
                                    )}
                                    {activeTab === "open" && (
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Price</th>
                                    )}
                                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volume</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">P&L</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-slate-200 dark:divide-slate-700">
                                {paginatedTrades.map((trade, i) => (
                                    <tr key={`${trade.ticket}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                                        <td className="px-3 py-2">
                                            <div className="max-w-[120px]">
                                                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{trade.account}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{trade.accountName}</div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{trade.symbol}</span>
                                        </td>
                                        <td className="px-2 py-2">
                                            <CustomBadge variant={trade.trade === "Buy" ? "default" : "destructive"} className="text-xs px-1.5 py-0.5">
                                                {trade.trade === "Buy" ? <ArrowUp className="h-2.5 w-2.5 mr-1" /> : <ArrowDown className="h-2.5 w-2.5 mr-1" />}
                                                {trade.trade}
                                            </CustomBadge>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-xs text-slate-700 dark:text-slate-300 max-w-[140px] truncate">
                                                {formatDateTime(trade.openTime)}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                                {formatPrice(trade.openPrice)}
                                            </span>
                                        </td>
                                        {activeTab !== "open" && (
                                            <>
                                                <td className="px-3 py-2">
                                                    <div className="text-xs text-slate-700 dark:text-slate-300 max-w-[140px] truncate">
                                                        {formatDateTime(trade.closeTime)}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                                        {formatPrice(trade.closePrice)}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === "open" && (
                                            <td className="px-2 py-2">
                                                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                                    {formatPrice(trade.currentPrice)}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-2 py-2">
                                            <span className="text-xs text-slate-700 dark:text-slate-300">
                                                {trade.volume}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`text-sm font-bold ${getProfitNumber(trade.profit) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                {formatProfit(trade.profit)}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            <CustomBadge variant={trade.status === "closed" ? "secondary" : "default"} className="text-xs px-1.5 py-0.5">
                                                {trade.status === "closed" ? <CheckCircle className="h-2.5 w-2.5 mr-1" /> : <Clock className="h-2.5 w-2.5 mr-1" />}
                                                {trade.status}
                                            </CustomBadge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* No Data Message */}
                    {filteredTrades.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-24 h-24 bg-card rounded-full flex items-center justify-center mb-4">
                                <Activity className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No trades found</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                {searchTerm || symbolFilter !== "all" || accountFilter !== "all" || profitFilter !== "all"
                                    ? "Try adjusting your filters or search criteria."
                                    : "No trading data available at this time."
                                }
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredTrades.length > 0 && (
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-card">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Showing <span className="font-medium text-slate-900 dark:text-slate-100">{startIndex + 1}</span> to{" "}
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(startIndex + itemsPerPage, filteredTrades.length)}</span> of{" "}
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{filteredTrades.length}</span> trades
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-10 h-10 ${currentPage === pageNum
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                                        : "bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                                                        } transition-all duration-200`}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                        {totalPages > 5 && (
                                            <>
                                                <span className="text-slate-400 dark:text-slate-500 px-2">...</span>
                                                <Button
                                                    variant={currentPage === totalPages ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(totalPages)}
                                                    className={`w-10 h-10 ${currentPage === totalPages
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                                        : "bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                                                        } transition-all duration-200`}
                                                >
                                                    {totalPages}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="bg-card border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TradingContest