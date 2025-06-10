"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ChevronDown,
  ChevronRight,
  BarChart2,
  DollarSign,
  User,
  Monitor,
  Users,
  Briefcase,
  HeadphonesIcon,
  Home,
} from "lucide-react"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile?: boolean
  onItemClick?: () => void
}

interface MenuItem {
  title: string
  icon: React.ElementType
  path?: string
  submenu?: {
    title: string
    path: string
  }[]
}

export default function Sidebar({ open, isMobile = false, onItemClick }: SidebarProps) {
  const location = useLocation()
  // Initialize expandedMenus based on current location
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)

  // Add timeout ref to handle hover delay
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/client/dashboard", // FIXED: Now matches router configuration
    },
    {
      title: "Financial Operations",
      icon: DollarSign,
      submenu: [
        { title: "Deposit", path: "/client/financial/deposit" },
        { title: "Withdrawal", path: "/client/financial/withdrawal" },
        { title: "Transfer", path: "/client/financial/transfer" },
        { title: "Transaction History", path: "/client/financial/history" },
      ],
    },
    {
      title: "My Account",
      icon: User,
      submenu: [
        { title: "Open New Account", path: "/client/account/new" },
        { title: "Account List", path: "/client/account/list" },
        { title: "Trading Contest", path: "/client/account/trading-contest" },
      ],
    },
    {
      title: "Trading Platforms",
      icon: Monitor,
      path: "/client/trading-platforms",
    },
    {
      title: "Refer A Friend",
      icon: Users,
      path: "/client/refer-friend",
    },
    {
      title: "Partner Zone",
      icon: Briefcase,
      submenu: [
        { title: "Create New Account", path: "/client/partner/new-account" },
        { title: "Partner Dashboard", path: "/client/partner/dashboard" },
        { title: "IB Commission", path: "/client/partner/ib-commission" },
        { title: "IB Withdrawal", path: "/client/partner/ib-withdrawal" },
        // { title: "Summary", path: "/client/partner/summary" },
        // { title: "IB Accounts", path: "/client/partner/ib-accounts" },
        // { title: "Auto Rebate Report", path: "/client/partner/auto-rebate-report" },
      ],
    },
    {
      title: "Customer Support",
      icon: HeadphonesIcon,
      submenu: [{ title: "My Enquiries", path: "/client/support/clientportal" }],
    },
    // Optional: Copy Trading (uncomment if needed)
    // {
    //   title: "Copy Trading",
    //   icon: Copy,
    //   submenu: [
    //     { title: "Rating", path: "/client/copy-trading/rating" },
    //     { title: "Copier Area", path: "/client/copy-trading/copier-area" },
    //     { title: "Master Area", path: "/client/copy-trading/master-area" },
    //     { title: "Terms & Conditions", path: "/client/copy-trading/terms" },
    //   ],
    // },
    // {
    //   title: "Trading Signals",
    //   icon: LineChart,
    //   path: "/client/trading-signals",
    // },
  ]

  // Function to toggle menu expansion
  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Check if a path is active - exact match
  const isActive = (path: string) => {
    return location.pathname === path
  }

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: { title: string; path: string }[]) => {
    return submenu.some(item => location.pathname === item.path)
  }

  // Handle mouse enter for hover effect with delay (desktop only)
  const handleMouseEnter = (title: string) => {
    // Only use hover on desktop when sidebar is collapsed
    if (!isMobile && !open) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      // Set a small delay to prevent accidental triggers
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredMenu(title)
      }, 50)
    }
  }

  // Handle mouse leave for hover effect with delay
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null)
    }, 300) // Longer delay when leaving to make it easier to move to submenu
  }

  // Handle menu item click
  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Initialize expanded menus on component mount based on current location
  useEffect(() => {
    const initializeExpandedMenus = () => {
      const newExpandedMenus: Record<string, boolean> = {}

      menuItems.forEach(item => {
        if (item.submenu) {
          // Check if any submenu item matches current path
          const hasActiveItem = item.submenu.some(subItem => location.pathname === subItem.path)
          if (hasActiveItem) {
            newExpandedMenus[item.title] = true
          }
        }
      })

      console.log('Initializing expanded menus for path:', location.pathname, newExpandedMenus)
      setExpandedMenus(newExpandedMenus)
    }

    // Initialize on mount
    initializeExpandedMenus()
  }, []) // Only run on mount

  // Update expanded menus when location changes (preserve user-expanded menus)
  useEffect(() => {
    const updateExpandedMenus = () => {
      setExpandedMenus(prev => {
        const newExpandedMenus = { ...prev }

        menuItems.forEach(item => {
          if (item.submenu) {
            const hasActiveItem = item.submenu.some(subItem => location.pathname === subItem.path)
            if (hasActiveItem && !newExpandedMenus[item.title]) {
              // Only expand if not already expanded by user
              newExpandedMenus[item.title] = true
            }
          }
        })

        return newExpandedMenus
      })
    }

    updateExpandedMenus()
  }, [location.pathname])

  return (
    <aside
      className={`
        ${isMobile
          ? `fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'
          }`
          : `${open ? "w-64" : "w-20"} transition-all duration-300 ease-in-out`
        } 
        flex-shrink-0 overflow-y-auto border-r bg-white dark:bg-gray-900 sidebar-scrollbar
      `}
    >
      <div className="flex h-16 items-center justify-center border-b px-4 dark:border-gray-700">
        {(open || isMobile) ? (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">TestCRM</h2>
        ) : (
          <BarChart2 className="h-8 w-8 text-gray-800 dark:text-white" />
        )}
      </div>
      <nav className="mt-2 px-2 sidebar-nav">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li
              key={item.title}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(item.title)}
              onMouseLeave={handleMouseLeave}
            >
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium sidebar-menu-item transition-colors duration-200 ${isSubmenuActive(item.submenu)
                      ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      } ${(open || isMobile) ? "" : "justify-center"}`}
                  >
                    <item.icon className={`h-5 w-5 ${isSubmenuActive(item.submenu)
                      ? "text-white dark:text-gray-900"
                      : "text-gray-500 dark:text-gray-400"
                      }`} />
                    {(open || isMobile) && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                        {expandedMenus[item.title] ? (
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Show submenu either when expanded in open state or when hovered in collapsed state */}
                  {(((open || isMobile) && expandedMenus[item.title]) ||
                    (!isMobile && !open && hoveredMenu === item.title)) && (
                      <ul
                        className={`${(open || isMobile)
                          ? "mt-1 space-y-1 pl-8"
                          : "absolute left-full top-0 z-50 mt-0 ml-1 min-w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                          }`}
                        style={{
                          // Ensure the popup menu is positioned correctly
                          display: (!isMobile && !open && hoveredMenu === item.title) ? 'block' : '',
                        }}
                      >
                        {item.submenu.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              to={subItem.path}
                              onClick={handleItemClick}
                              className={`block rounded-md px-3 py-2 text-sm font-medium sidebar-menu-item transition-colors duration-200 ${isActive(subItem.path)
                                ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 font-semibold"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ) : (
                <Link
                  to={item.path || "#"}
                  onClick={handleItemClick}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium sidebar-menu-item transition-colors duration-200 ${isActive(item.path || "")
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    } ${(open || isMobile) ? "" : "justify-center"}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.path || "")
                    ? "text-white dark:text-gray-900"
                    : "text-gray-500 dark:text-gray-400"
                    }`} />
                  {(open || isMobile) && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}