// Frontend/src/pages/client/Partner/IBDashboard.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";
import { Banknote, History, Users, Trees, CreditCard } from "lucide-react";
import IBTree from './IBTree';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface IBPartner {
    _id: string;
    userId: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    referralCode: string;
    level: number;
    totalVolume: number;
    totalEarned: number;
}

interface IBSummary {
    totalCommission: number;
    withdrawableBalance: number;
    totalWithdrawals: number;
    partnersCount: number;
}

const IBDashboard = () => {
    const [activeTab, setActiveTab] = useState<string>("details");
    const [loading, setLoading] = useState<boolean>(true);
    const [ibSummary, setIbSummary] = useState<IBSummary>({
        totalCommission: 0,
        withdrawableBalance: 0,
        totalWithdrawals: 0,
        partnersCount: 0
    });
    const [partnersList, setPartnersList] = useState<IBPartner[]>([]);
    const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            const dashboardResponse = await axios.get(`${API_BASE_URL}/api/ib-configurations/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (dashboardResponse.data.success) {
                setIbSummary(dashboardResponse.data.summary);
            }

            const partnersResponse = await axios.get(`${API_BASE_URL}/api/ib-configurations/partners`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (partnersResponse.data.success) {
                setPartnersList(partnersResponse.data.partners);
            }

            const withdrawalsResponse = await axios.get(`${API_BASE_URL}/api/withdrawals/ib-withdrawals`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (withdrawalsResponse.data.success) {
                setWithdrawalHistory(withdrawalsResponse.data.withdrawals);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/withdrawals/ib-withdraw`,
                { amount: ibSummary.withdrawableBalance },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                fetchDashboardData();
                toast.success("Withdrawal request submitted successfully");
            }
        } catch (error) {
            console.error("Error processing withdrawal:", error);
            toast.error("Failed to process withdrawal request");
        }
    };

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">IB Dashboard</h2>
                <p className="text-muted-foreground">
                    Manage your referral network and earnings
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Commission
                        </CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${ibSummary.totalCommission.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime Earnings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Withdrawal History
                        </CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${ibSummary.totalWithdrawals.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total Withdrawn
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Withdrawable Balance
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${ibSummary.withdrawableBalance.toFixed(2)}</div>
                        {ibSummary.withdrawableBalance > 0 && (
                            <Button
                                className="mt-2 w-full"
                                size="sm"
                                variant="outline"
                                onClick={handleWithdraw}
                            >
                                Withdraw
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            IB Partners
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ibSummary.partnersCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total Network Size
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Details and Tree */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                        <Users className="mr-2 h-4 w-4" />
                        IB Details
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="mr-2 h-4 w-4" />
                        Withdrawal History
                    </TabsTrigger>
                    <TabsTrigger value="tree">
                        <Trees className="mr-2 h-4 w-4" />
                        IB Tree
                    </TabsTrigger>
                </TabsList>

                {/* IB Details Tab */}
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Partner Network</CardTitle>
                            <CardDescription>
                                View all partners in your referral network
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name/Email</TableHead>
                                        <TableHead>IB Code</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Total Volume</TableHead>
                                        <TableHead>Total Earned</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partnersList.length > 0 ? (
                                        partnersList.map((partner) => (
                                            <TableRow key={partner._id}>
                                                <TableCell>
                                                    <div className="font-medium">{`${partner.userId.firstname} ${partner.userId.lastname}`}</div>
                                                    <div className="text-sm text-muted-foreground">{partner.userId.email}</div>
                                                </TableCell>
                                                <TableCell>{partner.referralCode}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{partner.level}</Badge>
                                                </TableCell>
                                                <TableCell>${partner.totalVolume.toFixed(2)}</TableCell>
                                                <TableCell>${partner.totalEarned.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6">
                                                <div className="text-muted-foreground">
                                                    No partners found. Share your referral link to start growing your network.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Withdrawal History Tab */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Withdrawal History</CardTitle>
                            <CardDescription>
                                Your commission withdrawal requests and status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reference</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawalHistory.length > 0 ? (
                                        withdrawalHistory.map((withdrawal) => (
                                            <TableRow key={withdrawal._id}>
                                                <TableCell>
                                                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        withdrawal.status === 'completed' ? 'default' :
                                                            withdrawal.status === 'approved' ? 'secondary' :
                                                                withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                                                    }>
                                                        {withdrawal.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{withdrawal.reference || '—'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-6">
                                                <div className="text-muted-foreground">
                                                    No withdrawal history found.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* IB Tree Tab */}
                <TabsContent value="tree">
                    <Card>
                        <CardHeader>
                            <CardTitle>Network Tree</CardTitle>
                            <CardDescription>
                                Visual representation of your referral network
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            <IBTree partnersList={partnersList} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Toaster position="top-center" />
        </div>
    );
};

export default IBDashboard;