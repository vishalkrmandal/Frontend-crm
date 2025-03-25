"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Upload } from "lucide-react"

// Sample data for details
const initialDetails = [
    { id: 1, name: "Server Name", value: "prod-server-01", description: "Production server hostname" },
    { id: 2, name: "KYC doc-1 Label", value: "Government ID", description: "Primary identification document" },
    { id: 3, name: "KYC doc-2 Label", value: "Proof of Address", description: "Utility bill or bank statement" },
    { id: 4, name: "KYC doc-3 Label", value: "Selfie with ID", description: "Photo holding government ID" },
    { id: 5, name: "Company Email", value: "support@example.com", description: "Primary contact email" },
    { id: 6, name: "Company Contact No.", value: "+1 (555) 123-4567", description: "Customer support number" },
    { id: 7, name: "Whatsapp contact", value: "+1 (555) 987-6543", description: "WhatsApp business account" },
]

// Sample data for files
const initialFiles = [
    { id: 1, name: "Company Logo", value: "/placeholder.svg?height=100&width=200", description: "Main brand logo" },
    { id: 2, name: "Favicon", value: "/placeholder.svg?height=32&width=32", description: "Website favicon" },
    {
        id: 3,
        name: "Terms Document",
        value: "/placeholder.svg?height=150&width=120",
        description: "Terms and conditions PDF",
    },
]

export default function ConfigureValues() {
    const [details, setDetails] = useState(initialDetails)
    const [files, setFiles] = useState(initialFiles)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
    const [currentDetail, setCurrentDetail] = useState<any>(null)
    const [currentFile, setCurrentFile] = useState<any>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")

    const handleEditDetail = (detail: any) => {
        setCurrentDetail(detail)
        setIsDetailDialogOpen(true)
    }

    const handleEditFile = (file: any) => {
        setCurrentFile(file)
        setPreviewUrl(file.value)
        setIsFileDialogOpen(true)
    }

    const handleSaveDetail = () => {
        setDetails(details.map((d) => (d.id === currentDetail.id ? currentDetail : d)))
        setIsDetailDialogOpen(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSaveFile = () => {
        setFiles(files.map((f) => (f.id === currentFile.id ? { ...currentFile, value: previewUrl } : f)))
        setIsFileDialogOpen(false)
    }

    return (
        <div className="space-y-8">
            {/* Details Table */}
            <div className="rounded-md border">
                <div className="p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">List of Details</h2>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">S.No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Update</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {details.map((detail) => (
                            <TableRow key={detail.id}>
                                <TableCell>{detail.id}</TableCell>
                                <TableCell>{detail.name}</TableCell>
                                <TableCell>{detail.value}</TableCell>
                                <TableCell>{detail.description}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="icon" onClick={() => handleEditDetail(detail)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Files Table */}
            <div className="rounded-md border">
                <div className="p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">List of Files</h2>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">S.No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Edit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell>{file.id}</TableCell>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>
                                    <img src={file.value || "/placeholder.svg"} alt={file.name} className="h-10 w-auto object-contain" />
                                </TableCell>
                                <TableCell>{file.description}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="icon" onClick={() => handleEditFile(file)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Detail</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="detail-name" className="text-right">
                                Name
                            </Label>
                            <Input id="detail-name" value={currentDetail?.name || ""} className="col-span-3" readOnly />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="detail-value" className="text-right">
                                Value
                            </Label>
                            <Input
                                id="detail-value"
                                value={currentDetail?.value || ""}
                                onChange={(e) => setCurrentDetail({ ...currentDetail, value: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="detail-description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="detail-description"
                                value={currentDetail?.description || ""}
                                onChange={(e) => setCurrentDetail({ ...currentDetail, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveDetail}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit File Dialog */}
            <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update File</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file-name" className="text-right">
                                Name
                            </Label>
                            <Input id="file-name" value={currentFile?.name || ""} className="col-span-3" readOnly />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Preview</Label>
                            <div className="col-span-3">
                                {previewUrl && (
                                    <img
                                        src={previewUrl || "/placeholder.svg"}
                                        alt="Preview"
                                        className="h-32 w-auto object-contain border rounded-md p-2"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file-upload" className="text-right">
                                Choose File
                            </Label>
                            <Input id="file-upload" type="file" onChange={handleFileChange} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file-description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="file-description"
                                value={currentFile?.description || ""}
                                onChange={(e) => setCurrentFile({ ...currentFile, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFileDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveFile} className="flex items-center gap-1">
                            <Upload className="h-4 w-4" /> Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

