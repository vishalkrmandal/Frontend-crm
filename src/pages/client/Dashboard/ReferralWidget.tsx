// Frontend\src\pages\client\components\dashboard\ReferralWidget.tsx

import { Users, Share, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ReferralWidgetProps {
    referrals: number
    earnings: number
}

export const ReferralWidget = ({ referrals, earnings }: ReferralWidgetProps) => {
    const [copied, setCopied] = useState(false)
    const referralLink = "https://yourplatform.com/register?ref=ABC123" // This should come from API

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Referral Program
                </h3>
                <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-800">{referrals}</p>
                        <p className="text-xs text-purple-600">Total Referrals</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-800">${earnings}</p>
                        <p className="text-xs text-green-600">Earnings</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Your Referral Link</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="flex-1 text-xs p-2 border border-gray-300 rounded bg-gray-50"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                            <Copy className="h-3 w-3" />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                        <Share className="h-3 w-3" />
                        Share
                    </button>
                    <button className="flex-1 px-3 py-2 border border-purple-600 text-purple-600 rounded text-xs hover:bg-purple-50 transition-colors">
                        View Details
                    </button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    Earn commission for every successful referral
                </div>
            </div>
        </div>
    )
}