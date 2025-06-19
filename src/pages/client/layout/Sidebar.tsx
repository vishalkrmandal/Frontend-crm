// Frontend\src\pages\client\layout\Sidebar.tsx

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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [isHoveringCollapsed, setIsHoveringCollapsed] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/client",
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
      ],
    },
    {
      title: "Customer Support",
      icon: HeadphonesIcon,
      submenu: [{ title: "My Enquiries", path: "/client/support/clientportal" }],
    },
  ]

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const isSubmenuActive = (submenu: { title: string; path: string }[]) => {
    return submenu.some(item => location.pathname === item.path)
  }

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  // Handle hover for collapsed sidebar
  const handleSidebarMouseEnter = () => {
    if (!isMobile && !open) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoveringCollapsed(true)
      }, 50) // Reduced delay for faster response
    }
  }

  const handleSidebarMouseLeave = () => {
    if (!isMobile && !open) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoveringCollapsed(false)
      }, 150) // Optimized delay for smooth exit
    }
  }

  // Determine if sidebar should show expanded view
  const shouldShowExpanded = open || isMobile || (!isMobile && !open && isHoveringCollapsed)

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const initializeExpandedMenus = () => {
      const newExpandedMenus: Record<string, boolean> = {}
      menuItems.forEach(item => {
        if (item.submenu) {
          const hasActiveItem = item.submenu.some(subItem => location.pathname === subItem.path)
          if (hasActiveItem) {
            newExpandedMenus[item.title] = true
          }
        }
      })
      setExpandedMenus(newExpandedMenus)
    }
    initializeExpandedMenus()
  }, [])

  useEffect(() => {
    const updateExpandedMenus = () => {
      setExpandedMenus(prev => {
        const newExpandedMenus = { ...prev }
        menuItems.forEach(item => {
          if (item.submenu) {
            const hasActiveItem = item.submenu.some(subItem => location.pathname === subItem.path)
            if (hasActiveItem && !newExpandedMenus[item.title]) {
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
          : `${shouldShowExpanded ? "w-64" : "w-20"} transition-all duration-500 ease-in-out`
        } 
        flex flex-col flex-shrink-0 overflow-hidden h-full bg-[#F5F5F5] dark:bg-[#111315]
      `}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out flex-shrink-0">
        <div className={`transition-all duration-500 ease-in-out ${shouldShowExpanded ? 'opacity-100 scale-100' : 'opacity-100 scale-100'}`}>
          {shouldShowExpanded ? (
            <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap transition-all duration-500 ease-in-out">TestCRM</h2>
          ) : (
            <BarChart2 className="h-8 w-8 text-gray-800 dark:text-white transition-all duration-500 ease-in-out" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 px-2 mb-4 overflow-y-auto flex-1 scrollbar-hidden min-h-0">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title} className="relative">
              {item.submenu ? (
                <div>
                  {/* Parent Menu Item */}
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`flex w-full items-center rounded-sidebar px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${isSubmenuActive(item.submenu)
                      ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      } ${shouldShowExpanded ? "" : "justify-center"}`}
                  >
                    <item.icon className={`h-5 w-5 transition-all duration-300 ease-in-out ${isSubmenuActive(item.submenu)
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400"
                      }`} />
                    <div className={`ml-3 flex-1 flex items-center justify-between transition-all duration-500 ease-in-out overflow-hidden ${shouldShowExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 ml-0'
                      }`}>
                      <span className="text-left whitespace-nowrap">{item.title}</span>
                      {expandedMenus[item.title] ? (
                        <ChevronDown className="h-4 w-4 transition-all duration-300 ease-in-out flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-all duration-300 ease-in-out flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Submenu with Hierarchical Lines */}
                  <div className={`relative mt-1 transition-all duration-400 ease-in-out overflow-hidden ${shouldShowExpanded && expandedMenus[item.title]
                    ? 'opacity-100 max-h-96'
                    : 'opacity-0 max-h-0'
                    }`}>
                    <ul className="space-y-1">
                      {item.submenu.map((subItem, index) => (
                        <li key={subItem.title} className="relative">
                          {/* Curved Hierarchical Line for each item */}
                          <div className={`absolute left-6 top-0 h-full w-8 flex items-center transition-all duration-400 ease-in-out ${shouldShowExpanded && expandedMenus[item.title] ? 'opacity-100' : 'opacity-0'
                            }`}>
                            <svg
                              className="w-8 h-12 text-gray-300 dark:text-gray-600"
                              viewBox="0 0 32 48"
                              fill="none"
                            >
                              {/* Vertical line from top */}
                              {index > 0 && (
                                <path
                                  d="M 12 0 L 12 24"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  fill="none"
                                />
                              )}

                              {/* Curved connection to horizontal line */}
                              <path
                                d={index === item.submenu!.length - 1
                                  ? "M 12 24 Q 12 28 16 28 L 32 28" // Last item: curved corner only
                                  : "M 12 24 Q 12 28 16 28 L 32 28 M 12 28 L 12 48" // Middle items: curve + continue down
                                }
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill="none"
                              />
                            </svg>
                          </div>

                          <Link
                            to={subItem.path}
                            onClick={handleItemClick}
                            className={`block rounded-sidebar ml-12 px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${isActive(subItem.path)
                              ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 font-semibold"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                              }`}
                          >
                            <span className="whitespace-nowrap">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                /* Single Menu Item */
                <Link
                  to={item.path || "#"}
                  onClick={handleItemClick}
                  className={`flex items-center rounded-sidebar px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${isActive(item.path || "")
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${shouldShowExpanded ? "" : "justify-center"}`}
                >
                  <item.icon className={`h-5 w-5 transition-all duration-300 ease-in-out ${isActive(item.path || "")
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                    }`} />
                  <span className={`ml-3 whitespace-nowrap transition-all duration-500 ease-in-out overflow-hidden ${shouldShowExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 ml-0'
                    }`}>
                    {item.title}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}