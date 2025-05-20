"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Upload } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { toast } from "sonner"

type Client = {
    _id: string
    firstname: string
    lastname: string
    email: string
}

export default function CreateTicket() {
    const [clients, setClients] = useState<Client[]>([])
    const [subject, setSubject] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [selectedClient, setSelectedClient] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchClients()
    }, [])

    const getToken = () => {
        const adminToken = localStorage.getItem("adminToken")
        return adminToken ? adminToken : null
    }

    const fetchClients = async () => {
        try {
            const token = getToken()

            if (!token) {
                setError("Authentication failed. Please log in again.")
                setLoading(false)
                navigate("/login")
                return
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/clients?role=client`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                setClients(response.data.data)
            } else {
                setError("Failed to fetch clients")
            }
        } catch (error) {
            console.error("Error fetching clients:", error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to fetch clients")
            } else {
                setError("Failed to fetch clients")
            }
        } finally {
            setLoading(false)
        }
    }

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form inputs
        if (!subject.trim()) {
            toast.error("Subject is required")
            return
        }

        if (!category) {
            toast.error("Please select a category")
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
            setIsSubmitting(true)

            // Create form data
            const formData = new FormData()
            formData.append("subject", subject)
            formData.append("category", category)
            formData.append("description", description)
            formData.append("clientId", selectedClient) // This would need to be handled in the backend

            if (selectedFile) {
                formData.append("attachment", selectedFile)
            }

            // Get token
            const token = getToken()

            // Submit the form
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/tickets`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            if (response.data.success) {
                toast.success("Ticket created successfully")
                navigate("/admin/support")
            }
        } catch (error) {
            console.error("Error creating ticket:", error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to create ticket")
            } else {
                toast.error("Failed to create ticket")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to="/admin/support/portal" className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Loading...</h1>
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p>Loading clients...</p>
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-background">
                    <div className="container mx-auto flex h-16 items-center px-4">
                        <Link to="/admin/support/portal" className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <h1 className="mx-auto text-xl font-semibold">Error</h1>
                    </div>
                </header>
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-destructive">{error}</p>
                                <Button onClick={fetchClients} variant="outline" className="mt-4">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/admin/support/portal" className="flex items-center gap-2">
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
                            <CardTitle>Create a New Ticket</CardTitle>
                            <CardDescription>
                                Fill out the form below to create a new support ticket for a client.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Select
                                    value={selectedClient}
                                    onValueChange={setSelectedClient}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client._id} value={client._id}>
                                                {client.firstname} {client.lastname} ({client.email})
                                            </SelectItem>
                                        ))}
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                                        <SelectItem value="Billing">Billing</SelectItem>
                                        <SelectItem value="Account">Account</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Please provide details about the issue"
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attachment">Attachment (optional)</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById("admin-file-upload");
                                            if (input) input.click();
                                        }}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload File
                                    </Button>
                                    <Input
                                        id="admin-file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.gif"
                                    />
                                    {selectedFile && (
                                        <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Create Ticket"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}