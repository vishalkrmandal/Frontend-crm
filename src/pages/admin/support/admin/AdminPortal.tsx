"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Download, Filter, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"

export default function AdminPortal() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState("all")

    // Helper function to get badge variant based on status
    function getStatusVariant(status: string) {
        switch (status) {
            case "Open":
                return "destructive"
            case "In Progress":
                return "blue"
            case "Pending":
                return "default"
            case "Solved":
                return "green"
            case "Closed":
                return "secondary"
            default:
                return "default"
        }
    }

    // Sample ticket data
    const tickets = [
        {
            id: "T-1001",
            subject: "Laptop Issue",
            status: "Open",
            category: "IT Support",
            assignedTo: "Edgar Hansel",
            lastUpdated: "10 hours ago",
        },
        {
            id: "T-1002",
            subject: "Payment Issue",
            status: "In Progress",
            category: "Billing",
            assignedTo: "Ann Lynch",
            lastUpdated: "15 hours ago",
        },
        {
            id: "T-1003",
            subject: "Bug Report",
            status: "Pending",
            category: "IT Support",
            assignedTo: "Juan Hermann",
            lastUpdated: "20 hours ago",
        },
        {
            id: "T-1004",
            subject: "Access Denied",
            status: "Open",
            category: "IT Support",
            assignedTo: "Jessie Otero",
            lastUpdated: "23 hours ago",
        },
        {
            id: "T-1005",
            subject: "Internet Issue",
            status: "Solved",
            category: "Network",
            assignedTo: "Edgar Hansel",
            lastUpdated: "2 days ago",
        },
    ]

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/admin" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Admin Dashboard</h1>
                    {/* <Button variant="outline" className="ml-auto">
                        Logout
                    </Button> */}
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
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
                                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                                    <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Ticket
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">120</div>
                                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                    <span className="text-green-500">+19.5%</span>
                                    <span className="ml-1">from last month</span>
                                </div>
                                <div className="mt-4 h-[80px]">
                                    {/* Bar chart would go here */}
                                    <div className="flex h-full items-end gap-1">
                                        {[40, 30, 45, 25, 60, 45, 55, 65, 50, 60, 70, 75].map((height, i) => (
                                            <div key={i} className="flex-1 bg-red-500/80" style={{ height: `${height}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">60</div>
                                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                    <span className="text-red-500">-10.8%</span>
                                    <span className="ml-1">from last month</span>
                                </div>
                                <div className="mt-4 h-[80px]">
                                    {/* Bar chart would go here */}
                                    <div className="flex h-full items-end gap-1">
                                        {[60, 45, 55, 40, 50, 35, 45, 55, 40, 50, 45, 40].map((height, i) => (
                                            <div key={i} className="flex-1 bg-purple-500/80" style={{ height: `${height}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Solved Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">50</div>
                                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                    <span className="text-green-500">+12.3%</span>
                                    <span className="ml-1">from last month</span>
                                </div>
                                <div className="mt-4 h-[80px]">
                                    {/* Bar chart would go here */}
                                    <div className="flex h-full items-end gap-1">
                                        {[30, 40, 35, 45, 50, 60, 55, 45, 50, 60, 65, 70].map((height, i) => (
                                            <div key={i} className="flex-1 bg-green-500/80" style={{ height: `${height}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">10</div>
                                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                    <span className="text-red-500">-5.2%</span>
                                    <span className="ml-1">from last month</span>
                                </div>
                                <div className="mt-4 h-[80px]">
                                    {/* Bar chart would go here */}
                                    <div className="flex h-full items-end gap-1">
                                        {[20, 15, 25, 10, 15, 20, 10, 15, 10, 5, 10, 15].map((height, i) => (
                                            <div key={i} className="flex-1 bg-blue-500/80" style={{ height: `${height}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8">
                        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <TabsList>
                                    <TabsTrigger value="all">All Tickets</TabsTrigger>
                                    <TabsTrigger value="open">Open</TabsTrigger>
                                    <TabsTrigger value="progress">In Progress</TabsTrigger>
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="solved">Solved</TabsTrigger>
                                </TabsList>
                                <div className="flex w-full gap-2 sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search tickets..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <TabsContent value="all" className="mt-6">
                                <Card>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Ticket ID</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Assigned To</TableHead>
                                                    <TableHead>Last Updated</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tickets
                                                    .filter(
                                                        (ticket) =>
                                                            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            ticket.id.toLowerCase().includes(searchQuery.toLowerCase()),
                                                    )
                                                    .map((ticket) => (
                                                        <TableRow key={ticket.id}>
                                                            <TableCell className="font-medium">{ticket.id}</TableCell>
                                                            <TableCell>{ticket.subject}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                                                            </TableCell>
                                                            <TableCell>{ticket.category}</TableCell>
                                                            <TableCell>{ticket.assignedTo}</TableCell>
                                                            <TableCell>{ticket.lastUpdated}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link to={`/admin/support/ticket/${ticket.id}`}>View</Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="open" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <p>Open tickets content</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="pending" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <p>Pending tickets content</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="solved" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <p>Solved tickets content</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}



