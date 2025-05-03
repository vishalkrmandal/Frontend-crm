// Frontend\src\pages\admin\features\ClientsPage.tsx

"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Download, ChevronDown, Check, X, MoreHorizontal, Eye, EyeOff, Lock, Pencil } from "lucide-react"
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
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import clientService from "./clientService"
import { toast } from "sonner"
import { impersonateClient } from "@/utils/impersonation"

interface Client {
    id: string;
    name: string;
    email: string;
    firstname: string;
    lastname: string;
    avatar?: string;
    accountNumber: string;
    status: string;
    isEmailVerified: boolean;
    kycVerified: boolean;
    kycStatus: "unverified" | "verified" | "rejected";
    kycRejectReason?: string;
    country: {
        name: string;
        state: string;
    };
    ibPartner: string;
    phone: string;
    dateofbirth: string;
    educationLevel: string;
    otherEducation: string;
    idDocument: string;
    address1Document: string;
    address2Document: string;
    bankDetails: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
        ifscSwiftCode: string;
    };
    walletDetails: {
        tetherWalletAddress: string;
        ethWalletAddress: string;
        accountNumber: string;
        trxWalletAddress: string;
    };
}

interface Account {
    _id: string;
    mt5Account: string;
    name: string;
    accountType: string;
    leverage: string;
    balance: number;
    equity: number;
    profit: number;
}

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [selectedKycStatus, setSelectedKycStatus] = useState<string | null>(null)
    const [selectedEmailStatus, setSelectedEmailStatus] = useState<string | null>(null)
    const [selectedIbPartner, setSelectedIbPartner] = useState<string | null>(null)
    const [visiblePasswords, setVisiblePasswords] = useState<string[]>([])
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [clientDetailsDialogOpen, setClientDetailsDialogOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [editMode, setEditMode] = useState<Record<string, boolean>>({})

    const [accountsDialogOpen, setAccountsDialogOpen] = useState(false)
    const [clientAccounts, setClientAccounts] = useState<Account[]>([])
    const [loadingAccounts, setLoadingAccounts] = useState(false)

    // List of unique countries, IB partners for filters
    const [countries, setCountries] = useState<string[]>([])
    const [ibPartners, setIbPartners] = useState<string[]>([])

    // Add this function after your state declarations
    const getFullDocumentUrl = (documentPath: string) => {
        if (!documentPath) return '';
        // Replace backslashes with forward slashes for URL compatibility
        const formattedPath = documentPath.replace(/\\/g, '/');
        return `http://localhost:5000/${formattedPath}`;
    };

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const response = await clientService.getAllClients()
            setClients(response.data)

            // Extract unique countries and IB partners for filters
            const uniqueCountries = [...new Set(response.data.map((client: Client) => client.country?.name).filter(Boolean))] as string[]
            const uniqueIbPartners = [...new Set(response.data.map((client: Client) => client.ibPartner))] as string[]

            setCountries(uniqueCountries)
            setIbPartners(uniqueIbPartners)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching clients:", error)
            toast.error("Failed to fetch clients. Please try again.")
            setLoading(false)
        }
    }

    // Add this new function to handle client impersonation
    const handleImpersonateClient = async (client: Client) => {
        try {
            // Show loading toast
            toast.loading("Preparing client access...");

            // Call the API to get impersonation token
            const response = await clientService.impersonateClient(client.id);

            if (response.success) {
                // Dismiss the loading toast
                toast.dismiss();
                toast.success("Client access prepared successfully");

                // Handle the impersonation - this will open a new tab
                impersonateClient(response.clientToken, response.user);
            } else {
                toast.error("Failed to access client account");
            }
        } catch (error) {
            console.error("Error impersonating client:", error);
            toast.error("Failed to access client account. Please try again.");
        }
    };

    const getClientPassword = async (clientId: string) => {
        try {
            const response = await clientService.getClientPassword(clientId)
            setPassword(response.password || "Not available")
        } catch (error) {
            console.error("Error fetching password:", error)
            // Set password state to indicate it wasn't found
            setPassword("Password not found")

            // Only show toast for other types of errors
            if ((error as any)?.response?.status !== 404) {
                toast.error("Failed to fetch password. Please try again.")
            }
        }
    }

    const handlePasswordDialog = async (client: Client) => {
        setSelectedClient(client)
        await getClientPassword(client.id)
        setPasswordDialogOpen(true)
    }

    const handleUpdatePassword = async () => {
        if (!selectedClient) return
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.")
            return
        }

        try {
            await clientService.updateClientPassword(selectedClient.id, newPassword)
            toast.success("Password updated successfully.")
            setPasswordDialogOpen(false)
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            console.error("Error updating password:", error)
            toast.error("Failed to update password. Please try again.")
        }
    }

    const handleViewDetails = async (client: Client) => {
        setSelectedClient(client)
        try {
            const response = await clientService.getClientDetails(client.id)
            setSelectedClient(response.data)
            setClientDetailsDialogOpen(true)
        } catch (error) {
            console.error("Error fetching client details:", error)
            toast.error("Failed to fetch client details. Please try again.")
        }
    }

    const handleSuspendClient = async (clientId: string) => {
        try {
            await clientService.suspendClient(clientId)
            toast.success("Client suspended successfully.")
            fetchClients()
        } catch (error) {
            console.error("Error suspending client:", error)
            toast.error("Failed to suspend client. Please try again.")
        }
    }

    const handleActivateClient = async (clientId: string) => {
        try {
            await clientService.activateClient(clientId)
            toast.success("Client activated successfully.")
            fetchClients()
        } catch (error) {
            console.error("Error activating client:", error)
            toast.error("Failed to activate client. Please try again.")
        }
    }

    const toggleEditMode = (field: string) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const handleUpdateClient = async () => {
        if (!selectedClient) return;

        // Validate reject reason is provided if status is rejected
        if (selectedClient.kycStatus === "rejected" && !selectedClient.kycRejectReason?.trim()) {
            toast.error("Rejection reason is required when KYC status is set to Rejected");
            return;
        }

        // Prepare client data without education level initially
        const clientData: any = {
            firstname: selectedClient.firstname,
            lastname: selectedClient.lastname,
            email: selectedClient.email,
            isEmailVerified: selectedClient.isEmailVerified,
            country: selectedClient.country,
            phone: selectedClient.phone,
            dateofbirth: selectedClient.dateofbirth,
            kycVerified: selectedClient.kycStatus === "verified",
            kycStatus: selectedClient.kycStatus,
            kycRejectReason: selectedClient.kycRejectReason,
            ibPartner: selectedClient.ibPartner,
            bankDetails: selectedClient.bankDetails,
            walletDetails: selectedClient.walletDetails
        };

        // Only add education level if it has a valid value
        if (selectedClient.educationLevel && selectedClient.educationLevel.trim() !== '' &&
            selectedClient.educationLevel !== 'not-specified') {
            clientData.educationLevel = selectedClient.educationLevel;

            // Add otherEducation only if educationLevel is 'other'
            if (selectedClient.educationLevel === 'other' && selectedClient.otherEducation) {
                clientData.otherEducation = selectedClient.otherEducation;
            }
        }

        try {
            await clientService.updateClient(selectedClient.id, clientData);
            toast.success("Client updated successfully.");
            setEditMode({});
            fetchClients();
            setClientDetailsDialogOpen(false);
        } catch (error) {
            console.error("Error updating client:", error);
            toast.error("Failed to update client. Please try again.");
        }
    };
    const handleOpenDocument = (documentUrl: string) => {
        if (!documentUrl) return

        // Get full URL
        const fullUrl = getFullDocumentUrl(documentUrl);

        // Check if PDF or image
        const isPdf = documentUrl.toLowerCase().endsWith('.pdf')

        if (isPdf) {
            window.open(fullUrl, '_blank')
        } else {
            // Open image in new tab
            const img = new Image()
            img.src = fullUrl
            const w = window.open("")
            if (w) w.document.write(img.outerHTML)
        }
    }

    const handleDownloadDocument = (documentUrl: string, fileName: string) => {
        if (!documentUrl) return

        const fullUrl = getFullDocumentUrl(documentUrl);

        fetch(fullUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = fileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            })
            .catch(error => {
                console.error("Error downloading document:", error)
                // toast.error("Failed to download document. Please try again.")
            })
    }


    // Filter clients based on search and filters
    // Update the filtering logic
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = !searchTerm ||
                client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCountry = !selectedCountry ||
                selectedCountry === "all" ||
                client.country?.name === selectedCountry;

            const matchesKycStatus = !selectedKycStatus ||
                selectedKycStatus === "all" ||
                (selectedKycStatus === "Verified" && client.kycStatus === "verified") ||
                (selectedKycStatus === "Unverified" && client.kycStatus === "unverified") ||
                (selectedKycStatus === "Rejected" && client.kycStatus === "rejected");

            const matchesEmailStatus = !selectedEmailStatus ||
                selectedEmailStatus === "all" ||
                (selectedEmailStatus === "Verified" && client.isEmailVerified) ||
                (selectedEmailStatus === "Unverified" && !client.isEmailVerified);

            const matchesIbPartner = !selectedIbPartner ||
                selectedIbPartner === "all" ||
                client.ibPartner === selectedIbPartner;

            return matchesSearch && matchesCountry && matchesKycStatus && matchesEmailStatus && matchesIbPartner;
        });
    }, [clients, searchTerm, selectedCountry, selectedKycStatus, selectedEmailStatus, selectedIbPartner]);

    // Add this function to fetch user accounts
    const handleViewAccounts = async (client: Client) => {
        setSelectedClient(client)
        setLoadingAccounts(true)
        try {
            const response = await clientService.getUserAccounts(client.id)
            setClientAccounts(response.data)
            setAccountsDialogOpen(true)
        } catch (error) {
            console.error("Error fetching user accounts:", error)
            toast.error("Failed to fetch user accounts. Please try again.")
        } finally {
            setLoadingAccounts(false)
        }
    }

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setSelectedCountry(null)
        setSelectedKycStatus(null)
        setSelectedEmailStatus(null)
        setSelectedIbPartner(null)
    }

    return (
        <div className="space-y-6">
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
                                                    {countries.map((country, index) => (
                                                        <SelectItem key={index} value={country}>{country}</SelectItem>
                                                    ))}
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
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="p-2">
                                            <p className="text-xs font-medium mb-1">Email Status</p>
                                            <Select value={selectedEmailStatus || ""} onValueChange={setSelectedEmailStatus}>
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
                                                    {ibPartners.filter(partner => partner !== "None").map((partner, index) => (
                                                        <SelectItem key={index} value={partner}>{partner}</SelectItem>
                                                    ))}
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => clientService.exportToExcel()}>
                                            Export to Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => clientService.exportToPdf()}>
                                            Export to PDF
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Applied filters */}
                        {(selectedCountry || selectedKycStatus || selectedEmailStatus || selectedIbPartner) && (
                            <div className="flex flex-wrap gap-2">
                                {selectedCountry && selectedCountry !== "all" && (
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
                                {selectedKycStatus && selectedKycStatus !== "all" && (
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
                                {selectedEmailStatus && selectedEmailStatus !== "all" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Email: {selectedEmailStatus}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => setSelectedEmailStatus(null)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                                {selectedIbPartner && selectedIbPartner !== "all" && (
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
                                        {/* <TableHead>Account Number</TableHead> */}
                                        <TableHead>Password</TableHead>
                                        <TableHead>Email Verified</TableHead>
                                        <TableHead>KYC Verified</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>IB Partner</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-4">Loading...</TableCell>
                                        </TableRow>
                                    ) : filteredClients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-4">No clients found</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClients.map((client) => (
                                            <TableRow key={client.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                                            onClick={() => handleImpersonateClient(client)}
                                                            title="Login as this client"
                                                        >
                                                            <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
                                                            <AvatarFallback>{client.firstname?.charAt(0) || "C"}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{`${client.firstname || ''} ${client.lastname || ''}`}</div>
                                                            <div className="text-sm text-muted-foreground">{client.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                {/* <TableCell>{client.accountNumber || "—"}</TableCell> */}
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handlePasswordDialog(client)}
                                                    >
                                                        <Lock className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    {client.isEmailVerified ? (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            <Check className="mr-1 h-3 w-3" />Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                                            <X className="mr-1 h-3 w-3" />Unverified
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {client.kycStatus === "verified" ? (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            <Check className="mr-1 h-3 w-3" />Verified
                                                        </Badge>
                                                    ) : client.kycStatus === "rejected" ? (
                                                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                                            <X className="mr-1 h-3 w-3" />Rejected
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                            <X className="mr-1 h-3 w-3" />Unverified
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell>{client.country?.name || "—"}</TableCell>
                                                <TableCell>{client.ibPartner}</TableCell>
                                                <TableCell>
                                                    {client.status === "activated" ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                                            Suspended
                                                        </Badge>
                                                    )}
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
                                                            <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleViewAccounts(client)}>
                                                                View MT5 Accounts
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleImpersonateClient(client)}>
                                                                Login as Client
                                                            </DropdownMenuItem>
                                                            {client.status === "activated" ? (
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleSuspendClient(client.id)}
                                                                >
                                                                    Suspend Client
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    className="text-green-600"
                                                                    onClick={() => handleActivateClient(client.id)}
                                                                >
                                                                    Activate Client
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
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
                                <Button variant="outline" size="sm" disabled={filteredClients.length === clients.length}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Password</DialogTitle>
                        <DialogDescription>
                            Client: {selectedClient?.firstname} {selectedClient?.lastname}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p>Current password: {password || "Loading..."}</p>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePassword}>Update Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Client Details Dialog */}
            <Dialog open={clientDetailsDialogOpen} onOpenChange={setClientDetailsDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Client Details</DialogTitle>
                        <DialogDescription>
                            Manage client information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedClient && (
                        <div className="space-y-6">
                            <Tabs defaultValue="personal">
                                <TabsList className="w-full">
                                    <TabsTrigger value="personal" className="flex-1">Personal Information</TabsTrigger>
                                    <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
                                    <TabsTrigger value="financial" className="flex-1">Financial Details</TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* First Name */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>First Name</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('firstname')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.firstname ? (
                                                <Input
                                                    value={selectedClient.firstname}
                                                    onChange={(e) => setSelectedClient({
                                                        ...selectedClient,
                                                        firstname: e.target.value
                                                    })}
                                                />
                                            ) : (
                                                <p className="text-sm">{selectedClient.firstname}</p>
                                            )}
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>Last Name</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('lastname')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.lastname ? (
                                                <Input
                                                    value={selectedClient.lastname}
                                                    onChange={(e) => setSelectedClient({
                                                        ...selectedClient,
                                                        lastname: e.target.value
                                                    })}
                                                />
                                            ) : (
                                                <p className="text-sm">{selectedClient.lastname}</p>
                                            )}
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>Date of Birth</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('dateofbirth')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.dateofbirth ? (
                                                <Input
                                                    type="date"
                                                    value={selectedClient.dateofbirth ? selectedClient.dateofbirth.split('T')[0] : ''}
                                                    onChange={(e) => setSelectedClient({
                                                        ...selectedClient,
                                                        dateofbirth: e.target.value
                                                    })}
                                                />
                                            ) : (
                                                <p className="text-sm">
                                                    {selectedClient.dateofbirth ? new Date(selectedClient.dateofbirth).toLocaleDateString() : 'Not specified'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone Number */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>Contact Number</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('phone')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.phone ? (
                                                <Input
                                                    type="tel"
                                                    value={selectedClient.phone || ''}
                                                    onChange={(e) => setSelectedClient({
                                                        ...selectedClient,
                                                        phone: e.target.value
                                                    })}
                                                />
                                            ) : (
                                                <p className="text-sm">{selectedClient.phone || 'Not specified'}</p>
                                            )}
                                        </div>

                                        {/* Email Verified */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>Email Verified</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('isEmailVerified')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.isEmailVerified ? (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isEmailVerified"
                                                        checked={selectedClient.isEmailVerified}
                                                        onCheckedChange={(checked) => setSelectedClient({
                                                            ...selectedClient,
                                                            isEmailVerified: !!checked
                                                        })}
                                                    />
                                                    <label
                                                        htmlFor="isEmailVerified"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Mark as Verified
                                                    </label>
                                                </div>
                                            ) : (
                                                selectedClient.isEmailVerified ? (
                                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                                        <Check className="mr-1 h-3 w-3" />Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-100 text-red-800">
                                                        <X className="mr-1 h-3 w-3" />Unverified
                                                    </Badge>
                                                )
                                            )}
                                        </div>

                                        {/* Country */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>Country</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('country')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.country ? (
                                                <div className="space-y-2">
                                                    <Select
                                                        value={selectedClient.country?.name || ""}
                                                        onValueChange={(value) => setSelectedClient({
                                                            ...selectedClient,
                                                            country: {
                                                                ...selectedClient.country,
                                                                name: value
                                                            }
                                                        })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {countries.map((country, index) => (
                                                                <SelectItem key={index} value={country}>{country}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        placeholder="State/Province"
                                                        value={selectedClient.country?.state || ""}
                                                        onChange={(e) => setSelectedClient({
                                                            ...selectedClient,
                                                            country: {
                                                                ...selectedClient.country,
                                                                state: e.target.value
                                                            }
                                                        })}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-sm">
                                                    {selectedClient.country?.name ? `${selectedClient.country.name}${selectedClient.country.state ? `, ${selectedClient.country.state}` : ''}` : 'Not specified'}
                                                </p>
                                            )}
                                        </div>

                                        {/* KYC Verified */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>KYC Status</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('kycStatus')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.kycStatus ? (
                                                <div className="space-y-2">
                                                    <Select
                                                        value={selectedClient.kycStatus || "unverified"}
                                                        onValueChange={(value) => setSelectedClient({
                                                            ...selectedClient,
                                                            kycStatus: value as "unverified" | "verified" | "rejected",
                                                            kycVerified: value === "verified"
                                                        })}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unverified">Unverified</SelectItem>
                                                            <SelectItem value="verified">Verified</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    {selectedClient.kycStatus === "rejected" && (
                                                        <div className="mt-2">
                                                            <Label htmlFor="kycRejectReason">Rejection Reason</Label>
                                                            <Input
                                                                id="kycRejectReason"
                                                                value={selectedClient.kycRejectReason || ""}
                                                                onChange={(e) => setSelectedClient({
                                                                    ...selectedClient,
                                                                    kycRejectReason: e.target.value
                                                                })}
                                                                placeholder="Required reason for rejection"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    {selectedClient.kycStatus === "verified" ? (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                                            <Check className="mr-1 h-3 w-3" />Verified
                                                        </Badge>
                                                    ) : selectedClient.kycStatus === "rejected" ? (
                                                        <div>
                                                            <Badge variant="outline" className="bg-red-100 text-red-800">
                                                                <X className="mr-1 h-3 w-3" />Rejected
                                                            </Badge>
                                                            {selectedClient.kycRejectReason && (
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    Reason: {selectedClient.kycRejectReason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                            <X className="mr-1 h-3 w-3" />Unverified
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/* Education Level */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>Education Level</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('educationLevel')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.educationLevel ? (
                                                <Select
                                                    value={selectedClient.educationLevel || ''}
                                                    onValueChange={(value) => setSelectedClient({
                                                        ...selectedClient,
                                                        educationLevel: value === 'not-specified' ? '' : value,
                                                        otherEducation: value === 'other' ? selectedClient.otherEducation : ''
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select education level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="not-specified">Not Specified</SelectItem>
                                                        <SelectItem value="secondary">Secondary</SelectItem>
                                                        <SelectItem value="higher secondary">Higher Secondary</SelectItem>
                                                        <SelectItem value="bachelor's degree">Bachelor's Degree</SelectItem>
                                                        <SelectItem value="master's degree">Master's Degree</SelectItem>
                                                        <SelectItem value="doctorate">Doctorate</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm">
                                                    {selectedClient.educationLevel === 'other' && selectedClient.otherEducation
                                                        ? `Other: ${selectedClient.otherEducation}`
                                                        : selectedClient.educationLevel ? selectedClient.educationLevel.charAt(0).toUpperCase() + selectedClient.educationLevel.slice(1) : 'Not specified'}
                                                </p>
                                            )}

                                            {/* Other Education field - only shown when 'other' is selected */}
                                            {editMode.educationLevel && selectedClient.educationLevel === 'other' && (
                                                <div className="mt-2">
                                                    <Label htmlFor="otherEducation">Please specify</Label>
                                                    <Input
                                                        id="otherEducation"
                                                        value={selectedClient.otherEducation || ''}
                                                        onChange={(e) => setSelectedClient({
                                                            ...selectedClient,
                                                            otherEducation: e.target.value
                                                        })}
                                                        placeholder="Specify your education"
                                                        className="mt-1"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* IB Partner */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Label>IB Partner</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => toggleEditMode('ibPartner')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {editMode.ibPartner ? (
                                                <Select
                                                    value={selectedClient.ibPartner || 'None'}
                                                    onValueChange={(value) => setSelectedClient({
                                                        ...selectedClient,
                                                        ibPartner: value
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select IB partner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="None">None</SelectItem>
                                                        {ibPartners.filter(partner => partner !== "None").map((partner, index) => (
                                                            <SelectItem key={index} value={partner}>{partner}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm">{selectedClient.ibPartner || 'None'}</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-6 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* ID Document */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-md">ID Document</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedClient.idDocument ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-center mb-2">
                                                            {selectedClient.idDocument.toLowerCase().endsWith('.pdf') ? (
                                                                <div className="flex flex-col items-center">
                                                                    <p className="text-sm mb-2">PDF Document</p>
                                                                    <div className="flex space-x-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleOpenDocument(selectedClient.idDocument)}
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDownloadDocument(selectedClient.idDocument, 'id-document.pdf')}
                                                                        >
                                                                            <Download className="mr-2 h-4 w-4" />
                                                                            Download
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center">
                                                                    <img
                                                                        src={getFullDocumentUrl(selectedClient.idDocument)}
                                                                        alt="ID Document"
                                                                        className="max-h-48 object-contain cursor-pointer border rounded p-1"
                                                                        onClick={() => handleOpenDocument(selectedClient.idDocument)}
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-2"
                                                                        onClick={() => handleDownloadDocument(selectedClient.idDocument, 'id-document.jpg')}
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-muted-foreground">No ID document uploaded</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Address 1 Document */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-md">Address Proof 1</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedClient.address1Document ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-center mb-2">
                                                            {selectedClient.address1Document.toLowerCase().endsWith('.pdf') ? (
                                                                <div className="flex flex-col items-center">
                                                                    <p className="text-sm mb-2">PDF Document</p>
                                                                    <div className="flex space-x-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleOpenDocument(selectedClient.address1Document)}
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDownloadDocument(selectedClient.address1Document, 'address-proof-1.pdf')}
                                                                        >
                                                                            <Download className="mr-2 h-4 w-4" />
                                                                            Download
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center">
                                                                    <img
                                                                        src={getFullDocumentUrl(selectedClient.address1Document)}
                                                                        alt="Address Proof 1"
                                                                        className="max-h-48 object-contain cursor-pointer border rounded p-1"
                                                                        onClick={() => handleOpenDocument(selectedClient.address1Document)}
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-2"
                                                                        onClick={() => handleDownloadDocument(selectedClient.address1Document, 'address-proof-1.jpg')}
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-muted-foreground">No address proof uploaded</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Address 2 Document */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-md">Address Proof 2</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedClient.address2Document ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-center mb-2">
                                                            {selectedClient.address2Document.toLowerCase().endsWith('.pdf') ? (
                                                                <div className="flex flex-col items-center">
                                                                    <p className="text-sm mb-2">PDF Document</p>
                                                                    <div className="flex space-x-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleOpenDocument(selectedClient.address2Document)}
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDownloadDocument(selectedClient.address2Document, 'address-proof-2.pdf')}
                                                                        >
                                                                            <Download className="mr-2 h-4 w-4" />
                                                                            Download
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center">
                                                                    <img
                                                                        src={getFullDocumentUrl(selectedClient.address2Document)}
                                                                        alt="Address Proof 2"
                                                                        className="max-h-48 object-contain cursor-pointer border rounded p-1"
                                                                        onClick={() => handleOpenDocument(selectedClient.address2Document)}
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-2"
                                                                        onClick={() => handleDownloadDocument(selectedClient.address2Document, 'address-proof-2.jpg')}
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-muted-foreground">No additional address proof uploaded</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="financial" className="space-y-6 mt-4">
                                    {/* Bank Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Bank Account Details</CardTitle>
                                            <CardDescription>Client's bank information</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Bank Name */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Bank Name</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('bankName')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.bankName ? (
                                                        <Input
                                                            value={selectedClient.bankDetails?.bankName || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                bankDetails: {
                                                                    ...selectedClient.bankDetails,
                                                                    bankName: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{selectedClient.bankDetails?.bankName || 'Not specified'}</p>
                                                    )}
                                                </div>

                                                {/* Account Holder Name */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Account Holder Name</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('accountHolderName')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.accountHolderName ? (
                                                        <Input
                                                            value={selectedClient.bankDetails?.accountHolderName || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                bankDetails: {
                                                                    ...selectedClient.bankDetails,
                                                                    accountHolderName: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{selectedClient.bankDetails?.accountHolderName || 'Not specified'}</p>
                                                    )}
                                                </div>

                                                {/* Account Number */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Account Number</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('bankAccountNumber')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.bankAccountNumber ? (
                                                        <Input
                                                            value={selectedClient.bankDetails?.accountNumber || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                bankDetails: {
                                                                    ...selectedClient.bankDetails,
                                                                    accountNumber: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{selectedClient.bankDetails?.accountNumber || 'Not specified'}</p>
                                                    )}
                                                </div>

                                                {/* IFSC/SWIFT Code */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>IFSC/SWIFT Code</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('ifscSwiftCode')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.ifscSwiftCode ? (
                                                        <Input
                                                            value={selectedClient.bankDetails?.ifscSwiftCode || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                bankDetails: {
                                                                    ...selectedClient.bankDetails,
                                                                    ifscSwiftCode: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{selectedClient.bankDetails?.ifscSwiftCode || 'Not specified'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Wallet Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Wallet Details</CardTitle>
                                            <CardDescription>Client's wallet information for cryptocurrency transactions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* USDT Wallet Address */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>USDT Wallet Address</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('tetherWallet')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.tetherWallet ? (
                                                        <Input
                                                            value={selectedClient.walletDetails?.tetherWalletAddress || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                walletDetails: {
                                                                    ...selectedClient.walletDetails,
                                                                    tetherWalletAddress: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm break-all">
                                                            {selectedClient.walletDetails?.tetherWalletAddress || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* ETH Wallet Address */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>ETH Wallet Address</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('ethWallet')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.ethWallet ? (
                                                        <Input
                                                            value={selectedClient.walletDetails?.ethWalletAddress || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                walletDetails: {
                                                                    ...selectedClient.walletDetails,
                                                                    ethWalletAddress: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm break-all">
                                                            {selectedClient.walletDetails?.ethWalletAddress || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* TRX Wallet Address */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>TRX Wallet Address</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('trxWallet')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.trxWallet ? (
                                                        <Input
                                                            value={selectedClient.walletDetails?.trxWalletAddress || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                walletDetails: {
                                                                    ...selectedClient.walletDetails,
                                                                    trxWalletAddress: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm break-all">
                                                            {selectedClient.walletDetails?.trxWalletAddress || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Wallet Account Number */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Wallet Account Number</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleEditMode('walletAccountNumber')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {editMode.walletAccountNumber ? (
                                                        <Input
                                                            value={selectedClient.walletDetails?.accountNumber || ''}
                                                            onChange={(e) => setSelectedClient({
                                                                ...selectedClient,
                                                                walletDetails: {
                                                                    ...selectedClient.walletDetails,
                                                                    accountNumber: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="text-sm">
                                                            {selectedClient.walletDetails?.accountNumber || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter>
                                {Object.keys(editMode).length > 0 && (
                                    <div className="flex w-full justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditMode({})}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdateClient}>
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                                {Object.keys(editMode).length === 0 && (
                                    <Button variant="outline" onClick={() => setClientDetailsDialogOpen(false)}>
                                        Close
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add this dialog to your JSX, right after the existing dialogs */}
            <Dialog open={accountsDialogOpen} onOpenChange={setAccountsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>MT5 Accounts for {selectedClient?.firstname} {selectedClient?.lastname}</DialogTitle>
                        <DialogDescription>
                            Below are all MT5 trading accounts associated with this client.
                        </DialogDescription>
                    </DialogHeader>

                    {loadingAccounts ? (
                        <div className="flex justify-center p-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                        </div>
                    ) : clientAccounts.length === 0 ? (
                        <div className="text-center p-6">
                            <p>No MT5 accounts found for this client.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-[50vh] overflow-x-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white z-10">
                                    <TableRow>
                                        <TableHead>Account Number</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Leverage</TableHead>
                                        <TableHead>Balance</TableHead>
                                        <TableHead>Equity</TableHead>
                                        <TableHead>Profit/Loss</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientAccounts
                                        .slice() // Create a copy of the array to avoid mutating the original
                                        .sort((a, b) => {
                                            // Safely handle sorting with potentially undefined values
                                            const balanceA = typeof a.balance === 'number' ? a.balance : 0;
                                            const balanceB = typeof b.balance === 'number' ? b.balance : 0;
                                            return balanceB - balanceA; // Sort in descending order
                                        })
                                        .map((account) => (
                                            <TableRow key={account._id}>
                                                <TableCell className="font-medium">{account.mt5Account}</TableCell>
                                                <TableCell>{account.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={account.accountType === 'real' ? 'default' : 'outline'}>
                                                        {account.accountType?.charAt(0).toUpperCase() + account.accountType?.slice(1) || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{account.leverage || 'N/A'}</TableCell>
                                                <TableCell>${typeof account.balance === 'number' ? account.balance.toFixed(2) : '0.00'}</TableCell>
                                                <TableCell>${typeof account.equity === 'number' ? account.equity.toFixed(2) : '0.00'}</TableCell>
                                                <TableCell className={
                                                    account.profit > 0
                                                        ? 'text-green-600'
                                                        : account.profit < 0
                                                            ? 'text-red-600'
                                                            : ''
                                                }>
                                                    ${typeof account.profit === 'number' ? account.profit.toFixed(2) : '0.00'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAccountsDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ClientsPage
