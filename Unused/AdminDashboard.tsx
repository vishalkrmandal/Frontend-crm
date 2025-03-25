{/*import { Badge } from "@/components/ui/badge";*/ }
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Bell, CircleUser, Home, LineChart, Menu, Package, Package2, Search, Users, BookUser } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";


const AdminDashboard = () => {

    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);

    const toggleUsersDropdown = () => setIsUsersDropdownOpen(!isUsersDropdownOpen);

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link to="#" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span className="">RRU Hostel</span>
                        </Link>
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <NavLink
                                to="./home"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <Home className="h-4 w-4" />
                                Home
                            </NavLink>
                            <NavLink
                                to="./hostel"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <Package className="h-4 w-4" />
                                Hostel
                            </NavLink>
                            <NavLink
                                to="./students"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <Users className="h-4 w-4" />
                                Students
                            </NavLink>
                            <NavLink
                                to="./permision"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <LineChart className="h-4 w-4" />
                                Permision
                            </NavLink>
                            <NavLink
                                to="./permision"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <BookUser className="h-4 w-4" />
                                <span>Users</span>
                            </NavLink>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer"
                                    onClick={toggleUsersDropdown}
                                >
                                    <BookUser className="h-4 w-4" />
                                    <span>Users</span>
                                </div>
                                {isUsersDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-muted/40 shadow-md rounded-lg mt-1 z-10">
                                        <NavLink
                                            to="./users/student-registration"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                                }`
                                            }
                                        >
                                            Students
                                        </NavLink>
                                    
                                        <NavLink
                                            to="./users/staff-registration"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                                }`
                                            }
                                        >
                                            Staff
                                        </NavLink>
                                        <NavLink
                                            to="./users/admin-registration"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                                }`
                                            }
                                        >
                                            Admin
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <NavLink
                                to="./home"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <Home className="h-4 w-4" />
                                Home
                            </NavLink>
                            <NavLink
                                to="./hostel"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <Package className="h-4 w-4" />
                                Hostel
                            </NavLink>
                            <NavLink
                                to="./students"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <Users className="h-4 w-4" />
                                Students
                            </NavLink>
                            <NavLink
                                to="./permision"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                    }`
                                }
                            >
                                <LineChart className="h-4 w-4" />
                                Permision
                            </NavLink>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer"
                                    onClick={toggleUsersDropdown}
                                >
                                    <BookUser className="h-4 w-4" />
                                    <span>Users</span>
                                </div>
                                {isUsersDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-muted/40 shadow-md rounded-lg mt-1 z-10">
                                        <NavLink
                                            to="./users/student-registration"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                                }`
                                            }
                                        >
                                            Students
                                        </NavLink>
                                    
                                        <NavLink
                                            to="./users/staff-registration"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                                }`
                                            }
                                        >
                                            Staff
                                        </NavLink>
                                        <NavLink
                                            to="./users/admin-registration"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'
                                                }`
                                            }
                                        >
                                            Admin
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search"
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;