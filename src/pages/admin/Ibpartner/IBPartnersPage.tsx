// Frontend\src\pages\admin\Ibpartner\IBPartnersPage.tsx

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
    updateIBConfiguration,
    updateGroupDefaultTime
} from "@/pages/admin/Ibpartner/ibapi"

const IBPartnersPage = () => {
    // State for Groups and IB Configuration - Initialize with empty arrays
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

    // Add these state variables after the existing ones
    const [groupDefaultTime, setGroupDefaultTime] = useState<number>(0)
    const [groupDefaultTimeInput, setGroupDefaultTimeInput] = useState<string>("")

    // Update the formatTime function
    const formatTime = (seconds: number): string => {
        if (seconds === 0 || isNaN(seconds)) return "0 seconds";

        const units = [
            { name: 'year', seconds: 365 * 24 * 60 * 60 },
            { name: 'month', seconds: 30 * 24 * 60 * 60 },
            { name: 'day', seconds: 24 * 60 * 60 },
            { name: 'hour', seconds: 60 * 60 },
            { name: 'minute', seconds: 60 },
            { name: 'second', seconds: 1 }
        ];

        const parts = [];
        let remaining = Math.floor(seconds);

        for (const unit of units) {
            const count = Math.floor(remaining / unit.seconds);
            if (count > 0) {
                parts.push(`${count} ${unit.name}${count > 1 ? 's' : ''}`);
                remaining -= count * unit.seconds;
            }
        }

        return parts.length > 0 ? parts.join(', ') : "0 seconds";
    };

    // Fetch data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                const fetchedGroups = await getGroups();
                console.log("Fetched groups:", fetchedGroups);

                const safeGroups = Array.isArray(fetchedGroups) ? fetchedGroups : [];
                setGroups(safeGroups);

                if (safeGroups.length > 0) {
                    setSelectedGroup(safeGroups[0]._id);
                    const configs = await getIBConfigurationsByGroup(safeGroups[0]._id);
                    const safeConfigs = Array.isArray(configs) ? configs : [];
                    setIbConfigurations(safeConfigs);

                    // Set default time from first configuration or 0
                    const defaultTime = safeConfigs.length > 0 ? (safeConfigs[0].defaultTimeInSeconds || 0) : 0;
                    setGroupDefaultTime(defaultTime);
                    setGroupDefaultTimeInput(defaultTime.toString());
                } else {
                    console.warn("No groups found");
                    setIbConfigurations([]);
                    setGroupDefaultTime(0);
                    setGroupDefaultTimeInput("0");
                }
            } catch (error: any) {
                console.error('Error fetching initial data:', error);
                setGroups([]);
                setIbConfigurations([]);
                setGroupDefaultTime(0);
                setGroupDefaultTimeInput("0");
                toast.error("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Handle group change
    // Modify the handleGroupChange function
    const handleGroupChange = async (value: string) => {
        setSelectedGroup(value);
        try {
            setLoading(true);
            const configs = await getIBConfigurationsByGroup(value);
            const safeConfigs = Array.isArray(configs) ? configs : [];
            setIbConfigurations(safeConfigs);

            // Set default time from first configuration or 0
            const defaultTime = safeConfigs.length > 0 ? (safeConfigs[0].defaultTimeInSeconds || 0) : 0;
            setGroupDefaultTime(defaultTime);
            setGroupDefaultTimeInput(defaultTime.toString());
        } catch (error: any) {
            console.error('Error loading configurations:', error);
            setIbConfigurations([]);
            toast.error("Failed to load configurations");
        } finally {
            setLoading(false);
        }
    };

    // Add this new function
    const handleUpdateGroupDefaultTime = async () => {
        try {
            const timeInSeconds = parseInt(groupDefaultTimeInput);
            if (isNaN(timeInSeconds) || timeInSeconds < 0) {
                toast.error("Please enter a valid number of seconds");
                return;
            }

            await updateGroupDefaultTime(selectedGroup, timeInSeconds);
            setGroupDefaultTime(timeInSeconds);

            // Refresh configurations
            const updatedConfigs = await getIBConfigurationsByGroup(selectedGroup);
            const safeConfigs = Array.isArray(updatedConfigs) ? updatedConfigs : [];
            setIbConfigurations(safeConfigs);

            toast.success("Default time updated successfully");
        } catch (error: any) {
            console.error('Error updating default time:', error);
            toast.error("Failed to update default time");
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
                toast.error("Please fill all fields");
                return;
            }

            const level = parseInt(newLevel);
            const bonusPerLot = parseFloat(newBonusPerLot);

            if (isNaN(level) || level < 1 || level > 10) {
                toast.error("Level must be between 1 and 10");
                return;
            }

            if (isNaN(bonusPerLot) || bonusPerLot < 0) {
                toast.error("Bonus per lot must be a valid non-negative number");
                return;
            }

            if (isEditMode) {
                // Update existing configuration
                await updateIBConfiguration(currentConfigId, bonusPerLot);
                toast.success("IB configuration updated successfully");
            } else {
                // Create new configuration
                await createIBConfiguration(selectedGroup, level, bonusPerLot);
                toast.success("IB configuration added successfully");
            }

            // Refresh configurations
            const updatedConfigs = await getIBConfigurationsByGroup(selectedGroup);
            const safeConfigs = Array.isArray(updatedConfigs) ? updatedConfigs : [];
            setIbConfigurations(safeConfigs);
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error('Error submitting configuration:', error);
            toast.error(error.response?.data?.message || "Failed to save configuration");
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
                <div className="border-4 rounded-md w-full sm:w-1/3">
                    <Select value={selectedGroup} onValueChange={handleGroupChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Add null check for groups array */}
                            {(groups || []).map((group) => (
                                <SelectItem key={group._id} value={group._id}>
                                    {group.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Add this section after the existing header section and before the IB Configuration Section */}
            {selectedGroup && (
                <div className="rounded-md border bg-card shadow-sm">
                    <div className="p-4 bg-muted/50 border-b">
                        <h3 className="text-lg font-semibold">Group Default Time Configuration</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-2">
                                <Label htmlFor="defaultTime" className="text-sm font-medium">
                                    Default Time (in seconds)
                                </Label>
                                <Input
                                    id="defaultTime"
                                    type="number"
                                    min="0"
                                    value={groupDefaultTimeInput}
                                    onChange={(e) => setGroupDefaultTimeInput(e.target.value)}
                                    placeholder="Enter time in seconds"
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-start md:justify-end">
                                <Button
                                    onClick={handleUpdateGroupDefaultTime}
                                    disabled={loading || !groupDefaultTimeInput.trim()}
                                    className="w-full md:w-auto"
                                >
                                    Update Default Time
                                </Button>
                            </div>
                        </div>

                        {/* Real-time preview */}
                        <div className="mt-4 p-3 bg-muted/30 rounded-md">
                            <div className="text-sm">
                                <span className="font-medium text-muted-foreground">Current setting: </span>
                                <span className="text-foreground">
                                    {formatTime(groupDefaultTime)}
                                </span>
                            </div>
                            {groupDefaultTimeInput.trim() && parseInt(groupDefaultTimeInput) !== groupDefaultTime && (
                                <div className="text-sm mt-1">
                                    <span className="font-medium text-muted-foreground">Preview: </span>
                                    <span className="text-blue-600">
                                        {formatTime(parseInt(groupDefaultTimeInput) || 0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* IB Configuration Section */}
            <div className="rounded-md border bg-card shadow-sm">
                <div className="flex justify-between rounded-md items-center p-4 bg-muted/50">
                    <h2 className="text-xl font-semibold">IB Configuration</h2>
                    <Button
                        className="flex items-center gap-1"
                        onClick={handleAddConfig}
                        disabled={!selectedGroup || loading}
                    >
                        <PlusCircle className="h-4 w-4" /> Add New
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3 font-semibold">Level</TableHead>
                                <TableHead className="w-1/3 font-semibold">Bonus/Lot</TableHead>
                                <TableHead className="w-1/4 font-semibold">Default Time</TableHead>
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
                            ) : !selectedGroup ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Please select a group to view configurations.
                                    </TableCell>
                                </TableRow>
                            ) : (ibConfigurations || []).length > 0 ? (
                                (ibConfigurations || []).map((config) => (
                                    <TableRow key={config._id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium py-4">Level {config.level}</TableCell>
                                        <TableCell className="py-4">${config.bonusPerLot.toFixed(2)}</TableCell>
                                        <TableCell className="py-4">{formatTime(config.defaultTimeInSeconds || 0)}</TableCell>
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
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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