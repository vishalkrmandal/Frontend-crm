"use client"

import { useState, useEffect } from "react"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRangePicker } from "./DateRangePicker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
    const [, setCurrentDate] = useState<string>("")

    useEffect(() => {
        const now = new Date()
        const formattedDate = now.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        })
        setCurrentDate(formattedDate)
    }, [])

    return (
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">
                    {/* Left: Hamburger button */}
                    <div className="flex lg:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Left: Title */}
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
                        <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mx-2">•</span>
                            <span>Superadmin</span>
                            <span className="mx-2">•</span>
                            <span>Dashboard</span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-3">
                        <DateRangePicker />

                        <Button variant="ghost" size="icon" className="ml-2">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notifications</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg" alt="Admin" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header

