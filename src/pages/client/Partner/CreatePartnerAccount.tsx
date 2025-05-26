// Frontend/src/pages/client/Partner/CreatePartnerAccount.tsx - Updated
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Users, Crown, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import IBDashboard from './IBDashboard';
import TradeCommission from './TradeCommission';

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

const CreatePartnerAccount = () => {
    const [ibConfig, setIbConfig] = useState<IBConfiguration | null>(null);
    const [referralLink, setReferralLink] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('create');
    const [loading, setLoading] = useState<boolean>(false);
    const [affiliateId, setAffiliateId] = useState<string>('');

    const navigate = useNavigate();

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

                    // Only set referral link and affiliate ID if referralCode exists
                    if (response.data.ibConfiguration.referralCode) {
                        const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
                        setReferralLink(`${clientUrl}/signup/${response.data.ibConfiguration.referralCode}`);
                        setAffiliateId(`${response.data.ibConfiguration.referralCode.toUpperCase()}`);
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
                    setAffiliateId(`${response.data.ibConfiguration.referralCode.toUpperCase()}`);
                }

                toast.success("Referral code created/activated successfully!");
            }
        } catch (error) {
            console.error("Error creating referral code:", error);
            toast.error("Failed to create referral code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    const handleShareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my network!',
                    text: 'Sign up using my referral link',
                    url: referralLink,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                console.error('Error sharing:', error);
                handleCopyToClipboard(referralLink, 'Link');
            }
        } else {
            handleCopyToClipboard(referralLink, 'Link');
        }
    };

    // Helper function to check if we should show the create button
    const shouldShowCreateButton = () => {
        return !ibConfig || !ibConfig.referralCode;
    };

    return (
        <div className="container mx-auto py-6 max-w-6xl">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Create Partner Account</TabsTrigger>
                    <TabsTrigger value="dashboard">IB Dashboard</TabsTrigger>
                    <TabsTrigger value="commissions">Trade Commission</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <div className="space-y-6">
                        {/* Parent Referral Details */}
                        {ibConfig?.parentDetails && (
                            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                        <Crown className="h-5 w-5" />
                                        Your Referrer Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">Referrer Name</Label>
                                            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                                {ibConfig.parentDetails.name}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">Referrer Email</Label>
                                            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                                {ibConfig.parentDetails.email}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">Referrer Code</Label>
                                            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                                {ibConfig.parentDetails.referralCode}
                                            </div>
                                        </div>
                                        {/* <div>
                                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">Your Level</Label>
                                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                Level {ibConfig.level}
                                            </Badge>
                                        </div> */}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Main Partner Account Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                                    <Users className="h-6 w-6" />
                                    Create Partner Account
                                </CardTitle>
                                <CardDescription className="text-center">
                                    {ibConfig && ibConfig.referralCode
                                        ? 'Manage your referral codes and start earning commissions'
                                        : 'Generate your referral code and start earning commissions'
                                    }
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {shouldShowCreateButton() ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <TrendingUp className="h-8 w-8 text-white" />
                                        </div>

                                        {ibConfig && !ibConfig.referralCode ? (
                                            <>
                                                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                                    <AlertTitle className="text-orange-800 dark:text-orange-200">
                                                        Ready to Become an IB?
                                                    </AlertTitle>
                                                    <AlertDescription className="text-orange-700 dark:text-orange-300">
                                                        Create your referral code to start earning commissions on referred accounts.
                                                    </AlertDescription>
                                                </Alert>
                                                <p className="text-center text-muted-foreground">
                                                    Join our Introducing Broker program and unlock a powerful way to earn from your network.
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-center text-muted-foreground">
                                                Create your referral code to start earning commissions on referred accounts.
                                            </p>
                                        )}

                                        <Button
                                            onClick={handleCreateReferralCode}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            {loading ? 'Creating...' :
                                                ibConfig && !ibConfig.referralCode ? 'Generate Referral Code' : 'Create Referral Code'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Status Alert */}
                                        {ibConfig && ibConfig.status === 'pending' && (
                                            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                                                    Account Pending Activation
                                                </AlertTitle>
                                                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                                    Your IB account is pending activation. Contact support to activate your account.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Affiliate ID */}
                                        <div className="space-y-2">
                                            <Label htmlFor="affiliate-id" className="flex items-center gap-2">
                                                <Crown className="h-4 w-4" />
                                                Affiliate ID:
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="affiliate-id"
                                                    value={affiliateId}
                                                    readOnly
                                                    className="font-bold text-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => ibConfig && ibConfig.referralCode && handleCopyToClipboard(ibConfig.referralCode, 'Referral code')}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Referral Link */}
                                        <div className="space-y-2">
                                            <Label htmlFor="referral-link" className="flex items-center gap-2">
                                                <Share2 className="h-4 w-4" />
                                                Your Referral Link:
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="referral-link"
                                                    value={referralLink}
                                                    readOnly
                                                    className="font-medium"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleCopyToClipboard(referralLink, 'Referral link')}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={handleShareLink}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Level and Status Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                                            {/* <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    Level {ibConfig ? ibConfig.level : ''}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Your Network Level</div>
                                            </div> */}
                                            <div className="text-center justify-center">
                                                <Badge
                                                    variant={ibConfig && ibConfig.status === 'active' ? 'default' : 'secondary'}
                                                    className="text-lg px-4 py-2"
                                                >
                                                    {ibConfig ? ibConfig.status.toUpperCase() : ''}
                                                </Badge>
                                                <div className="text-sm text-muted-foreground mt-1">Account Status</div>
                                            </div>
                                        </div>

                                        <Alert>
                                            <AlertTitle>💡 Tip</AlertTitle>
                                            <AlertDescription>
                                                Share this link with others. When they sign up, they'll automatically be added to your network and you'll start earning commissions from their trades.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>

                            {ibConfig && ibConfig.referralCode && (
                                <CardFooter className="flex justify-center gap-4">
                                    <Button
                                        onClick={() => setActiveTab("dashboard")}
                                        variant="outline"
                                    >
                                        Go to IB Dashboard
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab("commissions")}
                                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                    >
                                        View Trade Commissions
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="dashboard">
                    <IBDashboard />
                </TabsContent>

                <TabsContent value="commissions">
                    <TradeCommission />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CreatePartnerAccount;