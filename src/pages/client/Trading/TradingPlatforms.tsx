import { Apple, Globe, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TradingPlatforms() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Trading Platform</h1>
                <p className="text-muted-foreground">Download and access from all platform.</p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="min-h-screen flex flex-col">
                    {/* Hero Section with Background Image */}
                    <div className="relative flex-1 rounded-xl border overflow-hidden">
                        <div className="absolute inset-0 w-full h-full rounded-xl border">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                        </div>

                        <div className="container mx-auto relative z-10 h-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                                {/* Left Column - Text and Download as */}
                                <div className="flex flex-col justify-center py-16 px-6 lg:px-0 space-y-12">
                                    <div className="space-y-6">
                                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                                            Trade on <span className="bg-orange-500 px-2 rounded-lg">world class</span> Platform
                                        </h2>
                                        <p className="text-lg text-gray-200 max-w-xl">
                                            Ultra fast trade execution, No dealing desk, no requotes, Wide selection of Expert Advisors supported
                                            & Trading from a smartphone or tablet
                                        </p>
                                    </div>

                                    {/* Download as */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <a href="#" className="group">
                                            <div className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-xl border border-white/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-black rounded-full p-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="text-white"
                                                        >
                                                            <path d="M4 7V17L16 12L4 7Z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-300">Download From</p>
                                                        <h3 className="text-xl font-semibold text-white">Play Store</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        <a href="#" className="group">
                                            <div className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-xl border border-white/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-black rounded-full p-3">
                                                        <Apple className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-300">Download From</p>
                                                        <h3 className="text-xl font-semibold text-white">App Store</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        <a href="#" className="group">
                                            <div className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-xl border border-white/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-black rounded-full p-3">
                                                        <Laptop className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-300">Download For</p>
                                                        <h3 className="text-xl font-semibold text-white">Desktop & Mac</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        <a href="#" className="group">
                                            <div className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-xl border border-white/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-black rounded-full p-3">
                                                        <Globe className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-300">Access Via</p>
                                                        <h3 className="text-xl font-semibold text-white">Web Platform</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-8 py-6 text-lg rounded-full">
                                        Start Trading Now
                                    </Button>
                                </div>

                                {/* Right Column - Device Images */}
                                <div className="hidden lg:flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        {/* Image placeholder */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}