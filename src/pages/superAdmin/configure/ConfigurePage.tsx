import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LeverageAndGroup from "./components/leverageGroup"
import ConfigureValues from "./components/ConfigureValues"
import PaymentMethod from "./components/PaymentMethod"

export default function ConfigurationPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Configuration Settings</h1>

            <Tabs defaultValue="leverage" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="leverage">Leverage & Group</TabsTrigger>
                    <TabsTrigger value="configure">Configure Values</TabsTrigger>
                    <TabsTrigger value="payment">Payment Method</TabsTrigger>
                </TabsList>

                <TabsContent value="leverage">
                    <LeverageAndGroup />
                </TabsContent>

                <TabsContent value="configure">
                    <ConfigureValues />
                </TabsContent>

                <TabsContent value="payment">
                    <PaymentMethod />
                </TabsContent>
            </Tabs>
        </div>
    )
}

