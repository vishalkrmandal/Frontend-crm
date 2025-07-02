import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaymentMethod from "./components/PaymentMethod"

export default function ConfigurationPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Configuration Settings</h1>

            <Tabs defaultValue="payment" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-8">
                    <TabsTrigger value="payment" className="data-[state=active]:bg-card">Payment Method</TabsTrigger>
                </TabsList>
                <TabsContent value="payment">
                    <PaymentMethod />
                </TabsContent>
            </Tabs>
        </div>
    )
}

