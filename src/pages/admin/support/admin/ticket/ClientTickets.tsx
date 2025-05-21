import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchClientData();
        fetchClientTickets();
    }, [id]);

    const getToken = () => {
        return localStorage.getItem("adminToken");
    };

    const fetchClientData = async () => {
        try {
            const token = getToken();
            if (!token) {
                setError("Authentication failed");
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/clients/${id}`,
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
                `${import.meta.env.VITE_API_URL}/api/tickets/client/${id}/all`,
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
            setError("Failed to fetch client tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (ticketId: string) => {
        navigate(`/admin/support/ticket/${ticketId}`);
    };

    // Filter tickets based on search term
    const filteredTickets = tickets.filter(
        (ticket) =>
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to={`/admin/support/client/${id}`} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Client Profile</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Loading...</h1>
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
                        <Link to={`/admin/support/client/${id}`} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Client Profile</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Error</h1>
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-destructive">{error}</p>
                        <Button onClick={fetchClientTickets} variant="outline" className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to={`/admin/support/client/${id}`} className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Client Profile</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">
                        {client ? `${client.firstname} ${client.lastname}'s Tickets` : "Client Tickets"}
                    </h1>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <CardTitle>
                                    {client ? `${client.firstname} ${client.lastname}'s Support Tickets` : "Support Tickets"}
                                </CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search tickets..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredTickets.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">No tickets found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ticket</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Status</TableHead>
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
                                                    <TableCell>{ticket.subject}</TableCell>
                                                    <TableCell>{ticket.category}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(ticket.status)}>
                                                            {formatStatus(ticket.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
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