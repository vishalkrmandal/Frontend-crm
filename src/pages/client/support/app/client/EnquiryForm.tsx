import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EnquiryFormProps {
    onTabChange?: (tab: string) => void;
}

const EnquiryForm: React.FC<EnquiryFormProps> = ({ onTabChange }) => {
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Get user token from localStorage
    const getToken = () => {
        const clientToken = localStorage.getItem("clientToken");
        return clientToken ? clientToken : null;
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

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // Validate form inputs
        if (!subject.trim()) {
            toast.error("Subject is required");
            return;
        }

        if (!category) {
            toast.error("Please select a category");
            return;
        }

        if (!description.trim()) {
            toast.error("Description is required");
            return;
        }

        try {
            setIsSubmitting(true);

            // Create form data
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("category", category);
            formData.append("description", description);

            if (selectedFile) {
                formData.append("attachment", selectedFile);
            }

            // Get token
            const token = getToken();

            if (!token) {
                toast.error("Authentication failed. Please log in again.");
                navigate("/login");
                return;
            }

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
            );

            if (response.data.success) {
                toast.success("Enquiry submitted successfully");

                // Reset form
                setSubject("");
                setCategory("");
                setDescription("");
                setSelectedFile(null);

                // Navigate to notifications tab
                if (onTabChange) {
                    onTabChange("notifications");
                }
            }
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            toast.error(
                (error as any)?.response?.data?.message || "Failed to submit enquiry"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                    <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Billing">Billing</option>
                        <option value="Account">Account</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Please provide details about your issue"
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
                                const fileInput = document.getElementById("file-upload");
                                if (fileInput) {
                                    fileInput.click();
                                }
                            }}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload File
                        </Button>
                        <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                        />
                        {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default EnquiryForm; 