import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LeverageAndGroup from "./components/leverageGroup"
import ConfigureValues from "./components/ConfigureValues"

export default function SuperadminConfigurationPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Configuration Settings</h1>

            <Tabs defaultValue="leverage" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="leverage" className="data-[state=active]:bg-card">Leverage & Group</TabsTrigger>
                    <TabsTrigger value="configure" className="data-[state=active]:bg-card">Configure Values</TabsTrigger>
                </TabsList>

                <TabsContent value="leverage" >
                    <LeverageAndGroup />
                </TabsContent>

                <TabsContent value="configure">
                    <ConfigureValues />
                </TabsContent>
            </Tabs>
        </div>
    )
}

