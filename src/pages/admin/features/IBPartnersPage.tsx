"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Pencil } from "lucide-react"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner" // Import Sonner's toast instead of the custom hook
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Import API functions and types
import {
    Group,
    IBConfiguration,
    getGroups,
    getIBConfigurationsByGroup,
    createIBConfiguration,
    updateIBConfiguration
} from "@/pages/admin/features/ibapi"

const IBPartnersPage = () => {
    // State for Groups and IB Configuration
    const [groups, setGroups] = useState<Group[]>([])
    const [selectedGroup, setSelectedGroup] = useState<string>("")
    const [ibConfigurations, setIbConfigurations] = useState<IBConfiguration[]>([])
    const [loading, setLoading] = useState(true)

    // State for dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentConfigId, setCurrentConfigId] = useState("")
    const [newLevel, setNewLevel] = useState("")
    const [newBonusPerLot, setNewBonusPerLot] = useState("")

    // Fetch data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch groups from backend
                const fetchedGroups = await getGroups();
                setGroups(fetchedGroups);

                // Set the first group as default selected if available
                if (fetchedGroups.length > 0) {
                    setSelectedGroup(fetchedGroups[0]._id);
                    // Fetch IB configurations for this group
                    const configs = await getIBConfigurationsByGroup(fetchedGroups[0]._id);
                    setIbConfigurations(configs);
                }
            } catch (error: any) {
                console.error('Error fetching initial data:', error);
                toast.error("Error", {
                    description: error.message || "Failed to load initial data"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Handle group change
    const handleGroupChange = async (value: string) => {
        setSelectedGroup(value);
        try {
            setLoading(true);
            const configs = await getIBConfigurationsByGroup(value);
            setIbConfigurations(configs);
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to load configurations"
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle add new configuration
    const handleAddConfig = () => {
        setIsEditMode(false);
        setCurrentConfigId("");
        setNewLevel("");
        setNewBonusPerLot("");
        setIsDialogOpen(true);
    };

    // Handle edit configuration
    const handleEditConfig = (config: IBConfiguration) => {
        setIsEditMode(true);
        setCurrentConfigId(config._id);
        setNewLevel(config.level.toString());
        setNewBonusPerLot(config.bonusPerLot.toString());
        setIsDialogOpen(true);
    };

    // Submit configuration form
    const handleSubmitConfig = async () => {
        try {
            if (newLevel.trim() === "" || newBonusPerLot.trim() === "") {
                toast.error("Error", {
                    description: "Please fill all fields"
                });
                return;
            }

            const level = parseInt(newLevel);
            const bonusPerLot = parseFloat(newBonusPerLot);

            if (level < 1 || level > 10) {
                toast.error("Error", {
                    description: "Level must be between 1 and 10"
                });
                return;
            }

            if (bonusPerLot < 0) {
                toast.error("Error", {
                    description: "Bonus per lot must be non-negative"
                });
                return;
            }

            if (isEditMode) {
                // Update existing configuration
                await updateIBConfiguration(currentConfigId, bonusPerLot);
                toast.success("Success", {
                    description: "IB configuration updated successfully"
                });
            } else {
                // Create new configuration
                await createIBConfiguration(selectedGroup, level, bonusPerLot);
                toast.success("Success", {
                    description: "IB configuration added successfully"
                });
            }

            // Refresh configurations
            const updatedConfigs = await getIBConfigurationsByGroup(selectedGroup);
            setIbConfigurations(updatedConfigs);
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error('Error submitting configuration:', error);
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to save configuration"
            });
        }
    };

    return (
        <div className="space-y-6">

            {/* IB Partner Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardHeader className="px-0">
                    <CardTitle>IB Commission Configuration</CardTitle>
                    <CardDescription>Manage commission rates for Introducing Broker partners</CardDescription>
                </CardHeader>
                <div className="w-full sm:w-1/3">
                    <Select value={selectedGroup} onValueChange={handleGroupChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((group) => (
                                <SelectItem key={group._id} value={group._id}>
                                    {group.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* IB Configuration Section */}
            <div className="rounded-md border shadow-sm">
                <div className="flex justify-between items-center p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">IB Configuration</h2>
                    <Button className="flex items-center gap-1" onClick={handleAddConfig}>
                        <PlusCircle className="h-4 w-4" /> Add New
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3 font-semibold">Level</TableHead>
                                <TableHead className="w-1/3 font-semibold">Bonus/Lot</TableHead>
                                <TableHead className="w-1/3 text-right font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Loading configurations...
                                    </TableCell>
                                </TableRow>
                            ) : ibConfigurations.length > 0 ? (
                                ibConfigurations.map((config) => (
                                    <TableRow key={config._id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium py-4">Level {config.level}</TableCell>
                                        <TableCell className="py-4">${config.bonusPerLot.toFixed(2)}</TableCell>
                                        <TableCell className="text-right py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditConfig(config)}
                                                className="flex items-center gap-1 ml-auto"
                                            >
                                                <Pencil className="h-4 w-4" /> Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No configurations found for this group.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Configuration Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit IB Configuration" : "Add New IB Configuration"}</DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? "Update the bonus amount for this level."
                                : "Add a new level and bonus amount for the selected group."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="level" className="text-right">
                                Level
                            </Label>
                            <Input
                                id="level"
                                type="number"
                                min="1"
                                max="10"
                                value={newLevel}
                                onChange={(e) => setNewLevel(e.target.value)}
                                className="col-span-3"
                                disabled={isEditMode}
                                placeholder="Enter level (1-10)"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bonusPerLot" className="text-right">
                                Bonus/Lot
                            </Label>
                            <div className="col-span-3 flex items-center">
                                <span className="mr-2">$</span>
                                <Input
                                    id="bonusPerLot"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newBonusPerLot}
                                    onChange={(e) => setNewBonusPerLot(e.target.value)}
                                    className="flex-grow"
                                    placeholder="Enter bonus amount per lot"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitConfig}>
                            {isEditMode ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default IBPartnersPage