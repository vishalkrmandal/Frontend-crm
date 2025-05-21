// src/pages/admin/clients/ClientDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ChevronLeft, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type Client = {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    createdAt: string;
    status: string;
    // add other fields as needed
};

export default function ClientDetail() {
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();

    useEffect(() => {
        fetchClient();
    }, [id]);

    const getToken = () => {
        return localStorage.getItem("adminToken");
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
                `${import.meta.env.VITE_API_URL}/api/admin/clients/${id}`,
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
            setError("Failed to fetch client details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error || !client) return <p>Error: {error || "Could not load client"}</p>;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/admin/support/portal" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Clients</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Client Profile</h1>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
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
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {client.firstname} {client.lastname}
                                    </h2>
                                    <p className="text-muted-foreground">{client.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="font-medium">Contact Information</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4" />
                                        <span>{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4" />
                                        <span>{client.phone}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="font-medium">Account Details</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4" />
                                        <span>Joined: {new Date(client.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Status:</span>
                                        <span className={client.status === 'activated' ? 'text-green-500' : 'text-red-500'}>
                                            {client.status === 'activated' ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Add other client information as needed */}

                            <div className="mt-6">
                                <Button asChild variant="outline">
                                    <Link to={`/admin/support/client/${client._id}/tickets`}>
                                        View Client Tickets
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}