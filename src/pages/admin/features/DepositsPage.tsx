"use client"

import { useState, useEffect } from "react"
import {
    Search, Filter, Download, ChevronDown, X, MoreHorizontal,
    Check, FileText, ArrowUpDown, Calendar
} from "lucide-react"
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
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import axios from "axios";

// // Sample data (this would come from API in a real application)
// const deposits = [
//     {
//         id: 1,
//         user: {
//             name: "John Smith",
//             email: "john@example.com",
//             avatar: "/placeholder.svg",
//         },
//         accountNumber: "ACC10023",
//         amount: 5000,
//         planType: "Standard",
//         paymentMethod: "Bank Transfer",
//         bonus: 250,
//         document: "/path/to/document.pdf",
//         requestedOn: "2025-03-10T14:30:00",
//         approvedOn: "2025-03-11T09:20:00",
//         status: "Approved",
//         remarks: "Congratulations! Your deposit has been processed."
//     },
//     {
//         id: 2,
//         user: {
//             name: "Emily Johnson",
//             email: "emily@example.com",
//             avatar: "/placeholder.svg",
//         },
//         accountNumber: "ACC10024",
//         amount: 10000,
//         planType: "Premium",
//         paymentMethod: "Credit Card",
//         bonus: 0,
//         document: "/path/to/document.jpg",
//         requestedOn: "2025-03-11T09:15:00",
//         status: "Pending",
//     },
//     {
//         id: 3,
//         user: {
//             name: "Michael Chen",
//             email: "michael@example.com",
//             avatar: "/placeholder.svg",
//         },
//         accountNumber: "ACC10025",
//         amount: 2500,
//         planType: "Basic",
//         paymentMethod: "Cryptocurrency",
//         bonus: 0,
//         document: null,
//         requestedOn: "2025-03-11T16:45:00",
//         status: "Pending",
//     },
//     {
//         id: 4,
//         user: {
//             name: "Sarah Williams",
//             email: "sarah@example.com",
//             avatar: "/placeholder.svg",
//         },
//         accountNumber: "ACC10026",
//         amount: 7500,
//         planType: "Standard",
//         paymentMethod: "Bank Transfer",
//         bonus: 375,
//         document: "/path/to/document.png",
//         requestedOn: "2025-03-09T11:20:00",
//         approvedOn: "2025-03-10T14:35:00",
//         status: "Approved",
//         remarks: "Congratulations! Your deposit has been processed."
//     },
//     {
//         id: 5,
//         user: {
//             name: "David Rodriguez",
//             email: "david@example.com",
//             avatar: "/placeholder.svg",
//         },
//         accountNumber: "ACC10027",
//         amount: 15000,
//         planType: "Premium",
//         paymentMethod: "Credit Card",
//         bonus: 0,
//         document: "/path/to/document.jpg",
//         requestedOn: "2025-03-12T08:30:00",
//         status: "Pending",
//     },
//     {
//         id: 6,
//         user: {
//             name: "Lisa Kim",
//             email: "lisa@example.com",
//             avatar: "/placeholder.svg",
//         },
//         accountNumber: "ACC10028",
//         amount: 3000,
//         planType: "Basic",
//         paymentMethod: "E-Wallet",
//         bonus: 0,
//         document: null,
//         requestedOn: "2025-03-10T13:10:00",
//         rejectedOn: "2025-03-11T16:20:00",
//         status: "Rejected",
//         remarks: "Transaction could not be verified. Please provide a valid proof of payment."
//     },
// ]


interface Deposit {
    id: number;
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    accountNumber: string;
    amount: number;
    planType: string;
    paymentMethod: string;
    bonus: number;
    document: string | null;
    requestedOn: string;
    approvedOn?: string;
    rejectedOn?: string;
    status: string;
    remarks?: string;
    proofOfPayment?: string | null;
}

const DepositsPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [sortField, setSortField] = useState("requestedOn")
    const [sortOrder, setSortOrder] = useState("desc")


    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [documentOpen, setDocumentOpen] = useState(false)
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)

    // Form states
    const [bonus, setBonus] = useState(0)
    const [remarks, setRemarks] = useState("Congratulations")
    const [rejectRemarks, setRejectRemarks] = useState("")
    const [zoomLevel, setZoomLevel] = useState(100)

    // Get token from localStorage
    const getToken = () => localStorage.getItem('token');

    // API headers with auth token
    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    // Fetch deposits on component mount and when filters/sort change
    useEffect(() => {
        fetchDeposits();
    }, [selectedStatus, selectedPlanType, selectedPaymentMethod, startDate, endDate, sortField, sortOrder]);

    // Fetch deposits from API
    const fetchDeposits = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedStatus) params.append('status', selectedStatus);
            if (selectedPlanType) params.append('planType', selectedPlanType);
            if (selectedPaymentMethod) params.append('paymentMethod', selectedPaymentMethod);
            if (startDate) params.append('startDate', startDate.toISOString());
            if (endDate) params.append('endDate', endDate.toISOString());
            params.append('sortField', sortField);
            params.append('sortOrder', sortOrder);

            const response = await axios.get(`http://localhost:5000/api/admindeposits?${params.toString()}`, getAuthHeaders());

            // Transform the API response to match our expected format
            const transformedData = response.data.data.map((item: any) => ({
                id: item._id,
                user: {
                    name: item.user.name,
                    email: item.user.email,
                    avatar: "/placeholder.svg" // Default avatar
                },
                accountNumber: item.accountNumber,
                amount: item.amount,
                planType: item.planType, // Using paymentType as planType
                paymentMethod: item.paymentMethod,
                bonus: item.bonus || 0,
                document: item.proofOfPayment,
                requestedOn: item.requestedOn || item.createdAt,
                approvedOn: item.approvedOn,
                rejectedOn: item.rejectedOn,
                status: item.status,
                remarks: item.remarks || item.notes,
                proofOfPayment: item.proofOfPayment
            }));

            console.log("Deposits fetched:", response.data.data)

            setDeposits(transformedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching deposits:', error);
            setError('Failed to fetch deposits');
            setLoading(false);
        }
    };

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

        // Date filter
        let matchesDate = true
        if (startDate && endDate) {
            const depositDate = new Date(deposit.requestedOn)
            matchesDate = depositDate >= startDate && depositDate <= endDate
        }

        return matchesSearch && matchesStatus && matchesPlanType && matchesPaymentMethod && matchesDate
    }).sort((a, b) => {
        // Sort by selected field
        if ((a[sortField as keyof Deposit] ?? '') < (b[sortField as keyof Deposit] ?? '')) {
            return sortOrder === "asc" ? -1 : 1
        }
        if ((a[sortField as keyof Deposit] ?? '') > (b[sortField as keyof Deposit] ?? '')) {
            return sortOrder === "asc" ? 1 : -1
        }
        return 0
    })

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedStatus(null)
        setSelectedPlanType(null)
        setSelectedPaymentMethod(null)
        setStartDate(null)
        setEndDate(null)
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

    // Handle sort toggle
    const handleSort = (field: keyof Deposit) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("asc")
        }
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        {/* <Check className="mr-1 h-3 w-3" />*/} Approved
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
                        {/* <X className="mr-1 h-3 w-3" />*/} Rejected
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }



    // Handle export
    const handleExport = (format: string) => {
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedStatus) params.append('status', selectedStatus);
        if (selectedPlanType) params.append('planType', selectedPlanType);
        if (selectedPaymentMethod) params.append('paymentMethod', selectedPaymentMethod);
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
        params.append('format', format);

        // Create export URL
        const exportUrl = `http://localhost:5000/api/admindeposits/export?${params.toString()}`;

        // Open in new tab or trigger download
        window.open(exportUrl, '_blank');
    };

    // Open details dialog
    const openDetails = (deposit: Deposit) => {
        setSelectedDeposit(deposit)
        setDetailsOpen(true)
    }

    // Open approve dialog
    const openApprove = (deposit: Deposit) => {
        setSelectedDeposit(deposit)
        setBonus(0)
        setRemarks("Congratulations")
        setApproveOpen(true)
    }

    // Open reject dialog
    const openReject = (deposit: Deposit) => {
        setSelectedDeposit(deposit)
        setRejectRemarks("")
        setRejectOpen(true)
    }

    // Document dialog - modified to handle real file fetching
    const openDocument = (deposit: Deposit) => {
        if (deposit.proofOfPayment) {
            setSelectedDeposit(deposit);
            setZoomLevel(100);
            setDocumentOpen(true);
        }
    };

    // Approve deposit
    const handleApprove = async () => {
        try {
            if (!selectedDeposit) {
                console.error("No deposit selected for approval.");
                return;
            }
            const response = await axios.put(`http://localhost:5000/api/admindeposits/${selectedDeposit.id}/approve`, {
                bonus,
                remarks
            }, getAuthHeaders());

            // Update local state with the approved deposit
            setDeposits(prevDeposits =>
                prevDeposits.map(dep =>
                    dep.id === selectedDeposit.id ? response.data.data : dep
                )
            );

            setApproveOpen(false);
            // Show success message
        } catch (error) {
            console.error('Error approving deposit:', error);
            // Show error message
        }
    };

    // Reject deposit
    const handleReject = async () => {
        try {
            if (!selectedDeposit) {
                console.error("No deposit selected for rejection.");
                return;
            }
            const response = await axios.put(`http://localhost:5000/api/admindeposits/${selectedDeposit.id}/reject`, {
                remarks: rejectRemarks
            }, getAuthHeaders());

            // Update local state with the rejected deposit
            setDeposits(prevDeposits =>
                prevDeposits.map(dep =>
                    dep.id === selectedDeposit.id ? response.data.data : dep
                )
            );

            setRejectOpen(false);
            // Show success message
        } catch (error) {
            console.error('Error rejecting deposit:', error);
            // Show error message
        }
    };

    // Sort indicator
    const SortIndicator = ({ field }: { field: keyof Deposit }) => {
        if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4" />
        return sortOrder === "asc" ?
            <ChevronDown className="ml-1 h-4 w-4" /> :
            <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
    }

    const openDocumentInNewTab = () => {
        if (selectedDeposit && selectedDeposit.proofOfPayment) {
            // Assuming your backend serves files at this URL
            const url = `http://localhost:5000${selectedDeposit.proofOfPayment}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-6">
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
                                    <DropdownMenuContent align="end" className="w-[240px]">
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

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Date Range</p>
                                            <div className="flex gap-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {startDate ? (
                                                                format(startDate, "PP")
                                                            ) : (
                                                                <span>From</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={startDate || undefined}
                                                            onSelect={(day) => setStartDate(day || null)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {endDate ? (
                                                                format(endDate, "PP")
                                                            ) : (
                                                                <span>To</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={endDate || undefined}
                                                            onSelect={(day) => setEndDate(day || null)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
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
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            Export as Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('docx')}>
                                            Export as DOCX
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Applied filters */}
                        {(selectedStatus || selectedPlanType || selectedPaymentMethod || startDate || endDate) && (
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
                                {(startDate || endDate) && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Date Range
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

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Account Number</TableHead>
                                        <TableHead onClick={() => handleSort("amount")} className="cursor-pointer">
                                            Amount
                                            <SortIndicator field="amount" />
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("planType")} className="cursor-pointer">
                                            Plan Type
                                            <SortIndicator field="planType" />
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("paymentMethod")} className="cursor-pointer">
                                            Payment Method
                                            <SortIndicator field="paymentMethod" />
                                        </TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead onClick={() => handleSort("requestedOn")} className="cursor-pointer">
                                            Requested On
                                            <SortIndicator field="requestedOn" />
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("status")} className="cursor-pointer text-center">
                                            Status
                                            <SortIndicator field="status" />
                                        </TableHead>
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
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openDocument(deposit)}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(deposit.requestedOn)}</TableCell>
                                            <TableCell className="text-center">{getStatusBadge(deposit.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openDetails(deposit)}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {deposit.status === "Pending" && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-green-600"
                                                                    onClick={() => openApprove(deposit)}
                                                                >
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => openReject(deposit)}
                                                                >
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

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Deposit Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this deposit request
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDeposit && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">User Information</div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={selectedDeposit.user.avatar} alt={selectedDeposit.user.name} />
                                                <AvatarFallback>{selectedDeposit.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{selectedDeposit.user.name}</div>
                                                <div className="text-sm text-muted-foreground">{selectedDeposit.user.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">Account Number</div>
                                        <div className="text-sm">{selectedDeposit.accountNumber}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">Amount</div>
                                        <div className="text-lg font-semibold">${selectedDeposit.amount.toLocaleString()}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">Plan Type</div>
                                        <div className="text-sm">{selectedDeposit.planType}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">Payment Method</div>
                                        <div className="text-sm">{selectedDeposit.paymentMethod}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">Status</div>
                                        <div>{getStatusBadge(selectedDeposit.status)}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium mb-1 text-muted-foreground">Requested On</div>
                                        <div className="text-sm">{formatDate(selectedDeposit.requestedOn)}</div>
                                    </div>

                                    {selectedDeposit.status === "Approved" && selectedDeposit.approvedOn && (
                                        <div>
                                            <div className="text-sm font-medium mb-1 text-muted-foreground">Approved On</div>
                                            <div className="text-sm">{formatDate(selectedDeposit.approvedOn)}</div>
                                        </div>
                                    )}

                                    {selectedDeposit.status === "Rejected" && selectedDeposit.rejectedOn && (
                                        <div>
                                            <div className="text-sm font-medium mb-1 text-muted-foreground">Rejected On</div>
                                            <div className="text-sm">{formatDate(selectedDeposit.rejectedOn)}</div>
                                        </div>
                                    )}

                                    {selectedDeposit.bonus > 0 && (
                                        <div>
                                            <div className="text-sm font-medium mb-1 text-muted-foreground">Bonus</div>
                                            <div className="text-sm">${selectedDeposit.bonus.toLocaleString()}</div>
                                        </div>
                                    )}

                                    {selectedDeposit.remarks && (
                                        <div>
                                            <div className="text-sm font-medium mb-1 text-muted-foreground">Remarks</div>
                                            <div className="text-sm">{selectedDeposit.remarks}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedDeposit.document && (
                                <div>
                                    <div className="text-sm font-medium mb-2 text-muted-foreground">Document Preview</div>
                                    <div className="border rounded-md p-2 h-40 relative bg-gray-50">
                                        {/* Document preview taking full width */}
                                        <div className="w-full h-full">  {/* Changed from w-xl to w-full */}
                                            {selectedDeposit.document.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img
                                                    src={`http://localhost:5000${selectedDeposit.document}`}
                                                    alt="Document preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : selectedDeposit.document.match(/\.(pdf)$/i) ? (
                                                <div className="w-full h-full flex items-center justify-center bg-white text-gray-500">
                                                    <FileText className="h-10 w-10 text-gray-400" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white text-gray-500">
                                                    <FileText className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Transparent button overlay centered on the image */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => openDocument(selectedDeposit)}
                                                className="bg-white bg-opacity-70 hover:bg-opacity-90 transition-all"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Document
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Deposit</DialogTitle>
                        <DialogDescription>
                            Approve this deposit request and add an optional bonus
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDeposit && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">Amount</div>
                                <div>${selectedDeposit.amount.toLocaleString()}</div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bonus">Bonus Amount</Label>
                                <Input
                                    id="bonus"
                                    type="number"
                                    min="0"
                                    value={bonus}
                                    onChange={(e) => setBonus(Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
                        <Button onClick={handleApprove}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Deposit</DialogTitle>
                        <DialogDescription>
                            Reject this deposit request and provide a reason
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDeposit && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">Amount</div>
                                <div>${selectedDeposit.amount.toLocaleString()}</div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rejectRemarks">Reason for Rejection</Label>
                                <Textarea
                                    id="rejectRemarks"
                                    value={rejectRemarks}
                                    onChange={(e) => setRejectRemarks(e.target.value)}
                                    rows={3}
                                    placeholder="Please provide a reason for rejection"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Dialog */}
            <Dialog open={documentOpen} onOpenChange={setDocumentOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>

                    {selectedDeposit && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Button variant="outline" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                                    Zoom Out
                                </Button>
                                <span>{zoomLevel}%</span>
                                <Button variant="outline" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                                    Zoom In
                                </Button>
                            </div>

                            {/* Document preview container */}
                            <div className="border rounded-lg overflow-auto h-[60vh]">
                                <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}>
                                    {/* Display document based on file type */}
                                    {selectedDeposit.proofOfPayment && (
                                        <div className="min-h-[500px] min-w-[500px] flex items-center justify-center">
                                            {/* Determine file type and render appropriate preview */}
                                            {selectedDeposit.proofOfPayment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img
                                                    src={`http://localhost:5000${selectedDeposit.document}`}
                                                    alt="Document preview"
                                                    className="max-w-full"
                                                />
                                            ) : selectedDeposit.proofOfPayment.match(/\.(pdf)$/i) ? (
                                                <iframe
                                                    src={`http://localhost:5000/api/admindeposits/${selectedDeposit.document}`}
                                                    title="PDF Document"
                                                    width="100%"
                                                    height="500px"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <FileText className="h-16 w-16 mx-auto mb-4" />
                                                    <p>File preview not available</p>
                                                    <p>Click "Open in New Tab" to view</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setDocumentOpen(false)}>Close</Button>
                                <Button onClick={() => openDocumentInNewTab()}>
                                    Open in New Tab
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DepositsPage