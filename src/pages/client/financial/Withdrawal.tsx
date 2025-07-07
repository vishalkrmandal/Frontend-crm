import { useState, useEffect } from "react";
import { Wallet, AlertCircle, ChevronLeft, ArrowRight, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Base API URL for dynamic environment support
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Account {
  _id: string;
  mt5Account: string;
  accountType: string;
  balance: number;
  name: string;
}

interface BankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

interface EWalletDetails {
  walletId: string;
  type: string;
}

interface WithdrawalHistory {
  _id: string;
  createdAt: string;
  paymentMethod: string;
  amount: number;
  accountNumber: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface PaymentMethod {
  paymentMethod: string;
  paymentDetails: BankDetails | EWalletDetails;
}

export default function Withdrawal() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState(1); // Step 1: Account selection, Step 2: Payment method, Step 3: Amount and confirmation
  const [eWalletType, setEWalletType] = useState<string>("");
  const [isLoading, setIsLoading] = useState({
    accounts: false,
    withdrawals: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOpenTrades, setHasOpenTrades] = useState(false);
  const [profilePaymentMethods, setProfilePaymentMethods] = useState<any>(null);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Bank details state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: ""
  });

  // E-Wallet details state
  const [eWalletDetails, setEWalletDetails] = useState<EWalletDetails>({
    walletId: "",
    type: ""
  });

  // Get token from localStorage
  const getToken = () => localStorage.getItem("clientToken");

  // API headers with auth token
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  // Fetch user accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(prev => ({ ...prev, accounts: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/api/accounts`, getAuthHeaders());
        setAccounts(response.data.data || []);
        console.log("Accounts fetched:", response.data.data);
        if (response.data.data.length > 0) {
          setSelectedAccount(response.data.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        // toast.error("Failed to fetch accounts");
      } finally {
        setIsLoading(prev => ({ ...prev, accounts: false }));
      }
    };

    fetchAccounts();
  }, []);

  // Fetch withdrawal history
  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      setIsLoading(prev => ({ ...prev, withdrawals: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/api/withdrawals/user`, getAuthHeaders());
        setWithdrawalHistory(response.data.data || []);
      } catch (error) {
        console.error("Error fetching withdrawal history:", error);
        // toast.error("Failed to fetch withdrawal history");
      } finally {
        setIsLoading(prev => ({ ...prev, withdrawals: false }));
      }
    };

    fetchWithdrawalHistory();
  }, []);

  // Fetch last used payment method
  useEffect(() => {
    const fetchLastPaymentMethod = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/withdrawals/last-method`, getAuthHeaders());
        if (response.data.data) {
          if (response.data.data.source === 'profile') {
            setProfilePaymentMethods(response.data.data.paymentMethods);
            // Find ewallet methods
            const ewalletMethod = response.data.data.paymentMethods.find((method: any) => method.type === 'ewallet');
            if (ewalletMethod) {
              setAvailableWallets(ewalletMethod.wallets);
            }
          } else {
            setLastPaymentMethod(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching last payment method:", error);
      }
    };

    fetchLastPaymentMethod();
  }, []);

  const selectPaymentMethod = (methodType: string) => {
    setMethod(methodType);

    if (profilePaymentMethods) {
      // Handle profile-based payment methods
      if (methodType === "bank") {
        const bankMethod = profilePaymentMethods.find((method: any) => method.type === 'bank');
        if (bankMethod) {
          setBankDetails(bankMethod.details);
        }
      } else if (methodType === "ewallet") {
        // Don't pre-fill anything for ewallet, let user select wallet type first
      }
    } else if (lastPaymentMethod && lastPaymentMethod.paymentMethod === methodType) {
      // Handle withdrawal history based payment methods (existing logic)
      if (methodType === "bank" && "bankName" in lastPaymentMethod.paymentDetails) {
        setBankDetails(lastPaymentMethod.paymentDetails as BankDetails);
      } else if ((methodType === "ewallet") &&
        "walletId" in lastPaymentMethod.paymentDetails) {
        setEWalletDetails({
          ...lastPaymentMethod.paymentDetails as EWalletDetails,
          type: lastPaymentMethod.paymentDetails.type
        });
        setEWalletType(lastPaymentMethod.paymentDetails.type);
      }
    }
  };

  const selectEWalletType = (type: string) => {
    setEWalletType(type);

    if (profilePaymentMethods && availableWallets.length > 0) {
      // Find the selected wallet and pre-fill the address
      const selectedWallet = availableWallets.find(wallet => wallet.type === type);
      if (selectedWallet) {
        setEWalletDetails({
          walletId: selectedWallet.address,
          type: type
        });
        setSelectedWallet(selectedWallet);
      }
    } else {
      setEWalletDetails({
        ...eWalletDetails,
        type: type
      });
    }
  };

  const handleBankDetailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBankDetails({
      ...bankDetails,
      [event.target.name]: event.target.value
    });
  };

  const handleEWalletDetailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEWalletDetails({
      ...eWalletDetails,
      [event.target.name]: event.target.value,
      type: eWalletType
    });
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1); // Go back to account selection
    } else if (step === 3) {
      setMethod("");
      setEWalletType("");
      setStep(2); // Go back to payment method selection
    }
  };

  const handleNextToPaymentMethod = () => {
    if (!selectedAccount) {
      toast.error("Please select an account");
      return;
    }
    setStep(2);
  };

  const handleNextToConfirmation = () => {
    // Validate fields before proceeding
    if (method === "bank") {
      if (!bankDetails.bankName || !bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        toast.error("Please fill all bank details");
        return;
      }
    } else if (method === "ewallet") {
      if (!eWalletType) {
        toast.error("Please select an e-wallet type");
        return;
      }
      if (!eWalletDetails.walletId) {
        toast.error("Please enter wallet ID");
        return;
      }
    }

    setStep(3);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!amount || Number(amount) < 1) {
      toast.error("Minimum withdrawal amount is $1");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedAccObj = accounts.find(acc => acc._id === selectedAccount);
      if (!selectedAccObj) {
        toast.error("Please select an account");
        setIsSubmitting(false);
        return;
      }

      if (Number(amount) > selectedAccObj.balance) {
        toast.error("Withdrawal amount exceeds available balance");
        setIsSubmitting(false);
        return;
      }

      const withdrawalData = {
        accountId: selectedAccount,
        accountNumber: selectedAccObj.mt5Account,
        accountType: selectedAccObj.accountType,
        amount: amount,
        paymentMethod: method === "ewallet" ? eWalletType : method,
        bankDetails: method === "bank" ? bankDetails : undefined,
        eWalletDetails: method === "ewallet" ? eWalletDetails : undefined
      };

      console.log("Submitting withdrawal request:", withdrawalData);

      await axios.post(`${API_BASE_URL}/api/withdrawals`, withdrawalData, getAuthHeaders());

      // Refresh withdrawal history
      const response = await axios.get(`${API_BASE_URL}/api/withdrawals/user`, getAuthHeaders());
      setWithdrawalHistory(response.data.data);

      // Reset form
      setAmount("");
      setMethod("");
      setEWalletType("");
      setHasOpenTrades(false);
      setStep(1);
      toast.success("Withdrawal request submitted successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit withdrawal request";
      toast.error(errorMessage);

      // If there are open trades, also update the warning message
      if (error.response?.data?.hasOpenTrades) {
        setHasOpenTrades(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Find selected account details
  const selectedAccountDetails = accounts.find(acc => acc._id === selectedAccount);

  // Sort accounts by balance (highest first)
  const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);
  const topAccounts = sortedAccounts.slice(0, 5);
  const remainingAccounts = sortedAccounts.slice(5);

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
        <p className="text-muted-foreground">
          Withdraw funds from your trading account to your preferred payment method.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="account-selection"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <h2 className="text-lg font-medium mb-4">Select Account</h2>

              <div className="mt-2 space-y-4">
                <div>
                  <Label htmlFor="account">Select Account to Withdraw From</Label>
                  <Select
                    value={selectedAccount}
                    onValueChange={setSelectedAccount}
                    disabled={accounts.length === 0 || isLoading.accounts}
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .sort((a, b) => b.balance - a.balance) // Sort accounts by balance in descending order
                        .map(account => (
                          <SelectItem key={account._id} value={account._id}>
                            {account.mt5Account} ({account.accountType}) - ${account.balance.toFixed(2)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAccountDetails && (
                  <div className="p-4 rounded-lg border mt-4">
                    <h3 className="font-medium mb-2">Selected Account Details</h3>
                    <div className="space-y-1">
                      <p><strong>Account ID:</strong> {selectedAccountDetails.mt5Account}</p>
                      <p><strong>Account Type:</strong> {selectedAccountDetails.accountType}</p>
                      <p><strong>Available Balance:</strong> ${selectedAccountDetails.balance.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-6"
                  onClick={handleNextToPaymentMethod}
                  disabled={!selectedAccount}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="payment-methods"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-medium">Select Withdrawal Method</h2>
              </div>

              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`flex cursor-pointer flex-col items-center rounded-lg border p-3 hover:border-primary ${method === 'bank' ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => selectPaymentMethod("bank")}
                  >
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <h3 className="mt-2 font-medium">Bank Account</h3>
                  </div>

                  <div
                    className={`flex cursor-pointer flex-col items-center rounded-lg border p-3 hover:border-primary ${method === 'ewallet' ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => selectPaymentMethod("ewallet")}
                  >
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <h3 className="mt-2 font-medium">E-Wallet</h3>
                  </div>
                </div>

                <AnimatePresence>
                  {method === "bank" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          name="bankName"
                          value={bankDetails.bankName}
                          onChange={handleBankDetailChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                          id="accountHolderName"
                          name="accountHolderName"
                          value={bankDetails.accountHolderName}
                          onChange={handleBankDetailChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={handleBankDetailChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          name="ifscCode"
                          value={bankDetails.ifscCode}
                          onChange={handleBankDetailChange}
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {method === "ewallet" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        {profilePaymentMethods && availableWallets.length > 0 ? (
                          // Show wallets from profile
                          availableWallets.map((wallet) => (
                            <div
                              key={wallet.type}
                              className={`p-3 border rounded-md text-center cursor-pointer hover:border-primary ${eWalletType === wallet.type ? "border-primary bg-primary/10" : ""}`}
                              onClick={() => selectEWalletType(wallet.type)}
                            >
                              {wallet.name}
                            </div>
                          ))
                        ) : (
                          // Show default wallets (existing logic)
                          <>
                            <div
                              className={`p-3 border rounded-md text-center cursor-pointer hover:border-primary ${eWalletType === "bitcoin" ? "border-primary bg-primary/10" : ""}`}
                              onClick={() => selectEWalletType("bitcoin")}
                            >
                              Bitcoin
                            </div>
                            <div
                              className={`p-3 border rounded-md text-center cursor-pointer hover:border-primary ${eWalletType === "ethereum" ? "border-primary bg-primary/10" : ""}`}
                              onClick={() => selectEWalletType("ethereum")}
                            >
                              Ethereum
                            </div>
                            <div
                              className={`p-3 border rounded-md text-center cursor-pointer hover:border-primary ${eWalletType === "usdt" ? "border-primary bg-primary/10" : ""}`}
                              onClick={() => selectEWalletType("usdt")}
                            >
                              USDT
                            </div>
                          </>
                        )}
                      </div>

                      {eWalletType && (
                        <div>
                          <Label htmlFor="walletId">
                            {profilePaymentMethods && selectedWallet ? `${selectedWallet.name} Address` : 'Wallet ID'}
                          </Label>
                          <Input
                            id="walletId"
                            name="walletId"
                            value={eWalletDetails.walletId}
                            onChange={handleEWalletDetailChange}
                            placeholder={profilePaymentMethods && selectedWallet ? selectedWallet.address : ''}
                            readOnly={profilePaymentMethods && selectedWallet ? true : false}
                            required
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {method && (
                  <Button
                    className="w-full mt-6"
                    onClick={handleNextToConfirmation}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="withdrawal-form"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-medium">Withdrawal Form</h2>
              </div>

              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label>From Account</Label>
                  <div className="p-3 rounded-lg border mt-2">
                    {selectedAccountDetails && (
                      <div className="space-y-1">
                        <p><strong>Account ID:</strong> {selectedAccountDetails.mt5Account}</p>
                        <p><strong>Account Type:</strong> {selectedAccountDetails.accountType}</p>
                        <p><strong>Available Balance:</strong> ${selectedAccountDetails.balance.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Withdrawal Method</Label>
                  <div className="p-3 rounded-lg border mt-2">
                    {method === "bank" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            name="bankName"
                            value={bankDetails.bankName}
                            onChange={handleBankDetailChange}
                            readOnly={profilePaymentMethods ? true : false}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountHolderName">Account Holder Name</Label>
                          <Input
                            id="accountHolderName"
                            name="accountHolderName"
                            value={bankDetails.accountHolderName}
                            onChange={handleBankDetailChange}
                            readOnly={profilePaymentMethods ? true : false}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            name="accountNumber"
                            value={bankDetails.accountNumber}
                            onChange={handleBankDetailChange}
                            readOnly={profilePaymentMethods ? true : false}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ifscCode">IFSC Code</Label>
                          <Input
                            id="ifscCode"
                            name="ifscCode"
                            value={bankDetails.ifscCode}
                            onChange={handleBankDetailChange}
                            readOnly={profilePaymentMethods ? true : false}
                            required
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      min="1"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-8"
                      required
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <p className="text-xs text-muted-foreground">Minimum withdrawal: $1</p>
                    {selectedAccountDetails && (
                      <p className="text-xs text-muted-foreground">Available: ${selectedAccountDetails.balance.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                <div className={`rounded-md p-3 ${hasOpenTrades ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <div className="flex">
                    <AlertCircle className={`h-5 w-5 ${hasOpenTrades ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    <div className="ml-3">
                      <p className={`text-sm ${hasOpenTrades ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {hasOpenTrades
                          ? "Your trade is open. If you want to withdraw money, first close all your trades."
                          : "Withdrawals are processed within 1-3 business days. Bank transfers may take additional time."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !amount || Number(amount) < 1 || !selectedAccount}
                >
                  {isSubmitting ? "Processing..." : "Request Withdrawal"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Available Balance</h2>

          {isLoading.accounts ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Combined account list with scroll if needed */}
              <div className="max-h-full">
                <div className={`space-y-2 ${remainingAccounts.length > 0 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                  {[...topAccounts, ...remainingAccounts].map(account => (
                    <div key={account._id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center">
                        <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{account.mt5Account} ({account.accountType})</h3>
                          <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${account.balance.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Recent Withdrawals</h2>
        <div className="mt-4 overflow-x-auto">
          {isLoading.withdrawals ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">Method</th>
                  <th className="pb-2 text-left font-medium">Amount</th>
                  <th className="pb-2 text-left font-medium">Account</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.length > 0 ? (
                  withdrawalHistory.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{formatDate(withdrawal.createdAt)}</td>
                      <td className="py-3 text-sm">{withdrawal.paymentMethod === "bank" ? "Bank Transfer" :
                        withdrawal.paymentMethod === "card" ? "Credit Card" :
                          `E-Wallet (${withdrawal.paymentMethod})`}</td>
                      <td className="py-3 text-sm">${withdrawal.amount.toFixed(2)}</td>
                      <td className="py-3 text-sm">{withdrawal.accountNumber}</td>
                      <td className="py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(withdrawal.status)}`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-sm text-muted-foreground">
                      No withdrawal history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}