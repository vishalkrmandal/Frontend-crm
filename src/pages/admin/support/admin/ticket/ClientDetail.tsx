// src/pages/admin/clients/ClientDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, ChevronLeft, Mail, Phone, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Client = {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    createdAt: string;
    status: string;
    isEmailVerified?: boolean;
    lastLoginAt?: string;
    // add other fields as needed
};

type TicketStats = {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    inProgressTickets: number;
};

export default function ClientDetail() {
    const [client, setClient] = useState<Client | null>(null);
    const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>("");
    const { id } = useParams();

    useEffect(() => {
        fetchClient();
        fetchTicketStats();
        determineUserRole();
    }, [id]);

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
                return "/agent/support/portal";
            case "admin":
            case "superadmin":
            default:
                return "/admin/support/portal";
        }
    };

    // UPDATED: Get appropriate tickets path based on user role
    const getTicketsPath = () => {
        switch (userRole) {
            case "agent":
                return `/agent/support/client/${client?._id}/tickets`;
            case "admin":
            case "superadmin":
            default:
                return `/admin/support/client/${client?._id}/tickets`;
        }
    };

    const fetchClient = async () => {
        try {
            const token = getToken();
            if (!token) {
                setError("Authentication failed");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/clients/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Client response:", response.data);

            if (response.data.success) {
                setClient(response.data.data);
            } else {
                setError("Failed to fetch client");
            }
        } catch (error) {
            console.error("Error fetching client:", error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to fetch client details");
            } else {
                setError("Failed to fetch client details");
            }
        } finally {
            setLoading(false);
        }
    };

    // NEW: Fetch ticket statistics for the client
    const fetchTicketStats = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/client/${id}/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setTicketStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching ticket stats:", error);
            // Don't set error here as this is optional data
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to={getBackPath()} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Loading...</h1>
                        {/* Show user role badge */}
                        {userRole && (
                            <Badge variant="outline" className="ml-auto">
                                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                            </Badge>
                        )}
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p>Loading client details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to={getBackPath()} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Error</h1>
                        {/* Show user role badge */}
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
                                <p className="text-destructive">{error || "Could not load client"}</p>
                                <Button onClick={fetchClient} variant="outline" className="mt-4">
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
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Client Profile</h1>
                    {/* UPDATED: Show user role badge */}
                    <Badge variant="outline" className="ml-auto">
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Main Client Information */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Client Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarFallback>
                                                <User className="h-8 w-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold">
                                                {client.firstname} {client.lastname}
                                            </h2>
                                            <p className="text-muted-foreground">{client.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge
                                                    variant={client.status === 'activated' ? 'default' : 'destructive'}
                                                >
                                                    {client.status === 'activated' ? 'Active' : 'Suspended'}
                                                </Badge>
                                                {client.isEmailVerified && (
                                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                                        Email Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <p className="font-medium text-sm">Contact Information</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{client.email}</span>
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="font-medium text-sm">Account Details</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>Joined: {new Date(client.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {client.lastLoginAt && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>Last Login: {new Date(client.lastLoginAt).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex flex-wrap gap-2">
                                            <Button asChild variant="default">
                                                <Link to={getTicketsPath()}>
                                                    <Ticket className="mr-2 h-4 w-4" />
                                                    View Client Tickets
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline">
                                                <Link to={`${getBackPath()}?search=${client.email}`}>
                                                    View All Tickets
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ticket Statistics Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Ticket Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {ticketStats ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {ticketStats.totalTickets}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Total</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-orange-600">
                                                        {ticketStats.openTickets}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Open</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {ticketStats.inProgressTickets}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">In Progress</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {ticketStats.closedTickets}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Closed</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <p>Loading statistics...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link to={getTicketsPath()}>
                                            <Ticket className="mr-2 h-4 w-4" />
                                            All Tickets
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link to={`${getTicketsPath()}?status=open`}>
                                            <Ticket className="mr-2 h-4 w-4" />
                                            Open Tickets
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link to={`${getTicketsPath()}?status=inProgress`}>
                                            <Ticket className="mr-2 h-4 w-4" />
                                            In Progress
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}