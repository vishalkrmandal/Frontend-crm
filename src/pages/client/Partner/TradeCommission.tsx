// Frontend/src/pages/client/Partner/TradeCommission.tsx - Enhanced Version
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
    FileSpreadsheet,
    FileText,
    Download,
    TrendingUp,
    DollarSign,
    BarChart3,
    CheckCircle,
    RefreshCw,
    Clock,
    Users,
    ChevronDown,
    ChevronUp,
    Eye,
    ArrowRight,
    User,
    Mail,
    CreditCard,
    Globe
} from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface TradeCommission {
    acNo: string;
    openTime: string;
    closeTime: string;
    openPrice: string;
    closePrice: string;
    symbol: string;
    profit: number;
    volume: number;
    rebate: number;
    status: string;
    level?: number;
}

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
    totalTrades?: number;
    country?: string;
    mt5Account?: string;
}

interface CommissionTotals {
    totalProfit: number;
    totalVolume: number;
    totalRebate: number;
}

interface CommissionSummary {
    totalCommission: number;
    totalTrades: number;
    totalVolume: number;
    totalProfit: number;
    avgCommissionPerTrade: number;
    period: number;
}

interface SyncStatus {
    isProcessing: boolean;
    lastSyncTime: string;
    nextSyncIn: string;
}

const TradeCommission = () => {
    const [trades, setTrades] = useState<TradeCommission[]>([]);
    const [partners, setPartners] = useState<IBPartner[]>([]);
    const [totals, setTotals] = useState<CommissionTotals>({
        totalProfit: 0,
        totalVolume: 0,
        totalRebate: 0
    });
    const [summary, setSummary] = useState<CommissionSummary | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [exporting, setExporting] = useState<{ excel: boolean; pdf: boolean }>({
        excel: false,
        pdf: false
    });
    const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
    const [partnerTrades, setPartnerTrades] = useState<{ [key: string]: TradeCommission[] }>({});
    const [loadingPartnerTrades, setLoadingPartnerTrades] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchInitialData();
        // Check sync status periodically
        const statusInterval = setInterval(fetchSyncStatus, 5000);
        return () => clearInterval(statusInterval);
    }, []);

    useEffect(() => {
        // Auto-load trades for all partners when partners data is available
        if (partners.length > 0) {
            partners.forEach(partner => {
                fetchPartnerTrades(partner._id);
            });
        }
    }, [partners]);

    const fetchInitialData = async () => {
        await Promise.all([
            fetchTradeCommissions(),
            fetchCommissionSummary(),
            fetchSyncStatus(),
            fetchPartnersWithCommissions()
        ]);
    };

    const fetchTradeCommissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('clientToken');

            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/commission/trade-commissions`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setTrades(response.data.trades);
                setTotals(response.data.totals);
            }
        } catch (error) {
            console.error("Error fetching trade commissions:", error);
            if (typeof error === "object" && error !== null && "response" in error && (error as any).response?.status === 404) {
                toast.info("No IB configuration found. Please set up your referral system first.");
            } else {
                toast.error("Failed to load trade commission data");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPartnersWithCommissions = async () => {
        try {
            const token = localStorage.getItem('clientToken');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/commission/partners`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setPartners(response.data.partners);
            }
        } catch (error) {
            console.error("Error fetching partners with commissions:", error);
        }
    };

    const fetchPartnerTrades = async (partnerId: string) => {
        if (partnerTrades[partnerId]) {
            return; // Already loaded
        }

        try {
            setLoadingPartnerTrades(prev => ({ ...prev, [partnerId]: true }));
            const token = localStorage.getItem('clientToken');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/commission/partner/${partnerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setPartnerTrades(prev => ({
                    ...prev,
                    [partnerId]: response.data.trades
                }));
            }
        } catch (error) {
            console.error("Error fetching partner trades:", error);
            toast.error("Failed to load partner trade details");
        } finally {
            setLoadingPartnerTrades(prev => ({ ...prev, [partnerId]: false }));
        }
    };

    const handlePartnerExpand = async (partnerId: string) => {
        if (expandedPartner === partnerId) {
            setExpandedPartner(null);
        } else {
            setExpandedPartner(partnerId);
            await fetchPartnerTrades(partnerId);
        }
    };

    const fetchCommissionSummary = async () => {
        try {
            const token = localStorage.getItem('clientToken');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/commission/summary?period=30`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.error("Error fetching commission summary:", error);
        }
    };

    const fetchSyncStatus = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/sync/status`);
            if (response.data.success) {
                setSyncStatus(response.data.syncStatus);
            }
        } catch (error) {
            console.error("Error fetching sync status:", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchInitialData();
        setRefreshing(false);
        toast.success("Data refreshed successfully!");
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toFixed(4);
    };

    const exportToExcel = async () => {
        try {
            setExporting(prev => ({ ...prev, excel: true }));

            const exportData = trades.map(trade => ({
                'AC NO': trade.acNo,
                'Open Time': formatDateTime(trade.openTime),
                'Close Time': formatDateTime(trade.closeTime),
                'Open Price': trade.openPrice,
                'Close Price': trade.closePrice,
                'Symbol': trade.symbol,
                'Profit': trade.profit,
                'Volume': trade.volume,
                'Commission': trade.rebate,
                'Status': trade.status,
                'Level': trade.level || 'N/A'
            }));

            // Add totals row
            exportData.push({
                'AC NO': '',
                'Open Time': '',
                'Close Time': '',
                'Open Price': '',
                'Close Price': '',
                'Symbol': '',
                'Profit': totals.totalProfit,
                'Volume': totals.totalVolume,
                'Commission': totals.totalRebate,
                'Status': 'TOTAL',
                'Level': ''
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();

            // Set column widths
            const colWidths = [
                { wch: 10 }, // AC NO
                { wch: 20 }, // Open Time
                { wch: 20 }, // Close Time
                { wch: 12 }, // Open Price
                { wch: 12 }, // Close Price
                { wch: 12 }, // Symbol
                { wch: 12 }, // Profit
                { wch: 10 }, // Volume
                { wch: 12 }, // Commission
                { wch: 10 }, // Status
                { wch: 8 }   // Level
            ];
            worksheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Commission Trades');

            const fileName = `commission_trades_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success("Excel file exported successfully!");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Failed to export Excel file");
        } finally {
            setExporting(prev => ({ ...prev, excel: false }));
        }
    };

    const exportToPDF = async () => {
        try {
            setExporting(prev => ({ ...prev, pdf: true }));

            const pdf = new jsPDF();

            // Add title
            pdf.setFontSize(20);
            pdf.text('Commission Trades Report', 20, 20);

            // Add date and summary
            pdf.setFontSize(12);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
            if (summary) {
                pdf.text(`Total Commission (30 days): $${summary.totalCommission.toFixed(4)}`, 20, 45);
                pdf.text(`Total Trades: ${summary.totalTrades}`, 20, 55);
            }

            // Prepare table data
            const tableData = trades.map(trade => [
                trade.acNo,
                formatDateTime(trade.openTime),
                formatDateTime(trade.closeTime),
                trade.openPrice,
                trade.closePrice,
                trade.symbol,
                formatCurrency(trade.profit),
                trade.volume.toFixed(4),
                formatCurrency(trade.rebate),
                trade.status,
                trade.level?.toString() || 'N/A'
            ]);

            // Add totals row
            tableData.push([
                '',
                '',
                '',
                '',
                '',
                'Total:',
                formatCurrency(totals.totalProfit),
                totals.totalVolume.toFixed(4),
                formatCurrency(totals.totalRebate),
                '',
                ''
            ]);

            // Create table
            (pdf as any).autoTable({
                startY: summary ? 65 : 55,
                head: [['AC NO', 'Open Time', 'Close Time', 'Open Price', 'Close Price', 'Symbol', 'Profit', 'Volume', 'Commission', 'Status', 'Level']],
                body: tableData,
                styles: {
                    fontSize: 7,
                    cellPadding: 1
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255]
                },
                footStyles: {
                    fillColor: [243, 244, 246],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold'
                }
            });

            const fileName = `commission_trades_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            toast.success("PDF file exported successfully!");
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            toast.error("Failed to export PDF file");
        } finally {
            setExporting(prev => ({ ...prev, pdf: false }));
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                    <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <TrendingUp className="h-8 w-8" />
                        Commission Trades
                    </h2>
                    <p className="text-muted-foreground">
                        Track your commission earnings from referred client trades
                    </p>
                </div>

                {/* Refresh Button and Sync Status */}
                <div className="flex items-center gap-3">
                    {syncStatus && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {syncStatus.isProcessing ? (
                                <span className="text-blue-600">Syncing...</span>
                            ) : (
                                <span>Last sync: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}</span>
                            )}
                        </div>
                    )}
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Commission
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${formatCurrency(totals.totalRebate)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {trades.length} trades
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
                        <div className="text-2xl font-bold text-blue-600">
                            {totals.totalVolume.toFixed(4)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total lots traded
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Partners
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {partners.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total IB partners
                        </p>
                    </CardContent>
                </Card>

                {/* 30-Day Summary Card */}
                {summary && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                30-Day Summary
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-orange-600">
                                ${formatCurrency(summary.totalCommission)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avg: ${formatCurrency(summary.avgCommissionPerTrade)}/trade
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Export Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    onClick={exportToExcel}
                    disabled={exporting.excel || trades.length === 0}
                    variant="outline"
                    className="gap-2"
                >
                    {exporting.excel ? (
                        <>
                            <Download className="h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className="h-4 w-4" />
                            Export Excel
                        </>
                    )}
                </Button>

                <Button
                    onClick={exportToPDF}
                    disabled={exporting.pdf || trades.length === 0}
                    variant="outline"
                    className="gap-2"
                >
                    {exporting.pdf ? (
                        <>
                            <Download className="h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4" />
                            Export PDF
                        </>
                    )}
                </Button>
            </div>

            {/* IB Partners Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        IB Users Commission Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                                    <TableHead className="font-semibold">Name/Email</TableHead>
                                    <TableHead className="font-semibold">Country</TableHead>
                                    <TableHead className="font-semibold">Level</TableHead>
                                    <TableHead className="font-semibold">Total Volume</TableHead>
                                    <TableHead className="font-semibold">Total Earned</TableHead>
                                    <TableHead className="font-semibold">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.length > 0 ? (
                                    <>
                                        {partners.map((partner) => (
                                            <React.Fragment key={partner._id}>
                                                <TableRow className="hover:bg-muted/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                                                {partner.userId.firstname[0]}{partner.userId.lastname[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{`${partner.userId.firstname} ${partner.userId.lastname}`}</div>
                                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {partner.userId.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                                            {partner.country}
                                                        </div>
                                                    </TableCell>
                                                    {/* <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-mono">{partner.acNo}</span>
                                                        </div>
                                                    </TableCell> */}
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700">
                                                            Level {partner.level}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        ${partner.totalVolume.toFixed(4)}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-medium text-green-600">
                                                        ${partner.totalEarned.toFixed(4)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePartnerExpand(partner._id)}
                                                            className="gap-1"
                                                        >
                                                            {expandedPartner === partner._id ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expandable Trade Details */}
                                                <AnimatePresence>
                                                    {expandedPartner === partner._id && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-t">
                                                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                            <Eye className="h-4 w-4" />
                                                                            Trade Details for {partner.userId.firstname} {partner.userId.lastname}
                                                                        </h4>

                                                                        {loadingPartnerTrades[partner._id] ? (
                                                                            <div className="space-y-2">
                                                                                <Skeleton className="h-8 w-full" />
                                                                                <Skeleton className="h-8 w-full" />
                                                                                <Skeleton className="h-8 w-full" />
                                                                            </div>
                                                                        ) : partnerTrades[partner._id] && partnerTrades[partner._id].length > 0 ? (
                                                                            <div className="rounded-lg border bg-white dark:bg-gray-900 overflow-hidden">
                                                                                <Table>
                                                                                    <TableHeader>
                                                                                        <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                                                                                            <TableHead className="text-xs">MT5 Account</TableHead>
                                                                                            <TableHead className="text-xs">Symbol</TableHead>
                                                                                            <TableHead className="text-xs">Volume</TableHead>
                                                                                            <TableHead className="text-xs">Open Price</TableHead>
                                                                                            <TableHead className="text-xs">Close Price</TableHead>
                                                                                            <TableHead className="text-xs">Profit</TableHead>
                                                                                            <TableHead className="text-xs">Commission</TableHead>
                                                                                            <TableHead className="text-xs">Status</TableHead>
                                                                                        </TableRow>
                                                                                    </TableHeader>
                                                                                    <TableBody>
                                                                                        {partnerTrades[partner._id].map((trade, index) => (
                                                                                            <TableRow key={index} className="hover:bg-muted/30">
                                                                                                <TableCell className="font-mono text-xs">{trade.acNo}</TableCell>
                                                                                                <TableCell className="font-mono text-xs font-medium">{trade.symbol}</TableCell>
                                                                                                <TableCell className="font-mono text-xs">{trade.volume.toFixed(4)}</TableCell>
                                                                                                <TableCell className="font-mono text-xs">{trade.openPrice}</TableCell>
                                                                                                <TableCell className="font-mono text-xs">{trade.closePrice}</TableCell>
                                                                                                <TableCell className={`font-mono text-xs ${trade.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                                                    {trade.profit < 0 ? '-' : ''}${formatCurrency(Math.abs(trade.profit))}
                                                                                                </TableCell>
                                                                                                <TableCell className="font-mono text-xs font-medium text-blue-600">
                                                                                                    ${formatCurrency(trade.rebate)}
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                                                                                        <CheckCircle className="h-2 w-2 mr-1" />
                                                                                                        {trade.status}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ))}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center py-4 text-muted-foreground">
                                                                                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                                <p>No trade details found for this partner</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <div className="text-lg font-medium">No IB partners found</div>
                                                <div className="text-sm">IB partners will appear here once you have referrals.</div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Partner Trade Sections */}
            {partners.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Partner Trade Details
                    </h3>

                    {partners.map((partner) => (
                        <Card key={partner._id} className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                            {partner.userId.firstname[0]}{partner.userId.lastname[0]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {partner.userId.firstname} {partner.userId.lastname}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Mail className="h-3 w-3" />
                                                {partner.userId.email}
                                                <span className="mx-2">•</span>
                                                <Globe className="h-3 w-3" />
                                                {partner.country}
                                                <span className="mx-2">•</span>
                                                <Badge variant="outline">Level {partner.level}</Badge>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                            ${formatCurrency(partner.totalEarned)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Total Commission
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="mb-4 grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600">Volume</div>
                                        <div className="text-lg font-bold">{partner.totalVolume.toFixed(4)}</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-sm font-medium text-green-600">Commission</div>
                                        <div className="text-lg font-bold">${formatCurrency(partner.totalEarned)}</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="text-sm font-medium text-purple-600">Trades</div>
                                        <div className="text-lg font-bold">{partner.totalTrades || 0}</div>
                                    </div>
                                </div>

                                {/* Individual Partner Trade Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    {loadingPartnerTrades[partner._id] ? (
                                        <div className="p-6 space-y-2">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                    ) : partnerTrades[partner._id] && partnerTrades[partner._id].length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800">
                                                    <TableHead className="text-xs font-semibold">MT5 Account</TableHead>
                                                    <TableHead className="text-xs font-semibold">Symbol</TableHead>
                                                    <TableHead className="text-xs font-semibold">Volume</TableHead>
                                                    <TableHead className="text-xs font-semibold">Open Price</TableHead>
                                                    <TableHead className="text-xs font-semibold">Close Price</TableHead>
                                                    <TableHead className="text-xs font-semibold">Profit</TableHead>
                                                    <TableHead className="text-xs font-semibold">Commission</TableHead>
                                                    <TableHead className="text-xs font-semibold">Open Time</TableHead>
                                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {partnerTrades[partner._id].map((trade, index) => (
                                                    <TableRow key={index} className="hover:bg-muted/30">
                                                        <TableCell className="font-mono text-xs font-medium">{trade.acNo}</TableCell>
                                                        <TableCell className="font-mono text-xs font-bold text-blue-600">{trade.symbol}</TableCell>
                                                        <TableCell className="font-mono text-xs">{trade.volume.toFixed(4)}</TableCell>
                                                        <TableCell className="font-mono text-xs">{trade.openPrice}</TableCell>
                                                        <TableCell className="font-mono text-xs">{trade.closePrice}</TableCell>
                                                        <TableCell className={`font-mono text-xs font-medium ${trade.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {trade.profit < 0 ? '-' : ''}${formatCurrency(Math.abs(trade.profit))}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs font-bold text-green-600">
                                                            ${formatCurrency(trade.rebate)}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {formatDateTime(trade.openTime)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                                                <CheckCircle className="h-2 w-2 mr-1" />
                                                                {trade.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                {/* Individual Partner Totals Row */}
                                                <TableRow className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 font-bold border-t-2">
                                                    <TableCell colSpan={2} className="text-right font-bold text-sm">
                                                        Partner Total:
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-blue-600 text-sm">
                                                        {partnerTrades[partner._id].reduce((sum, trade) => sum + trade.volume, 0).toFixed(4)}
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell className="font-mono font-bold text-purple-600 text-sm">
                                                        ${formatCurrency(Math.abs(partnerTrades[partner._id].reduce((sum, trade) => sum + trade.profit, 0)))}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-green-600 text-sm">
                                                        ${formatCurrency(partnerTrades[partner._id].reduce((sum, trade) => sum + trade.rebate, 0))}
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground bg-gray-50 dark:bg-gray-900">
                                            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>No trade details found for this partner</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => fetchPartnerTrades(partner._id)}
                                            >
                                                <RefreshCw className="h-3 w-3 mr-1" />
                                                Load Trades
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TradeCommission;