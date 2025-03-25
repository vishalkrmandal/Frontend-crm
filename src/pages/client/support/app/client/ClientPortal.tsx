"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Upload } from "lucide-react"
import { Link } from "react-router-dom"

export default function ClientPortal() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/client" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Client Portal</h1>
                    {/* <Button variant="outline" className="ml-auto">
                        Logout
                    </Button> */}
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="enquiry" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="enquiry">Submit Enquiry</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>
                        <TabsContent value="enquiry" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Submit a New Enquiry</CardTitle>
                                    <CardDescription>
                                        Fill out the form below to submit your enquiry. You will receive a ticket number for tracking.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="Brief description of your issue" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select
                                            id="category"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="technical">Technical Issue</option>
                                            <option value="billing">Billing</option>
                                            <option value="account">Account</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" placeholder="Please provide details about your issue" rows={5} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="attachment">Attachment (optional)</Label>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload File
                                            </Button>
                                            <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                                            {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Submit Enquiry</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="notifications" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Tickets</CardTitle>
                                    <CardDescription>View and manage your support tickets</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {tickets.map((ticket) => (
                                            <div key={ticket.id} className="rounded-lg border p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{ticket.subject}</h3>
                                                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">Ticket #{ticket.id}</span>
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground">{ticket.lastUpdate}</p>
                                                <div className="mt-4 flex justify-end">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link to={`/client/support/ticket/${ticket.id}`}>View Details</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

// Sample ticket data
const tickets = [
    {
        id: "T-1001",
        subject: "Internet Connection Issue",
        status: "Open",
        lastUpdate: "Updated 2 hours ago",
    },
    {
        id: "T-1002",
        subject: "Billing Inquiry",
        status: "In Progress",
        lastUpdate: "Updated 1 day ago",
    },
    {
        id: "T-1003",
        subject: "Software Installation Problem",
        status: "Closed",
        lastUpdate: "Updated 3 days ago",
    },
]

// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
    switch (status) {
        case "Open":
            return "destructive"
        case "In Progress":
            return "red"
        case "Closed":
            return "green"
        default:
            return "secondary"
    }
}

