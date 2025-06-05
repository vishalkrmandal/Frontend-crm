// Frontend/src/pages/client/Partner/IBWithdrawal.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    CreditCard,
    Wallet,
    History,
    AlertCircle,
    CheckCircle,
    Clock,
    X,
    Banknote,
    Building2
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ProfileDetails {
    user: {
        firstname: string;
        lastname: string;
        email: string;
    };
    bankDetails: {
        bankName?: string;
        accountHolderName?: string;
        accountNumber?: string;
        ifscSwiftCode?: string;
    };
    walletDetails: {
        tetherWalletAddress?: string;
        ethWalletAddress?: string;
        trxWalletAddress?: string;
    };
    availableBalance: number;
}

interface WithdrawalRequest {
    _id: string;
    amount: number;
    withdrawalMethod: string;
    status: string;
    bankDetails?: any;
    walletDetails?: any;
    rejectedReason?: string;
    createdAt: string;
    processedAt?: string;
}

const IBWithdrawal = () => {
    const [profile, setProfile] = useState<ProfileDetails | null>(null);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState('');
    const [selectedBankDetails, setSelectedBankDetails] = useState({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscSwiftCode: ''
    });
    const [selectedWalletDetails, setSelectedWalletDetails] = useState({
        walletType: '',
        walletAddress: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Auto-fill form when profile is loaded and method is selected
        if (profile && withdrawalMethod === 'bank') {
            setSelectedBankDetails({
                bankName: profile.bankDetails.bankName || '',
                accountHolderName: profile.bankDetails.accountHolderName || '',
                accountNumber: profile.bankDetails.accountNumber || '',
                ifscSwiftCode: profile.bankDetails.ifscSwiftCode || ''
            });
        }
    }, [profile, withdrawalMethod]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('clientToken');

            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            // Fetch profile details
            const profileResponse = await axios.get(`${API_BASE_URL}/api/ibclients/withdrawals/profile-details`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (profileResponse.data.success) {
                setProfile(profileResponse.data.profile);
            }

            // Fetch withdrawal history
            const historyResponse = await axios.get(`${API_BASE_URL}/api/ibclients/withdrawals/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (historyResponse.data.success) {
                setWithdrawals(historyResponse.data.withdrawals);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleWalletTypeChange = (walletType: string) => {
        setSelectedWalletDetails({
            walletType,
            walletAddress: getWalletAddress(walletType)
        });
    };

    const getWalletAddress = (walletType: string) => {
        if (!profile) return '';

        switch (walletType) {
            case 'tether':
                return profile.walletDetails.tetherWalletAddress || '';
            case 'eth':
                return profile.walletDetails.ethWalletAddress || '';
            case 'trx':
                return profile.walletDetails.trxWalletAddress || '';
            default:
                return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!withdrawalMethod) {
            toast.error('Please select a withdrawal method');
            return;
        }

        if (parseFloat(amount) > (profile?.availableBalance || 0)) {
            toast.error('Insufficient balance');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('clientToken');

            const requestData = {
                amount: parseFloat(amount),
                withdrawalMethod,
                ...(withdrawalMethod === 'bank' ? { bankDetails: selectedBankDetails } : { walletDetails: selectedWalletDetails })
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/ibclients/withdrawals/request`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Withdrawal request submitted successfully');
                setAmount('');
                setWithdrawalMethod('');
                fetchData(); // Refresh data
            }

        } catch (error: any) {
            console.error('Error submitting withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelWithdrawal = async (withdrawalId: string) => {
        try {
            const token = localStorage.getItem('clientToken');

            const response = await axios.delete(
                `${API_BASE_URL}/api/ibclients/withdrawals/${withdrawalId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Withdrawal request cancelled');
                fetchData();
            }

        } catch (error: any) {
            console.error('Error cancelling withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel withdrawal');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <X className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
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

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-96 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <DollarSign className="h-8 w-8" />
                    IB Withdrawal
                </h2>
                <p className="text-muted-foreground">
                    Withdraw your commission earnings
                </p>
            </div>

            {/* Balance Card */}
            <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Banknote className="h-5 w-5" />
                        Available Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                        ${profile?.availableBalance.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Ready for withdrawal
                    </p>
                </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Withdrawal</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Withdrawal Amount ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max={profile?.availableBalance || 0}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                required
                            />
                        </div>

                        {/* Withdrawal Method */}
                        <div className="space-y-3">
                            <Label>Withdrawal Method</Label>
                            <RadioGroup value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bank" id="bank" />
                                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
                                        <Building2 className="h-4 w-4" />
                                        Bank Transfer
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="wallet" id="wallet" />
                                    <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                                        <Wallet className="h-4 w-4" />
                                        Cryptocurrency Wallet
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Bank Details */}
                        {withdrawalMethod === 'bank' && (
                            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h4 className="font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Bank Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            value={selectedBankDetails.bankName}
                                            onChange={(e) => setSelectedBankDetails({ ...selectedBankDetails, bankName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                        <Input
                                            id="accountHolderName"
                                            value={selectedBankDetails.accountHolderName}
                                            onChange={(e) => setSelectedBankDetails({ ...selectedBankDetails, accountHolderName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="accountNumber">Account Number</Label>
                                        <Input
                                            id="accountNumber"
                                            value={selectedBankDetails.accountNumber}
                                            onChange={(e) => setSelectedBankDetails({ ...selectedBankDetails, accountNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="ifscSwiftCode">IFSC/SWIFT Code</Label>
                                        <Input
                                            id="ifscSwiftCode"
                                            value={selectedBankDetails.ifscSwiftCode}
                                            onChange={(e) => setSelectedBankDetails({ ...selectedBankDetails, ifscSwiftCode: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wallet Details */}
                        {withdrawalMethod === 'wallet' && (
                            <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Wallet Details
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="walletType">Wallet Type</Label>
                                        <Select
                                            value={selectedWalletDetails.walletType}
                                            onValueChange={handleWalletTypeChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select wallet type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tether">Tether (USDT)</SelectItem>
                                                <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                                                <SelectItem value="trx">Tron (TRX)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="walletAddress">Wallet Address</Label>
                                        <Input
                                            id="walletAddress"
                                            value={selectedWalletDetails.walletAddress}
                                            onChange={(e) => setSelectedWalletDetails({ ...selectedWalletDetails, walletAddress: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={submitting || !withdrawalMethod || !amount}
                            className="w-full"
                        >
                            {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Withdrawal History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawals.length > 0 ? (
                                    withdrawals.map((withdrawal) => (
                                        <TableRow key={withdrawal._id}>
                                            <TableCell className="text-sm">
                                                {formatDate(withdrawal.createdAt)}
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
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
                                                {withdrawal.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => cancelWithdrawal(withdrawal._id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                {withdrawal.rejectedReason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Reason: {withdrawal.rejectedReason}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <div className="text-lg font-medium">No withdrawal history</div>
                                                <div className="text-sm">Your withdrawal requests will appear here</div>
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

export default IBWithdrawal;