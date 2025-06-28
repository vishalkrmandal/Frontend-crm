import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Ticket = {
    _id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    assignedTo?: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
};

type Client = {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
};

// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
    switch (status) {
        case "new":
            return "destructive";
        case "open":
            return "destructive";
        case "inProgress":
            return "default"; // Changed from "orange" to "default"
        case "resolved":
            return "blue";
        case "closed":
            return "green";
        default:
            return "default";
    }
}

// Format status for display
const formatStatus = (status: string) => {
    switch (status) {
        case "inProgress":
            return "In Progress";
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

export default function ClientTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [userRole, setUserRole] = useState<string>("");
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchClientData();
        fetchClientTickets();
        determineUserRole();

        // Set initial status filter from URL params
        const statusParam = searchParams.get("status");
        if (statusParam) {
            setStatusFilter(statusParam);
        }
    }, [id, searchParams]);

    // UPDATED: Support multiple token types (admin, superadmin, agent)
    const getToken = () => {
        const adminToken = localStorage.getItem("adminToken");
        const superadminToken = localStorage.getItem("superadminToken");
        const agentToken = localStorage.getItem("agentToken");

        // Priority: superadmin > admin > agent
        return superadminToken || adminToken || agentToken || null;
    };

    // UPDATED: Determine user role and set appropriate navigation paths
    const determineUserRole = () => {
        const adminToken = localStorage.getItem("adminToken");
        const superadminToken = localStorage.getItem("superadminToken");
        const agentToken = localStorage.getItem("agentToken");

        if (superadminToken) {
            const user = JSON.parse(localStorage.getItem("superadminUser") || "{}");
            setUserRole(user.role || "superadmin");
        } else if (adminToken) {
            const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
            setUserRole(user.role || "admin");
        } else if (agentToken) {
            const user = JSON.parse(localStorage.getItem("agentUser") || "{}");
            setUserRole(user.role || "agent");
        }
    };

    // UPDATED: Get appropriate back navigation path based on user role
    const getBackPath = () => {
        switch (userRole) {
            case "agent":
                return `/agent/support/client/${id}`;
            case "admin":
            case "superadmin":
            default:
                return `/admin/support/client/${id}`;
        }
    };

    // UPDATED: Get appropriate ticket detail path based on user role
    const getTicketDetailPath = (ticketId: string) => {
        switch (userRole) {
            case "agent":
                return `/agent/support/ticket/${ticketId}`;
            case "admin":
            case "superadmin":
            default:
                return `/admin/support/ticket/${ticketId}`;
        }
    };

    const fetchClientData = async () => {
        try {
            const token = getToken();
            if (!token) {
                setError("Authentication failed");
                return;
            }

            // UPDATED: Use the admin/clients endpoint which works for agents too
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/clients/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setClient(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching client data:", error);
            if (axios.isAxiosError(error)) {
                console.error("Client fetch error:", error.response?.data?.message);
            }
        }
    };

    const fetchClientTickets = async () => {
        try {
            const token = getToken();
            if (!token) {
                setError("Authentication failed");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/client/${id}/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setTickets(response.data.data);
            } else {
                setError("Failed to fetch tickets");
            }
        } catch (error) {
            console.error("Error fetching client tickets:", error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to fetch client tickets");
            } else {
                setError("Failed to fetch client tickets");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (ticketId: string) => {
        navigate(getTicketDetailPath(ticketId));
    };

    // Filter tickets based on search term and status
    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.assignedTo &&
                `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get ticket counts for status filter
    const getTicketCounts = () => {
        return {
            all: tickets.length,
            new: tickets.filter(t => t.status === "new").length,
            open: tickets.filter(t => t.status === "open").length,
            inProgress: tickets.filter(t => t.status === "inProgress").length,
            resolved: tickets.filter(t => t.status === "resolved").length,
            closed: tickets.filter(t => t.status === "closed").length,
        };
    };

    const ticketCounts = getTicketCounts();

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to={getBackPath()} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Client Profile</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Loading...</h1>
                        {/* UPDATED: Show user role badge */}
                        {userRole && (
                            <Badge variant="outline" className="ml-auto">
                                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                            </Badge>
                        )}
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p>Loading client tickets...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to={getBackPath()} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Client Profile</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Error</h1>
                        {/* UPDATED: Show user role badge */}
                        {userRole && (
                            <Badge variant="outline" className="ml-auto">
                                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                            </Badge>
                        )}
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-destructive">{error}</p>
                                <Button onClick={fetchClientTickets} variant="outline" className="mt-4">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to={getBackPath()} className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Client Profile</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">
                        {client ? `${client.firstname} ${client.lastname}'s Tickets` : "Client Tickets"}
                    </h1>
                    {/* UPDATED: Show user role badge */}
                    <Badge variant="outline" className="ml-auto">
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <CardTitle>
                                        {client ? `${client.firstname} ${client.lastname}'s Support Tickets` : "Support Tickets"}
                                    </CardTitle>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Search tickets..."
                                                className="pl-8"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full sm:w-40">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All ({ticketCounts.all})</SelectItem>
                                                <SelectItem value="new">New ({ticketCounts.new})</SelectItem>
                                                <SelectItem value="open">Open ({ticketCounts.open})</SelectItem>
                                                <SelectItem value="inProgress">In Progress ({ticketCounts.inProgress})</SelectItem>
                                                <SelectItem value="resolved">Resolved ({ticketCounts.resolved})</SelectItem>
                                                <SelectItem value="closed">Closed ({ticketCounts.closed})</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* UPDATED: Show filter summary */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                        Showing {filteredTickets.length} of {tickets.length} tickets
                                    </span>
                                    {statusFilter !== "all" && (
                                        <Badge variant="outline" className="text-xs">
                                            Status: {formatStatus(statusFilter)}
                                        </Badge>
                                    )}
                                    {searchTerm && (
                                        <Badge variant="outline" className="text-xs">
                                            Search: "{searchTerm}"
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredTickets.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">
                                        {searchTerm || statusFilter !== "all"
                                            ? "No tickets match your current filters."
                                            : "No tickets found."
                                        }
                                    </p>
                                    {(searchTerm || statusFilter !== "all") && (
                                        <Button
                                            variant="outline"
                                            className="mt-2"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setStatusFilter("all");
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ticket</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="pr-16">Status</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Last Updated</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTickets.map((ticket) => (
                                                <TableRow
                                                    key={ticket._id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleRowClick(ticket._id)}
                                                >
                                                    <TableCell className="font-medium">
                                                        {ticket.ticketNumber}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {ticket.subject}
                                                    </TableCell>
                                                    <TableCell>{ticket.category}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(ticket.status)}>
                                                            {formatStatus(ticket.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {ticket.assignedTo ? (
                                                            <span className="text-muted-foreground">
                                                                {ticket.assignedTo.firstname} {ticket.assignedTo.lastname}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(ticket.updatedAt).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}