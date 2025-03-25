"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Copy, Facebook, Send, Twitter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


const ReferFriend = () => {
    const [emailAddress, setEmailAddress] = useState("")
    const [copied, setCopied] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const referralLinkRef = useRef<HTMLInputElement>(null)

    // Mock referral link - in a real app, this would be generated for each user
    const referralLink = "https://tradecrm.com/register?ref=USER123"

    const handleCopyLink = () => {
        if (referralLinkRef.current) {
            referralLinkRef.current.select()
            document.execCommand("copy")
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, this would send the email via an API
        console.log("Sending email to:", emailAddress)
        setEmailSent(true)
        setTimeout(() => {
            setEmailSent(false)
            setEmailAddress("")
        }, 2000)
    }

    const handleSocialShare = (platform: string) => {
        // In a real app, this would open the respective sharing dialog
        let shareUrl = ""

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
                break
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join me on TradeCRM and get 10% off your first deposit!")}`
                break
            case "whatsapp":
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent("Join me on TradeCRM and get 10% off your first deposit! " + referralLink)}`
                break
            case "messenger":
                shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(referralLink)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`
                break
        }

        if (shareUrl) {
            window.open(shareUrl, "_blank", "width=600,height=400")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Referral Program</h1>
                <p className="text-muted-foreground mt-1">Invite friends and earn rewards</p>
            </div>

            <Card className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Illustration */}
                    <div className="p-8 flex flex-col items-center justify-center bg-accent/30 relative">
                        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <div className="text-xl">❤️</div>
                        </div>
                        <div className="absolute top-10 right-20 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <div className="text-xl">⭐</div>
                        </div>
                        <div className="absolute bottom-20 left-10 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <div className="text-xl">⭐</div>
                        </div>
                        <div className="absolute bottom-10 right-10 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <div className="text-xl">💰</div>
                        </div>

                        <h2 className="text-3xl font-bold text-red-500 mb-6">REFER A FRIEND</h2>

                        <img
                            src="/images/refer-friend.png"
                            alt="Referral illustration"
                            className="max-w-full h-auto"
                        />
                    </div>

                    {/* Right side - Referral content */}
                    <div className="p-8 flex flex-col">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold">GIVE 10%, GET $10 USD</h2>
                            <h3 className="text-xl font-medium mt-2">REFER A FRIEND</h3>
                        </div>

                        <p className="text-center mb-8">
                            Give your friends 10% off, and earn $10 USD off when they buy. One sharing more happy people
                        </p>

                        <div className="mb-6">
                            <div className="flex">
                                <input
                                    ref={referralLinkRef}
                                    type="text"
                                    value={referralLink}
                                    readOnly
                                    className="bg-background border border-input rounded-l-md px-3 py-2 text-sm w-full focus:outline-none"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="bg-primary text-primary-foreground px-3 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                                >
                                    {copied ? "Copied!" : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => handleSocialShare("facebook")}
                                    className="w-12 h-12 rounded-full bg-[#3b5998] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                >
                                    <Facebook size={24} />
                                </button>
                                <button
                                    onClick={() => handleSocialShare("messenger")}
                                    className="w-12 h-12 rounded-full bg-[#0084ff] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 28 28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 2C7.373 2 2 6.97 2 13.304c0 3.83 1.92 7.25 4.923 9.492v4.666l4.497-2.475c.83.23 1.7.36 2.58.36 6.627 0 12-4.97 12-11.303C26 6.97 20.627 2 14 2z"></path>
                                        <path d="M6 12.5l5 3 7-6.5-7 5-5-3 7 6.5"></path>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleSocialShare("whatsapp")}
                                    className="w-12 h-12 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                >
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
                                    >
                                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.2.3-.767.966-.94 1.164-.173.199-.347.223-.647.075-.3-.15-1.269-.467-2.416-1.483-.893-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.462.13-.612.136-.13.3-.339.45-.508.149-.169.2-.3.3-.498.099-.2.05-.374-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleSocialShare("twitter")}
                                    className="w-12 h-12 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                >
                                    <Twitter size={24} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-center mb-3">Or share via email</p>
                            <form onSubmit={handleSendEmail} className="flex">
                                <input
                                    type="email"
                                    placeholder="Your friend's email address"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    className="bg-background border border-input rounded-l-md px-3 py-2 text-sm w-full focus:outline-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground px-3 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                                >
                                    {emailSent ? "Sent!" : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold">1</span>
                            </div>
                            <h4 className="font-medium mb-2">Share Your Link</h4>
                            <p className="text-sm text-muted-foreground">
                                Copy your unique referral link and share it with friends via email or social media.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold">2</span>
                            </div>
                            <h4 className="font-medium mb-2">Friend Signs Up</h4>
                            <p className="text-sm text-muted-foreground">
                                When your friend clicks your link and creates an account, they get 10% off their first deposit.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold">3</span>
                            </div>
                            <h4 className="font-medium mb-2">You Get Rewarded</h4>
                            <p className="text-sm text-muted-foreground">
                                Once your friend makes their first deposit, you'll receive $10 USD credited to your account.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Your Referral History</h3>
                    {/* This would be populated with actual referral data in a real app */}
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">You haven't referred anyone yet. Start sharing your link today!</p>
                        <Button className="mt-4">Share Your Link</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ReferFriend

