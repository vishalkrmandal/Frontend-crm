// Frontend/src/pages/client/layout/Header.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/hooks/useAuth"
import { useNotifications } from "@/context/NotificationContext"
import {
  Menu,
  Moon,
  Sun,
  Bell,
  User,
  Search,
  Settings,
  LogOut,
  Shield,
  Clock,
  ChevronDown,
  X,
} from "lucide-react"
import NotificationDropdown from "@/components/notifications/NotificationDropdown"

interface HeaderProps {
  toggleSidebar: () => void
  sidebarOpen: boolean
  isMobile: boolean
}

interface UserData {
  firstname: string
  lastname: string
  email: string
}

export default function Header({ toggleSidebar, isMobile }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, activeRole } = useAuth()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    isConnected
  } = useNotifications()
  const navigate = useNavigate()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userData, setUserData] = useState<UserData>({
    firstname: "User",
    lastname: "Title",
    email: "user@example.com"
  })

  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Update user data when auth context changes
  useEffect(() => {
    if (user) {
      setUserData({
        firstname: user.firstname || "User",
        lastname: user.lastname || "Title",
        email: user.email || "user@example.com"
      })
    }
  }, [user])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowUserMenu(false)
    setShowSearch(false)
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    setShowNotifications(false)
    setShowSearch(false)
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    setShowNotifications(false)
    setShowUserMenu(false)
    if (!showSearch) {
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    if (activeRole) {
      logout(activeRole, navigate)
    } else {
      logout(undefined, navigate)
    }
    setShowUserMenu(false)
  }

  const handleNavigateToProfile = () => {
    navigate('/client/profile/my-profile')
    setShowUserMenu(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 h-16 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="group relative rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {!isMobile && (
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Test CRM
              </h1>
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          {showSearch ? (
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, accounts..."
                className="w-full rounded-lg border border-border bg-background/50 backdrop-blur-sm px-4 py-2 pl-10 pr-10 text-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <button
                type="button"
                onClick={toggleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={toggleSearch}
              className="flex w-full items-center rounded-lg border border-border/50 bg-muted/30 px-4 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:border-border"
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-auto hidden sm:inline-block rounded border border-border px-2 py-1 text-xs font-mono bg-background/50">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Search Button (Mobile) */}
          <button
            onClick={toggleSearch}
            className="md:hidden rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="relative">
              {theme === "dark" ? (
                <Sun className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-12" />
              )}
            </div>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="group relative rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
              aria-label="Notifications"
            >
              <Bell className={`h-5 w-5 transition-transform duration-200 group-hover:rotate-12 ${!isConnected ? 'text-muted-foreground/50' : ''}`} />
              {unreadCount > 0 && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs font-bold text-white items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
              {!isConnected && (
                <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-yellow-500" title="Reconnecting..." />
              )}
            </button>

            {showNotifications && (
              <NotificationDropdown
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
                loading={loading}
                unreadCount={unreadCount}
              />
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="group flex items-center space-x-2 rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
              aria-label="User menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-semibold text-primary-foreground shadow-lg">
                {getInitials(userData.firstname, userData.lastname)}
              </div>
              {!isMobile && (
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl">
                {/* User Info */}
                <div className="flex items-center space-x-3 border-b border-border/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-lg">
                    {getInitials(userData.firstname, userData.lastname)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {userData.firstname} {userData.lastname}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{userData.email}</p>
                    {activeRole && (
                      <div className="flex items-center mt-1">
                        <Shield className="h-3 w-3 mr-1 text-primary" />
                        <span className="text-xs text-primary font-medium capitalize">{activeRole}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={handleNavigateToProfile}
                    className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>

                  <button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  <button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Activity Log</span>
                  </button>

                  <div className="my-2 border-t border-border/50" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearch && isMobile && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="flex h-16 items-center px-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions, accounts..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </form>
            <button
              onClick={toggleSearch}
              className="ml-3 rounded-lg p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}