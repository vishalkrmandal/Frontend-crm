// Frontend\src\pages\admin\features\TransactionsPage.tsx
"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, ChevronDown, X, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import axios from "axios"

// Transaction type definition
interface Transaction {
    id: string
    user: {
        name: string
        email: string
        avatar?: string
    }
    accountNumber?: string
    fromAccountNumber?: string
    toAccountNumber?: string
    amount: number
    paymentMethod: string
    type: 'Deposit' | 'Withdrawal' | 'Transfer'
    planType: string
    // document: boolean
    requestedOn: string
    completedOn?: string
    status: string
    bankDetails?: {
        bankName: string
        accountHolderName: string
        accountNumber: string
        ifscCode: string
    }
}

// API response type
interface ApiResponse {
    success: boolean
    count: number
    data: Transaction[]
}

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

    // const closeButtonRef = useRef(null);

    // Fetch transactions data
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true)
                // In a real implementation, this would be an API call
                // For now, we'll use a simulated delay and sample data
                const response = await axios.get<ApiResponse>('http://localhost:5000/api/admin/transactions', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })

                // Extract the transactions array from the response data
                setTransactions(response.data.data || [])
                setLoading(false)
            } catch (err) {
                console.error('Error fetching transactions:', err)
                setError('Failed to load transactions')
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [])

    // Sort handler
    const handleSort = (field: string) => {
        if (sortField === field) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            // Set new field and default to descending
            setSortField(field)
            setSortDirection('desc')
        }
    }

    // Filter transactions based on search and filters
    const filteredTransactions = transactions.filter((transaction) => {
        // Search filter
        const matchesSearch =
            searchTerm === "" ||
            transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.accountNumber && transaction.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        // || transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

        // Type filter
        const matchesType = selectedType === null || selectedType === 'all' || transaction.type === selectedType

        // Plan Type filter
        const matchesPlanType = selectedPlanType === null || selectedPlanType === 'all' ||
            transaction.planType.toLowerCase().includes(selectedPlanType.toLowerCase())

        // Payment Method filter
        const matchesPaymentMethod = selectedPaymentMethod === null || selectedPaymentMethod === 'all' ||
            transaction.paymentMethod.toLowerCase().includes(selectedPaymentMethod.toLowerCase())

        // Date filter
        let matchesDateRange = true
        if (startDate && endDate) {
            const transactionDate = new Date(transaction.requestedOn)
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59) // Set to end of day
            matchesDateRange = transactionDate >= start && transactionDate <= end
        }

        return matchesSearch && matchesType && matchesPlanType && matchesPaymentMethod && matchesDateRange
    })

    // Sort transactions
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (!sortField) return 0

        let valueA, valueB

        switch (sortField) {
            case 'amount':
                valueA = a.amount
                valueB = b.amount
                break
            case 'requestedOn':
                valueA = new Date(a.requestedOn).getTime()
                valueB = new Date(b.requestedOn).getTime()
                break
            case 'completedOn':
                valueA = a.completedOn ? new Date(a.completedOn).getTime() : 0
                valueB = b.completedOn ? new Date(b.completedOn).getTime() : 0
                break
            case 'type':
                valueA = a.type
                valueB = b.type
                break
            default:
                return 0
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
        return 0
    })

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedType(null)
        setSelectedPlanType(null)
        setSelectedPaymentMethod(null)
        setStartDate(null)
        setEndDate(null)
        setSortField(null)
    }

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return format(date, 'MMM d, yyyy h:mm a')
        } catch (err) {
            return 'Invalid Date'
        }
    }

    // Get type badge
    const getTypeBadge = (type: string) => {
        switch (type) {
            case "Deposit":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Deposit
                    </Badge>
                )
            case "Withdrawal":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                        Withdrawal
                    </Badge>
                )
            case "Transfer":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Transfer
                    </Badge>
                )
            default:
                return <Badge variant="outline">{type}</Badge>
        }
    }

    // Format amount with color based on transaction type
    const formatAmount = (amount: number, type: string) => {
        switch (type) {
            case "Deposit":
                return <span className="text-green-600">+${amount.toLocaleString()}</span>
            case "Withdrawal":
                return <span className="text-red-600">-${amount.toLocaleString()}</span>
            case "Transfer":
                return <span className="text-yellow-600">${amount.toLocaleString()}</span>
            default:
                return <span>${amount.toLocaleString()}</span>
        }
    }

    // Removed unused getAccountNumber function

    // // Export handlers
    // const exportAsExcel = () => {
    //     // In a real implementation, this would generate an Excel file
    //     alert('Exporting as Excel is not implemented in this demo')
    // }

    // const exportAsPDF = () => {
    //     // In a real implementation, this would generate a PDF
    //     alert('Exporting as PDF is not implemented in this demo')
    // }

    // View transaction details
    const viewTransactionDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setDetailsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View all financial transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        {/* Search and filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, email, account..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex gap-1">
                                            <Filter className="h-4 w-4" />
                                            Filters
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[320px]">
                                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Type</p>
                                            <Select value={selectedType || ""} onValueChange={setSelectedType}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Types" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="Deposit">Deposit</SelectItem>
                                                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                                                    <SelectItem value="Transfer">Transfer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Plan Type</p>
                                            <Select value={selectedPlanType || ""} onValueChange={setSelectedPlanType}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Plans" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Plans</SelectItem>
                                                    <SelectItem value="BASIC">Basic</SelectItem>
                                                    <SelectItem value="STANDARD">Standard</SelectItem>
                                                    <SelectItem value="CLASSIC">Classic</SelectItem>
                                                    <SelectItem value="PREMIUM">Premium</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Payment Method</p>
                                            <Select value={selectedPaymentMethod || ""} onValueChange={setSelectedPaymentMethod}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Methods" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Methods</SelectItem>
                                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                                    <SelectItem value="usdt">USDT</SelectItem>
                                                    <SelectItem value="ethereum">Ethereum</SelectItem>
                                                    <SelectItem value="Internal Transfer">Internal Transfer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Date Range</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    type="date"
                                                    value={startDate || ""}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    placeholder="Start Date"
                                                />
                                                <Input
                                                    type="date"
                                                    value={endDate || ""}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    placeholder="End Date"
                                                />
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={resetFilters}>
                                            <X className="mr-2 h-4 w-4" />
                                            Reset Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={exportAsPDF}>
                                            Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={exportAsExcel}>
                                            Export as Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu> */}
                            </div>
                        </div>

                        {/* Applied filters */}
                        {(selectedType || selectedPlanType || selectedPaymentMethod || startDate || endDate) && (
                            <div className="flex flex-wrap gap-2">
                                {selectedType && selectedType !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Type: {selectedType}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedType(null)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                {selectedPlanType && selectedPlanType !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Plan: {selectedPlanType}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedPlanType(null)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                {selectedPaymentMethod && selectedPaymentMethod !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Payment: {selectedPaymentMethod}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedPaymentMethod(null)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                {startDate && endDate && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Date: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => {
                                                setStartDate(null)
                                                setEndDate(null)
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {/* Loading and error states */}
                        {loading && (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
                                {error}
                            </div>
                        )}

                        {/* Table */}
                        {!loading && !error && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Account</TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                                                <div className="flex items-center">
                                                    Amount
                                                    {sortField === 'amount' && (
                                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                                                <div className="flex items-center">
                                                    Type
                                                    {sortField === 'type' && (
                                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead>Plan Type</TableHead>
                                            {/* <TableHead>Document</TableHead> */}
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('requestedOn')}>
                                                <div className="flex items-center">
                                                    Requested On
                                                    {sortField === 'requestedOn' && (
                                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('completedOn')}>
                                                <div className="flex items-center">
                                                    Completed On
                                                    {sortField === 'completedOn' && (
                                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                                                    No transactions found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sortedTransactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={transaction.user.avatar || "/placeholder.svg"} alt={transaction.user.name} />
                                                                <AvatarFallback>{transaction.user.name.charAt(0) || 'U'}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{transaction.user.name || 'Unknown User'}</div>
                                                                <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.type === 'Transfer' ? (
                                                            <div>
                                                                <div className="font-medium">{(transaction as any).fromAccount?.accountNumber}</div>
                                                                <div className="text-sm text-muted-foreground">→ {(transaction as any).toAccount?.accountNumber}</div>
                                                            </div>
                                                        ) : (
                                                            transaction.accountNumber
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{formatAmount(transaction.amount, transaction.type)}</TableCell>
                                                    <TableCell>{transaction.paymentMethod}</TableCell>
                                                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                                                    <TableCell>{transaction.planType}</TableCell>
                                                    {/* <TableCell>
                                                        {transaction.document ? (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <span className="text-muted-foreground">None</span>
                                                        )}
                                                    </TableCell> */}
                                                    <TableCell>{formatDate(transaction.requestedOn)}</TableCell>
                                                    <TableCell>{transaction.completedOn ? formatDate(transaction.completedOn) : 'Pending'}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Open menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => viewTransactionDetails(transaction)}>
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                {/* {transaction.document && (
                                                                    <DropdownMenuItem>
                                                                        Download Receipt
                                                                    </DropdownMenuItem>
                                                                )} */}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing <strong>{sortedTransactions.length}</strong> of <strong>{transactions.length}</strong>{" "}
                                    transactions
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" disabled>
                                        Previous
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl" >
                    {selectedTransaction && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedTransaction.type} Details
                                </DialogTitle>
                                {/* <DialogDescription>
                                    Complete information for {selectedTransaction.type.toLowerCase()} #{selectedTransaction.id}
                                </DialogDescription> */}
                            </DialogHeader>

                            <Tabs defaultValue="details" className="mt-4">
                                <TabsList className="grid w-full grid-cols-1">
                                    <TabsTrigger value="details">Transaction Details</TabsTrigger>
                                    {/* {selectedTransaction.type !== 'Transfer' && (
                                        <TabsTrigger value="payment">Payment Information</TabsTrigger>
                                    )} */}
                                </TabsList>

                                <TabsContent value="details" className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">User Name</p>
                                            <p className="font-medium">{selectedTransaction.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                                            <p>{selectedTransaction.user.email}</p>
                                        </div>
                                        {/* <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Transaction ID</p>
                                            <p className="font-mono text-sm">{selectedTransaction.id}</p>
                                        </div> */}
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                                            <p className="font-medium">{formatAmount(selectedTransaction.amount, selectedTransaction.type)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                                            <p>{getTypeBadge(selectedTransaction.type)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Payment Method</p>
                                            <p>{selectedTransaction.paymentMethod}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Plan Type</p>
                                            <p>{selectedTransaction.planType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                            <p>{selectedTransaction.status}</p>
                                        </div>
                                        {selectedTransaction.type === 'Transfer' ? (
                                            <>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">From Account</p>
                                                    <p>{selectedTransaction.fromAccountNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">To Account</p>
                                                    <p>{selectedTransaction.toAccountNumber}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                                                <p>{selectedTransaction.accountNumber}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Requested On</p>
                                            <p>{formatDate(selectedTransaction.requestedOn)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Completed On</p>
                                            <p>{selectedTransaction.completedOn ? formatDate(selectedTransaction.completedOn) : 'Pending'}</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                {selectedTransaction.type !== 'Transfer' && (
                                    <TabsContent value="payment" className="space-y-4 py-4">
                                        {selectedTransaction.paymentMethod === 'bank' && selectedTransaction.bankDetails ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Bank Name</p>
                                                    <p>{selectedTransaction.bankDetails.bankName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Holder</p>
                                                    <p>{selectedTransaction.bankDetails.accountHolderName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                                                    <p>{selectedTransaction.bankDetails.accountNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">IFSC Code</p>
                                                    <p>{selectedTransaction.bankDetails.ifscCode || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-muted-foreground">
                                                {selectedTransaction.paymentMethod === 'bitcoin' ||
                                                    selectedTransaction.paymentMethod === 'ethereum' ||
                                                    selectedTransaction.paymentMethod === 'usdt' ? (
                                                    <div className="space-y-4">
                                                        <p>Transaction was processed via {selectedTransaction.paymentMethod}.</p>
                                                        {/* {selectedTransaction.document && (
                                                            <Button variant="outline">
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                View Receipt
                                                            </Button>
                                                        )} */}
                                                    </div>
                                                ) : (
                                                    <p>No payment details available</p>
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>
                                )}
                            </Tabs>

                            {/* <div className="flex justify-end space-x-2 mt-6">
                                {selectedTransaction.document && (
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Receipt
                                    </Button>
                                )}
                                <Button onClick={() => setDetailsDialogOpen(false)}>
                                    Close
                                </Button>
                            </div> */}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TransactionsPage;