"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Paperclip, Send, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link, useParams } from "react-router-dom"


// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
    switch (status) {
        case "Open":
            return "destructive"
        case "In Progress":
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
        subject: "Internet Connection Issue",
        status: "Open",
        category: "Technical",
        createdAt: "March 10, 2025 at 9:30 AM",
        messages: [
            {
                sender: "You",
                isClient: true,
                time: "March 10, 9:30 AM",
                content:
                    "I'm experiencing intermittent internet connection issues. My router keeps disconnecting every 30 minutes.",
                attachment: null,
            },
            {
                sender: "Support Agent",
                isClient: false,
                time: "March 10, 10:15 AM",
                content:
                    "Thank you for reporting this issue. Could you please try resetting your router and let us know if the problem persists?",
                attachment: null,
            },
            {
                sender: "You",
                isClient: true,
                time: "March 10, 11:00 AM",
                content:
                    "I've reset the router but the issue is still occurring. I've attached a screenshot of the error message I'm seeing.",
                attachment: "error-screenshot.png",
            },
        ],
    },
    {
        id: "T-1002",
        subject: "Billing Inquiry",
        status: "In Progress",
        category: "Billing",
        createdAt: "March 8, 2025 at 2:45 PM",
        messages: [
            {
                sender: "You",
                isClient: true,
                time: "March 8, 2:45 PM",
                content: "I noticed an unexpected charge on my latest bill. Could you please explain what this is for?",
                attachment: "bill-march.pdf",
            },
            {
                sender: "Support Agent",
                isClient: false,
                time: "March 9, 9:20 AM",
                content: "I'm looking into this for you. Could you please confirm which specific charge you're referring to?",
                attachment: null,
            },
        ],
    },
    {
        id: "T-1003",
        subject: "Software Installation Problem",
        status: "Closed",
        category: "Software",
        createdAt: "March 5, 2025 at 11:15 AM",
        messages: [
            {
                sender: "You",
                isClient: true,
                time: "March 5, 11:15 AM",
                content: "I'm unable to install the latest software update. It keeps failing at 75% with error code XB-2240.",
                attachment: null,
            },
            {
                sender: "Support Agent",
                isClient: false,
                time: "March 5, 1:30 PM",
                content:
                    "This error typically occurs due to insufficient disk space. Could you check your available storage and try again?",
                attachment: null,
            },
            {
                sender: "You",
                isClient: true,
                time: "March 5, 2:45 PM",
                content: "That was the issue! I freed up some space and the installation completed successfully. Thank you!",
                attachment: null,
            },
            {
                sender: "Support Agent",
                isClient: false,
                time: "March 5, 3:00 PM",
                content:
                    "Great! I'm glad that resolved the issue. I'll close this ticket now, but feel free to open a new one if you need further assistance.",
                attachment: null,
            },
        ],
    },
]



export default function TicketDetail() {
    const [newMessage, setNewMessage] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const { id } = useParams();

    // Find ticket by ID (in a real app, this would be fetched from an API)
    const ticket = tickets.find((t) => t.id === id) || {
        id: id,
        subject: "Unknown Ticket",
        status: "Unknown",
        category: "Unknown",
        createdAt: "Unknown",
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

    const isClosed = ticket.status === "Closed"

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/support/client" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Tickets</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Ticket Details</h1>
                    {/* <Button variant="outline" className="ml-auto">
                        Logout
                    </Button> */}
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
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
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium">Category</p>
                                    <p className="text-sm text-muted-foreground">{ticket.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">{ticket.createdAt}</p>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-6">
                                {ticket.messages.map((message, index) => (
                                    <div key={index} className={`flex ${message.isClient ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[80%] rounded-lg p-4 ${message.isClient ? "bg-primary text-primary-foreground" : "bg-muted"}`}
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
                        {!isClosed && (
                            <CardFooter>
                                <form onSubmit={handleSubmit} className="w-full space-y-4">
                                    <Textarea
                                        placeholder="Type your message here..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => document.getElementById("message-file")?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Attach File
                                        </Button>
                                        <Input id="message-file" type="file" className="hidden" onChange={handleFileChange} />
                                        {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                                        <Button type="submit" className="ml-auto">
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Message
                                        </Button>
                                    </div>
                                </form>
                            </CardFooter>
                        )}
                        {isClosed && (
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
    )
}

