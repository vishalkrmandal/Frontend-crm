// Frontend/src/pages/client/Partner/CreatePartnerAccount.tsx
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
import { Copy, Share2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast, Toaster } from "sonner";
import IBDashboard from './IBDashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreatePartnerAccount = () => {
    const [referralCode, setReferralCode] = useState<string>('');
    const [referralLink, setReferralLink] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('create');
    const [loading, setLoading] = useState<boolean>(false);

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
                    setReferralCode(response.data.ibConfiguration.referralCode);
                    const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
                    setReferralLink(`${clientUrl}/signup/${response.data.ibConfiguration.referralCode}`);
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
                setReferralCode(response.data.ibConfiguration.referralCode);
                const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
                setReferralLink(`${clientUrl}/signup/${response.data.ibConfiguration.referralCode}`);

                toast.success("Referral code created successfully!");
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

    return (
        <div className="container mx-auto py-6 max-w-6xl">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Partner Account</TabsTrigger>
                    <TabsTrigger value="dashboard">IB Dashboard</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Create Partner Account</CardTitle>
                            <CardDescription className="text-center">
                                Generate your referral code and start earning commissions
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {!referralCode ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <p className="text-center text-muted-foreground">
                                        Create your referral code to start earning commissions on referred accounts.
                                    </p>
                                    <Button
                                        onClick={handleCreateReferralCode}
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Referral Code'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="referral-code">Your Referral Code:</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="referral-code"
                                                value={referralCode}
                                                readOnly
                                                className="font-medium"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleCopyToClipboard(referralCode, 'Referral code')}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="referral-link">Your Referral Link:</Label>
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

                                    <Alert>
                                        <AlertTitle>Tip</AlertTitle>
                                        <AlertDescription>
                                            Share this link with others. When they sign up, they'll automatically be added to your network.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </CardContent>

                        {referralCode && (
                            <CardFooter className="flex justify-center">
                                <Button onClick={() => setActiveTab("dashboard")}>
                                    Go to IB Dashboard
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="dashboard">
                    <IBDashboard />
                </TabsContent>
            </Tabs>

            <Toaster position="top-center" />
        </div>
    );
};

export default CreatePartnerAccount;