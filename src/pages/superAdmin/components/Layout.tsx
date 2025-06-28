"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"



export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-grow p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}


