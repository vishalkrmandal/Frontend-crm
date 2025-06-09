import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


type Ticket = {
    _id: string;
    subject: string;
    status: string;
    ticketNumber: string | number;
    updatedAt: string;
    // Add other fields as needed
};

const TicketList = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const getToken = () => {
        const clientToken = localStorage.getItem("clientToken");
        return clientToken ? clientToken : null;
    };

    const fetchTickets = async () => {
        try {
            const token = getToken();

            if (!token) {
                setError("Authentication failed. Please log in again.");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets`,
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
            console.error("Error fetching tickets:", error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to fetch tickets");
            } else if (error instanceof Error) {
                setError(error.message || "Failed to fetch tickets");
            } else {
                setError("Failed to fetch tickets");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "new":
                return "destructive";
            case "open":
                return "destructive";
            case "inProgress":
                return "red";
            case "resolved":
                return "blue";
            case "closed":
                return "secondary";
            default:
                return "secondary";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds

        if (diff < 60) {
            return "Just now";
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
        } else if (diff < 604800) {
            const days = Math.floor(diff / 86400);
            return `${days} ${days === 1 ? "day" : "days"} ago`;
        } else {
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    };

    // Format status for display
    const formatStatus = (status: string) => {
        switch (status) {
            case "inProgress":
                return "In Progress";
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p>Loading tickets...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button
                        onClick={fetchTickets}
                        variant="outline"
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (tickets.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p>You don't have any tickets yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
                <CardDescription>View and manage your support tickets</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{ticket.subject}</h3>
                                    <Badge variant={getStatusVariant(ticket.status)}>
                                        {formatStatus(ticket.status)}
                                    </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Ticket #{ticket.ticketNumber}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Updated {formatDate(ticket.updatedAt)}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to={`/client/support/ticket/${ticket._id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TicketList;