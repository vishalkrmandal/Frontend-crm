// Frontend/src/pages/client/layout/Layout.tsx

"use client"

import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import Sidebar from "./Sidebar"
import Header from "./Header"
import { NotificationProvider } from "@/context/NotificationContext"
import ImpersonationBanner from '@/pages/auth/ImpersonationBanner'
import { useAuth } from "@/hooks/useAuth"

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  useAuth()

  // Preserve scroll position and URL state on reload
  useEffect(() => {
    // Save current scroll position and URL to sessionStorage
    const saveState = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString())
      sessionStorage.setItem('currentPath', location.pathname)
    }

    // Restore state on mount
    const restoreState = () => {
      const savedScroll = sessionStorage.getItem('scrollPosition')

      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll))
        }, 100)
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', saveState)

    // Restore state on component mount
    restoreState()

    return () => {
      window.removeEventListener('beforeunload', saveState)
    }
  }, [location.pathname])

  // Handle responsive sidebar behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Auto-adjust sidebar based on screen size
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      } else if (!mobile && !sidebarOpen) {
        setSidebarOpen(true)
      }
    }

    // Set initial state
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    setSidebarOpen(!mobile)

    // Add resize listener
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <NotificationProvider userType="client">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary)',
              secondary: 'var(--primary-foreground)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--destructive)',
              secondary: 'var(--destructive-foreground)',
            },
          },
        }}
      />

      {/* Main app container with background */}
      <div className="relative min-h-screen bg-background">
        <ImpersonationBanner />

        {/* Main layout container with background */}
        <div className="flex h-screen bg-background">
          {/* Mobile Overlay */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            />
          )}

          {/* Sidebar Container */}
          <div className={`${isMobile ? 'fixed z-50' : 'relative z-10'} transition-all duration-300 ease-in-out`}>
            <Sidebar
              open={sidebarOpen}
              setOpen={setSidebarOpen}
              isMobile={isMobile}
              onItemClick={closeSidebar}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden bg-background">
            {/* Header */}
            <Header
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative bg-background">
              <div className="mx-auto p-2 md:p-6 mb-20 max-w-7xl">
                <div className="min-h-full">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </NotificationProvider>
  )
}