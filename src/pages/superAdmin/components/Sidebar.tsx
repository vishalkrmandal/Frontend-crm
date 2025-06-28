"use client"
import { Link, useLocation } from "react-router-dom"
import { Users, ArrowDownCircle, ArrowUpCircle, BarChart3, Home, HandshakeIcon, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    SidebarProvider,
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarSeparator,
} from "@/components/ui/sidebar"

interface SidebarProps {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const location = useLocation()
    const { pathname } = location

    const sidebarNavItems = [
        {
            title: "Dashboard",
            href: "/",
            icon: <Home className="h-5 w-5" />,
        },
        {
            title: "Clients",
            href: "/clients",
            icon: <Users className="h-5 w-5" />,
        },
        {
            title: "Deposits",
            href: "/deposits",
            icon: <ArrowDownCircle className="h-5 w-5" />,
        },
        {
            title: "Withdrawals",
            href: "/withdrawals",
            icon: <ArrowUpCircle className="h-5 w-5" />,
        },
        {
            title: "Transactions",
            href: "/transactions",
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            title: "IB Partners",
            href: "/ib-partners",
            icon: <HandshakeIcon className="h-5 w-5" />,
        },
    ]

    return (
        <SidebarProvider>
            {/* Mobile sidebar */}
            <div
                className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                aria-hidden="true"
                onClick={() => setSidebarOpen(false)}
            ></div>

            <ShadcnSidebar
                className={`absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 shrink-0 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"
                    }`}
            >
                <SidebarHeader className="flex justify-between items-center mb-6">
                    <Link to="/" className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-primary"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span className="ml-2 text-xl font-bold">FinAdmin</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarMenu>
                        {sidebarNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname === item.href}>
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                            pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>

                <SidebarSeparator className="my-4" />

                <SidebarFooter>
                    <div className="px-3 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">A</div>
                                <div>
                                    <p className="text-sm font-medium">Admin User</p>
                                    <p className="text-xs text-muted-foreground">admin@example.com</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SidebarFooter>
            </ShadcnSidebar>
        </SidebarProvider>
    )
}

export default Sidebar

