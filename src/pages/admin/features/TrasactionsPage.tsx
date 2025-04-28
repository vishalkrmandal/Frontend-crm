// Frontend\src\pages\admin\features\TrasactionsPage.tsx
"use client"

import { useState } from "react"
import { Search, Filter, Download, ChevronDown, X, MoreHorizontal, FileText } from "lucide-react"
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

// Sample data
const transactions = [
    {
        id: "TX12457",
        user: {
            name: "John Smith",
            email: "john@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10023",
        amount: 5000,
        paymentMethod: "Bank Transfer",
        type: "Deposit",
        planType: "Standard",
        document: true,
        requestedOn: "2025-03-10T14:30:00",
        completedOn: "2025-03-10T16:45:00",
    },
    {
        id: "TX59774",
        user: {
            name: "Emily Johnson",
            email: "emily@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10024",
        amount: 10000,
        paymentMethod: "Credit Card",
        type: "Deposit",
        planType: "Premium",
        document: true,
        requestedOn: "2025-03-11T09:15:00",
        completedOn: "2025-03-11T10:30:00",
    },
    {
        id: "TX22457",
        user: {
            name: "Michael Chen",
            email: "michael@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10025",
        amount: 1000,
        paymentMethod: "Cryptocurrency",
        type: "Withdrawal",
        planType: "Basic",
        document: false,
        requestedOn: "2025-03-11T16:45:00",
        completedOn: "2025-03-12T09:20:00",
    },
    {
        id: "TX33689",
        user: {
            name: "Sarah Williams",
            email: "sarah@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10026",
        amount: 3500,
        paymentMethod: "Bank Transfer",
        type: "Withdrawal",
        planType: "Standard",
        document: true,
        requestedOn: "2025-03-09T11:20:00",
        completedOn: "2025-03-09T15:45:00",
    },
    {
        id: "TX45872",
        user: {
            name: "David Rodriguez",
            email: "david@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10027",
        amount: 15000,
        paymentMethod: "Credit Card",
        type: "Deposit",
        planType: "Premium",
        document: true,
        requestedOn: "2025-03-12T08:30:00",
        completedOn: "2025-03-12T10:15:00",
    },
    {
        id: "TX67123",
        user: {
            name: "Lisa Kim",
            email: "lisa@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10028",
        amount: 1200,
        paymentMethod: "E-Wallet",
        type: "Withdrawal",
        planType: "Basic",
        document: false,
        requestedOn: "2025-03-10T13:10:00",
        completedOn: "2025-03-11T09:30:00",
    },
]

const TransactionsPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)

    // Filter transactions based on search and filters
    const filteredTransactions = transactions.filter((transaction) => {
        // Search filter
        const matchesSearch =
            searchTerm === "" ||
            transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

        // Type filter
        const matchesType = selectedType === null || transaction.type === selectedType

        // Plan Type filter
        const matchesPlanType = selectedPlanType === null || transaction.planType === selectedPlanType

        // Payment Method filter
        const matchesPaymentMethod = selectedPaymentMethod === null || transaction.paymentMethod === selectedPaymentMethod

        return matchesSearch && matchesType && matchesPlanType && matchesPaymentMethod
    })

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedType(null)
        setSelectedPlanType(null)
        setSelectedPaymentMethod(null)
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
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
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        Withdrawal
                    </Badge>
                )
            default:
                return <Badge variant="outline">{type}</Badge>
        }
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
                                    placeholder="Search by name, email, account, or transaction ID..."
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
                                                    <SelectItem value="Basic">Basic</SelectItem>
                                                    <SelectItem value="Standard">Standard</SelectItem>
                                                    <SelectItem value="Premium">Premium</SelectItem>
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
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                    <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                                                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem >
                                            Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem >
                                            Export as Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Applied filters */}
                        {(selectedType || selectedPlanType || selectedPaymentMethod) && (
                            <div className="flex flex-wrap gap-2">
                                {selectedType && (
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
                                {selectedPlanType && (
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
                                {selectedPaymentMethod && (
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
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Account Number</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Plan Type</TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Requested On</TableHead>
                                        <TableHead>Completed On</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={transaction.user.avatar} alt={transaction.user.name} />
                                                        <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{transaction.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{transaction.accountNumber}</TableCell>
                                            <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                                            <TableCell>{transaction.paymentMethod}</TableCell>
                                            <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                                            <TableCell>{transaction.planType}</TableCell>
                                            <TableCell>
                                                {transaction.document ? (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(transaction.requestedOn)}</TableCell>
                                            <TableCell>{formatDate(transaction.completedOn)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong>{" "}
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
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TransactionsPage

