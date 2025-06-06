// Frontend/src/pages/client/Partner/IBDashboard.tsx - Lightweight Version
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
import { toast } from "sonner";
import {
    Banknote,
    History,
    Users,
    Trees,
    Wallet,
    RefreshCw,
    ArrowUpRight,
    CheckCircle,
    Clock,
    XCircle,
    Eye
} from "lucide-react";
import IBTree from './IBTree';
import { useNavigate } from 'react-router-dom';

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

interface WithdrawalRequest {
    _id: string;
    amount: number;
    withdrawalMethod: string;
    status: string;
    createdAt: string;
    rejectedReason?: string;
}

const IBDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>("details");
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [ibSummary, setIbSummary] = useState<IBSummary>({
        totalCommission: 0,
        withdrawableBalance: 0,
        totalWithdrawals: 0,
        partnersCount: 0
    });
    const [partnersList, setPartnersList] = useState<IBPartner[]>([]);
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            if (!refreshing) setLoading(true);
            const token = localStorage.getItem('clientToken');

            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            // Fetch dashboard summary
            const dashboardResponse = await axios.get(`${API_BASE_URL}/api/ibclients/ib-configurations/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (dashboardResponse.data.success) {
                setIbSummary(dashboardResponse.data.summary);
            }

            // Fetch partners list
            const partnersResponse = await axios.get(`${API_BASE_URL}/api/ibclients/ib-configurations/partners`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (partnersResponse.data.success) {
                setPartnersList(partnersResponse.data.partners);
            }

            // Fetch withdrawal history using new endpoint
            const withdrawalsResponse = await axios.get(`${API_BASE_URL}/api/ibclients/withdrawals/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (withdrawalsResponse.data.success) {
                setWithdrawalHistory(withdrawalsResponse.data.withdrawals);
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        toast.success("Dashboard refreshed successfully!");
    };

    const handleWithdrawNavigation = () => {
        navigate('/client/partner/ib-withdrawal');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-3 w-3" />;
            case 'approved':
                return <CheckCircle className="h-3 w-3" />;
            case 'rejected':
                return <XCircle className="h-3 w-3" />;
            default:
                return <Eye className="h-3 w-3" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800';
            case 'approved':
                return 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800';
            case 'rejected':
                return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/10 dark:text-gray-400 dark:border-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        IB Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your referral network and commission earnings
                    </p>
                </div>

                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Lightweight Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Commission Card */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Commission
                        </CardTitle>
                        <Banknote className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${ibSummary.totalCommission.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime Earnings
                        </p>
                    </CardContent>
                </Card>

                {/* Withdrawable Balance Card */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Available Balance
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">${ibSummary.withdrawableBalance.toFixed(2)}</div>
                        <div className="mt-2">
                            {ibSummary.withdrawableBalance > 0 ? (
                                <Button
                                    onClick={handleWithdrawNavigation}
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    Withdraw
                                </Button>
                            ) : (
                                <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Total Withdrawals Card */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Withdrawn
                        </CardTitle>
                        <History className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">${ibSummary.totalWithdrawals.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully Withdrawn
                        </p>
                    </CardContent>
                </Card>

                {/* IB Partners Card */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Network Partners
                        </CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{ibSummary.partnersCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active Referrals
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Lightweight Tabs */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                        <Users className="mr-2 h-4 w-4" />
                        Partner Details
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals">
                        <History className="mr-2 h-4 w-4" />
                        Withdrawal History
                    </TabsTrigger>
                    <TabsTrigger value="tree">
                        <Trees className="mr-2 h-4 w-4" />
                        Network Tree
                    </TabsTrigger>
                </TabsList>

                {/* Partner Details Tab */}
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Partner Network</CardTitle>
                            <CardDescription>
                                View all partners in your referral network and their performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                            <TableHead className="font-semibold">Partner Info</TableHead>
                                            <TableHead className="font-semibold">Referral Code</TableHead>
                                            <TableHead className="font-semibold">Level</TableHead>
                                            <TableHead className="font-semibold">Total Volume</TableHead>
                                            <TableHead className="font-semibold">Commission Earned</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partnersList.length > 0 ? (
                                            partnersList.map((partner) => (
                                                <TableRow key={partner._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {partner.userId.firstname} {partner.userId.lastname}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {partner.userId.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono">
                                                            {partner.referralCode}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            Level {partner.level}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-blue-600">
                                                        {partner.totalVolume.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-medium text-green-600">
                                                        ${partner.totalEarned.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="space-y-2">
                                                        <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
                                                        <div className="text-lg font-medium text-muted-foreground">
                                                            No partners found
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Share your referral link to start growing your network
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Withdrawal History Tab */}
                <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Withdrawal History</CardTitle>
                                    <CardDescription>
                                        Track all your withdrawal requests and their status
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={handleWithdrawNavigation}
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                    <Wallet className="h-4 w-4 mr-2" />
                                    New Withdrawal
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                            <TableHead className="font-semibold">Date & Time</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Method</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withdrawalHistory.length > 0 ? (
                                            withdrawalHistory.map((withdrawal) => (
                                                <TableRow key={withdrawal._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <TableCell className="text-sm">
                                                        {formatDate(withdrawal.createdAt)}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold">
                                                        ${withdrawal.amount.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {withdrawal.withdrawalMethod}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`capitalize ${getStatusColor(withdrawal.status)}`}
                                                        >
                                                            {getStatusIcon(withdrawal.status)}
                                                            <span className="ml-1">{withdrawal.status}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {withdrawal.rejectedReason && (
                                                            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                                                <strong>Rejected:</strong> {withdrawal.rejectedReason}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="space-y-2">
                                                        <History className="h-12 w-12 mx-auto text-muted-foreground/30" />
                                                        <div className="text-lg font-medium text-muted-foreground">
                                                            No withdrawal history
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Your withdrawal requests will appear here
                                                        </div>
                                                        <Button
                                                            onClick={handleWithdrawNavigation}
                                                            className="mt-4"
                                                            variant="outline"
                                                        >
                                                            <Wallet className="h-4 w-4 mr-2" />
                                                            Make First Withdrawal
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* IB Tree Tab */}
                <TabsContent value="tree">
                    <Card>
                        <CardHeader>
                            <CardTitle>Network Tree</CardTitle>
                            <CardDescription>
                                Visual representation of your referral network hierarchy
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            <IBTree partnersList={partnersList} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default IBDashboard;