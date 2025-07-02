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
// import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "sonner"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Define the currency type
interface Currency {
    code: string;
    name: string;
    symbol: string;
    country: string;
    flag: string;
    rate: number;
}

// Define the exchange type
interface Exchange {
    _id: string;
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    type: string;
    isCustomRate: boolean;
    lastUpdated: string;
}



export default function PaymentMethod() {
    const [paymentMethods, setPaymentMethods] = useState<{ _id: string; accountHolderName?: string; type: string; accountNumber?: string; active?: boolean; walletName?: string }[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentMethod, setCurrentMethod] = useState<any>(null)
    const [dialogMode, setDialogMode] = useState<"update" | "add">("update")
    const [activeTab, setActiveTab] = useState("bank")
    // const [exchanges, setexchanges] = useState(initialexchanges)
    // const [isexchangeDialogOpen, setIsexchangeDialogOpen] = useState(false)
    // const [currentexchange, setCurrentexchange] = useState<any>(null)
    // const [isexchangeDeleteDialogOpen, setIsexchangeDeleteDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [selectedMethodDetails, setSelectedMethodDetails] = useState<{ accountHolderName?: string; type?: string; accountNumber?: string; ifsc_swift?: string; bankName?: string; qrCode?: string; paymentLink?: string; active?: boolean; walletName?: string; walletAddress?: string } | null>(null)
    const [qrFile, setQrFile] = useState<File | null>(null)
    const [qrPreview, setQrPreview] = useState<string | null>(null)

    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isExchangeDialogOpen, setIsExchangeDialogOpen] = useState(false);
    const [isExchangeDeleteDialogOpen, setIsExchangeDeleteDialogOpen] = useState(false);
    const [currentExchange, setCurrentExchange] = useState<Exchange | null>(null);
    const [formData, setFormData] = useState({
        baseCurrency: "USD",
        targetCurrency: "INR",
        rate: 0,
        type: "deposit",
    });
    const [liveRate, setLiveRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [baseSearchTerm, setBaseSearchTerm] = useState("");
    const [targetSearchTerm, setTargetSearchTerm] = useState("");


    useEffect(() => {
        fetchPaymentMethods()
    }, [])

    const fetchPaymentMethods = async () => {
        try {
            const token = localStorage.getItem('adminToken') // Assuming you store token in localStorage
            const response = await axios.get(`${API_BASE_URL}/api/payment-methods`, {
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
            const token = localStorage.getItem('adminToken')

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
                await axios.put(`${API_BASE_URL}/api/payment-methods/${currentMethod._id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
            } else {
                await axios.post(`${API_BASE_URL}/api/payment-methods`, formData, {
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
            const token = localStorage.getItem('adminToken')
            await axios.delete(`${API_BASE_URL}/api/payment-methods/${currentMethod._id}`, {
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



    const viewMethodDetails = async (method: { id?: number; name?: string; type?: string; accounts?: string; active?: boolean; _id?: any }) => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await axios.get(`${API_BASE_URL}/api/payment-methods/${method._id}`, {
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





    //EXCHANGE RATE LOGIC
    useEffect(() => {
        fetchExchanges();
        fetchCurrencies();
    }, []);

    // Fetch exchanges from API
    const fetchExchanges = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(`${API_BASE_URL}/api/exchanges`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.data);
            setExchanges(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch exchange rates");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch currencies with flags
    const fetchCurrencies = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(`${API_BASE_URL}/api/exchanges/currencies`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.data);
            setCurrencies(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch currencies");
            console.error(error);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "rate" ? parseFloat(value) : value,
        });
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });

        // If either currency changes, update the live rate
        if (name === "baseCurrency" || name === "targetCurrency") {
            fetchLiveRate(
                name === "baseCurrency" ? value : formData.baseCurrency,
                name === "targetCurrency" ? value : formData.targetCurrency
            );
        }
    };

    // Fetch live rate for selected currencies
    const fetchLiveRate = async (base: string, target: string) => {
        try {
            // Find the base currency in our currencies list
            const baseCurrency = currencies.find(c => c.code === base);
            const targetCurrency = currencies.find(c => c.code === target);

            if (baseCurrency && targetCurrency) {
                // Calculate rate based on USD rates from our currencies list
                const baseRate = baseCurrency.rate;
                const targetRate = targetCurrency.rate;

                // Calculate cross rate
                const calculatedRate = targetRate / baseRate;
                setLiveRate(calculatedRate);

                // Update form data with the live rate
                setFormData({
                    ...formData,
                    baseCurrency: base,
                    targetCurrency: target,
                    rate: calculatedRate,
                });
            }
        } catch (error) {
            console.error("Failed to fetch live rate:", error);
            setLiveRate(null);
        }
    };

    // Add/update exchange rate
    const handleExchangeSave = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const headers = { Authorization: `Bearer ${token}` };

            if (currentExchange && currentExchange._id) {
                // Update existing exchange
                await axios.put(
                    `${API_BASE_URL}/api/exchanges/${currentExchange._id}`,
                    { rate: formData.rate, type: formData.type },
                    { headers }
                );
                toast.success("Exchange rate updated");
            } else {
                // Create new exchange
                await axios.post(`${API_BASE_URL}/api/exchanges`, formData, { headers });
                toast.success("Exchange rate added");
            }

            // Refresh exchanges list
            fetchExchanges();
            setIsExchangeDialogOpen(false);
        } catch (error) {
            toast.error("Failed to save exchange rate");
            console.error(error);
        }
    };

    // Handle delete
    const handleExchangeDelete = async () => {
        try {
            if (!currentExchange || !currentExchange._id) return;

            const token = localStorage.getItem("adminToken");
            await axios.delete(`${API_BASE_URL}/api/exchanges/${currentExchange._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchExchanges();
            setIsExchangeDeleteDialogOpen(false);
            toast.success("Exchange rate deleted");
        } catch (error) {
            toast.error("Failed to delete exchange rate");
            console.error(error);
        }
    };

    // Handle edit button
    const handleExchangeEdit = (exchange: Exchange) => {
        setCurrentExchange(exchange);
        setFormData({
            baseCurrency: exchange.baseCurrency,
            targetCurrency: exchange.targetCurrency,
            rate: exchange.rate,
            type: exchange.type,
        });
        // Fetch the current live rate for reference
        fetchLiveRate(exchange.baseCurrency, exchange.targetCurrency);
        setIsExchangeDialogOpen(true);
    };

    // Get currency flag by code
    const getCurrencyFlag = (code: string) => {
        const currency = currencies.find(c => c.code === code);
        return currency?.flag || "";
    };

    // Get currency name by code
    const getCurrencyName = (code: string) => {
        const currency = currencies.find(c => c.code === code);
        return currency?.name || code;
    };

    // Open add dialog
    const handleAddClick = () => {
        setCurrentExchange(null);
        setFormData({
            baseCurrency: "USD",
            targetCurrency: "INR",
            rate: 0,
            type: "deposit",
        });
        fetchLiveRate("USD", "INR");
        setIsExchangeDialogOpen(true);
    };

    const getFilteredCurrencies = (searchTerm: string) => {
        if (!searchTerm) return currencies; // Show all if no search input

        return currencies.filter(currency =>
            currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            currency.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };


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
                                    <TableCell>
                                        {method.type === "Crypto Wallet"
                                            ? method.walletName
                                            : method.accountHolderName}
                                    </TableCell>
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
                                                    const token = localStorage.getItem('adminToken')
                                                    await axios.put(`${API_BASE_URL}/api/payment-methods/${method._id}`,
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
                    <div className="p-4 flex justify-end border min-w-full">
                        <div className=" grid grid-cols-1 md:grid-cols-3 gap-2">
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
                                            <Label>Payment Type</Label>
                                            <p>{selectedMethodDetails.type}</p>
                                        </div>
                                        {/* Status for all payment types */}
                                        <div>
                                            <Label>Active/Status</Label>
                                            <p style={{ color: selectedMethodDetails.active ? "green" : "red", fontWeight: "bold" }}>
                                                {selectedMethodDetails.active ? "Account is Active" : "Account is Inactive"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bank Account Fields */}
                                    {selectedMethodDetails.type === 'Bank Account' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Account Holder Name</Label>
                                                    <p>{selectedMethodDetails.accountHolderName}</p>
                                                </div>
                                                <div>
                                                    <Label>Account Number</Label>
                                                    <p>{selectedMethodDetails.accountNumber}</p>
                                                </div>

                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>IFSC/SWIFT Code</Label>
                                                    <p>{selectedMethodDetails.ifsc_swift}</p>
                                                </div>

                                                <div>
                                                    <Label>Bank Name</Label>
                                                    <p>{selectedMethodDetails.bankName}</p>
                                                </div>
                                            </div>

                                        </>
                                    )}

                                    {/* Crypto Wallet Fields */}
                                    {selectedMethodDetails.type === 'Crypto Wallet' && (
                                        <>

                                            <div>
                                                <Label>Wallet Address</Label>
                                                <p>{selectedMethodDetails.walletAddress}</p>
                                            </div>
                                            <div>
                                                <Label>Wallet Name</Label>
                                                <p>{selectedMethodDetails.walletName}</p>
                                            </div>


                                        </>
                                    )}

                                    {/* Other Payment Type Fields */}
                                    {selectedMethodDetails.type === 'Other' && (
                                        <div>
                                            <Label>Payment Details</Label>
                                            <p>{selectedMethodDetails.accountNumber}</p>
                                        </div>
                                    )}


                                    {/* QR Code for all payment types if available */}
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

                                    {/* Payment Link for all payment types if available */}
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
                <div className="rounded-md bg-card border">
                    <div className="p-4 bg-muted/50 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">List of Exchanges</h2>
                        <Button
                            variant="outline"
                            onClick={handleAddClick}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" /> Add Exchange Rate
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">S.No.</TableHead>
                                <TableHead>Base Currency</TableHead>
                                <TableHead>Target Currency</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : exchanges.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">No exchange rates found</TableCell>
                                </TableRow>
                            ) : (
                                exchanges.map((exchange, index) => (
                                    <TableRow key={exchange._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell >
                                            <div className="flex items-center gap-2">
                                                {getCurrencyFlag(exchange.baseCurrency) && (
                                                    <img
                                                        src={getCurrencyFlag(exchange.baseCurrency)}
                                                        alt={exchange.baseCurrency}
                                                        className="w-5 h-5 rounded-full object-cover"
                                                    />
                                                )}
                                                {exchange.baseCurrency} ({getCurrencyName(exchange.baseCurrency)})
                                            </div>
                                        </TableCell>
                                        <TableCell >
                                            <div className="flex items-center gap-2">
                                                {getCurrencyFlag(exchange.targetCurrency) && (
                                                    <img
                                                        src={getCurrencyFlag(exchange.targetCurrency)}
                                                        alt={exchange.targetCurrency}
                                                        className="w-5 h-5 rounded-full object-cover"
                                                    />
                                                )}
                                                {exchange.targetCurrency} ({getCurrencyName(exchange.targetCurrency)})
                                            </div>
                                        </TableCell>
                                        <TableCell>{exchange.rate.toFixed(4)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${exchange.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {exchange.type.charAt(0).toUpperCase() + exchange.type.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(exchange.lastUpdated).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleExchangeEdit(exchange)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentExchange(exchange);
                                                        setIsExchangeDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>


                    {/* Add/Edit Exchange Dialog */}
                    <Dialog open={isExchangeDialogOpen} onOpenChange={setIsExchangeDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {currentExchange ? "Update Exchange Rate" : "Add Exchange Rate"}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="baseCurrency">Base Currency</Label>
                                        <Select
                                            value={formData.baseCurrency}
                                            onValueChange={(value) => handleSelectChange("baseCurrency", value)}
                                            disabled={!!currentExchange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select base currency" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-96">
                                                <div className="p-2 sticky top-0 bg-white z-10">
                                                    <Input
                                                        placeholder="Search currencies..."
                                                        className="mb-2"
                                                        value={baseSearchTerm}
                                                        onChange={(e) => {
                                                            e.stopPropagation(); // Prevent event bubbling
                                                            setBaseSearchTerm(e.target.value);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()} // Prevent closing on click
                                                    />
                                                </div>
                                                <div className="overflow-y-auto max-h-64">
                                                    <SelectGroup>
                                                        <SelectLabel>Currencies</SelectLabel>
                                                        {getFilteredCurrencies(baseSearchTerm).map((currency) => (
                                                            <SelectItem key={`base-${currency.code}`} value={currency.code}>
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={currency.flag}
                                                                        alt={currency.code}
                                                                        className="w-4 h-4 rounded-full object-cover"
                                                                    />
                                                                    <span>{currency.code} ({currency.name})</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="targetCurrency">Target Currency</Label>
                                        <Select
                                            value={formData.targetCurrency}
                                            onValueChange={(value) => handleSelectChange("targetCurrency", value)}
                                            disabled={!!currentExchange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select target currency" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-96">
                                                <div className="p-2 sticky top-0 bg-white z-10">
                                                    <Input
                                                        placeholder="Search currencies..."
                                                        className="mb-2"
                                                        value={targetSearchTerm}
                                                        onChange={(e) => setTargetSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="overflow-y-auto max-h-64">
                                                    <SelectGroup>
                                                        <SelectLabel>Currencies</SelectLabel>
                                                        {getFilteredCurrencies(targetSearchTerm).map((currency) => (
                                                            <SelectItem key={`target-${currency.code}`} value={currency.code}>
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={currency.flag}
                                                                        alt={currency.code}
                                                                        className="w-4 h-4 rounded-full object-cover"
                                                                    />
                                                                    <span>{currency.code} ({currency.name})</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="rate">Exchange Rate</Label>
                                        {liveRate !== null && (
                                            <span className="text-sm text-muted-foreground">
                                                Live rate: {liveRate.toFixed(4)}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="rate"
                                        name="rate"
                                        type="number"
                                        step="0.0001"
                                        value={formData.rate}
                                        onChange={handleInputChange}
                                        placeholder="Exchange rate"
                                    />
                                    <div className="text-sm text-muted-foreground">
                                        1 {formData.baseCurrency} = {formData.rate.toFixed(4)} {formData.targetCurrency}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => handleSelectChange("type", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="deposit">Deposit</SelectItem>
                                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsExchangeDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleExchangeSave}>
                                    {currentExchange ? "Update" : "Add"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isExchangeDeleteDialogOpen} onOpenChange={setIsExchangeDeleteDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Confirm Delete</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this exchange rate? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsExchangeDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleExchangeDelete}>
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

