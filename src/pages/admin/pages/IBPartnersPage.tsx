"use client"

import { useState } from "react"
import { Search, Filter, Download, ChevronDown, X, MoreHorizontal, Check, Copy, LinkIcon } from "lucide-react"
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
import { toast } from "@/hooks/use-toast"

// Sample data
const ibPartners = [
    {
        id: 1,
        user: {
            name: "John Smith",
            email: "john@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "IB10023",
        dateCreated: "2025-01-15T14:30:00",
        kycVerified: true,
        referralLink: "https://example.com/ref/john-smith",
        status: "Active",
    },
    {
        id: 2,
        user: {
            name: "Emily Johnson",
            email: "emily@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "IB10024",
        dateCreated: "2025-02-10T09:15:00",
        kycVerified: true,
        referralLink: "https://example.com/ref/emily-johnson",
        status: "Active",
    },
    {
        id: 3,
        user: {
            name: "Michael Chen",
            email: "michael@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "IB10025",
        dateCreated: "2025-02-25T16:45:00",
        kycVerified: false,
        referralLink: "https://example.com/ref/michael-chen",
        status: "Pending",
    },
    {
        id: 4,
        user: {
            name: "Sarah Williams",
            email: "sarah@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "IB10026",
        dateCreated: "2025-01-20T11:20:00",
        kycVerified: true,
        referralLink: "https://example.com/ref/sarah-williams",
        status: "Active",
    },
    {
        id: 5,
        user: {
            name: "David Rodriguez",
            email: "david@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "IB10027",
        dateCreated: "2025-03-05T08:30:00",
        kycVerified: false,
        referralLink: "https://example.com/ref/david-rodriguez",
        status: "Pending",
    },
    {
        id: 6,
        user: {
            name: "Lisa Kim",
            email: "lisa@example.com",
            avatar: "/placeholder.svg",
        },
        accountNumber: "IB10028",
        dateCreated: "2025-02-18T13:10:00",
        kycVerified: true,
        referralLink: "https://example.com/ref/lisa-kim",
        status: "Inactive",
    },
]

const IBPartnersPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [selectedKycStatus, setSelectedKycStatus] = useState<string | null>(null)

    // Filter IB Partners based on search and filters
    const filteredIBPartners = ibPartners.filter((partner) => {
        // Search filter
        const matchesSearch =
            searchTerm === "" ||
            partner.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())

        // Status filter
        const matchesStatus = selectedStatus === null || partner.status === selectedStatus

        // KYC filter
        const matchesKyc =
            selectedKycStatus === null ||
            (selectedKycStatus === "Verified" && partner.kycVerified) ||
            (selectedKycStatus === "Unverified" && !partner.kycVerified)

        return matchesSearch && matchesStatus && matchesKyc
    })

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedStatus(null)
        setSelectedKycStatus(null)
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Copy referral link
    const copyReferralLink = (link: string) => {
        navigator.clipboard.writeText(link)
        toast({
            title: "Copied to clipboard",
            description: "Referral link has been copied to clipboard",
        })
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Check className="mr-1 h-3 w-3" /> Active
                    </Badge>
                )
            case "Pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "Inactive":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                        <X className="mr-1 h-3 w-3" /> Inactive
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h1 className="text-2xl font-bold">IB Partners</h1>
                <Button>Add New Partner</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>IB Partner List</CardTitle>
                    <CardDescription>Manage and view all Introducing Broker partners</CardDescription>
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
                                                    <SelectItem value="all">All Statuses</SelectItem>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">KYC Status</p>
                                            <Select value={selectedKycStatus || ""} onValueChange={setSelectedKycStatus}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Statuses</SelectItem>
                                                    <SelectItem value="Verified">Verified</SelectItem>
                                                    <SelectItem value="Unverified">Unverified</SelectItem>
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
                        {(selectedStatus || selectedKycStatus) && (
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
                                {selectedKycStatus && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        KYC: {selectedKycStatus}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedKycStatus(null)}
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
                                        <TableHead>Date Created</TableHead>
                                        <TableHead>KYC Verified</TableHead>
                                        <TableHead>Referral Link</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIBPartners.map((partner) => (
                                        <TableRow key={partner.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={partner.user.avatar} alt={partner.user.name} />
                                                        <AvatarFallback>{partner.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{partner.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{partner.user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{partner.accountNumber}</TableCell>
                                            <TableCell>{formatDate(partner.dateCreated)}</TableCell>
                                            <TableCell>
                                                {partner.kycVerified ? (
                                                    <Badge variant="green" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        <Check className="mr-1 h-3 w-3" /> Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                                                        <X className="mr-1 h-3 w-3" /> Unverified
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="max-w-[150px] truncate text-xs">{partner.referralLink}</div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyReferralLink(partner.referralLink)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                        <span className="sr-only">Copy link</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <LinkIcon className="h-3 w-3" />
                                                        <span className="sr-only">Open link</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(partner.status)}</TableCell>
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
                                                        <DropdownMenuItem>Edit Partner</DropdownMenuItem>
                                                        {partner.status === "Pending" && (
                                                            <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                                                        )}
                                                        {partner.status === "Active" && (
                                                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                                                        )}
                                                        {partner.status === "Inactive" && (
                                                            <DropdownMenuItem className="text-green-600">Activate</DropdownMenuItem>
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
                                Showing <strong>{filteredIBPartners.length}</strong> of <strong>{ibPartners.length}</strong> partners
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

export default IBPartnersPage

