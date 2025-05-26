// Frontend/src/pages/client/Partner/TradeCommission.tsx
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
import { FileSpreadsheet, FileText, Download, TrendingUp, DollarSign, BarChart3, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
}

interface CommissionTotals {
    totalProfit: number;
    totalVolume: number;
    totalRebate: number;
}

const TradeCommission = () => {
    const [trades, setTrades] = useState<TradeCommission[]>([]);
    const [totals, setTotals] = useState<CommissionTotals>({
        totalProfit: 0,
        totalVolume: 0,
        totalRebate: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [exporting, setExporting] = useState<{ excel: boolean; pdf: boolean }>({
        excel: false,
        pdf: false
    });

    useEffect(() => {
        fetchTradeCommissions();
    }, []);

    const fetchTradeCommissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('clientToken');

            if (!token) {
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/ib-configurations/trade-commissions`, {
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
            toast.error("Failed to load trade commission data");
        } finally {
            setLoading(false);
        }
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
                'Rebate': trade.rebate,
                'Status': trade.status
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
                'Rebate': totals.totalRebate,
                'Status': 'TOTAL'
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
                { wch: 12 }, // Rebate
                { wch: 10 }  // Status
            ];
            worksheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Commission Trades');

            // Generate filename with current date
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

            // Add date
            pdf.setFontSize(12);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

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
                trade.status
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
                ''
            ]);

            // Create table
            (pdf as any).autoTable({
                startY: 45,
                head: [['AC NO', 'Open Time', 'Close Time', 'Open Price', 'Close Price', 'Symbol', 'Profit', 'Volume', 'Rebate', 'Status']],
                body: tableData,
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [59, 130, 246], // Blue color
                    textColor: [255, 255, 255]
                },
                footStyles: {
                    fillColor: [243, 244, 246], // Gray color
                    textColor: [0, 0, 0],
                    fontStyle: 'bold'
                }
            });

            // Generate filename with current date
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
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
            <div className="text-center">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <TrendingUp className="h-8 w-8" />
                    Commission Trades
                </h2>
                <p className="text-muted-foreground">
                    Track your commission earnings from referred client trades
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Profit
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${formatCurrency(Math.abs(totals.totalProfit))}
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
                            Total Rebate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            ${formatCurrency(totals.totalRebate)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Commission earned
                        </p>
                    </CardContent>
                </Card>
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

            {/* Trades Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Trade Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                    <TableHead className="font-semibold">AC NO</TableHead>
                                    <TableHead className="font-semibold">Open Time</TableHead>
                                    <TableHead className="font-semibold">Close Time</TableHead>
                                    <TableHead className="font-semibold">Open Price</TableHead>
                                    <TableHead className="font-semibold">Close Price</TableHead>
                                    <TableHead className="font-semibold">Symbol</TableHead>
                                    <TableHead className="font-semibold">Profit</TableHead>
                                    <TableHead className="font-semibold">Volume</TableHead>
                                    <TableHead className="font-semibold">Rebate</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trades.length > 0 ? (
                                    <>
                                        {trades.map((trade, index) => (
                                            <TableRow key={index} className="hover:bg-muted/50">
                                                <TableCell className="font-mono">{trade.acNo}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {formatDateTime(trade.openTime)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {formatDateTime(trade.closeTime)}
                                                </TableCell>
                                                <TableCell className="font-mono">{trade.openPrice}</TableCell>
                                                <TableCell className="font-mono">{trade.closePrice}</TableCell>
                                                <TableCell className="font-mono font-medium">{trade.symbol}</TableCell>
                                                <TableCell className={`font-mono font-medium ${trade.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {trade.profit < 0 ? '-' : ''}{formatCurrency(Math.abs(trade.profit))}
                                                </TableCell>
                                                <TableCell className="font-mono">{trade.volume.toFixed(4)}</TableCell>
                                                <TableCell className="font-mono font-medium text-blue-600">
                                                    {formatCurrency(trade.rebate)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-green-600 border-green-300">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        {trade.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Totals Row */}
                                        <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 font-bold border-t-2">
                                            <TableCell colSpan={6} className="text-right font-bold">
                                                Total:
                                            </TableCell>
                                            <TableCell className={`font-mono font-bold ${totals.totalProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {totals.totalProfit < 0 ? '-' : ''}{formatCurrency(Math.abs(totals.totalProfit))}
                                            </TableCell>
                                            <TableCell className="font-mono font-bold">
                                                {totals.totalVolume.toFixed(4)}
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-blue-600">
                                                {formatCurrency(totals.totalRebate)}
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <div className="text-lg font-medium">No commission trades found</div>
                                                <div className="text-sm">Commission trades will appear here once your referrals start trading.</div>
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

export default TradeCommission;