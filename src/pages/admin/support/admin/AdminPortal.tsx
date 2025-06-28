// Frontend\src\pages\admin\support\admin\AdminPortal.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Download, Filter, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import axios from "axios"
import ExcelJS from 'exceljs'
import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
    switch (status) {
        case "new":
            return "destructive"
        case "open":
            return "destructive"
        case "inProgress":
            return "red"
        case "resolved":
            return "blue"
        case "closed":
            return "secondary"
        default:
            return "default"
    }
}

// Format status for display
const formatStatus = (status: string) => {
    switch (status) {
        case "inProgress":
            return "In Progress"
        default:
            return status.charAt(0).toUpperCase() + status.slice(1)
    }
}

type User = {
    firstname: string
    lastname: string
}

type Ticket = {
    _id: string
    ticketNumber: string
    subject: string
    status: string
    category?: string
    createdBy?: User
    assignedTo?: User
    createdAt: string
    updatedAt: string
}

export default function AdminPortal() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState("all")
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [stats, setStats] = useState({
        totalTickets: 0,
        newTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string>("")
    const navigate = useNavigate()

    useEffect(() => {
        fetchTickets()
        fetchStats()
        determineUserRole()
    }, [filter])

    // UPDATED: Support multiple token types (admin, superadmin, agent)
    const getToken = () => {
        const adminToken = localStorage.getItem("adminToken")
        const superadminToken = localStorage.getItem("superadminToken")
        const agentToken = localStorage.getItem("agentToken")

        // Priority: superadmin > admin > agent
        return superadminToken || adminToken || agentToken || null
    }

    // UPDATED: Determine user role and set appropriate navigation paths
    const determineUserRole = () => {
        const adminToken = localStorage.getItem("adminToken")
        const superadminToken = localStorage.getItem("superadminToken")
        const agentToken = localStorage.getItem("agentToken")

        if (superadminToken) {
            const user = JSON.parse(localStorage.getItem("superadminUser") || "{}")
            setUserRole(user.role || "superadmin")
        } else if (adminToken) {
            const user = JSON.parse(localStorage.getItem("adminUser") || "{}")
            setUserRole(user.role || "admin")
        } else if (agentToken) {
            const user = JSON.parse(localStorage.getItem("agentUser") || "{}")
            setUserRole(user.role || "agent")
        }
    }

    // UPDATED: Get appropriate back navigation path based on user role
    const getBackPath = () => {
        switch (userRole) {
            case "agent":
                return "/agent/dashboard"
            case "admin":
            case "superadmin":
            default:
                return "/admin/dashboard"
        }
    }

    // UPDATED: Get appropriate new ticket path based on user role
    const getNewTicketPath = () => {
        switch (userRole) {
            case "agent":
                return "/agent/support/new-ticket"
            case "admin":
            case "superadmin":
            default:
                return "/admin/support/new-ticket"
        }
    }

    // UPDATED: Get appropriate ticket detail path based on user role
    const getTicketDetailPath = (ticketId: string) => {
        switch (userRole) {
            case "agent":
                return `/agent/support/ticket/${ticketId}`
            case "admin":
            case "superadmin":
            default:
                return `/admin/support/ticket/${ticketId}`
        }
    }

    const fetchTickets = async () => {
        try {
            const token = getToken()

            if (!token) {
                setError("Authentication failed. Please log in again.")
                setLoading(false)
                navigate("/login")
                return
            }

            let url = `${API_BASE_URL}/api/tickets`

            // Add status filter if not "all"
            if (filter !== "all") {
                url += `?status=${filter}`
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                setTickets(response.data.data)
            } else {
                setError("Failed to fetch tickets")
            }
        } catch (error) {
            console.error("Error fetching tickets:", error)
            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof (error as any).response === "object" &&
                (error as any).response !== null &&
                "data" in (error as any).response &&
                typeof (error as any).response.data === "object" &&
                (error as any).response.data !== null &&
                "message" in (error as any).response.data
            ) {
                setError((error as any).response.data.message || "Failed to fetch tickets")
            } else {
                setError("Failed to fetch tickets")
            }
            toast.error("Failed to fetch tickets")
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const token = getToken()

            if (!token) {
                return
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setStats(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    const exportToExcel = () => {
        try {
            // Filter tickets based on search query
            const filteredTickets = tickets.filter(
                (ticket) =>
                    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (ticket.category && ticket.category.toLowerCase().includes(searchQuery.toLowerCase()))
            )

            // Prepare data for export
            const data = filteredTickets.map((ticket) => ({
                "Ticket ID": ticket.ticketNumber,
                "Subject": ticket.subject,
                "Status": formatStatus(ticket.status),
                "Category": ticket.category,
                "Created By": ticket.createdBy ? `${ticket.createdBy.firstname} ${ticket.createdBy.lastname}` : "",
                "Assigned To": ticket.assignedTo ? `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}` : "Not Assigned",
                "Created At": new Date(ticket.createdAt).toLocaleString(),
                "Updated At": new Date(ticket.updatedAt).toLocaleString()
            }))

            // Create worksheet
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet("Tickets")

            // Add header row
            worksheet.columns = [
                { header: "Ticket ID", key: "Ticket ID", width: 15 },
                { header: "Subject", key: "Subject", width: 30 },
                { header: "Status", key: "Status", width: 15 },
                { header: "Category", key: "Category", width: 20 },
                { header: "Created By", key: "Created By", width: 25 },
                { header: "Assigned To", key: "Assigned To", width: 25 },
                { header: "Created At", key: "Created At", width: 22 },
                { header: "Updated At", key: "Updated At", width: 22 }
            ]

            // Add data rows
            data.forEach((row) => {
                worksheet.addRow(row)
            })

            // Style header row
            worksheet.getRow(1).font = { bold: true }

            // Generate file and trigger download
            workbook.xlsx.writeBuffer().then((buffer) => {
                const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "tickets_export.xlsx"
                a.click()
                window.URL.revokeObjectURL(url)
            })

            toast.success("Exported to Excel successfully")
        } catch (error) {
            console.error("Error exporting to Excel:", error)
            toast.error("Failed to export to Excel")
        }
    }

    const exportToPDF = () => {
        try {
            // Filter tickets based on search query
            const filteredTickets = tickets.filter(
                (ticket) =>
                    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (ticket.category && ticket.category.toLowerCase().includes(searchQuery.toLowerCase()))
            )

            // Create PDF document
            const doc = new jsPDF()

            // Add title
            doc.setFontSize(16)
            doc.text("Tickets Report", 14, 15)

            // Add date
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22)

            // Add table
            const columns = [
                { header: "Ticket ID", dataKey: "id" },
                { header: "Subject", dataKey: "subject" },
                { header: "Status", dataKey: "status" },
                { header: "Category", dataKey: "category" },
                { header: "Created By", dataKey: "createdBy" },
                { header: "Updated At", dataKey: "updatedAt" }
            ]

            type RowType = {
                id: string
                subject: string
                status: string
                category: string
                createdBy: string
                updatedAt: string
            }

            const rows: RowType[] = filteredTickets.map((ticket) => ({
                id: ticket.ticketNumber,
                subject: ticket.subject,
                status: formatStatus(ticket.status),
                category: ticket.category || "",
                createdBy: ticket.createdBy ? `${ticket.createdBy.firstname} ${ticket.createdBy.lastname}` : "",
                updatedAt: new Date(ticket.updatedAt).toLocaleDateString()
            }))

            // Generate table
            autoTable(doc, {
                head: [columns.map((column) => column.header)],
                body: rows.map((row) => columns.map((column) => row[column.dataKey as keyof RowType])),
                startY: 30,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [66, 66, 66] }
            })

            // Save the PDF
            doc.save("tickets_report.pdf")

            toast.success("Exported to PDF successfully")
        } catch (error) {
            console.error("Error exporting to PDF:", error)
            toast.error("Failed to export to PDF")
        }
    }

    // Filter tickets based on search query
    const filteredTickets = tickets.filter(
        (ticket) =>
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.category && ticket.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to={getBackPath()} className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Support Dashboard</h1>
                    {/* UPDATED: Show user role badge */}
                    <Badge variant="outline" className="ml-auto">
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-2">
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 className="text-3xl font-bold tracking-tight">Tickets</h2>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={exportToPDF}>
                                        Export as PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToExcel}>
                                        Export as Excel
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Link to={getNewTicketPath()}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Ticket
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.newTickets || 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    New and unassigned tickets
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.openTickets || 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Tickets awaiting response
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Closed Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.closedTickets || 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Completed and archived tickets
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Progress Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.inProgressTickets || 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Tickets currently being addressed
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8">
                        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="w-full sm:w-auto overflow-x-auto">
                                    <TabsList className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-0 w-full sm:w-auto min-w-max">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-card">All Tickets</TabsTrigger>
                                        <TabsTrigger value="new" className="data-[state=active]:bg-card">New</TabsTrigger>
                                        <TabsTrigger value="open" className="data-[state=active]:bg-card">Open</TabsTrigger>
                                        <TabsTrigger value="inProgress" className="data-[state=active]:bg-card">In Progress</TabsTrigger>
                                        <TabsTrigger value="resolved" className="data-[state=active]:bg-card">Resolved</TabsTrigger>
                                        <TabsTrigger value="closed" className="data-[state=active]:bg-card">Closed</TabsTrigger>
                                    </TabsList>
                                </div>
                                <div className="flex w-full gap-2 sm:w-auto">
                                    <div className="relative flex-1 sm:w-76">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search tickets..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <TabsContent value={filter} className="mt-6">
                                <Card>
                                    <CardContent className="p-0">
                                        {loading ? (
                                            <div className="flex justify-center items-center p-8">
                                                <p>Loading tickets...</p>
                                            </div>
                                        ) : error ? (
                                            <div className="flex flex-col justify-center items-center p-8">
                                                <p className="text-destructive">{error}</p>
                                                <Button onClick={fetchTickets} variant="outline" className="mt-4">
                                                    Try Again
                                                </Button>
                                            </div>
                                        ) : filteredTickets.length === 0 ? (
                                            <div className="flex justify-center items-center p-8">
                                                <p>No tickets found.</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="pr-8">Ticket ID</TableHead>
                                                        <TableHead className="pr-8">Subject</TableHead>
                                                        <TableHead className="pr-16">Status</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Created By</TableHead>
                                                        <TableHead>Assigned To</TableHead>
                                                        <TableHead>Last Updated</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredTickets.map((ticket) => (
                                                        <TableRow key={ticket._id}>
                                                            <TableCell className="font-medium">
                                                                {ticket.ticketNumber}
                                                            </TableCell>
                                                            <TableCell>{ticket.subject}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={getStatusVariant(ticket.status)}>
                                                                    {formatStatus(ticket.status)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{ticket.category}</TableCell>
                                                            <TableCell>
                                                                {ticket.createdBy
                                                                    ? `${ticket.createdBy.firstname} ${ticket.createdBy.lastname}`
                                                                    : "Unknown"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {ticket.assignedTo
                                                                    ? `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}`
                                                                    : "Unassigned"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button className="border" variant="ghost" size="sm" asChild>
                                                                    <Link to={getTicketDetailPath(ticket._id)}>
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div >
            </main >
        </div >
    )
}