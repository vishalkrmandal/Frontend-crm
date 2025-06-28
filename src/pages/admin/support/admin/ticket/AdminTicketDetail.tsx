// Frontend\src\pages\admin\support\admin\ticket\AdminTicketDetail.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Paperclip, Send, Upload, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { io, Socket } from "socket.io-client"

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
            return "green"
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

type Attachment = {
    _id: string
    fileName: string
    filePath: string
    fileType: string
}

type Message = {
    _id: string
    sender: {
        _id: string
        firstname: string
        lastname: string
        role: string
        email?: string
    }
    content: string
    createdAt: string
    attachments?: Attachment[]
}

type Ticket = {
    _id: string
    subject: string
    ticketNumber: string
    status: string
    assignedTo?: {
        _id: string
        firstname: string
        lastname: string
        email?: string
    }
    createdBy?: {
        _id: string
        firstname: string
        lastname: string
        email?: string
    }
    category?: string
    createdAt: string
    messages: Message[]
}

type Admin = {
    _id: string
    firstname: string
    lastname: string
    email?: string
    role: string
}



export default function AdminTicketDetail() {
    const [newMessage, setNewMessage] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [status, setStatus] = useState("")
    const [assignee, setAssignee] = useState("")
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [admins, setAdmins] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sending, setSending] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [typingUser, setTypingUser] = useState<string | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [userRole, setUserRole] = useState<string>("")
    const { id } = useParams()
    const navigate = useNavigate()
    const messageEndRef = useRef<HTMLDivElement | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [clientStats, setClientStats] = useState({ totalTickets: 0 });

    // UPDATED: Support multiple token types (admin, superadmin, agent)
    const getToken = () => {
        const adminToken = localStorage.getItem("adminToken")
        const superadminToken = localStorage.getItem("superadminToken")
        const agentToken = localStorage.getItem("agentToken")

        // Priority: superadmin > admin > agent
        return superadminToken || adminToken || agentToken || null
    }

    // Get user info from localStorage
    const getUserInfo = () => {
        const adminToken = localStorage.getItem("adminToken")
        const superadminToken = localStorage.getItem("superadminToken")
        const agentToken = localStorage.getItem("agentToken")

        if (superadminToken) {
            const userJson = localStorage.getItem("superadminUser")
            return userJson ? JSON.parse(userJson) : null
        } else if (adminToken) {
            const userJson = localStorage.getItem("adminUser")
            return userJson ? JSON.parse(userJson) : null
        } else if (agentToken) {
            const userJson = localStorage.getItem("agentUser")
            return userJson ? JSON.parse(userJson) : null
        }
        return null
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
                return "/agent/support/portal"
            case "admin":
            case "superadmin":
            default:
                return "/admin/support/portal"
        }
    }

    // UPDATED: Get appropriate client detail path based on user role
    const getClientDetailPath = (clientId: string) => {
        switch (userRole) {
            case "agent":
                return `/agent/support/client/${clientId}`
            case "admin":
            case "superadmin":
            default:
                return `/admin/support/client/${clientId}`
        }
    }

    const fetchClientStats = async (clientId: string) => {
        try {
            if (!clientId) return;

            const token = getToken();
            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/client/${clientId}/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setClientStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching client stats:", error);
        }
    };

    // Call this function when ticket loads
    useEffect(() => {
        if (ticket?.createdBy?._id) {
            fetchClientStats(ticket.createdBy._id);
        }
    }, [ticket]);

    useEffect(() => {
        fetchTicket()
        fetchAdmins()
        determineUserRole()

        // Initialize socket connection
        const token = getToken()
        if (token) {
            const newSocket = io(`${API_BASE_URL}`, {
                auth: { token },
            })

            setSocket(newSocket)

            // Socket event listeners
            newSocket.on("connect", () => {
                console.log("Connected to socket server")
                // Join the ticket room
                newSocket.emit("joinTicket", id)
            })

            newSocket.on("newMessage", (message) => {
                // Update ticket with new message
                setTicket((prevTicket) => {
                    if (!prevTicket) return null

                    return {
                        ...prevTicket,
                        messages: [...prevTicket.messages, message],
                    }
                })
            })

            newSocket.on("userTyping", (data) => {
                if (data.isTyping) {
                    setTypingUser(data.user)
                } else {
                    setTypingUser(null)
                }
            })

            newSocket.on("disconnect", () => {
                console.log("Disconnected from socket server")
            })

            newSocket.on("error", (error) => {
                console.error("Socket error:", error)
                toast.error("Connection error. Please refresh the page.")
            })
        }

        // Cleanup function
        return () => {
            if (socket) {
                socket.emit("leaveTicket", id)
                socket.disconnect()
            }
        }
    }, [id])

    // Scroll to bottom when messages change
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    // Set status and assignee when ticket is loaded
    useEffect(() => {
        if (ticket) {
            setStatus(ticket.status)
            setAssignee(ticket.assignedTo?._id || "unassigned")
        }
    }, [ticket])

    const fetchTicket = async () => {
        try {
            const token = getToken()

            if (!token) {
                setError("Authentication failed. Please log in again.")
                setLoading(false)
                navigate("/login")
                return
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log("Ticket response:", response.data);

            if (response.data.success) {
                setTicket(response.data.data)
            } else {
                setError("Failed to fetch ticket details")
            }
        } catch (error) {
            console.error("Error fetching ticket:", error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to fetch ticket details")
            } else {
                setError("Failed to fetch ticket details")
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchAdmins = async () => {
        try {
            const token = getToken();

            if (!token) {
                return;
            }

            // UPDATED: Include agents in the assignable users list
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/clients?role=admin,superadmin,agent`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                // Filter to make sure we only include admin/agent users
                const assignableUsers = response.data.data.filter(
                    (user: Admin) => ['admin', 'superadmin', 'agent'].includes(user.role)
                );
                setAdmins(assignableUsers);
            }
        } catch (error) {
            console.error("Error fetching assignable users:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB")
                return
            }

            // Check file type (only images and PDFs)
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
            if (!validTypes.includes(file.type)) {
                toast.error("Only image and PDF files are allowed")
                return
            }

            setSelectedFile(file)
        }
    }

    const handleTyping = () => {
        if (socket) {
            // Emit typing event
            if (!isTyping) {
                socket.emit("typing", {
                    ticketId: id,
                    isTyping: true,
                })
                setIsTyping(true)
            }

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }

            // Set timeout to stop typing indicator after 2 seconds
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", {
                    ticketId: id,
                    isTyping: false,
                })
                setIsTyping(false)
            }, 2000)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!newMessage.trim() && !selectedFile) {
            toast.error("Please enter a message or attach a file")
            return
        }

        try {
            setSending(true)

            const formData = new FormData()
            formData.append("content", newMessage)

            if (selectedFile) {
                formData.append("attachment", selectedFile)
            }

            const token = getToken()

            const response = await axios.post(
                `${API_BASE_URL}/api/tickets/${id}/messages`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            if (response.data.success) {
                // Clear form
                setNewMessage("")
                setSelectedFile(null)

                // Update ticket with new message
                fetchTicket()

                // Emit the message through socket
                if (socket) {
                    socket.emit("sendMessage", {
                        ticketId: id,
                        content: newMessage,
                        attachments: response.data.data.attachments,
                    })
                }
            }
        } catch (error) {
            console.error("Error sending message:", error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to send message")
            } else {
                toast.error("Failed to send message")
            }
        } finally {
            setSending(false)
        }
    }

    const updateTicket = async () => {
        try {
            setUpdating(true)

            const token = getToken()

            // Convert "unassigned" back to empty string for API
            const assignedToValue = assignee === "unassigned" ? "" : assignee

            const response = await axios.put(
                `${API_BASE_URL}/api/tickets/${id}`,
                {
                    status,
                    assignedTo: assignedToValue || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                toast.success("Ticket updated successfully")
                fetchTicket()
            } else {
                toast.error("Failed to update ticket")
            }
        } catch (error) {
            console.error("Error updating ticket:", error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to update ticket")
            } else {
                toast.error("Failed to update ticket")
            }
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-2">
                        <Link to={getBackPath()} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Loading Ticket Details...</h1>
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
                        <p>Loading ticket details...</p>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !ticket) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to={getBackPath()} className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
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
                                <p className="text-destructive">{error || "Failed to load ticket details"}</p>
                                <Button onClick={fetchTicket} variant="outline" className="mt-4">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        )
    }

    const isClosed = ticket.status === "closed"
    const user = getUserInfo()

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to={getBackPath()} className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Ticket Details</h1>
                    {/* UPDATED: Show user role badge */}
                    <Badge variant="outline" className="ml-auto">
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-1">
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader className="flex-shrink-0">
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
                                            const isAdmin = message.sender.role !== "client"

                                            return (
                                                <div key={index} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                                    <div
                                                        className={`max-w-[80%] rounded-lg p-4 ${isAdmin
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                            }`}
                                                    >
                                                        <div className="mb-1 flex items-center justify-between gap-2">
                                                            <span className="text-xs font-medium">
                                                                {isAdmin && user && message.sender._id === user.id
                                                                    ? "You"
                                                                    : isAdmin
                                                                        ? `${message.sender.firstname} ${message.sender.lastname}`
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
                                                                    const isImage = attachment.fileType.startsWith("image/")
                                                                    const fileUrl = `${API_BASE_URL}/${attachment.filePath}`

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
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
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
                                        <form onSubmit={handleSubmit} className="w-full space-y-4" id="admin-ticket-message-form">
                                            <Textarea
                                                placeholder="Type your response here..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        const form = document.getElementById("admin-ticket-message-form") as HTMLFormElement | null;
                                                        form?.requestSubmit();
                                                    }
                                                }}
                                                onInput={handleTyping}
                                                className="min-h-[100px]"
                                            />
                                            <div className="flex justify-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => {
                                                        const fileInput = document.getElementById("admin-message-file");
                                                        if (fileInput) fileInput.click();
                                                    }}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Attach File
                                                </Button>
                                                <Input
                                                    id="admin-message-file"
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
                                                    {sending ? "Sending..." : "Send Response"}
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

                        <div className="space-y-6 h-full overflow-y-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ticket Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <Select
                                            value={status}
                                            onValueChange={setStatus}
                                            disabled={updating}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="inProgress">In Progress</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Assigned To</p>
                                        <Select
                                            value={assignee}
                                            onValueChange={setAssignee}
                                            disabled={updating}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select assignee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {admins.map((admin) => (
                                                    <SelectItem key={admin._id} value={admin._id}>
                                                        {admin.firstname} {admin.lastname} ({admin.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

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

                                    <div className="flex justify-end">
                                        <Button onClick={updateTicket} disabled={updating}>
                                            {updating ? "Updating..." : "Update Ticket"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src="" />
                                            <AvatarFallback>
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {ticket.createdBy?.firstname} {ticket.createdBy?.lastname}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {ticket.createdBy?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-sm font-medium">Total Tickets</p>
                                        <p className="text-sm text-muted-foreground">
                                            {clientStats.totalTickets || "0"}
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            asChild
                                        >
                                            <Link to={getClientDetailPath(ticket.createdBy?._id || "")}>
                                                View Customer Profile
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden">
                        {/* Ticket Info Cards */}
                        <div className="space-y-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Ticket Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium">Status</p>
                                            <Select
                                                value={status}
                                                onValueChange={setStatus}
                                                disabled={updating}
                                            >
                                                <SelectTrigger className="mt-1 h-8">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">New</SelectItem>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="inProgress">In Progress</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium">Assigned To</p>
                                            <Select
                                                value={assignee}
                                                onValueChange={setAssignee}
                                                disabled={updating}
                                            >
                                                <SelectTrigger className="mt-1 h-8">
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {admins.map((admin) => (
                                                        <SelectItem key={admin._id} value={admin._id}>
                                                            {admin.firstname} {admin.lastname} ({admin.role})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium">Category</p>
                                            <p className="text-xs text-muted-foreground">{ticket.category}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(ticket.createdAt).toLocaleString()}
                                            </p>
                                        </div>


                                        <div className="flex justify-end">
                                            <Button onClick={updateTicket} disabled={updating} size="sm">
                                                {updating ? "Updating..." : "Update"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-sm">Customer Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 pb-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" />
                                                <AvatarFallback>
                                                    <User className="h-3 w-3" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs font-medium">
                                                    {ticket.createdBy?.firstname} {ticket.createdBy?.lastname}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {ticket.createdBy?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <br />
                                            <p className="text-xs font-medium pb-2">Total Tickets</p>
                                            <p className="text-xs text-muted-foreground pb-8">
                                                {clientStats.totalTickets || "0"}
                                            </p>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link to={getClientDetailPath(ticket.createdBy?._id || "")}>
                                                    View Customer Profile
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Chat Section - Fixed at bottom */}
                        <Card>
                            <CardHeader> {/* 🔄 CHANGED: Added proper CardHeader like main section */}
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
                                <div className="grid gap-4 md:grid-cols-2"> {/* 🔄 CHANGED: Added category/created info like main */}
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

                                <Separator className="my-6" /> {/* 🔄 CHANGED: Added separator like main */}

                                <div className="space-y-6 max-h-[400px] overflow-y-auto p-2"> {/* 🔄 CHANGED: Same container as main */}
                                    {ticket.messages.map((message, index) => {
                                        const isAdmin = message.sender.role !== "client"

                                        return (
                                            <div key={index} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[80%] rounded-lg p-4 ${isAdmin /* 🔄 CHANGED: max-w-[80%] and p-4 (was max-w-[85%] and p-3) */
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted"
                                                        }`}
                                                >
                                                    <div className="mb-1 flex items-center justify-between gap-2">
                                                        <span className="text-xs font-medium">
                                                            {isAdmin && user && message.sender._id === user.id
                                                                ? "You"
                                                                : isAdmin
                                                                    ? `${message.sender.firstname} ${message.sender.lastname}`
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
                                                                const isImage = attachment.fileType.startsWith("image/")
                                                                const fileUrl = `${API_BASE_URL}/${attachment.filePath}`

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
                                                                                    className="max-w-full max-h-48 rounded-md" /* 🔄 CHANGED: max-h-48 (was max-h-32) */
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
                                                                                <span>{attachment.fileName}</span> {/* 🔄 CHANGED: Removed break-all */}
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {typingUser && (
                                        <div className="flex justify-start">
                                            <div className="max-w-[80%] rounded-lg p-2 bg-muted"> {/* 🔄 CHANGED: max-w-[80%] (was max-w-[85%]) */}
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
                                    <form onSubmit={handleSubmit} className="w-full space-y-4" id="admin-mobile-ticket-message-form">
                                        <Textarea
                                            placeholder="Type your response here..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    const form = document.getElementById("admin-mobile-ticket-message-form") as HTMLFormElement | null;
                                                    form?.requestSubmit();
                                                }
                                            }}
                                            onInput={handleTyping}
                                            className="min-h-[100px]" /* 🔄 CHANGED: min-h-[100px] (was min-h-[60px] resize-none) */
                                        />
                                        <div className="flex justify-center gap-4"> {/* 🔄 CHANGED: justify-center gap-4 (was items-center gap-2 flex-wrap) */}
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() => {
                                                    const fileInput = document.getElementById("admin-message-file-mobile");
                                                    if (fileInput) fileInput.click();
                                                }}
                                            /* 🔄 CHANGED: Removed size="sm" */
                                            >
                                                <Upload className="mr-2 h-4 w-4" /> {/* 🔄 CHANGED: mr-2 h-4 w-4 (was mr-1 h-3 w-3) */}
                                                Attach File {/* 🔄 CHANGED: "Attach File" (was "Attach") */}
                                            </Button>
                                            <Input
                                                id="admin-message-file-mobile"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png,.gif"
                                            />
                                            {selectedFile && (
                                                <span className="text-sm text-muted-foreground"> {/* 🔄 CHANGED: Removed break-all flex-1 */}
                                                    {selectedFile.name}
                                                </span>
                                            )}
                                            <Button type="submit" className="ml-auto" disabled={sending}> {/* 🔄 CHANGED: Removed size="sm" */}
                                                <Send className="mr-2 h-4 w-4" /> {/* 🔄 CHANGED: mr-2 h-4 w-4 (was mr-1 h-3 w-3) */}
                                                {sending ? "Sending..." : "Send Response"} {/* 🔄 CHANGED: "Send Response" (was "Send") */}
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
                </div>
            </main>
        </div>
    )
}