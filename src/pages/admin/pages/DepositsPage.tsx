"use client"

import { useState } from "react"
import { Search, Filter, Download, ChevronDown, X, MoreHorizontal, Check, FileText } from "lucide-react"
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
const deposits = [
    {
        id: 1,
        user: {
            name: "John Smith",
            email: "john@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10023",
        amount: 5000,
        planType: "Standard",
        paymentMethod: "Bank Transfer",
        bonus: 250,
        document: true,
        requestedOn: "2025-03-10T14:30:00",
        status: "Approved",
    },
    {
        id: 2,
        user: {
            name: "Emily Johnson",
            email: "emily@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10024",
        amount: 10000,
        planType: "Premium",
        paymentMethod: "Credit Card",
        bonus: 500,
        document: true,
        requestedOn: "2025-03-11T09:15:00",
        status: "Pending",
    },
    {
        id: 3,
        user: {
            name: "Michael Chen",
            email: "michael@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10025",
        amount: 2500,
        planType: "Basic",
        paymentMethod: "Cryptocurrency",
        bonus: 100,
        document: false,
        requestedOn: "2025-03-11T16:45:00",
        status: "Pending",
    },
    {
        id: 4,
        user: {
            name: "Sarah Williams",
            email: "sarah@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10026",
        amount: 7500,
        planType: "Standard",
        paymentMethod: "Bank Transfer",
        bonus: 375,
        document: true,
        requestedOn: "2025-03-09T11:20:00",
        status: "Approved",
    },
    {
        id: 5,
        user: {
            name: "David Rodriguez",
            email: "david@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10027",
        amount: 15000,
        planType: "Premium",
        paymentMethod: "Credit Card",
        bonus: 750,
        document: true,
        requestedOn: "2025-03-12T08:30:00",
        status: "Pending",
    },
    {
        id: 6,
        user: {
            name: "Lisa Kim",
            email: "lisa@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "ACC10028",
        amount: 3000,
        planType: "Basic",
        paymentMethod: "E-Wallet",
        bonus: 150,
        document: false,
        requestedOn: "2025-03-10T13:10:00",
        status: "Rejected",
    },
]

const DepositsPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

    // Filter deposits based on search and filters
    const filteredDeposits = deposits.filter((deposit) => {
        // Search filter
        const matchesSearch =
            searchTerm === "" ||
            deposit.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deposit.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deposit.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())

        // Status filter
        const matchesStatus = selectedStatus === null || deposit.status === selectedStatus

        // Plan Type filter
        const matchesPlanType = selectedPlanType === null || deposit.planType === selectedPlanType

        // Payment Method filter
        const matchesPaymentMethod = selectedPaymentMethod === null || deposit.paymentMethod === selectedPaymentMethod

        return matchesSearch && matchesStatus && matchesPlanType && matchesPaymentMethod
    })

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedStatus(null)
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

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Check className="mr-1 h-3 w-3" /> Approved
                    </Badge>
                )
            case "Pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "Rejected":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                        <X className="mr-1 h-3 w-3" /> Rejected
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h1 className="text-2xl font-bold">Deposits</h1>
                <Button>Add New Deposit</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deposit List</CardTitle>
                    <CardDescription>Manage and view all deposit requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        {/* Search and filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, email, or account..."
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
                                    <DropdownMenuContent align="end" className="w-[200px]">
                                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Status</p>
                                            <Select value={selectedStatus || ""} onValueChange={setSelectedStatus}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Statuses</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
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
                                                    <SelectItem value="">All Plans</SelectItem>
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
                                                    <SelectItem value="">All Methods</SelectItem>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                    <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                                                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={resetFilters}>
                                            <X className="mr-2 h-4 w-4" />
                                            Reset Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* Applied filters */}
                        {(selectedStatus || selectedPlanType || selectedPaymentMethod) && (
                            <div className="flex flex-wrap gap-2">
                                {selectedStatus && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Status: {selectedStatus}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedStatus(null)}
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
                                        <TableHead>Plan Type</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Requested On</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDeposits.map((deposit) => (
                                        <TableRow key={deposit.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={deposit.user.avatar} alt={deposit.user.name} />
                                                        <AvatarFallback>{deposit.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{deposit.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{deposit.user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{deposit.accountNumber}</TableCell>
                                            <TableCell>${deposit.amount.toLocaleString()}</TableCell>
                                            <TableCell>{deposit.planType}</TableCell>
                                            <TableCell>{deposit.paymentMethod}</TableCell>
                                            <TableCell>${deposit.bonus.toLocaleString()}</TableCell>
                                            <TableCell>
                                                {deposit.document ? (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(deposit.requestedOn)}</TableCell>
                                            <TableCell>{getStatusBadge(deposit.status)}</TableCell>
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
                                                        {deposit.status === "Pending" && (
                                                            <>
                                                                <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                                                            </>
                                                        )}
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
                                Showing <strong>{filteredDeposits.length}</strong> of <strong>{deposits.length}</strong> deposits
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

export default DepositsPage

