// Frontend\src\pages\client\layout\Layout.tsx

"use client"
import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { Outlet } from "react-router-dom"
import ImpersonationBanner from '@/pages/auth/ImpersonationBanner';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768 // md breakpoint
      setIsMobile(mobile)

      // Only adjust sidebar state on resize, not on mount to avoid navigation interference
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      } else if (!mobile && !sidebarOpen) {
        setSidebarOpen(true)
      }
    }

    // Set initial state without interfering with routing
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    setSidebarOpen(!mobile) // Open on desktop, closed on mobile

    // Add resize listener for dynamic responsiveness
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, []) // Only run on mount

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    // Only close sidebar on mobile when menu item is clicked
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div>
      <ImpersonationBanner />
      <div className="flex h-screen bg-background">
        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          />
        )}

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          isMobile={isMobile}
          onItemClick={closeSidebar}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}