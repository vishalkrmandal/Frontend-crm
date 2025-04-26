// Frontend\src\pages\admin\features\ClientsPage.tsx

"use client"

import { useState } from "react"
import { Search, Filter, Download, ChevronDown, Check, X, MoreHorizontal, Eye, EyeOff } from "lucide-react"
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
const clients = [
    {
        id: 1,
        name: "John Smith",
        email: "john@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10023",
        password: "RJ34#@wr",
        kycVerified: true,
        country: "United States",
        ibPartner: "None",
        permissions: ["Trading", "Deposit", "Withdrawal"],
    },
    {
        id: 2,
        name: "Emily Johnson",
        email: "emily@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10024",
        password: "Pa$$w0rd!",
        kycVerified: true,
        country: "Canada",
        ibPartner: "Partner A",
        permissions: ["Trading", "Deposit"],
    },
    {
        id: 3,
        name: "Michael Chen",
        email: "michael@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10025",
        password: "Secure123!",
        kycVerified: false,
        country: "Singapore",
        ibPartner: "Partner B",
        permissions: ["Trading"],
    },
    {
        id: 4,
        name: "Sarah Williams",
        email: "sarah@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10026",
        password: "S@rah2024",
        kycVerified: true,
        country: "United Kingdom",
        ibPartner: "None",
        permissions: ["Trading", "Deposit", "Withdrawal"],
    },
    {
        id: 5,
        name: "David Rodriguez",
        email: "david@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10027",
        password: "D@v1dR0d",
        kycVerified: false,
        country: "Mexico",
        ibPartner: "Partner C",
        permissions: ["Trading", "Deposit"],
    },
    {
        id: 6,
        name: "Lisa Kim",
        email: "lisa@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10028",
        password: "L!saK1m88",
        kycVerified: true,
        country: "South Korea",
        ibPartner: "None",
        permissions: ["Trading", "Deposit", "Withdrawal"],
    },
    {
        id: 7,
        name: "Robert Johnson",
        email: "robert@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10029",
        password: "R0b3rt!J",
        kycVerified: true,
        country: "Australia",
        ibPartner: "Partner A",
        permissions: ["Trading", "Deposit"],
    },
    {
        id: 8,
        name: "Maria Garcia",
        email: "maria@example.com",
        avatar: "/placeholder.svg",
        accountNumber: "ACC10030",
        password: "M@r1@G@rc!@",
        kycVerified: false,
        country: "Spain",
        ibPartner: "None",
        permissions: ["Trading"],
    },
]

const ClientsPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [selectedKycStatus, setSelectedKycStatus] = useState<string | null>(null)
    const [selectedIbPartner, setSelectedIbPartner] = useState<string | null>(null)
    const [visiblePasswords, setVisiblePasswords] = useState<number[]>([])

    // Filter clients based on search and filters
    const filteredClients = clients.filter((client) => {
        // Search filter
        const matchesSearch =
            searchTerm === "" ||
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())

        // Country filter
        const matchesCountry = selectedCountry === null || client.country === selectedCountry

        // KYC filter
        const matchesKyc =
            selectedKycStatus === null ||
            (selectedKycStatus === "Verified" && client.kycVerified) ||
            (selectedKycStatus === "Unverified" && !client.kycVerified)

        // IB Partner filter
        const matchesIbPartner =
            selectedIbPartner === null ||
            (selectedIbPartner === "None" && client.ibPartner === "None") ||
            client.ibPartner === selectedIbPartner

        return matchesSearch && matchesCountry && matchesKyc && matchesIbPartner
    })

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedCountry(null)
        setSelectedKycStatus(null)
        setSelectedIbPartner(null)
    }

    const togglePasswordVisibility = (clientId: number) => {
        setVisiblePasswords(current =>
            current.includes(clientId)
                ? current.filter(id => id !== clientId)
                : [...current, clientId]
        )
    }

    return (
        <div className="space-y-6">
            {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h1 className="text-2xl font-bold">Clients</h1>
                <Button>Add New Client</Button>
            </div> */}

            <Card>
                <CardHeader>
                    <CardTitle>Client List</CardTitle>
                    <CardDescription>Manage and view all registered clients</CardDescription>
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
                                            <p className="text-xs font-medium mb-1">Country</p>
                                            <Select value={selectedCountry || ""} onValueChange={setSelectedCountry}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Countries" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Countries</SelectItem>
                                                    <SelectItem value="United States">United States</SelectItem>
                                                    <SelectItem value="Canada">Canada</SelectItem>
                                                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                                    <SelectItem value="Australia">Australia</SelectItem>
                                                    <SelectItem value="Singapore">Singapore</SelectItem>
                                                    <SelectItem value="Spain">Spain</SelectItem>
                                                    <SelectItem value="Mexico">Mexico</SelectItem>
                                                    <SelectItem value="South Korea">South Korea</SelectItem>
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

                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">IB Partner</p>
                                            <Select value={selectedIbPartner || ""} onValueChange={setSelectedIbPartner}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All Partners" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Partners</SelectItem>
                                                    <SelectItem value="None">None</SelectItem>
                                                    <SelectItem value="Partner A">Partner A</SelectItem>
                                                    <SelectItem value="Partner B">Partner B</SelectItem>
                                                    <SelectItem value="Partner C">Partner C</SelectItem>
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
                        {(selectedCountry || selectedKycStatus || selectedIbPartner) && (
                            <div className="flex flex-wrap gap-2">
                                {selectedCountry && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Country: {selectedCountry}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedCountry(null)}
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
                                {selectedIbPartner && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        IB Partner: {selectedIbPartner}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedIbPartner(null)}
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
                                        <TableHead>Password</TableHead>
                                        <TableHead>KYC Verified</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>IB Partner</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={client.avatar} alt={client.name} />
                                                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{client.name}</div>
                                                        <div className="text-sm text-muted-foreground">{client.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{client.accountNumber}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {visiblePasswords.includes(client.id) ? client.password : "••••••••"}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => togglePasswordVisibility(client.id)}
                                                    >
                                                        {visiblePasswords.includes(client.id) ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {client.kycVerified ? (
                                                    <Badge variant="green" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        <Check className="mr-1 h-3 w-3" />Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                                                        <X className="mr-1 h-3 w-3" />Unverified
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{client.country}</TableCell>
                                            <TableCell>{client.ibPartner}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {client.permissions.map((permission) => (
                                                        <Badge key={permission} variant="outline" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
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
                                                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Suspend Client</DropdownMenuItem>
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
                                Showing <strong>{filteredClients.length}</strong> of <strong>{clients.length}</strong> clients
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

export default ClientsPage

