// Frontend\src\pages\client\layout\Layout.tsx

"use client"
import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { Outlet } from "react-router-dom"
import ImpersonationBanner from '@/pages/auth/ImpersonationBanner';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div>
      <ImpersonationBanner />
      <div className="flex h-screen bg-background">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}