//Frontend\src\pages\admin\configure\components\leverageGroup.tsx
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "react-hot-toast"



export default function LeverageAndGroup() {
    const [leverages, setLeverages] = useState<{ _id: number; value: string; name: string; active: boolean }[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentLeverage, setCurrentLeverage] = useState<any>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [Groups, setGroups] = useState<{ _id: number; name: string; value: string; description: string }[]>([])
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
    const [currentGroup, setCurrentGroup] = useState<any>(null)
    const [isGroupDeleteDialogOpen, setIsGroupDeleteDialogOpen] = useState(false)
    const [mt5Groups, setMt5Groups] = useState<{ lstGroup: string }[]>([])

    // Add useEffect for fetching Groups data
    useEffect(() => {
        fetchLeverages()
        fetchGroups()
    }, [])
    const fetchLeverages = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("Authentication token not found");
                return;
            }
            const res = await axios.get('http://localhost:5000/api/leverages', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setLeverages(res.data.data)
        } catch (error) {
            console.error('Error fetching leverages:', error)
            toast.error('Failed to load leverages')
        }
    }

    const handleAddNew = () => {
        setCurrentLeverage({ value: "", name: "", active: false })
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("Authentication token not found");
                return;
            }
            if (currentLeverage?._id) {
                // Update existing leverage
                await axios.put(`http://localhost:5000/api/leverages/${currentLeverage._id}`, currentLeverage, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                toast.success('Leverage updated successfully')
            } else {
                // Create new leverage
                await axios.post('http://localhost:5000/api/leverages', currentLeverage, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                toast.success('Leverage created successfully')
            }
            // Refresh the list
            fetchLeverages()
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error saving leverage:', error)
            toast.error('Failed to save leverage')
        }
    }

    const handleEdit = (leverage: any) => {
        setCurrentLeverage(leverage)
        setIsDialogOpen(true)
    }

    const handleDelete = (leverage: any) => {
        setCurrentLeverage(leverage)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        setLeverages(leverages.filter((l) => l._id !== currentLeverage._id))
        setIsDeleteDialogOpen(false)
    }


    // const toggleActive = (id: number) => {
    //     setLeverages(leverages.map((l) => (l.id === id ? { ...l, active: !l.active } : l)))
    // }



    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication token not found");
                return;
            }
            const res = await axios.get('http://localhost:5000/api/groups', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setGroups(res.data.data)
        } catch (error) {
            console.error('Error fetching groups:', error)
            toast.error('Failed to load groups')
        }
    }

    const fetchMt5Groups = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("Authentication token not found");
                return;
            }
            const res = await axios.get('http://localhost:5000/api/groups/mt5-groups', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            // Directly use the lstGroups from the response
            const mt5GroupsData = res.data.data.lstGroups.map((group: string) => ({ lstGroup: group }));
            setMt5Groups(mt5GroupsData);
            console.log('MT5 groups:', mt5GroupsData)
        } catch (error) {
            console.error('Error fetching MT5 groups:', error)
            toast.error('Failed to load MT5 groups')
        }
    }

    // Update the group handlers
    const handleGroupAddNew = () => {
        // Fetch MT5 groups when opening the add dialog
        fetchMt5Groups()
        setCurrentGroup({ name: "", value: "", description: "" })
        setIsGroupDialogOpen(true)
    }

    const handleSaveGroup = async () => {
        try {
            if (currentGroup?._id) {
                // Update existing group
                await axios.put(`http://localhost:5000/api/groups/${currentGroup._id}`, currentGroup, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                    }
                })
                toast.success('Group updated successfully')
            } else {
                // Create new group
                await axios.post('http://localhost:5000/api/groups', currentGroup, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                    }
                })
                toast.success('Group created successfully')
            }
            // Refresh the list
            fetchGroups()
            setIsGroupDialogOpen(false)
        } catch (error) {
            console.error('Error saving group:', error)
            toast.error('Failed to save group')
        }
    }

    const handleEditGroup = (Group: { _id: number; name: string; value: string; description: string }) => {
        // Fetch MT5 groups when opening the edit dialog
        fetchMt5Groups()
        setCurrentGroup(Group)
        setIsGroupDialogOpen(true)
    }

    const confirmGroupDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/groups/${currentGroup._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            toast.success('Group deleted successfully')
            fetchGroups()
            setIsGroupDeleteDialogOpen(false)
        } catch (error) {
            console.error('Error deleting group:', error)
            toast.error('Failed to delete group')
        }
    }


    const handleGroupDelete = (Groups: any) => {
        setCurrentGroup(Groups)
        setIsGroupDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-8">
            <div className="rounded-md border">
                <div className="flex justify-between items-center p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">List of Leverages</h2>
                    <Button onClick={handleAddNew} className="flex items-center gap-1">
                        <PlusCircle className="h-4 w-4" /> Add New
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">S.No.</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Active/Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leverages.map((leverage, index) => (
                            <TableRow key={leverage._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{leverage.value}</TableCell>
                                <TableCell>{leverage.name}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-md text-xs font-medium 
                    ${leverage.active
                                                ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300"
                                            }`}
                                    >
                                        {leverage.active ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(leverage)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDelete(leverage)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentLeverage && currentLeverage.id ? "Edit Leverage" : "Add New Leverage"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="value" className="text-right">
                                    Value
                                </Label>
                                <Input
                                    id="value"
                                    value={currentLeverage?.value || ""}
                                    onChange={(e) => setCurrentLeverage({ ...currentLeverage, value: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={currentLeverage?.name || ""}
                                    onChange={(e) => setCurrentLeverage({ ...currentLeverage, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="active" className="text-right">
                                    Active
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                    <Checkbox
                                        id="active"
                                        checked={currentLeverage?.active || false}
                                        onCheckedChange={(checked) => setCurrentLeverage({ ...currentLeverage, active: !!checked })}
                                    />
                                    <label
                                        htmlFor="active"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Is Active
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this leverage? This action cannot be undone.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Groups Table */}
            <div className="rounded-md border">
                <div className="flex justify-between items-center p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">List of Groups</h2>
                    <Button onClick={handleGroupAddNew} className="flex items-center gap-1">
                        <PlusCircle className="h-4 w-4" /> Add New
                    </Button>
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
                        {Groups.map((Group, index) => (
                            <TableRow key={Group._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{Group.name}</TableCell>
                                <TableCell>{Group.value}</TableCell>
                                <TableCell>{Group.description}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEditGroup(Group)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleGroupDelete(Group)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>


                {/* Edit Group Dialog */}
                <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentGroup && currentGroup._id ? "Edit Group" : "Add New Group"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="Group-name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="Group-name"
                                    value={currentGroup?.name || ""}
                                    onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="Group-value" className="text-right">
                                    Value
                                </Label>
                                <select
                                    id="Group-value"
                                    value={currentGroup?.value || ""}
                                    onChange={(e) => setCurrentGroup({ ...currentGroup, value: e.target.value })}
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                                >
                                    <option value="">Select a value</option>
                                    {mt5Groups.map((mt5Group) => (
                                        <option key={mt5Group.lstGroup} value={mt5Group.lstGroup}>
                                            {mt5Group.lstGroup}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="Group-description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="Group-description"
                                    value={currentGroup?.description || ""}
                                    onChange={(e) => setCurrentGroup({ ...currentGroup, description: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveGroup}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Delete Confirmation Dialog */}
                <Dialog open={isGroupDeleteDialogOpen} onOpenChange={setIsGroupDeleteDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this Group? This action cannot be undone.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGroupDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmGroupDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

