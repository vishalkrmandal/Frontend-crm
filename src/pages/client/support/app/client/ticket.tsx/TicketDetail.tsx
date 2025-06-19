// Frontend\src\pages\client\support\app\client\ticket.tsx\TicketDetail.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Paperclip, Send, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
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

export default function TicketDetail() {
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // Define the Ticket and Message types for better type safety
    type Attachment = {
        _id: string;
        fileName: string;
        fileType: string;
        filePath: string;
    };

    type Message = {
        sender: {
            _id: string;
            firstname: string;
            lastname: string;
            role: string;
        };
        content: string;
        createdAt: string;
        attachments?: Attachment[];
    };

    type Ticket = {
        _id: string;
        subject: string;
        ticketNumber: string;
        category: string;
        createdAt: string;
        status: string;
        messages: Message[];
    };

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get user info from localStorage
    const getUserInfo = () => {
        const userJson = localStorage.getItem("clientUser");
        if (!userJson) return null;
        try {
            return JSON.parse(userJson);
        } catch (error) {
            console.error("Error parsing user info:", error);
            return null;
        }
    };

    const getToken = () => {
        return localStorage.getItem("clientToken");
    };

    useEffect(() => {
        fetchTicket();

        // Initialize socket connection
        const token = getToken();
        if (token) {
            const newSocket = io(`${API_BASE_URL}`, {
                auth: { token },
            });

            setSocket(newSocket);

            // Socket event listeners
            newSocket.on("connect", () => {
                console.log("Connected to socket server");
                // Join the ticket room
                newSocket.emit("joinTicket", id);
            });

            newSocket.on("newMessage", (message) => {
                // Update ticket with new message
                setTicket((prevTicket) => {
                    if (!prevTicket) return null;

                    return {
                        ...prevTicket,
                        messages: [...prevTicket.messages, message],
                    };
                });
            });

            newSocket.on("userTyping", (data) => {
                if (data.isTyping) {
                    setTypingUser(data.user);
                } else {
                    setTypingUser(null);
                }
            });

            newSocket.on("disconnect", () => {
                console.log("Disconnected from socket server");
            });

            newSocket.on("error", (error) => {
                console.error("Socket error:", error);
                toast.error("Connection error. Please refresh the page.");
            });
        }

        // Cleanup function
        return () => {
            if (socket) {
                socket.emit("leaveTicket", id);
                socket.disconnect();
            }
        };
    }, [id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    const fetchTicket = async () => {
        try {
            const token = getToken();

            if (!token) {
                setError("Authentication failed. Please log in again.");
                setLoading(false);
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setTicket(response.data.data);
            } else {
                setError("Failed to fetch ticket details");
            }
        } catch (error) {
            console.error("Error fetching ticket:", error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to fetch ticket details");
            } else {
                setError("Failed to fetch ticket details");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }

            // Check file type (only images and PDFs)
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast.error("Only image and PDF files are allowed");
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleTyping = () => {
        if (socket) {
            // Emit typing event
            if (!isTyping) {
                socket.emit("typing", {
                    ticketId: id,
                    isTyping: true,
                });
                setIsTyping(true);
            }

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing indicator after 2 seconds
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", {
                    ticketId: id,
                    isTyping: false,
                });
                setIsTyping(false);
            }, 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newMessage.trim() && !selectedFile) {
            toast.error("Please enter a message or attach a file");
            return;
        }

        try {
            setSending(true);

            const formData = new FormData();
            formData.append("content", newMessage);

            if (selectedFile) {
                formData.append("attachment", selectedFile);
            }

            const token = getToken();

            const response = await axios.post(
                `${API_BASE_URL}/api/tickets/${id}/messages`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                // Clear form
                setNewMessage("");
                setSelectedFile(null);

                // Update ticket with new message
                fetchTicket();

                // Emit the message through socket
                if (socket) {
                    socket.emit("sendMessage", {
                        ticketId: id,
                        content: newMessage,
                        attachments: response.data.data.attachments,
                    });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to send message");
            } else {
                toast.error("Failed to send message");
            }
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to="/client/support/clientportal?tab=notifications" className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Tickets</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Loading Ticket Details...</h1>
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p>Loading ticket details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to="/client/support/clientportal?tab=notifications" className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Tickets</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Error</h1>
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-destructive">{error || "Failed to load ticket details"}</p>
                                <Button onClick={fetchTicket} variant="outline" className="mt-4">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    const isClosed = ticket.status === "closed";
    const user = getUserInfo();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/client/support/clientportal?tab=notifications" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Tickets</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Ticket Details</h1>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{ticket.subject}</CardTitle>
                                    <CardDescription>Ticket #{ticket.ticketNumber}</CardDescription>
                                </div>
                                <Badge variant={getStatusVariant(ticket.status)}>
                                    {formatStatus(ticket.status)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium">Category</p>
                                    <p className="text-sm text-muted-foreground">{ticket.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(ticket.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-6 max-h-[400px] overflow-y-auto p-2">
                                {ticket.messages.map((message, index) => {
                                    const isClient =
                                        message.sender.role === "client" ||
                                        (user && message.sender._id === user.id);

                                    return (
                                        <div key={index} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-[80%] rounded-lg p-4 ${isClient
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                    }`}
                                            >
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <span className="text-xs font-medium">
                                                        {isClient
                                                            ? "You"
                                                            : `${message.sender.firstname} ${message.sender.lastname}`}
                                                    </span>
                                                    <span className="text-xs opacity-70">
                                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                {(message.attachments?.length ?? 0) > 0 && (
                                                    <div className="mt-2">
                                                        {message.attachments?.map((attachment) => {
                                                            const isImage = attachment.fileType.startsWith("image/");
                                                            const fileUrl = `${API_BASE_URL}/${attachment.filePath}`;

                                                            return (
                                                                <div
                                                                    key={attachment._id}
                                                                    className="flex flex-col mt-2"
                                                                >
                                                                    {isImage ? (
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="mt-2"
                                                                        >
                                                                            <img
                                                                                src={fileUrl}
                                                                                alt={attachment.fileName}
                                                                                className="max-w-full max-h-48 rounded-md"
                                                                            />
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-1 rounded-md bg-background/10 px-2 py-1 text-xs hover:underline"
                                                                        >
                                                                            <Paperclip className="h-3 w-3" />
                                                                            <span>{attachment.fileName}</span>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {typingUser && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-lg p-2 bg-muted">
                                            <p className="text-xs text-muted-foreground">
                                                {typingUser} is typing...
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div ref={messageEndRef} />
                            </div>
                        </CardContent>
                        {!isClosed ? (
                            <CardFooter>
                                <form onSubmit={handleSubmit} className="w-full space-y-4" id="ticket-message-form">
                                    <Textarea
                                        placeholder="Type your message here..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                const form = document.getElementById("ticket-message-form") as HTMLFormElement | null;
                                                form?.requestSubmit();
                                            }
                                        }}
                                        onInput={handleTyping}
                                        className="min-h-[100px]"
                                    />
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                                const fileInput = document.getElementById("message-file");
                                                if (fileInput) fileInput.click();
                                            }}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Attach File
                                        </Button>
                                        <Input
                                            id="message-file"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                                        />
                                        {selectedFile && (
                                            <span className="text-sm text-muted-foreground">
                                                {selectedFile.name}
                                            </span>
                                        )}
                                        <Button type="submit" className="ml-auto" disabled={sending}>
                                            <Send className="mr-2 h-4 w-4" />
                                            {sending ? "Sending..." : "Send Message"}
                                        </Button>
                                    </div>
                                </form>
                            </CardFooter>
                        ) : (
                            <CardFooter>
                                <div className="w-full rounded-lg bg-muted p-4 text-center text-sm">
                                    This ticket is closed. No further communication is allowed.
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}