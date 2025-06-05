// Frontend/src/pages/admin/IBWithdrawalManagement.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
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
    DollarSign,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Search,
    RefreshCw,
    Building2,
    Wallet,
    User,
    Mail,
    Globe,
    CreditCard,
    AlertTriangle
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface WithdrawalRequest {
    _id: string;
    userId: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
        country?: { name: string };
        phone?: string;
    };
    ibConfigurationId: {
        _id: string;
        IBbalance: number;
        referralCode: string;
        level: number;
    };
    amount: number;
    withdrawalMethod: string;
    bankDetails?: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
        ifscSwiftCode: string;
    };
    walletDetails?: {
        walletType: string;
        walletAddress: string;
    };
    status: string;
    createdAt: string;
    processedAt?: string;
    rejectedReason?: string;
    adminNotes?: string;
    transactionId?: string;
    approvedBy?: {
        firstname: string;
        lastname: string;
    };
}

interface WithdrawalStats {
    totalRequests: number;
    totalAmount: number;
    byStatus: {
        [key: string]: {
            count: number;
            amount: number;
        };
    };
}

const IBWithdrawalManagement = () => {
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [stats, setStats] = useState<WithdrawalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog states
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    // Form states
    const [adminNotes, setAdminNotes] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [rejectedReason, setRejectedReason] = useState('');

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            // Fetch withdrawals
            const withdrawalsResponse = await axios.get(
                `${API_BASE_URL}/api/admin/ib-withdrawals?status=${statusFilter}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (withdrawalsResponse.data.success) {
                setWithdrawals(withdrawalsResponse.data.withdrawals);
            }

            // Fetch stats
            const statsResponse = await axios.get(
                `${API_BASE_URL}/api/admin/ib-withdrawals/stats`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load withdrawal data');
        } finally {
            setLoading(false);
        }
    };

    const openDetailsDialog = async (withdrawal: WithdrawalRequest) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/ib-withdrawals/${withdrawal._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSelectedWithdrawal(response.data.withdrawal);
                setDetailsDialogOpen(true);
            }
        } catch (error) {
            console.error('Error fetching withdrawal details:', error);
            toast.error('Failed to load withdrawal details');
        }
    };

    const handleApprove = async () => {
        if (!selectedWithdrawal) return;

        try {
            setProcessing(selectedWithdrawal._id);
            const token = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${API_BASE_URL}/api/admin/ib-withdrawals/${selectedWithdrawal._id}/approve`,
                { adminNotes, transactionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Withdrawal approved successfully');
                setApproveDialogOpen(false);
                setDetailsDialogOpen(false);
                setAdminNotes('');
                setTransactionId('');
                fetchData();
            }

        } catch (error: any) {
            console.error('Error approving withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to approve withdrawal');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!selectedWithdrawal || !rejectedReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            setProcessing(selectedWithdrawal._id);
            const token = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${API_BASE_URL}/api/admin/ib-withdrawals/${selectedWithdrawal._id}/reject`,
                { rejectedReason, adminNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Withdrawal rejected successfully');
                setRejectDialogOpen(false);
                setDetailsDialogOpen(false);
                setRejectedReason('');
                setAdminNotes('');
                fetchData();
            }

        } catch (error: any) {
            console.error('Error rejecting withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to reject withdrawal');
        } finally {
            setProcessing(null);
        }
    };

    const filteredWithdrawals = withdrawals.filter(withdrawal =>
        withdrawal.userId.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.userId.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.ibConfigurationId.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <DollarSign className="h-8 w-8" />
                        IB Withdrawal Management
                    </h2>
                    <p className="text-muted-foreground">
                        Review and process IB commission withdrawal requests
                    </p>
                </div>

                <Button onClick={fetchData} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRequests}</div>
                            <p className="text-xs text-muted-foreground">
                                ${stats.totalAmount.toFixed(2)} total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.byStatus.pending?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${(stats.byStatus.pending?.amount || 0).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.byStatus.approved?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${(stats.byStatus.approved?.amount || 0).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.byStatus.rejected?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${(stats.byStatus.rejected?.amount || 0).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or referral code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Withdrawals Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Details</TableHead>
                                    <TableHead>IB Balance</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWithdrawals.length > 0 ? (
                                    filteredWithdrawals.map((withdrawal) => (
                                        <TableRow key={withdrawal._id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        {withdrawal.userId.firstname} {withdrawal.userId.lastname}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {withdrawal.userId.email}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Code: {withdrawal.ibConfigurationId.referralCode}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono font-bold text-green-600">
                                                    ${withdrawal.ibConfigurationId.IBbalance.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Available
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono font-bold">
                                                    ${withdrawal.amount.toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {withdrawal.withdrawalMethod === 'bank' ? (
                                                        <Building2 className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <Wallet className="h-3 w-3 mr-1" />
                                                    )}
                                                    {withdrawal.withdrawalMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(withdrawal.createdAt)}
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
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDetailsDialog(withdrawal)}
                                                        className="gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>

                                                    {withdrawal.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedWithdrawal(withdrawal);
                                                                    setApproveDialogOpen(true);
                                                                }}
                                                                className="gap-1 text-green-600 hover:text-green-700"
                                                                disabled={processing === withdrawal._id}
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                Approve
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedWithdrawal(withdrawal);
                                                                    setRejectDialogOpen(true);
                                                                }}
                                                                className="gap-1 text-red-600 hover:text-red-700"
                                                                disabled={processing === withdrawal._id}
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <div className="text-lg font-medium">No withdrawal requests found</div>
                                                <div className="text-sm">Withdrawal requests will appear here</div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Withdrawal Request Details</DialogTitle>
                    </DialogHeader>

                    {selectedWithdrawal && (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">User Information</Label>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {selectedWithdrawal.userId.firstname} {selectedWithdrawal.userId.lastname}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            {selectedWithdrawal.userId.email}
                                        </div>
                                        {selectedWithdrawal.userId.country && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Globe className="h-3 w-3" />
                                                {selectedWithdrawal.userId.country.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">IB Information</Label>
                                    <div className="mt-2 space-y-1">
                                        <div className="text-sm">
                                            Code: {selectedWithdrawal.ibConfigurationId.referralCode}
                                        </div>
                                        <div className="text-sm">
                                            Level: {selectedWithdrawal.ibConfigurationId.level}
                                        </div>
                                        <div className="text-sm font-bold text-green-600">
                                            Balance: ${selectedWithdrawal.ibConfigurationId.IBbalance.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Withdrawal Details */}
                            <div>
                                <Label className="text-sm font-medium">Withdrawal Details</Label>
                                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Amount</div>
                                            <div className="font-bold text-lg">${selectedWithdrawal.amount.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Method</div>
                                            <div className="capitalize font-medium">{selectedWithdrawal.withdrawalMethod}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Request Date</div>
                                            <div className="text-sm">{formatDate(selectedWithdrawal.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Status</div>
                                            <Badge className={getStatusColor(selectedWithdrawal.status)}>
                                                {selectedWithdrawal.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank/Wallet Details */}
                            {selectedWithdrawal.withdrawalMethod === 'bank' && selectedWithdrawal.bankDetails && (
                                <div>
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Bank Details
                                    </Label>
                                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-muted-foreground">Bank Name</div>
                                                <div className="font-medium">{selectedWithdrawal.bankDetails.bankName}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Account Holder</div>
                                                <div className="font-medium">{selectedWithdrawal.bankDetails.accountHolderName}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Account Number</div>
                                                <div className="font-mono">{selectedWithdrawal.bankDetails.accountNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">IFSC/SWIFT</div>
                                                <div className="font-mono">{selectedWithdrawal.bankDetails.ifscSwiftCode}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedWithdrawal.withdrawalMethod === 'wallet' && selectedWithdrawal.walletDetails && (
                                <div>
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Wallet className="h-4 w-4" />
                                        Wallet Details
                                    </Label>
                                    <div className="mt-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-muted-foreground">Wallet Type</div>
                                                <div className="font-medium capitalize">{selectedWithdrawal.walletDetails.walletType}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Wallet Address</div>
                                                <div className="font-mono text-xs break-all">{selectedWithdrawal.walletDetails.walletAddress}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {selectedWithdrawal.adminNotes && (
                                <div>
                                    <Label className="text-sm font-medium">Admin Notes</Label>
                                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                                        {selectedWithdrawal.adminNotes}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedWithdrawal.rejectedReason && (
                                <div>
                                    <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700">
                                        {selectedWithdrawal.rejectedReason}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Withdrawal</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm">
                                <strong>Amount:</strong> ${selectedWithdrawal?.amount.toFixed(2)}
                            </div>
                            <div className="text-sm">
                                <strong>Available Balance:</strong> ${selectedWithdrawal?.ibConfigurationId.IBbalance.toFixed(2)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                            <Input
                                id="transactionId"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter transaction ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                            <Textarea
                                id="adminNotes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={processing === selectedWithdrawal?._id}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing === selectedWithdrawal?._id ? 'Processing...' : 'Approve Withdrawal'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Withdrawal</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-sm">
                                <strong>Amount:</strong> ${selectedWithdrawal?.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-red-600">
                                <strong>Warning:</strong> This will reject the withdrawal request
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rejectedReason">Rejection Reason *</Label>
                            <Textarea
                                id="rejectedReason"
                                value={rejectedReason}
                                onChange={(e) => setRejectedReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminNotesReject">Admin Notes (Optional)</Label>
                            <Textarea
                                id="adminNotesReject"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any additional notes..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={processing === selectedWithdrawal?._id || !rejectedReason.trim()}
                            variant="destructive"
                        >
                            {processing === selectedWithdrawal?._id ? 'Processing...' : 'Reject Withdrawal'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IBWithdrawalManagement;