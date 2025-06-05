// Frontend/src/pages/client/Partner/PartnerSummary.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Users,
    DollarSign,
    BarChart3,
    TrendingUp,
    Eye,
    UserCheck,
    Activity
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Partner {
    _id: string;
    userId: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    referralCode: string;
    level: number;
    totalTrades: number;
    totalVolume: number;
    totalRebate: number;
    totalProfit: number;
    createdAt: string;
}

interface Totals {
    totalPartners: number;
    totalVolume: number;
    totalRebate: number;
    totalTrades: number;
}

const PartnerSummary = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [totals, setTotals] = useState<Totals>({
        totalPartners: 0,
        totalVolume: 0,
        totalRebate: 0,
        totalTrades: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPartnerSummary();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchPartnerSummary, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPartnerSummary = async () => {
        try {
            const token = localStorage.getItem('clientToken');

            if (!token) {
                toast.error("Please login to view partner summary");
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/commission/summary`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setPartners(response.data.partners);
                setTotals(response.data.totals);
            }
        } catch (error) {
            console.error("Error fetching partner summary:", error);
            toast.error("Failed to load partner summary");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toFixed(4);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    const handleViewDetails = (partnerId: string, partnerName: string) => {
        navigate(`/client/partners/commission/${partnerId}`, {
            state: { partnerName }
        });
    };

    const getLevelBadgeColor = (level: number) => {
        const colors = [
            'bg-blue-100 text-blue-800 border-blue-300',
            'bg-green-100 text-green-800 border-green-300',
            'bg-purple-100 text-purple-800 border-purple-300',
            'bg-orange-100 text-orange-800 border-orange-300',
            'bg-red-100 text-red-800 border-red-300'
        ];
        return colors[(level - 1) % colors.length] || colors[0];
    };

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Users className="h-8 w-8" />
                    Partner Commission Summary
                </h2>
                <p className="text-muted-foreground">
                    Overview of your downline partners and commission earnings
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Partners
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {totals.totalPartners}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active referrals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Trades
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totals.totalTrades}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Commission trades
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Volume
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(totals.totalVolume)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total lots traded
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Commission
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            ${formatCurrency(totals.totalRebate)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total earned
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Partners Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Partner Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                    <TableHead className="font-semibold">Partner</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Level</TableHead>
                                    <TableHead className="font-semibold">Trades</TableHead>
                                    <TableHead className="font-semibold">Volume</TableHead>
                                    <TableHead className="font-semibold">Commission</TableHead>
                                    <TableHead className="font-semibold">Joined</TableHead>
                                    <TableHead className="font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.length > 0 ? (
                                    partners.map((partner) => (
                                        <TableRow key={partner._id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold">
                                                        {partner.userId.firstname} {partner.userId.lastname}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {partner.referralCode}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {partner.userId.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={getLevelBadgeColor(partner.level)}
                                                >
                                                    Level {partner.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                    {partner.totalTrades}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                {formatCurrency(partner.totalVolume)}
                                            </TableCell>
                                            <TableCell className="font-mono font-medium text-emerald-600">
                                                ${formatCurrency(partner.totalRebate)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDateTime(partner.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                {partner.totalTrades > 0 ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewDetails(
                                                            partner._id,
                                                            `${partner.userId.firstname} ${partner.userId.lastname}`
                                                        )}
                                                        className="gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No trades</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <div className="text-lg font-medium">No partners found</div>
                                                <div className="text-sm">
                                                    Share your referral code to start earning commissions from partner trades.
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
        </div>
    );
};

export default PartnerSummary;