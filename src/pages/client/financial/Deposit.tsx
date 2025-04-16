// Frontend\src\pages\client\financial\Deposit.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, Wallet, ArrowRight, ChevronLeft, Upload, X, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import UI components (assuming you're using shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Base API URL for dynamic environment support
const API_BASE_URL = "http://localhost:5000/api";

interface PaymentMethod {
  _id: string;
  type: string;
  active: boolean;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc_swift?: string;
  walletName?: string;
  walletAddress?: string;
  qrCode?: string;
  paymentLink?: string;
}

interface Account {
  _id: string;
  mt5Account: string;
  accountType: string;
}

interface Deposit {
  _id: string;
  createdAt: string;
  amount: number;
  status: string;
  paymentMethod?: PaymentMethod;
  paymentType?: string;
  account?: Account;
}

interface PaymentMethods {
  [key: string]: PaymentMethod[];
}

export default function Deposit() {
  // State variables
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({});
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedMethodDetails, setSelectedMethodDetails] = useState<PaymentMethod | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({
    accounts: false,
    methods: false,
    deposits: false
  });

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // API headers with auth token
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAccounts();
    fetchPaymentMethods();
    fetchDeposits();
  }, []);

  // Fetch user accounts
  const fetchAccounts = async () => {
    setIsLoading(prev => ({ ...prev, accounts: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts`, getAuthHeaders());
      const accountsData = response.data.data || [];
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0]._id);
      }
    } catch (error) {
      toast.error("Failed to fetch accounts");
      console.error("Error fetching accounts:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, accounts: false }));
    }
  };

  // Fetch active payment methods
  const fetchPaymentMethods = async () => {
    setIsLoading(prev => ({ ...prev, methods: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/clientdeposits/payment-methods`, getAuthHeaders());
      setPaymentMethods(response.data.data || {});
    } catch (error) {
      toast.error("Failed to fetch payment methods");
      console.error("Error fetching payment methods:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, methods: false }));
    }
  };

  // Fetch deposit history
  const fetchDeposits = async () => {
    setIsLoading(prev => ({ ...prev, deposits: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/clientdeposits`, getAuthHeaders());
      setDeposits(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch deposit history");
      console.error("Error fetching deposits:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, deposits: false }));
    }
  };

  // Handle payment method selection
  const selectPaymentType = (type: string) => {
    setSelectedPaymentType(type);
    setSelectedMethod(null);
    setSelectedMethodDetails(null);
    setStep(2);
  };

  // Handle specific method selection
  const selectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method._id);
    setSelectedMethodDetails(method);
    setStep(3);
  };

  // Go back to previous step
  const goBack = () => {
    if (step === 2) {
      setSelectedPaymentType(null);
      setStep(1);
    } else if (step === 3) {
      setSelectedMethodDetails(null);
      setStep(2);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setSelectedPaymentType(null);
    setSelectedMethod(null);
    setSelectedMethodDetails(null);
    setAmount("");
    setNotes("");
    setProofFile(null);
    setProofPreview(null);
    setStep(1);

    // Reset file input
    const fileInput = document.getElementById('proof-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle file change for proof of payment
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type and size
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a PDF, JPG, JPEG, or PNG file.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }

      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setProofPreview(reader.result);
          }
        };

        reader.onerror = () => {
          toast.error("Failed to create image preview");
          console.error("FileReader error:", reader.error);
        };

        reader.readAsDataURL(file);
      } else {
        // For PDFs or other non-image files
        setProofPreview(null);
      }

      setProofFile(file);
    }
  };

  // Remove selected file
  const removeProofFile = () => {
    setProofFile(null);
    setProofPreview(null);

    // Reset file input
    const fileInput = document.getElementById('proof-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!selectedAccount) {
      toast.error("Please select an account");
      return false;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (!proofFile) {
      toast.error("Please upload proof of payment");
      return false;
    }

    if (!selectedMethod || !selectedPaymentType) {
      toast.error("Please select a payment method");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('accountId', selectedAccount);
      formData.append('amount', amount);

      if (selectedMethod) {
        formData.append('paymentMethodId', selectedMethod);
      }

      if (selectedPaymentType) {
        formData.append('paymentType', selectedPaymentType);
      }

      if (proofFile) {
        formData.append('proofOfPayment', proofFile);
      }

      if (notes) {
        formData.append('notes', notes);
      }

      await axios.post(`${API_BASE_URL}/clientdeposits`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });


      setTimeout(() => {
        toast.success("Deposit request submitted successfully");

        // Reset form and refresh deposits list
        fetchDeposits();
        setIsSubmitting(false);
      }, 1500);
      resetForm();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit deposit request");
      }
      console.error('Error submitting deposit:', error);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">
          Add funds to your trading account using one of the available payment methods.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="payment-types"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <h2 className="text-lg font-medium">Select Payment Method</h2>

              {isLoading.methods ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {paymentMethods['Bank Account'] && paymentMethods['Bank Account'].length > 0 && (
                    <div
                      className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary"
                      onClick={() => selectPaymentType('Bank Transfer')}
                    >
                      <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Bank Transfer</h3>
                        <p className="text-sm text-muted-foreground">Direct bank transfer (1-3 business days)</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {paymentMethods['Crypto Wallet'] && paymentMethods['Crypto Wallet'].length > 0 && (
                    <div
                      className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary"
                      onClick={() => selectPaymentType('E-Wallet')}
                    >
                      <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">E-Wallet</h3>
                        <p className="text-sm text-muted-foreground">Deposit using crypto or digital wallets</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {Object.keys(paymentMethods)
                    .filter(key => key !== 'Bank Account' && key !== 'Crypto Wallet')
                    .map(type => (
                      paymentMethods[type] && paymentMethods[type].length > 0 && (
                        <div
                          key={type}
                          className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary"
                          onClick={() => selectPaymentType(type)}
                        >
                          <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                            <Wallet className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{type}</h3>
                            <p className="text-sm text-muted-foreground">Deposit using {type.toLowerCase()}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="payment-methods"
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
                <h2 className="text-lg font-medium">
                  {selectedPaymentType === 'Bank Transfer' ? 'Select Bank Account' : 'Select Wallet'}
                </h2>
              </div>

              <div className="mt-4">
                {selectedPaymentType === 'Bank Transfer' && paymentMethods['Bank Account']?.map(method => (
                  <div
                    key={method._id}
                    className="flex cursor-pointer items-center rounded-lg border p-4 hover:border-primary mb-3"
                    onClick={() => selectMethod(method)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{method.bankName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {method.accountHolderName} • {method.accountNumber}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}

                {selectedPaymentType === 'E-Wallet' && paymentMethods['Crypto Wallet']?.length > 0 && (
                  <Tabs defaultValue={paymentMethods['Crypto Wallet'][0]._id}>
                    <TabsList className="grid grid-cols-3 mb-4">
                      {paymentMethods['Crypto Wallet'].map(wallet => (
                        <TabsTrigger
                          key={wallet._id}
                          value={wallet._id}
                          onClick={() => selectMethod(wallet)}
                        >
                          {wallet.walletName}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {paymentMethods['Crypto Wallet'].map(wallet => (
                      <TabsContent key={wallet._id} value={wallet._id}>
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium">{wallet.walletName}</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Wallet Address: {wallet.walletAddress}
                          </p>
                          <Button
                            className="mt-4"
                            onClick={() => selectMethod(wallet)}
                          >
                            Select this wallet
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="payment-details"
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
                <h2 className="text-lg font-medium">Payment Method Details</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Payment Type</Label>
                    <p>{selectedMethodDetails?.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Active/Status</Label>
                    <p>{selectedMethodDetails?.active ? 'Account is Active' : 'Account is Inactive'}</p>
                  </div>
                </div>

                {selectedMethodDetails?.type === 'Bank Account' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Account Holder Name</Label>
                        <p>{selectedMethodDetails.accountHolderName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Account Number</Label>
                        <p>{selectedMethodDetails.accountNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">IFSC/SWIFT Code</Label>
                        <p>{selectedMethodDetails.ifsc_swift}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Bank Name</Label>
                        <p>{selectedMethodDetails.bankName}</p>
                      </div>
                    </div>
                  </>
                )}

                {selectedMethodDetails?.type === 'Crypto Wallet' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Wallet Address</Label>
                        <p className="break-all">{selectedMethodDetails.walletAddress}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Wallet Name</Label>
                        <p>{selectedMethodDetails.walletName}</p>
                      </div>
                    </div>
                  </>
                )}

                {selectedMethodDetails?.qrCode && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">QR Code</Label>
                    <div className="flex flex-col items-start">
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${selectedMethodDetails.qrCode}`}
                        alt="QR Code"
                        className="object-contain h-auto max-h-48"
                      />
                      <div className="mt-2">
                        <a
                          href={`${API_BASE_URL.replace('/api', '')}${selectedMethodDetails.qrCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          View full image
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethodDetails?.paymentLink && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Payment Link</Label>
                    <a
                      href={selectedMethodDetails.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedMethodDetails.paymentLink}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div
            key="deposit-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-medium">Deposit Details</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="account">Select Account</Label>
                {isLoading.accounts ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading accounts...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedAccount}
                    onValueChange={setSelectedAccount}
                    disabled={accounts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.mt5Account} ({account.accountType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">No Minimum deposit</p>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any additional information about your deposit"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="proof-file-input">
                  Upload Proof of Payment (PDF, JPG, JPEG, PNG)
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="proof-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleProofFileChange}
                    className="cursor-pointer"
                  />
                  {proofFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeProofFile}
                      title="Remove file"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {proofPreview && (
                  <div className="mt-2 relative">
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="max-w-full h-auto max-h-48 object-contain border rounded"
                    />
                  </div>
                )}

                {proofFile && !proofPreview && (
                  <div className="mt-2 p-3 border rounded flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    <span>{proofFile.name}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  !selectedAccount ||
                  !amount ||
                  !selectedMethod ||
                  !proofFile
                }
              >
                {isSubmitting ? "Processing..." : "Submit Deposit Request"}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Recent Deposits</h2>
        <div className="mt-4 overflow-x-auto">
          {isLoading.deposits ? (
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
                {deposits.length > 0 ? (
                  deposits.map((deposit) => (
                    <tr key={deposit._id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{formatDate(deposit.createdAt)}</td>
                      <td className="py-3 text-sm">
                        {deposit.paymentMethod?.type || deposit.paymentType}
                      </td>
                      <td className="py-3 text-sm">${deposit.amount.toFixed(2)}</td>
                      <td className="py-3 text-sm">{deposit.account?.mt5Account}</td>
                      <td className="py-3 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(deposit.status)}`}>
                          {deposit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No deposit history found
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