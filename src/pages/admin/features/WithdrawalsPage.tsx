// Frontend\src\pages\admin\features\WithdrawalsPage.tsx

"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, ChevronDown, X, MoreHorizontal, FileText, Eye, ThumbsUp, ThumbsDown } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import withdrawalService from "@/pages/admin/features/WithdrawalService"
import { ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

interface BankDetails {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
}

interface EWalletDetails {
    walletId: string;
    type: string;
}

interface Withdrawal {
    _id: string;
    user: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
        avatar?: string;
    };
    account: {
        _id: string;
        mt5Account: string;
        balance: number;
        accountType: string;
    };
    amount: number;
    paymentMethod: string;
    bankDetails?: BankDetails;
    eWalletDetails?: EWalletDetails;
    requestedDate: string;
    status: string;
    remarks?: string;
    approvedDate?: string;
    rejectedDate?: string;
}

const WithdrawalsPage = () => {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
    const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectRemarks, setRejectRemarks] = useState("")
    const [approvalRemarks, setApprovalRemarks] = useState("Congratulations")

    const [statusOptions, setStatusOptions] = useState<string[]>([])
    const [paymentMethodOptions, setPaymentMethodOptions] = useState<string[]>([])
    const [planTypeOptions, setPlanTypeOptions] = useState<string[]>([])


    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [isViewingDetails, setIsViewingDetails] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)


    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const fetchWithdrawals = async () => {
        try {
            setLoading(true)
            const data = await withdrawalService.getAllWithdrawals()
            setWithdrawals(data)

            const uniqueStatuses = [...new Set(data.map((item: Withdrawal) => item.status as string))]
            const uniquePaymentMethods = [...new Set(data.map((item: Withdrawal) => item.paymentMethod))]
            const uniquePlanTypes = [...new Set(data.map((item: Withdrawal) => item.account.accountType))]

            setStatusOptions(uniqueStatuses as string[])
            setPaymentMethodOptions(uniquePaymentMethods as string[])
            setPlanTypeOptions(uniquePlanTypes as string[])
        } catch (error) {
            console.error('Error fetching withdrawals:', error)
            toast.error('Failed to fetch withdrawals')
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            // Toggle sort direction
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field selected — default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    {
        sortField === 'columnName' ?
            (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />) :
            <ArrowUp className="h-4 w-4 ml-1" />
    }
    const filterWithdrawals = () => {
        let filtered = [...withdrawals]

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((withdrawal) => {
                const fullName = `${withdrawal.user.firstname} ${withdrawal.user.lastname}`.toLowerCase()
                return (
                    fullName.includes(searchTerm.toLowerCase()) ||
                    withdrawal.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    withdrawal.account.mt5Account.toLowerCase().includes(searchTerm.toLowerCase())
                )
            })
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(withdrawal => withdrawal.status === selectedStatus)
        }

        // Payment Method filter
        if (selectedPaymentMethod) {
            filtered = filtered.filter(withdrawal => withdrawal.paymentMethod === selectedPaymentMethod)
        }

        // Plan Type filter
        if (selectedPlanType) {
            filtered = filtered.filter(withdrawal => withdrawal.account.accountType === selectedPlanType)
        }

        // Date filter
        if (startDate && endDate) {
            filtered = filtered.filter(withdrawal => {
                const requestedDate = new Date(withdrawal.requestedDate)
                return requestedDate >= new Date(startDate) && requestedDate <= new Date(endDate)
            })
        }

        // Sort
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue, bValue

                switch (sortField) {
                    case 'amount':
                        aValue = a.amount
                        bValue = b.amount
                        break
                    case 'status':
                        aValue = a.status
                        bValue = b.status
                        break
                    case 'date':
                        aValue = new Date(a.requestedDate).getTime()
                        bValue = new Date(b.requestedDate).getTime()
                        break
                    case 'paymentMethod':
                        aValue = a.paymentMethod
                        bValue = b.paymentMethod
                        break
                    case 'planType':
                        aValue = a.account.accountType
                        bValue = b.account.accountType
                        break
                    default:
                        return 0
                }

                if (sortDirection === 'asc') {
                    return aValue > bValue ? 1 : -1
                } else {
                    return aValue < bValue ? 1 : -1
                }
            })
        }

        return filtered
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved":
                return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
            case "Pending":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
            case "Rejected":
                return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Update the handleApprove function
    const handleApprove = async (withdrawalId: string) => {
        try {
            setIsApproving(true)
            await withdrawalService.approveWithdrawal(withdrawalId, {
                remarks: approvalRemarks
            })

            // Update only the specific withdrawal in the state instead of refetching all
            setWithdrawals(prev =>
                prev.map(w =>
                    w._id === withdrawalId
                        ? { ...w, status: 'Approved', approvedDate: new Date().toISOString(), remarks: approvalRemarks }
                        : w
                )
            )

            // Show success message
            toast.success('Withdrawal approved successfully')
        } catch (error) {
            console.error('Error approving withdrawal:', error)
            toast.error('Failed to approve withdrawal')
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async (withdrawalId: string) => {
        if (!rejectRemarks.trim()) {
            alert('Remarks are required for rejection')
            return
        }

        try {
            setIsRejecting(true)
            await withdrawalService.rejectWithdrawal(withdrawalId, {
                remarks: rejectRemarks
            })

            // Update only the specific withdrawal in the state
            setWithdrawals(prev =>
                prev.map(w =>
                    w._id === withdrawalId
                        ? { ...w, status: 'Rejected', rejectedDate: new Date().toISOString(), remarks: rejectRemarks }
                        : w
                )
            )

            setRejectDialogOpen(false)
            setRejectRemarks("")

            // Show success message
            toast.error('Withdrawal rejected')
        } catch (error) {
            console.error('Error rejecting withdrawal:', error)
            toast.error('Failed to reject withdrawal')
        } finally {
            setIsRejecting(false)
        }
    }

    const handleViewDetails = (withdrawal: Withdrawal) => {
        setIsViewingDetails(true)
        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
            setSelectedWithdrawal(withdrawal)
            setDetailsOpen(true)
            setIsViewingDetails(false)
        }, 0)
    }

    const handleExport = (format: string) => {
        try {
            const filteredData = filterWithdrawals()
            withdrawalService.exportWithdrawals(filteredData, format)
            toast.success(`Withdrawals exported as ${format.toUpperCase()} successfully`)
        } catch (error) {
            console.error(`Error exporting as ${format}:`, error)
            toast.error(`Failed to export as ${format}`)
        }
    }

    const paginateWithdrawals = (items: Withdrawal[]) => {
        const indexOfLastItem = currentPage * itemsPerPage
        const indexOfFirstItem = indexOfLastItem - itemsPerPage
        return items.slice(indexOfFirstItem, indexOfLastItem)
    }

    const PaymentDetailsDialog = ({ withdrawal }: { withdrawal: Withdrawal | null }) => {
        if (!withdrawal) return null

        const bankDetails = withdrawal.bankDetails
        const eWalletDetails = withdrawal.eWalletDetails

        return (
            <Dialog open={paymentDetailsOpen} onOpenChange={setPaymentDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                        <DialogDescription>
                            {withdrawal.paymentMethod} details for withdrawal #{withdrawal._id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {withdrawal.paymentMethod.toLowerCase().includes('bank') && bankDetails ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Bank Name</p>
                                        <p className="text-sm text-gray-600">{bankDetails.bankName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Account Holder Name</p>
                                        <p className="text-sm text-gray-600">{bankDetails.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Account Number</p>
                                        <p className="text-sm text-gray-600">{bankDetails.accountNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">IFSC Code</p>
                                        <p className="text-sm text-gray-600">{bankDetails.ifscCode}</p>
                                    </div>
                                </div>
                            </>
                        ) : eWalletDetails ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Wallet ID</p>
                                        <p className="text-sm text-gray-600">{eWalletDetails.walletId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Wallet Type</p>
                                        <p className="text-sm text-gray-600">{eWalletDetails.type}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-600">No payment details available</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    const DetailsDialog = ({ withdrawal }: { withdrawal: Withdrawal | null }) => {
        if (!withdrawal) return null

        return (
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Withdrawal Details</DialogTitle>
                        <DialogDescription>
                            Complete information for withdrawal #{withdrawal._id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">User Name</p>
                                <p className="text-sm text-gray-600">{`${withdrawal.user.firstname} ${withdrawal.user.lastname}`}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-gray-600">{withdrawal.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Account Number</p>
                                <p className="text-sm text-gray-600">{withdrawal.account.mt5Account}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Balance</p>
                                <p className="text-sm text-gray-600">${withdrawal.account.balance.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Withdrawal Amount</p>
                                <p className="text-sm text-gray-600">${withdrawal.amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Plan Type</p>
                                <p className="text-sm text-gray-600">{withdrawal.account.accountType}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Payment Method</p>
                                <p className="text-sm text-gray-600">{withdrawal.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Status</p>
                                {getStatusBadge(withdrawal.status)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Requested Date</p>
                                <p className="text-sm text-gray-600">{formatDate(withdrawal.requestedDate)}</p>
                            </div>
                            {withdrawal.approvedDate && (
                                <div>
                                    <p className="text-sm font-medium">Approved Date</p>
                                    <p className="text-sm text-gray-600">{formatDate(withdrawal.approvedDate)}</p>
                                </div>
                            )}
                            {withdrawal.rejectedDate && (
                                <div>
                                    <p className="text-sm font-medium">Rejected Date</p>
                                    <p className="text-sm text-gray-600">{formatDate(withdrawal.rejectedDate)}</p>
                                </div>
                            )}
                            {withdrawal.remarks && (
                                <div className="col-span-2">
                                    <p className="text-sm font-medium">Remarks</p>
                                    <p className="text-sm text-gray-600">{withdrawal.remarks}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Payment Details</h4>
                            {withdrawal.paymentMethod.toLowerCase().includes('bank') && withdrawal.bankDetails ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Bank Name</p>
                                        <p className="text-sm text-gray-600">{withdrawal.bankDetails.bankName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Account Holder Name</p>
                                        <p className="text-sm text-gray-600">{withdrawal.bankDetails.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Account Number</p>
                                        <p className="text-sm text-gray-600">{withdrawal.bankDetails.accountNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">IFSC Code</p>
                                        <p className="text-sm text-gray-600">{withdrawal.bankDetails.ifscCode}</p>
                                    </div>
                                </div>
                            ) : withdrawal.eWalletDetails ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Wallet ID</p>
                                        <p className="text-sm text-gray-600">{withdrawal.eWalletDetails.walletId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Wallet Type</p>
                                        <p className="text-sm text-gray-600">{withdrawal.eWalletDetails.type}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No payment details available</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal List</CardTitle>
                    <CardDescription>Manage and view all withdrawal requests</CardDescription>
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
                                    <DropdownMenuContent align="end" className="w-[320px]">
                                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Status</p>
                                            <Select value={selectedStatus || ""} onValueChange={setSelectedStatus}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    {statusOptions.map(status => (
                                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                                    ))}
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
                                                    {paymentMethodOptions.map(method => (
                                                        <SelectItem key={method} value={method}>{method}</SelectItem>
                                                    ))}
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
                                                    {planTypeOptions.map(plan => (
                                                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                                                    ))}
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
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedStatus(null)
                                            setSelectedPaymentMethod(null)
                                            setSelectedPlanType(null)
                                            setStartDate(null)
                                            setEndDate(null)
                                        }}>
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
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            Export as Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                                            Export as CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('docx')}>
                                            Export as DOCX
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Applied filters */}
                        {(selectedStatus || selectedPaymentMethod || selectedPlanType || startDate || endDate) && (
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
                                {startDate && endDate && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Date: {startDate} to {endDate}
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
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                                    setSelectedStatus(null)
                                    setSelectedPaymentMethod(null)
                                    setSelectedPlanType(null)
                                    setStartDate(null)
                                    setEndDate(null)
                                }}>
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {/* Table */}
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : filterWithdrawals().length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No withdrawals found
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table className="w-full table-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[15%]">User</TableHead>
                                            <TableHead className="w-[10%]">Account Number</TableHead>
                                            <TableHead className="w-[8%]">Balance</TableHead>
                                            <TableHead className="w-[12%]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('amount')}
                                                    className="flex items-center"
                                                >
                                                    Withdrawal Amount
                                                    {sortField === 'amount' ?
                                                        (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />) :
                                                        <ArrowUp className="h-4 w-4 ml-1" />
                                                    }
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[10%]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('planType')}
                                                    className="flex items-center"
                                                >
                                                    PlanType
                                                    {sortField === 'planType' ?
                                                        (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />) :
                                                        <ArrowUp className="h-4 w-4 ml-1" />
                                                    }
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[12%]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('paymentMethod')}
                                                    className="flex items-center"
                                                >
                                                    Payment Method
                                                    {sortField === 'paymentMethod' ?
                                                        (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />) :
                                                        <ArrowUp className="h-4 w-4 ml-1" />
                                                    }
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[8%]">Withdrawal Details</TableHead>
                                            <TableHead className="w-[10%]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('date')}
                                                    className="flex items-center"
                                                >
                                                    Requested On
                                                    {sortField === 'date' ?
                                                        (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />) :
                                                        <ArrowUp className="h-4 w-4 ml-1" />
                                                    }
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[7%]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('status')}
                                                    className="flex items-center"
                                                >
                                                    Status
                                                    {sortField === 'status' ?
                                                        (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />) :
                                                        <ArrowUp className="h-4 w-4 ml-1" />
                                                    }
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[8%]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginateWithdrawals(filterWithdrawals()).map((withdrawal) => (
                                            <TableRow key={withdrawal._id}>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="flex-shrink-0">
                                                            <AvatarImage src={withdrawal.user.avatar} alt={`${withdrawal.user.firstname} ${withdrawal.user.lastname}`} />
                                                            <AvatarFallback>
                                                                {withdrawal.user && withdrawal.user.firstname
                                                                    ? withdrawal.user.firstname.charAt(0)
                                                                    : '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{`${withdrawal.user.firstname} ${withdrawal.user.lastname}`}</div>
                                                            <div className="text-sm text-muted-foreground truncate">{withdrawal.user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{withdrawal.account.mt5Account}</TableCell>
                                                <TableCell>${withdrawal.account.balance.toLocaleString()}</TableCell>
                                                <TableCell >
                                                    <p className="flex flex-row items-center justify-center">
                                                        ${withdrawal.amount.toLocaleString()}
                                                    </p>
                                                </TableCell>
                                                <TableCell><p className="flex flex-row items-center justify-center">{withdrawal.account.accountType}</p></TableCell>
                                                <TableCell><p className="flex flex-row items-center justify-center">{withdrawal.paymentMethod}</p></TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            setSelectedWithdrawal(withdrawal)
                                                            setPaymentDetailsOpen(true)
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{formatDate(withdrawal.requestedDate)}</TableCell>
                                                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => {
                                                                handleViewDetails(withdrawal)
                                                            }} disabled={isViewingDetails}>
                                                                {isViewingDetails ? (
                                                                    <>Loading...</>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            {withdrawal.status === "Pending" && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-green-600"
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(withdrawal)
                                                                            handleApprove(withdrawal._id)
                                                                        }}
                                                                        disabled={isApproving}
                                                                    >
                                                                        {isApproving ? (
                                                                            <>Loading...</>
                                                                        ) : (
                                                                            <>
                                                                                <ThumbsUp className="mr-2 h-4 w-4" />
                                                                                Approve
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(withdrawal)
                                                                            setRejectDialogOpen(true)
                                                                        }}
                                                                        disabled={isRejecting}
                                                                    >
                                                                        <ThumbsDown className="mr-2 h-4 w-4" />
                                                                        Reject
                                                                    </DropdownMenuItem>
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
                        )}
                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filterWithdrawals().length)} of {filterWithdrawals().length} items
                            </div>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(value) => {
                                        setItemsPerPage(Number(value))
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="10 per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 per page</SelectItem>
                                        <SelectItem value="10">10 per page</SelectItem>
                                        <SelectItem value="20">20 per page</SelectItem>
                                        <SelectItem value="50">50 per page</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronDown className="h-4 w-4 rotate-90" />
                                    </Button>
                                    <div className="text-sm">
                                        Page {currentPage} of {Math.ceil(filterWithdrawals().length / itemsPerPage) || 1}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filterWithdrawals().length / itemsPerPage)))}
                                        disabled={currentPage >= Math.ceil(filterWithdrawals().length / itemsPerPage)}
                                    >
                                        <ChevronDown className="h-4 w-4 -rotate-90" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Details Dialog */}
            <PaymentDetailsDialog withdrawal={selectedWithdrawal} />

            {/* Full Details Dialog */}
            <DetailsDialog withdrawal={selectedWithdrawal} />

            {/* Reject Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Withdrawal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this withdrawal. This will be recorded in the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                        <Textarea
                            placeholder="Enter rejection reason (required)"
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectRemarks("")}>Cancel</AlertDialogCancel>
                        // For the Reject Dialog
                        <AlertDialogAction
                            onClick={() => selectedWithdrawal && handleReject(selectedWithdrawal._id)}
                            disabled={!rejectRemarks.trim() || isRejecting}
                        >
                            {isRejecting ? 'Processing...' : 'Reject Withdrawal'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default WithdrawalsPage