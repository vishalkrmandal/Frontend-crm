"use client"


import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { Copy, Facebook, Twitter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ParentDetails {
    name: string;
    email: string;
    referralCode: string;
    level: number;
}

interface IBConfiguration {
    _id: string;
    referralCode: string | null;
    status: string;
    level: number;
    parentDetails?: ParentDetails;
}

const ReferFriend = () => {
    // const [emailAddress, setEmailAddress] = useState("")
    const [copied, setCopied] = useState(false)
    // const [emailSent, setEmailSent] = useState(false)
    const [ibConfig, setIbConfig] = useState<IBConfiguration | null>(null)
    const [referralLink, setReferralLink] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const referralLinkRef = useRef<HTMLInputElement>(null)

    const navigate = useNavigate()

    // Check if referral code already exists
    useEffect(() => {
        const checkReferralCode = async () => {
            try {
                const token = localStorage.getItem('clientToken');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/api/ibclients/ib-configurations/my-code`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success && response.data.ibConfiguration) {
                    setIbConfig(response.data.ibConfiguration);

                    // Only set referral link if referralCode exists
                    if (response.data.ibConfiguration.referralCode) {
                        const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
                        setReferralLink(`${clientUrl}/signup/${response.data.ibConfiguration.referralCode}`);
                    }
                }
            } catch (error) {
                console.error("Error fetching referral code:", error);
            }
        };

        checkReferralCode();
    }, [navigate]);

    const handleCreateReferralCode = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('clientToken');

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/ibclients/ib-configurations/create`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setIbConfig(response.data.ibConfiguration);

                if (response.data.ibConfiguration.referralCode) {
                    const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
                    setReferralLink(`${clientUrl}/signup/${response.data.ibConfiguration.referralCode}`);
                }

                toast.success("Referral code created successfully!");
            }
        } catch (error) {
            console.error("Error creating referral code:", error);
            toast.error("Failed to create referral code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (referralLinkRef.current) {
            referralLinkRef.current.select()
            navigator.clipboard.writeText(referralLink)
            setCopied(true)
            toast.success("Referral link copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // const handleSendEmail = (e: React.FormEvent) => {
    //     e.preventDefault()
    //     if (!referralLink) {
    //         toast.error("Please create your referral code first!")
    //         return
    //     }
    //     // In a real app, this would send the email via an API
    //     console.log("Sending email to:", emailAddress, "with link:", referralLink)
    //     setEmailSent(true)
    //     toast.success("Email sent successfully!")
    //     setTimeout(() => {
    //         setEmailSent(false)
    //         setEmailAddress("")
    //     }, 2000)
    // }

    const handleSocialShare = (platform: string) => {
        if (!referralLink) {
            toast.error("Please create your referral code first!")
            return
        }

        let shareUrl = ""
        const shareText = "Join me on TradeCRM and get 10% off your first deposit!"

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
                break
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`
                break
            case "whatsapp":
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + referralLink)}`
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

                        {!ibConfig || !ibConfig.referralCode ? (
                            <div className="flex flex-col items-center space-y-4 mb-6">
                                <p className="text-center text-muted-foreground">
                                    Create your referral code to start sharing with friends
                                </p>
                                <Button
                                    onClick={handleCreateReferralCode}
                                    disabled={loading}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Referral Code'}
                                </Button>
                            </div>
                        ) : (
                            <>
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

                                {/* <div>
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
                                </div> */}
                            </>
                        )}
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
                        <p className="text-muted-foreground">
                            {!ibConfig || !ibConfig.referralCode
                                ? "Create your referral code to start tracking your referrals!"
                                : "You haven't referred anyone yet. Start sharing your link today!"
                            }
                        </p>
                        {ibConfig && ibConfig.referralCode && (
                            <Button
                                className="mt-4"
                                onClick={handleCopyLink}
                            >
                                Share Your Link
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ReferFriend