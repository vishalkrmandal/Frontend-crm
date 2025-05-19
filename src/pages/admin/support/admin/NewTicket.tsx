// Frontend\src\pages\admin\support\admin\NewTicket.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Loader2, Upload } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewTicket() {
    const [subject, setSubject] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedClient, setSelectedClient] = useState("")
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate();

    // Get auth token from localStorage
    const token = localStorage.getItem("adminToken")
    const user = JSON.parse(localStorage.getItem("adminUser") || "{}")

    // Fetch clients on component mount
    useEffect(() => {
        fetchClients()
    }, [])

    // Function to fetch clients
    const fetchClients = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setClients(response.data.data)
        } catch (error) {
            console.error("Error fetching clients:", error)
            toast.error("Failed to fetch clients")
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            // Check if file is an image or PDF
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                toast.error("Only images and PDF files are allowed")
                return
            }
            // Check if file size is less than 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB")
                return
            }
            setSelectedFile(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        if (!subject.trim()) {
            toast.error("Subject is required")
            return
        }
        if (!category) {
            toast.error("Category is required")
            return
        }
        if (!description.trim()) {
            toast.error("Description is required")
            return
        }
        if (!selectedClient) {
            toast.error("Please select a client")
            return
        }

        try {
            setSubmitting(true)

            // Create form data
            const formData = new FormData()
            formData.append("subject", subject)
            formData.append("category", category)
            formData.append("description", description)
            formData.append("clientId", selectedClient)
            if (selectedFile) {
                formData.append("attachment", selectedFile)
            }

            // Submit form
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tickets`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            })

            // Show success message
            toast.success("Ticket created successfully")

            // Navigate to ticket detail
            navigate(`/admin/support/ticket/${response.data.data._id}`)

        } catch (error) {
            console.error("Error creating ticket:", error)
            toast.error("Failed to create ticket")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/support/admin" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Create New Ticket</h1>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create a New Support Ticket</CardTitle>
                            <CardDescription>
                                Fill out the form below to create a support ticket for a client.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                                        <SelectTrigger id="client">
                                            <SelectValue placeholder="Select a client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loading ? (
                                                <div className="flex items-center justify-center p-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : clients.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    No clients found
                                                </div>
                                            ) : (
                                                clients.map((client) => (
                                                    <SelectItem key={client._id} value={client._id}>
                                                        {client.firstname} {client.lastname} ({client.email})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Brief description of the issue"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technical">Technical Issue</SelectItem>
                                            <SelectItem value="billing">Billing</SelectItem>
                                            <SelectItem value="account">Account</SelectItem>
                                            <SelectItem value="network">Network</SelectItem>
                                            <SelectItem value="software">Software</SelectItem>
                                            <SelectItem value="hardware">Hardware</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Detailed description of the issue"
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="attachment">Attachment (optional)</Label>
                                    <div className="flex items-center gap-4">
                                        <Button type="button" variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload File
                                        </Button>
                                        <Input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*,application/pdf"
                                        />
                                        {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Ticket...
                                        </>
                                    ) : (
                                        'Create Ticket'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    )
}