import { Apple, Globe, Laptop, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/context/ThemeContext"

export default function TradingPlatforms() {
    const { theme } = useTheme();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Trading Platform</h1>
                <p className="text-muted-foreground">Download and access from all platforms.</p>
            </div>

            <div className={`rounded-xl ${theme === 'dark' ? 'bg-card' : 'bg-card'} shadow-sm`}>
                <div className="min-h-screen flex flex-col">
                    {/* Hero Section with Background Image */}
                    <div className={`relative flex-1 rounded-xl overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="absolute inset-0 w-full h-full rounded-xl">
                            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-black/80 to-gray-900/30' : 'bg-gradient-to-r from-gray-100/90 to-white/70'}`} />
                        </div>

                        <div className="container mx-auto relative z-10 h-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                                {/* Left Column - Text and Download as */}
                                <div className="flex flex-col justify-center py-16 px-6 lg:px-0 space-y-12">
                                    <div className="space-y-6">
                                        <h2 className={`text-3xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            Trade on <span className="bg-orange-500 px-2 rounded-lg text-white">world class</span> Platform
                                        </h2>
                                        <p className={`text-base md:text-lg max-w-xl ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Ultra fast trade execution, No dealing desk, no requotes, Wide selection of Expert Advisors supported
                                            & Trading from a smartphone or tablet
                                        </p>
                                    </div>

                                    {/* Download as */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                        <a href="#" className="group">
                                            <div className={`${theme === 'dark'
                                                ? 'bg-white/10 hover:bg-white/20 border-white/20'
                                                : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} 
                                                backdrop-blur-sm p-4 md:p-6 rounded-xl border transition-all`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`${theme === 'dark' ? 'bg-black' : 'bg-gray-900'} rounded-full p-3`}>
                                                        <PlayCircle className="text-white h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Download From</p>
                                                        <h3 className={`text-lg md:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Play Store</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        <a href="#" className="group">
                                            <div className={`${theme === 'dark'
                                                ? 'bg-white/10 hover:bg-white/20 border-white/20'
                                                : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} 
                                                backdrop-blur-sm p-4 md:p-6 rounded-xl border transition-all`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`${theme === 'dark' ? 'bg-black' : 'bg-gray-900'} rounded-full p-3`}>
                                                        <Apple className="text-white h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Download From</p>
                                                        <h3 className={`text-lg md:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>App Store</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        <a href="#" className="group">
                                            <div className={`${theme === 'dark'
                                                ? 'bg-white/10 hover:bg-white/20 border-white/20'
                                                : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} 
                                                backdrop-blur-sm p-4 md:p-6 rounded-xl border transition-all`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`${theme === 'dark' ? 'bg-black' : 'bg-gray-900'} rounded-full p-3`}>
                                                        <Laptop className="text-white h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Download For</p>
                                                        <h3 className={`text-lg md:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Desktop & Mac</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        <a href="#" className="group">
                                            <div className={`${theme === 'dark'
                                                ? 'bg-white/10 hover:bg-white/20 border-white/20'
                                                : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} 
                                                backdrop-blur-sm p-4 md:p-6 rounded-xl border transition-all`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`${theme === 'dark' ? 'bg-black' : 'bg-gray-900'} rounded-full p-3`}>
                                                        <Globe className="text-white h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Access Via</p>
                                                        <h3 className={`text-lg md:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Web Platform</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-6 py-5 text-base md:text-lg rounded-full">
                                        Start Trading Now
                                    </Button>
                                </div>

                                {/* Right Column - Device Images */}
                                <div className="hidden lg:flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        {/* Image placeholder - could add a real image or placeholder */}
                                        {/* <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-100/60'} backdrop-blur-sm`}>
                                                <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    Device Preview
                                                </p>
                                            </div>  
                                        </div> */}
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