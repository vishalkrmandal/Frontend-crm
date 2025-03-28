//Frontend\src\pages\admin\configure\components\PaymentMethod.tsx
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "sonner"

const initialexchanges = [
    { id: 1, name: "INR(India)", value: "exchange-1", description: "Description 1" },
    { id: 2, name: "EUR(Europe)", value: "exchange-2", description: "Description 2" },
    { id: 3, name: "USD(United State)", value: "exchange-3", description: "Description 3" },
    { id: 4, name: "GBP(British Pound)", value: "exchange-4", description: "Description 4" },
    { id: 5, name: "CNY(China)", value: "exchange-5", description: "Description 5" },
    { id: 6, name: "CAD(Canada)", value: "exchange-6", description: "Description 6" },
    { id: 7, name: "CHF(Switzerland)", value: "exchange-7", description: "Description 7" },
]


export default function PaymentMethod() {
    const [paymentMethods, setPaymentMethods] = useState<{ _id: string; accountHolderName?: string; type: string; accountNumber?: string; active?: boolean }[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentMethod, setCurrentMethod] = useState<any>(null)
    const [dialogMode, setDialogMode] = useState<"update" | "add">("update")
    const [activeTab, setActiveTab] = useState("bank")
    const [exchanges, setexchanges] = useState(initialexchanges)
    const [isexchangeDialogOpen, setIsexchangeDialogOpen] = useState(false)
    const [currentexchange, setCurrentexchange] = useState<any>(null)
    const [isexchangeDeleteDialogOpen, setIsexchangeDeleteDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [selectedMethodDetails, setSelectedMethodDetails] = useState<{ accountHolderName?: string; type?: string; accountNumber?: string; ifsc_swift?: string; bankName?: string; qrCode?: string; paymentLink?: string; active?: boolean } | null>(null)
    const [qrFile, setQrFile] = useState<File | null>(null)
    const [qrPreview, setQrPreview] = useState<string | null>(null)


    useEffect(() => {
        fetchPaymentMethods()
    }, [])

    const fetchPaymentMethods = async () => {
        try {
            const token = localStorage.getItem('token') // Assuming you store token in localStorage
            const response = await axios.get('http://localhost:5000/api/payment-methods', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPaymentMethods(response.data.data)
        } catch (error) {
            toast.error("Failed to fetch payment methods")
        }
    }

    const handleEdit = (method: { id?: number; acoountHolderName?: string; type?: any; accountNumber?: string; active?: boolean, walletName?: string, walletAddress?: string }) => {
        setCurrentMethod(method)
        setDialogMode("update")

        // Set the appropriate tab based on payment type
        switch (method.type) {
            case "Bank Account":
            case "Online Banking":
                setActiveTab("bank")
                break
            case "Crypto Wallet":
                setActiveTab("wallet")
                break
            default:
                setActiveTab("other")
        }

        setIsDialogOpen(true)
    }
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token')

            // Create FormData to handle both text data and file upload
            const formData = new FormData();

            // Add all current method properties to FormData
            Object.keys(currentMethod).forEach(key => {
                if (currentMethod[key] !== null && currentMethod[key] !== undefined) {
                    formData.append(key, currentMethod[key]);
                }
            });

            // Add QR code file if exists
            if (qrFile) {
                formData.append('qrCode', qrFile);
            }

            if (dialogMode === "update") {
                await axios.put(`http://localhost:5000/api/payment-methods/${currentMethod._id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
            } else {
                await axios.post('http://localhost:5000/api/payment-methods', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
            }

            fetchPaymentMethods()
            setIsDialogOpen(false)
            setQrFile(null) // Reset QR file state
            toast.success(dialogMode === "update"
                ? "Payment method updated"
                : "Payment method added"
            )
        } catch (error) {
            toast.error("Failed to save payment method")
        }
    }

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:5000/api/payment-methods/${currentMethod._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            fetchPaymentMethods()
            setIsDeleteDialogOpen(false)
            toast.success("Payment method deleted")
        } catch (error) {
            toast.error("Failed to delete payment method")
        }
    }

    const handleQRFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif']
            const maxSize = 5 * 1024 * 1024 // 5MB

            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Please upload a JPEG, PNG, or GIF.")
                return
            }

            if (file.size > maxSize) {
                toast.error("File is too large. Maximum size is 5MB.")
                return
            }

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setQrPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            setQrFile(file)
        }
    }

    const removeQRFile = () => {
        setQrFile(null)
        setQrPreview(null)
        // Reset file input
        const fileInput = document.getElementById('qr-file-input') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    // // Modify the existing handleUploadQR method if needed
    // const handleUploadQR = async () => {
    //     if (!qrFile) {
    //         toast.error("Please select a QR code file")
    //         return
    //     }

    //     try {
    //         const token = localStorage.getItem('token')
    //         const formData = new FormData()
    //         formData.append('qrCode', qrFile)
    //         formData.append('paymentLink', currentMethod.paymentLink || '')

    //         await axios.post(`http://localhost:5000/api/payment-methods/${currentMethod._id}/upload-qr`, formData, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         })

    //         fetchPaymentMethods()
    //         setQrFile(null)
    //         setQrPreview(null)
    //         toast.success("QR code uploaded")
    //     } catch (error) {
    //         toast.error("Failed to upload QR code")
    //     }
    // }

    const viewMethodDetails = async (method: { id?: number; name?: string; type?: string; accounts?: string; active?: boolean; _id?: any }) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`http://localhost:5000/api/payment-methods/${method._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setSelectedMethodDetails(response.data.data)
            setIsDetailsDialogOpen(true)
        } catch (error) {
            toast.error("Failed to fetch method details")
        }
    }



    const handleAdd = (method: { name: string; type: string; active: boolean }) => {
        setCurrentMethod({ ...method, accounts: "" });
        setDialogMode("add");
        setIsDialogOpen(true);
    };


    const handleSaveexchange = () => {
        setexchanges(exchanges.map((d) => (d.id === currentexchange.id ? currentexchange : d)))
        setIsexchangeDialogOpen(false)
    }
    const handleEditexchange = (exchange: any) => {
        setCurrentexchange(exchange)
        setIsexchangeDialogOpen(true)
    }
    const handleexchangeDelete = (exchanges: any) => {
        setCurrentexchange(exchanges)
        setIsexchangeDeleteDialogOpen(true)
    }

    const confirmexchangeDelete = () => {
        setexchanges(exchanges.filter((l) => l.id !== currentexchange.id))
        setIsexchangeDeleteDialogOpen(false)
    }

    return (
        <>

            <div className="space-y-8">
                <div className="rounded-md border">
                    <div className="p-4 bg-muted/50 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">List Of Payment Details</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCurrentMethod({
                                        name: "",
                                        type: "Bank Account",
                                        active: false
                                    })
                                    setDialogMode("add")
                                    setIsDialogOpen(true)
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">S.No.</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Payment Type</TableHead>
                                <TableHead>Account Details</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentMethods.map((method, index) => (
                                <TableRow key={method._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{method.accountHolderName}</TableCell>
                                    <TableCell>{method.type}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => viewMethodDetails(method)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={method.active}
                                            onCheckedChange={async (checked) => {
                                                try {
                                                    const token = localStorage.getItem('token')
                                                    await axios.put(`http://localhost:5000/api/payment-methods/${method._id}`,
                                                        { active: checked },
                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                    )
                                                    fetchPaymentMethods()
                                                } catch (error) {
                                                    toast.error("Failed to update status")
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(method)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setCurrentMethod(method)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="p-4 flex justify-end">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleAdd({ name: "India Local Bank", type: "Bank Account", active: false })}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" /> Add Bank
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleAdd({ name: "Bitcoin", type: "Crypto Wallet", active: false })}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" /> Add Crypto
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleAdd({ name: "Other Payment", type: "Other", active: false })}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" /> Add Other
                            </Button>
                        </div>
                    </div>

                    {/* Payment Method Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {dialogMode === "update" ? "Update Payment Method" : "Add Payment Method"}
                                </DialogTitle>
                            </DialogHeader>

                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="bank">Bank</TabsTrigger>
                                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                                    <TabsTrigger value="other">Other</TabsTrigger>
                                </TabsList>

                                {/* Bank Tab Content */}
                                <TabsContent value="bank" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Account Holder Name</Label>
                                            <Input
                                                value={currentMethod?.accountHolderName || ''}
                                                placeholder="Enter account holder name"
                                                onChange={(e) => setCurrentMethod({
                                                    ...currentMethod,
                                                    accountHolderName: e.target.value,
                                                    type: 'Bank Account'
                                                })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Account Number</Label>
                                            <Input
                                                value={currentMethod?.accountNumber || ''}
                                                placeholder="Enter account number"
                                                onChange={(e) => setCurrentMethod({
                                                    ...currentMethod,
                                                    accountNumber: e.target.value,
                                                    accounts: e.target.value
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ifsc_swift">IFSC/SWIFT Code</Label>
                                        <Input
                                            id="ifsc_swift"
                                            value={currentMethod?.ifsc_swift || ""}
                                            onChange={(e) => setCurrentMethod({ ...currentMethod, ifsc_swift: e.target.value })}
                                            placeholder="Enter IFSC or SWIFT code"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bank">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            value={currentMethod?.bankName || ""}
                                            onChange={(e) => setCurrentMethod({ ...currentMethod, bankName: e.target.value })}
                                            placeholder="Enter bank name"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="bank-active"
                                            checked={currentMethod?.active || false}
                                            onCheckedChange={(checked) => setCurrentMethod({ ...currentMethod, active: !!checked })}
                                        />
                                        <label htmlFor="bank-active" className="text-sm font-medium leading-none">
                                            Set as active payment method
                                        </label>
                                    </div>

                                    {/* QR Code and Payment Link Section */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>QR Code</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        id="qr-file-input"
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif"
                                                        onChange={handleQRFileChange}
                                                    />
                                                    {qrFile && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={removeQRFile}
                                                            title="Remove file"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {qrPreview && (
                                                    <div className="mt-2 relative">
                                                        <img
                                                            src={qrPreview}
                                                            alt="QR Code Preview"
                                                            className="max-w-full h-auto max-h-48 object-contain border rounded"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Payment Link</Label>
                                                <Input
                                                    value={currentMethod?.paymentLink || ''}
                                                    onChange={(e) => setCurrentMethod({
                                                        ...currentMethod,
                                                        paymentLink: e.target.value
                                                    })}
                                                    placeholder="Optional payment link"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Crypto Wallet Form */}
                                <TabsContent value="wallet" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wallet-name">Wallet Name</Label>
                                        <Input
                                            id="wallet-name"
                                            value={currentMethod?.walletName || ""}
                                            onChange={(e) =>
                                                setCurrentMethod({
                                                    ...currentMethod,
                                                    walletName: e.target.value,
                                                    type: "Crypto Wallet",
                                                })
                                            }
                                            placeholder="Bitcoin, Ethereum, etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                        <Input
                                            id="accountHolderName"
                                            value={currentMethod?.accountHolderName || ""}
                                            onChange={(e) => setCurrentMethod({ ...currentMethod, accountHolderName: e.target.value })}
                                            placeholder="Enter account holder name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wallet-address">Wallet Address</Label>
                                        <Input
                                            id="wallet-address"
                                            value={currentMethod?.walletAddress || ""}
                                            onChange={(e) => setCurrentMethod({ ...currentMethod, walletAddress: e.target.value })}
                                            placeholder="Enter wallet address"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="wallet-active"
                                            checked={currentMethod?.active || false}
                                            onCheckedChange={(checked) => setCurrentMethod({ ...currentMethod, active: !!checked })}
                                        />
                                        <label htmlFor="wallet-active" className="text-sm font-medium leading-none">
                                            Set as active payment method
                                        </label>
                                    </div>
                                </TabsContent>

                                {/* Other Payment Form */}
                                <TabsContent value="other" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="other-name">Payment Method Name</Label>
                                        <Input
                                            id="other-name"
                                            value={currentMethod?.name || ""}
                                            onChange={(e) =>
                                                setCurrentMethod({
                                                    ...currentMethod,
                                                    name: e.target.value,
                                                    type: "Other",
                                                })
                                            }
                                            placeholder="Enter payment method name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="other-details">Payment Details</Label>
                                        <Input
                                            id="other-details"
                                            value={currentMethod?.accounts || ""}
                                            onChange={(e) => setCurrentMethod({ ...currentMethod, accounts: e.target.value })}
                                            placeholder="Enter payment details"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="other-active"
                                            checked={currentMethod?.active || false}
                                            onCheckedChange={(checked) => setCurrentMethod({ ...currentMethod, active: !!checked })}
                                        />
                                        <label htmlFor="other-active" className="text-sm font-medium leading-none">
                                            Set as active payment method
                                        </label>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Delete</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this payment method?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Method Details Dialog */}
                    <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Payment Method Details</DialogTitle>
                            </DialogHeader>
                            {selectedMethodDetails && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Account Holder Name</Label>
                                            <p>{selectedMethodDetails.accountHolderName}</p>
                                        </div>
                                        <div>
                                            <Label>Payment Type</Label>
                                            <p>{selectedMethodDetails.type}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Account Number</Label>
                                            <p>{selectedMethodDetails.accountNumber}</p>
                                        </div>
                                        <div>
                                            <Label>IFSC/SWIFT Code</Label>
                                            <p>{selectedMethodDetails.ifsc_swift}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Bank Name</Label>
                                            <p>{selectedMethodDetails.bankName}</p>
                                        </div>
                                        <div>
                                            <Label>Active/Status</Label>
                                            <p style={{ color: selectedMethodDetails.active ? "green" : "red", fontWeight: "bold" }}>
                                                {selectedMethodDetails.active ? "Account is Active" : "Account is Inactive"}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedMethodDetails.qrCode && (
                                        <div className="space-y-2">
                                            <Label>QR Code</Label>
                                            <img
                                                src={`http://localhost:5000${selectedMethodDetails.qrCode}`}
                                                alt="QR Code"
                                                className="max-w-full h-auto"
                                            />
                                        </div>
                                    )}

                                    {selectedMethodDetails.paymentLink && (
                                        <div className="space-y-2">
                                            <Label>Payment Link</Label>
                                            <p><a
                                                href={selectedMethodDetails.paymentLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {selectedMethodDetails.paymentLink}
                                            </a></p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                {/* exchanges Table */}
                <div className="rounded-md border">
                    <div className="p-4 bg-muted/50">
                        <h2 className="text-xl font-semibold">List of exchanges</h2>
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
                            {exchanges.map((exchange) => (
                                <TableRow key={exchange.id}>
                                    <TableCell>{exchange.id}</TableCell>
                                    <TableCell>{exchange.name}</TableCell>
                                    <TableCell>{exchange.value}</TableCell>
                                    <TableCell>{exchange.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="icon" onClick={() => handleEditexchange(exchange)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleexchangeDelete(exchange)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>


                    {/* Edit exchange Dialog */}
                    <Dialog open={isexchangeDialogOpen} onOpenChange={setIsexchangeDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update exchange</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="exchange-name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="exchange-name" value={currentexchange?.name || ""} className="col-span-3" readOnly />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="exchange-value" className="text-right">
                                        Value
                                    </Label>
                                    <Input
                                        id="exchange-value"
                                        value={currentexchange?.value || ""}
                                        onChange={(e) => setCurrentexchange({ ...currentexchange, value: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="exchange-description" className="text-right">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="exchange-description"
                                        value={currentexchange?.description || ""}
                                        onChange={(e) => setCurrentexchange({ ...currentexchange, description: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsexchangeDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveexchange}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isexchangeDeleteDialogOpen} onOpenChange={setIsexchangeDeleteDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Confirm Delete</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <p>Are you sure you want to delete this exchange? This action cannot be undone.</p>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsexchangeDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmexchangeDelete}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    )
}

