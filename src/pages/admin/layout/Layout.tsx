// Frontend\src\pages\admin\layout\Layout.tsx

"use client"
import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { Outlet } from "react-router-dom"
import ImpersonationBanner from '@/pages/auth/ImpersonationBanner';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={sidebarOpen ? "sidebar-open" : ""}>
      <ImpersonationBanner />
      <div className="flex h-screen bg-background">
        {/* Mobile overlay - appears behind sidebar on mobile when open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden mobile-overlay z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}