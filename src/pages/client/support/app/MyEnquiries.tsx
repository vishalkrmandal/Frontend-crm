
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function MyEnquiries() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-primary py-6">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white">Customer Care Portal</h1>
                </div>
            </header>
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card className="overflow-hidden">
                            <div className="bg-muted p-6">
                                <h2 className="text-2xl font-bold">Client Portal</h2>
                                <p className="mt-2 text-muted-foreground">Submit and track your support tickets</p>
                            </div>
                            <CardContent className="p-6">
                                <ul className="space-y-2">
                                    <li>• Submit new support requests</li>
                                    <li>• Track ticket status</li>
                                    <li>• Receive email notifications</li>
                                    <li>• Attach files to your tickets</li>
                                    <li>• View ticket history</li>
                                </ul>
                                <Button asChild className="mt-6 w-full">
                                    <Link to="/support/client">Access Client Portal</Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <div className="bg-muted p-6">
                                <h2 className="text-2xl font-bold">Admin Portal</h2>
                                <p className="mt-2 text-muted-foreground">Manage and respond to customer tickets</p>
                            </div>
                            <CardContent className="p-6">
                                <ul className="space-y-2">
                                    <li>• View all customer tickets</li>
                                    <li>• Assign tickets to support agents</li>
                                    <li>• Track ticket metrics and analytics</li>
                                    <li>• Manage support categories</li>
                                    <li>• Generate reports</li>
                                </ul>
                                <Button asChild className="mt-6 w-full">
                                    <Link to="/support/admin">Access Admin Portal</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Customer Care System. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

