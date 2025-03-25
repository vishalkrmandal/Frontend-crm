"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
    BarChart2,
    ChevronRight,
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

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"

interface MenuItem {
    title: string
    icon: React.ElementType
    path?: string
    submenu?: {
        title: string
        path: string
    }[]
}

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
        path: "/account/new",
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
        submenu: [{ title: "My Enquiries", path: "/clientsupport/clientportal" }],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
        "Financial Operations": true,
        "My Account": true,
        "Partner Zone": true,
        "Customer Support": true,
        "Copy Trading": true,
    })

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
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex h-16 items-center justify-center p-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <BarChart2 className="size-4" />
                    </div>
                    <span className="ml-2 text-xl font-bold">TestCRM</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <React.Fragment key={item.title}>
                                {item.submenu ? (
                                    <Collapsible
                                        asChild
                                        defaultOpen={expandedMenus[item.title]}
                                        onOpenChange={(open) => toggleMenu(item.title)}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.submenu.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild isActive={isActive(subItem.path)}>
                                                                <Link to={subItem.path}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive(item.path || "")} tooltip={item.title}>
                                            <Link to={item.path || "#"}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </React.Fragment>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>{/* You can add user profile or other footer content here */}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

