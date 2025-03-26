"use client"

import { useState } from "react"
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
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Sample data
const initialPaymentMethods = [
    {
        id: 1,
        name: "Indian Cash",
        type: "Cash",
        accounts: "Cash payment at office",
        active: true,
    },
    {
        id: 2,
        name: "India Local Bank",
        type: "Bank Account",
        accounts: "HDFC Bank: XXXX1234",
        active: true,
    },
    {
        id: 3,
        name: "Bitcoin",
        type: "Crypto Wallet",
        accounts: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        active: false,
    },
    {
        id: 4,
        name: "Tether(TRC20)",
        type: "Crypto Wallet",
        accounts: "TJYeasTPa6gpEEiNBCY5TcNsj5mrqsNYEt",
        active: true,
    },
    {
        id: 5,
        name: "Etherium",
        type: "Crypto Wallet",
        accounts: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        active: true,
    },
    {
        id: 6,
        name: "India Net Banking",
        type: "Online Banking",
        accounts: "Multiple banks supported",
        active: false,
    },
    {
        id: 7,
        name: "TRON",
        type: "Crypto Wallet",
        accounts: "TJYeasTPa6gpEEiNBCY5TcNsj5mrqsNYEt",
        active: true,
    },
]

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
    const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentMethod, setCurrentMethod] = useState<any>(null)
    const [dialogMode, setDialogMode] = useState<"update" | "add">("update")
    const [activeTab, setActiveTab] = useState("bank")
    const [isPaymentDeleteDialogOpen, setIsPaymentDeleteDialogOpen] = useState(false)
    const [exchanges, setexchanges] = useState(initialexchanges)
    const [isexchangeDialogOpen, setIsexchangeDialogOpen] = useState(false)
    const [currentexchange, setCurrentexchange] = useState<any>(null)
    const [isexchangeDeleteDialogOpen, setIsexchangeDeleteDialogOpen] = useState(false)


    const handleEdit = (method: any) => {
        setCurrentMethod(method)
        setDialogMode("update")

        // Set the appropriate tab based on payment type
        if (method.type === "Bank Account" || method.type === "Online Banking") {
            setActiveTab("bank")
        } else if (method.type.includes("Crypto")) {
            setActiveTab("wallet")
        } else {
            setActiveTab("other")
        }

        setIsDialogOpen(true)
    }

    const handleAdd = (method: any) => {
        setCurrentMethod({ ...method, accounts: "" })
        setDialogMode("add")
        setIsDialogOpen(true)
    }

    const toggleActive = (id: number) => {
        setPaymentMethods(paymentMethods.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))
    }

    const handleSave = () => {
        if (dialogMode === "update") {
            setPaymentMethods(paymentMethods.map((m) => (m.id === currentMethod.id ? currentMethod : m)))
        } else {
            setPaymentMethods([
                ...paymentMethods,
                {
                    ...currentMethod,
                    id: Math.max(...paymentMethods.map((m) => m.id)) + 1,
                },
            ])
        }
        setIsDialogOpen(false)
    }

    const handlePaymentDelete = (method: any) => {
        setCurrentMethod(method)
        setIsPaymentDeleteDialogOpen(true)
    }

    const confirmPaymentDelete = () => {
        setPaymentMethods(paymentMethods.filter((m) => m.id !== currentMethod.id))
        setIsPaymentDeleteDialogOpen(false)
        console.log("Deleted:", currentMethod)
    }


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
        <div className="space-y-8">
            <div className="rounded-md border">
                <div className="p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">List Of Payment Details</h2>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">S.No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Payment Address Type</TableHead>
                            <TableHead>Accounts</TableHead>
                            <TableHead>Active/Status</TableHead>
                            <TableHead className="text-right">Edit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentMethods.map((method) => (
                            <TableRow key={method.id}>
                                <TableCell>{method.id}</TableCell>
                                <TableCell>{method.name}</TableCell>
                                <TableCell>{method.type}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{method.accounts}</TableCell>
                                <TableCell>
                                    <Checkbox checked={method.active} onCheckedChange={() => toggleActive(method.id)} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(method)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handlePaymentDelete(method)}>
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

                {/* Edit/Add Payment Method Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{dialogMode === "update" ? "Update Payment Method" : "Add Payment Method"}</DialogTitle>
                            <DialogDescription>
                                {dialogMode === "update"
                                    ? "Update the details for this payment method"
                                    : "Add a new payment method to your system"}
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="bank">Bank</TabsTrigger>
                                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                                <TabsTrigger value="other">Other</TabsTrigger>
                            </TabsList>

                            {/* Bank Account Form */}
                            <TabsContent value="bank" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bank-name">Account Holder Name</Label>
                                    <Input
                                        id="bank-name"
                                        value={currentMethod?.bankName || ""}
                                        onChange={(e) =>
                                            setCurrentMethod({
                                                ...currentMethod,
                                                bankName: e.target.value,
                                                type: "Bank Account",
                                            })
                                        }
                                        placeholder="Enter account holder name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="account-number">Account Number</Label>
                                    <Input
                                        id="account-number"
                                        value={currentMethod?.accountNumber || ""}
                                        onChange={(e) =>
                                            setCurrentMethod({
                                                ...currentMethod,
                                                accountNumber: e.target.value,
                                                accounts: `${e.target.value} (${currentMethod?.bankName || ""})`,
                                            })
                                        }
                                        placeholder="Enter account number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ifsc">IFSC Code</Label>
                                    <Input
                                        id="ifsc"
                                        value={currentMethod?.ifsc || ""}
                                        onChange={(e) => setCurrentMethod({ ...currentMethod, ifsc: e.target.value })}
                                        placeholder="Enter IFSC code"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bank">Bank Name</Label>
                                    <Input
                                        id="bank"
                                        value={currentMethod?.bank || ""}
                                        onChange={(e) => setCurrentMethod({ ...currentMethod, bank: e.target.value })}
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
                            </TabsContent>

                            {/* Crypto Wallet Form */}
                            <TabsContent value="wallet" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wallet-name">Wallet Name</Label>
                                    <Input
                                        id="wallet-name"
                                        value={currentMethod?.name || ""}
                                        onChange={(e) =>
                                            setCurrentMethod({
                                                ...currentMethod,
                                                name: e.target.value,
                                                type: "Crypto Wallet",
                                            })
                                        }
                                        placeholder="Bitcoin, Ethereum, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="wallet-address">Wallet Address</Label>
                                    <Input
                                        id="wallet-address"
                                        value={currentMethod?.accounts || ""}
                                        onChange={(e) => setCurrentMethod({ ...currentMethod, accounts: e.target.value })}
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
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isPaymentDeleteDialogOpen} onOpenChange={setIsPaymentDeleteDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this Payment? This action cannot be undone.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPaymentDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmPaymentDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
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
    )
}

