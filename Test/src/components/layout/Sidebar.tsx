"use client"

import React from "react"

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
            path: "/",
        },
        {
            title: "Financial Operations",
            icon: DollarSign,
            submenu: [
                { title: "Deposit", path: "/financial/deposit" },
                { title: "Withdrawal", path: "/financial/withdrawal" },
                { title: "Transfer", path: "/financial/transfer" },
                { title: "Transaction History", path: "/financial/history" },
            ],
        },
        {
            title: "My Account",
            icon: User,
            submenu: [
                { title: "Open New Account", path: "/account/new" },
                { title: "Account List", path: "/account/list" },
                { title: "Trading Contest", path: "/account/trading-contest" },
            ],
        },
        {
            title: "Trading Platforms",
            icon: Monitor,
            path: "/trading-platforms",
        },
        {
            title: "Refer A Friend",
            icon: Users,
            path: "/refer-friend",
        },
        {
            title: "Partner Zone",
            icon: Briefcase,
            submenu: [
                { title: "Create New Account", path: "/partner/new-account" },
                { title: "Partner Dashboard", path: "/partner/dashboard" },
                { title: "Multi Level IB", path: "/partner/multi-level-ib" },
                { title: "IB Accounts", path: "/partner/ib-accounts" },
                { title: "Auto Rebate Report", path: "/partner/auto-rebate-report" },
            ],
        },
        {
            title: "Customer Support",
            icon: HeadphonesIcon,
            submenu: [{ title: "My Enquiries", path: "/support/enquiries" }],
        },
        {
            title: "Copy Trading",
            icon: Copy,
            submenu: [
                { title: "Rating", path: "/copy-trading/rating" },
                { title: "Copier Area", path: "/copy-trading/copier-area" },
                { title: "Master Area", path: "/copy-trading/master-area" },
                { title: "Terms & Conditions", path: "/copy-trading/terms" },
            ],
        },
        {
            title: "Trading Signals",
            icon: LineChart,
            path: "/trading-signals",
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
                    <h2 className="text-xl font-bold text-sidebar-primary">TradeCRM</h2>
                ) : (
                    <BarChart2 className="h-8 w-8 text-sidebar-primary" />
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

