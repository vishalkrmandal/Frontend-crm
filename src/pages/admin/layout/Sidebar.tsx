"use client"

import type React from "react"

import { useState } from "react"
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
  Copy,
  LineChart,
  Home,
  Settings,
} from "lucide-react"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
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

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Dashboard": true,
    "Support": true,
  })

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/admin",
    },
    {
      title: "Features",
      icon: BarChart2,
      submenu: [
        { title: "Clients", path: "/admin/dashboard/clients" },
        { title: "Deposits", path: "/admin/dashboard/deposits" },
        { title: "Withdrawals", path: "/admin/dashboard/withdrawals" },
        { title: "Transactions", path: "/admin/dashboard/transactions" },
        { title: "IB Partners", path: "/admin/dashboard/ib-partners" },
      ],
    },
    {
      title: "Configure",
      icon: Settings,
      path: "/admin/configure",
    },
    {
      title: "Support",
      icon: HeadphonesIcon,
      path: "/admin/support/portal",
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

  return (
    <aside
      className={`${open ? "w-64" : "w-20"
        } flex-shrink-0 overflow-y-auto border-r bg-sidebar transition-all duration-300 ease-in-out`}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        {open ? (
          <h2 className="text-xl font-bold text-sidebar-primary">TestCRM Admin</h2>
        ) : (
          <Settings className="h-8 w-8 text-sidebar-primary" />
        )}
      </div>
      <nav className="mt-2 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${open ? "" : "justify-center"
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {open && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                        {expandedMenus[item.title] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {open && expandedMenus[item.title] && (
                    <ul className="mt-1 space-y-1 pl-8">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            to={subItem.path}
                            className={`block rounded-md px-3 py-2 text-sm font-medium ${isActive(subItem.path)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${isActive(item.path || "")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${open ? "" : "justify-center"}`}
                >
                  <item.icon className="h-5 w-5" />
                  {open && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}