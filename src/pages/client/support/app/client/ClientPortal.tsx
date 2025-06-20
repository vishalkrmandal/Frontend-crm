// Frontend\src\pages\client\support\app\client\ClientPortal.tsx

"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import EnquiryForm from "@/pages/client/support/app/client/EnquiryForm"
import TicketList from "@/pages/client/support/app/client/TicketList"

export default function ClientPortal() {
    const [searchParams] = useSearchParams()
    const tabFromUrl = searchParams.get('tab')

    // Set initial tab based on URL parameter, default to 'enquiry'
    const [activeTab, setActiveTab] = useState(tabFromUrl || "enquiry")

    // Update tab when URL parameters change
    useEffect(() => {
        if (tabFromUrl) {
            setActiveTab(tabFromUrl)
        }
    }, [tabFromUrl])

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link to="/client" className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="mx-auto text-xl font-semibold">Client Portal</h1>
                </div>
            </header>
            <main className="flex-1 py-8">
                <div className="container mx-auto px-1">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="enquiry">Submit Enquiry</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>
                        <TabsContent value="enquiry" className="mt-6">
                            <EnquiryForm onTabChange={handleTabChange} />
                        </TabsContent>
                        <TabsContent value="notifications" className="mt-6">
                            <TicketList />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}