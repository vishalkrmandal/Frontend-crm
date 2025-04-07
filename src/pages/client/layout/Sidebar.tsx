"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
    "Financial Operations": true,
    "My Account": true,
    "Partner Zone": true,
    "Customer Support": true,
    "Copy Trading": true,
  })

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
        { title: "Multi Level IB", path: "/client/partner/multi-level-ib" },
        { title: "IB Accounts", path: "/client/partner/ib-accounts" },
        { title: "Auto Rebate Report", path: "/client/partner/auto-rebate-report" },
      ],
    },
    {
      title: "Customer Support",
      icon: HeadphonesIcon,
      submenu: [{ title: "My Enquiries", path: "/client/support/clientportal" }],
    },
    {
      title: "Copy Trading",
      icon: Copy,
      submenu: [
        { title: "Rating", path: "/client/copy-trading/rating" },
        { title: "Copier Area", path: "/client/copy-trading/copier-area" },
        { title: "Master Area", path: "/client/copy-trading/master-area" },
        { title: "Terms & Conditions", path: "/client/copy-trading/terms" },
      ],
    },
    {
      title: "Trading Signals",
      icon: LineChart,
      path: "/client/trading-signals",
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
      className={`${open ? "w-64" : "w-20"} flex-shrink-0 overflow-y-auto border-r bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out`}
    >
      <div className="flex h-16 items-center justify-center border-b px-4 dark:border-gray-700">
        {open ? (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">TestCRM</h2>
        ) : (
          <BarChart2 className="h-8 w-8 text-gray-800 dark:text-white" />
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
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${item.path && isActive(item.path)
                      ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      } ${open ? "" : "justify-center"}`}
                  >
                    <item.icon className={`h-5 w-5 ${item.path && isActive(item.path)
                      ? "text-white dark:text-gray-900"
                      : "text-gray-500 dark:text-gray-400"
                      }`} />
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
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${isActive(item.path || "")
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    } ${open ? "" : "justify-center"}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.path || "")
                    ? "text-white dark:text-gray-900"
                    : "text-gray-500 dark:text-gray-400"
                    }`} />
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