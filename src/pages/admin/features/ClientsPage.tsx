// Frontend\src\pages\admin\features\ClientsPage.tsx

"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Download, ChevronDown, Check, X, MoreHorizontal, Eye, EyeOff, Lock, Pencil, RefreshCw } from "lucide-react"
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
import { useTheme } from '@/context/ThemeContext'

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
    const { theme } = useTheme();
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

    // Add this function to fetch user accounts with proper cleanup
    // Add this function to fetch user accounts with proper cleanup
    const handleViewAccounts = async (client: Client) => {
        setSelectedClient(client)
        setLoadingAccounts(true)
        setAccountsDialogOpen(true) // Open dialog immediately to show loading state

        try {
            const response = await clientService.getUserAccounts(client.id)
            setClientAccounts(response.data)

            // Show warning if API returned a warning (when external API fails)
            if (response.warning) {
                toast.warning(response.warning)
            }
        } catch (error) {
            console.error("Error fetching user accounts:", error)
            toast.error("Failed to fetch user accounts. Please try again.")
            handleCloseAccountsDialog() // Use proper close handler
        } finally {
            setLoadingAccounts(false)
        }
    }

    // Add proper dialog close handler with cleanup
    const handleCloseAccountsDialog = () => {
        setAccountsDialogOpen(false)
        setLoadingAccounts(false)
        setClientAccounts([])
        setSelectedClient(null)

        // Force cleanup of any lingering modal states
        setTimeout(() => {
            document.body.style.overflow = 'unset'
            document.body.style.paddingRight = '0px'
        }, 100)
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
            {accountsDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className={`fixed inset-0 transition-opacity ${theme === 'dark' ? 'bg-black/80' : 'bg-black/50'
                            }`}
                        onClick={handleCloseAccountsDialog}
                    />

                    {/* Dialog Content */}
                    <div className={`
            relative w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] rounded-lg shadow-xl
            ${theme === 'dark'
                            ? 'bg-gray-900 border border-gray-700'
                            : 'bg-white border border-gray-200'
                        } 
            flex flex-col overflow-hidden
        `}>
                        {/* Header */}
                        <div className={`
                p-4 pb-2 border-b flex justify-between items-start
                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}>
                            <div className="flex-1">
                                <h2 className={`
                        text-base sm:text-lg font-semibold
                        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                    `}>
                                    MT5 Accounts for {selectedClient?.firstname} {selectedClient?.lastname}
                                </h2>
                                <p className={`
                        text-sm mt-1
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                                    {loadingAccounts
                                        ? "Fetching latest account information from trading server..."
                                        : "Below are all MT5 trading accounts associated with this client."
                                    }
                                </p>
                            </div>
                            <button
                                onClick={handleCloseAccountsDialog}
                                className={`
                        ml-4 p-2 rounded-md transition-colors
                        ${theme === 'dark'
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                    }
                    `}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden">
                            {loadingAccounts ? (
                                <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
                                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                                    <div className="text-center space-y-2">
                                        <p className={`
                                text-base sm:text-lg font-medium
                                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                            `}>
                                            Loading Account Information
                                        </p>
                                        <p className={`
                                text-xs sm:text-sm px-4
                                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                            `}>
                                            Synchronizing with trading server to get latest balance and equity...
                                        </p>
                                    </div>
                                </div>
                            ) : clientAccounts.length === 0 ? (
                                <div className="text-center p-6 h-full flex flex-col items-center justify-center">
                                    <div className={`
                            mx-auto flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-4
                            ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                        `}>
                                        <svg className={`
                                w-5 h-5 sm:w-6 sm:h-6
                                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}
                            `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className={`
                            text-base sm:text-lg font-medium mb-2
                            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                        `}>
                                        No MT5 Accounts Found
                                    </h3>
                                    <p className={`
                            text-sm px-4
                            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                        `}>
                                        This client doesn't have any MT5 trading accounts yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    <div className="p-4 space-y-4">
                                        {/* Account Summary Cards */}
                                        <div className={`
                                grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4 rounded-lg
                                ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
                            `}>
                                            <div className="text-center">
                                                <p className={`
                                        text-xs sm:text-sm
                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                    `}>
                                                    Total Accounts
                                                </p>
                                                <p className="text-lg sm:text-2xl font-bold text-blue-500">
                                                    {clientAccounts.length}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className={`
                                        text-xs sm:text-sm
                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                    `}>
                                                    Total Balance
                                                </p>
                                                <p className="text-lg sm:text-2xl font-bold text-green-500">
                                                    ${clientAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className={`
                                        text-xs sm:text-sm
                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                    `}>
                                                    Total Equity
                                                </p>
                                                <p className="text-lg sm:text-2xl font-bold text-purple-500">
                                                    ${clientAccounts.reduce((sum, acc) => sum + (acc.equity || 0), 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="block sm:hidden space-y-3">
                                            {clientAccounts
                                                .slice()
                                                .sort((a, b) => {
                                                    const balanceA = typeof a.balance === 'number' ? a.balance : 0;
                                                    const balanceB = typeof b.balance === 'number' ? b.balance : 0;
                                                    return balanceB - balanceA;
                                                })
                                                .map((account) => (
                                                    <div key={account._id} className={`
                                            border rounded-lg p-4 space-y-3
                                            ${theme === 'dark'
                                                            ? 'bg-gray-800 border-gray-700'
                                                            : 'bg-white border-gray-200'
                                                        }
                                        `}>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className={`
                                                        font-medium font-mono text-sm
                                                        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                                                    `}>
                                                                    {account.mt5Account}
                                                                </p>
                                                                <p className={`
                                                        text-sm
                                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                                    `}>
                                                                    {account.name}
                                                                </p>
                                                            </div>
                                                            {/* <span className={`
                                                    px-2 py-1 text-xs rounded-full font-medium
                                                    ${account.status 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }
                                                `}>
                                                    {account.status ? 'Active' : 'Inactive'}
                                                </span> */}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className={`
                                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                                    `}>
                                                                    Type
                                                                </p>
                                                                <span className={`
                                                        px-2 py-1 text-xs rounded font-medium
                                                        ${account.accountType?.toLowerCase() === 'real'
                                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                                    }
                                                    `}>
                                                                    {account.accountType?.charAt(0).toUpperCase() + account.accountType?.slice(1) || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className={`
                                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                                    `}>
                                                                    Leverage
                                                                </p>
                                                                <p className={`
                                                        font-medium
                                                        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                                                    `}>
                                                                    1:{account.leverage || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                                            <div>
                                                                <p className={`
                                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                                    `}>
                                                                    Balance
                                                                </p>
                                                                <p className="font-medium text-green-500">
                                                                    ${typeof account.balance === 'number' ? account.balance.toFixed(2) : '0.00'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className={`
                                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                                    `}>
                                                                    Equity
                                                                </p>
                                                                <p className="font-medium text-purple-500">
                                                                    ${typeof account.equity === 'number' ? account.equity.toFixed(2) : '0.00'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className={`
                                                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                                                    `}>
                                                                    P&L
                                                                </p>
                                                                <p className={`font-medium ${(account.profit || 0) > 0
                                                                    ? 'text-green-500'
                                                                    : (account.profit || 0) < 0
                                                                        ? 'text-red-500'
                                                                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                                    }`}>
                                                                    {(account.profit || 0) > 0 ? '+' : ''}${typeof account.profit === 'number' ? account.profit.toFixed(2) : '0.00'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className={`
                                hidden sm:block border rounded-lg overflow-hidden
                                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                            `}>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className={`
                                            sticky top-0 z-10
                                            ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
                                        `}>
                                                        <tr className={`
                                                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                                            `}>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Account Number
                                                            </th>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Name
                                                            </th>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Type
                                                            </th>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Leverage
                                                            </th>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Balance
                                                            </th>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Equity
                                                            </th>
                                                            <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Profit/Loss
                                                            </th>
                                                            {/* <th className={`
                                                    px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
                                                `}>
                                                                Status
                                                            </th> */}
                                                        </tr>
                                                    </thead>
                                                    <tbody className={`
                                            divide-y
                                            ${theme === 'dark'
                                                            ? 'bg-gray-900 divide-gray-700'
                                                            : 'bg-white divide-gray-200'
                                                        }
                                        `}>
                                                        {clientAccounts
                                                            .slice()
                                                            .sort((a, b) => {
                                                                const balanceA = typeof a.balance === 'number' ? a.balance : 0;
                                                                const balanceB = typeof b.balance === 'number' ? b.balance : 0;
                                                                return balanceB - balanceA;
                                                            })
                                                            .map((account) => (
                                                                <tr key={account._id} className={`
                                                        transition-colors
                                                        ${theme === 'dark'
                                                                        ? 'hover:bg-gray-800'
                                                                        : 'hover:bg-gray-50'
                                                                    }
                                                    `}>
                                                                    <td className={`
                                                            px-4 py-4 text-sm font-medium font-mono
                                                            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                                                        `}>
                                                                        {account.mt5Account}
                                                                    </td>
                                                                    <td className={`
                                                            px-4 py-4 text-sm
                                                            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}
                                                        `}>
                                                                        {account.name}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm">
                                                                        <span className={`
                                                                px-2 py-1 text-xs rounded-full font-medium
                                                                ${account.accountType?.toLowerCase() === 'real'
                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                                            }
                                                            `}>
                                                                            {account.accountType?.charAt(0).toUpperCase() + account.accountType?.slice(1) || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`
                                                            px-4 py-4 text-sm
                                                            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}
                                                        `}>
                                                                        1:{account.leverage || 'N/A'}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm font-medium text-green-500">
                                                                        ${typeof account.balance === 'number' ? account.balance.toFixed(2) : '0.00'}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm font-medium text-purple-500">
                                                                        ${typeof account.equity === 'number' ? account.equity.toFixed(2) : '0.00'}
                                                                    </td>
                                                                    <td className={`px-4 py-4 text-sm font-medium ${(account.profit || 0) > 0
                                                                        ? 'text-green-500'
                                                                        : (account.profit || 0) < 0
                                                                            ? 'text-red-500'
                                                                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                                                        }`}>
                                                                        {(account.profit || 0) > 0 ? '+' : ''}${typeof account.profit === 'number' ? account.profit.toFixed(2) : '0.00'}
                                                                    </td>
                                                                    {/* <td className="px-4 py-4 text-sm">
                                                            <span className={`
                                                                px-2 py-1 text-xs rounded-full font-medium
                                                                ${account.status 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                }
                                                            `}>
                                                                {account.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td> */}
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`
                p-4 pt-2 border-t flex flex-col sm:flex-row gap-2 justify-end
                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}>
                            {!loadingAccounts && clientAccounts.length > 0 && (
                                <button
                                    onClick={() => handleViewAccounts(selectedClient!)}
                                    className={`
                            w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md
                            border transition-colors flex items-center justify-center gap-2
                            ${theme === 'dark'
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }
                        `}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh Accounts
                                </button>
                            )}
                            <button
                                onClick={handleCloseAccountsDialog}
                                disabled={loadingAccounts}
                                className={`
                        w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md
                        border transition-colors
                        ${theme === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50'
                                    }
                    `}
                            >
                                {loadingAccounts ? 'Loading...' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ClientsPage
