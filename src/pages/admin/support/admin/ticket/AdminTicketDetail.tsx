"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Paperclip, Send, Upload, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, useParams } from "react-router-dom"




// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
    switch (status) {
        case "Open":
            return "destructive"
        case "In Progress":
            return "red"
        case "Pending":
            return "green"
        case "Solved":
            return "blue"
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
        createdAt: "March 10, 2025 at 9:30 AM",
        customer: {
            name: "Sophia Anderson",
            email: "sophia@example.com",
            totalTickets: 3,
        },
        messages: [
            {
                sender: "Sophia Anderson",
                isCustomer: true,
                time: "March 10, 9:30 AM",
                content:
                    "My laptop keeps shutting down randomly. I've already tried restarting it multiple times but the issue persists.",
                attachment: null,
            },
            {
                sender: "Edgar Hansel",
                isCustomer: false,
                time: "March 10, 10:15 AM",
                content:
                    "Thank you for reporting this issue. Could you please provide more details about when this started happening? Also, have you installed any new software recently?",
                attachment: null,
            },
            {
                sender: "Sophia Anderson",
                isCustomer: true,
                time: "March 10, 11:00 AM",
                content:
                    "It started happening yesterday. I installed a software update for my graphics card two days ago. I've attached a screenshot of the error message I'm seeing before shutdown.",
                attachment: "error-screenshot.png",
            },
        ],
    },
    {
        id: "T-1002",
        subject: "Payment Issue",
        status: "In Progress",
        category: "Billing",
        createdAt: "March 9, 2025 at 2:45 PM",
        customer: {
            name: "Michael Johnson",
            email: "michael@example.com",
            totalTickets: 1,
        },
        messages: [
            {
                sender: "Michael Johnson",
                isCustomer: true,
                time: "March 9, 2:45 PM",
                content:
                    "I was charged twice for my monthly subscription. Could you please look into this and refund the extra charge?",
                attachment: "billing-statement.pdf",
            },
            {
                sender: "Ann Lynch",
                isCustomer: false,
                time: "March 9, 3:30 PM",
                content:
                    "I'm sorry to hear about the double charge. I can see the duplicate transaction in our system. I'll process a refund right away. It should appear in your account within 3-5 business days.",
                attachment: null,
            },
        ],
    },
]



export default function AdminTicketDetail() {
    const [newMessage, setNewMessage] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [status, setStatus] = useState("Open")
    const [assignee, setAssignee] = useState("Edgar Hansel")
    const { id } = useParams()

    // Find ticket by ID (in a real app, this would be fetched from an API)
    const ticket = tickets.find((t) => t.id === id) || {
        id: id,
        subject: "Unknown Ticket",
        status: "Unknown",
        category: "Unknown",
        createdAt: "Unknown",
        customer: {
            name: "Unknown",
            email: "unknown@example.com",
            totalTickets: 0,
        },
        messages: [],
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, this would send the message to the server
        setNewMessage("")
        setSelectedFile(null)
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/support/admin" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Ticket Details</h1>
                    {/* <Button variant="outline" className="ml-auto">
                        Logout
                    </Button> */}
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{ticket.subject}</CardTitle>
                                            <CardDescription>Ticket #{ticket.id}</CardDescription>
                                        </div>
                                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {ticket.messages.map((message, index) => (
                                            <div key={index} className={`flex ${message.isCustomer ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[80%] rounded-lg p-4 ${message.isCustomer ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                                                >
                                                    <div className="mb-1 flex items-center justify-between gap-2">
                                                        <span className="text-xs font-medium">{message.sender}</span>
                                                        <span className="text-xs opacity-70">{message.time}</span>
                                                    </div>
                                                    <p className="text-sm">{message.content}</p>
                                                    {message.attachment && (
                                                        <div className="mt-2 flex items-center gap-1 rounded-md bg-background/10 px-2 py-1 text-xs">
                                                            <Paperclip className="h-3 w-3" />
                                                            <span>{message.attachment}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                                        <Textarea
                                            placeholder="Type your response here..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() => document.getElementById("admin-message-file")?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Attach File
                                            </Button>
                                            <Input id="admin-message-file" type="file" className="hidden" onChange={handleFileChange} />
                                            {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                                            <Button type="submit" className="ml-auto">
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Response
                                            </Button>
                                        </div>
                                    </form>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ticket Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Solved">Solved</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Assigned To</p>
                                        <Select value={assignee} onValueChange={setAssignee}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select agent" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Edgar Hansel">Edgar Hansel</SelectItem>
                                                <SelectItem value="Ann Lynch">Ann Lynch</SelectItem>
                                                <SelectItem value="Juan Hermann">Juan Hermann</SelectItem>
                                                <SelectItem value="Jessie Otero">Jessie Otero</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Category</p>
                                        <p className="text-sm text-muted-foreground">{ticket.category}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Created</p>
                                        <p className="text-sm text-muted-foreground">{ticket.createdAt}</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button>Update Ticket</Button>
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
                                            <p className="font-medium">{ticket.customer.name}</p>
                                            <p className="text-sm text-muted-foreground">{ticket.customer.email}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-sm font-medium">Total Tickets</p>
                                        <p className="text-sm text-muted-foreground">{ticket.customer.totalTickets}</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button variant="outline">View Customer Profile</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

