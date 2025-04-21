import { useState, useEffect } from "react";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function Transfer() {
  const [accounts, setAccounts] = useState<{ _id: string; mt5Account: string; accountType: string; balance: number }[]>([]);
  const [transfers, setTransfers] = useState<{ _id: string; fromAccount?: { mt5Account: string }; toAccount?: { mt5Account: string }; amount: number; status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: ""
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Fetch user accounts and recent transfers on component mount
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch accounts
      const accountsResponse = await axios.get(
        `${API_URL}/transfers/accounts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Fetch transfers
      const transfersResponse = await axios.get(
        `${API_URL}/transfers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Ensure we're setting arrays (even if empty) rather than undefined
      setAccounts(accountsResponse.data?.data || []);
      setTransfers(transfersResponse.data?.data || []);

      // Set default from and to accounts if accounts are available
      if (accountsResponse.data?.data?.length >= 2) {
        setFormData({
          fromAccountId: accountsResponse.data.data[0]._id,
          toAccountId: accountsResponse.data.data[1]._id,
          amount: ""
        });
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch account data");
      // Ensure we set empty arrays in case of error
      setAccounts([]);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Function to swap from and to accounts
  const handleSwapAccounts = () => {
    setFormData({
      ...formData,
      fromAccountId: formData.toAccountId,
      toAccountId: formData.fromAccountId
    });

    // Show feedback to the user
    toast.info("Accounts swapped");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (formData.fromAccountId === formData.toAccountId) {
      toast.error("Cannot transfer to the same account");
      return;
    }

    if (parseFloat(formData.amount) < 10) {
      toast.error("Minimum transfer amount is $10");
      return;
    }

    try {
      setTransferring(true);

      await axios.post(
        `${API_URL}/transfers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Funds transferred successfully");

      // Refresh data after successful transfer
      fetchUserData();

      // Reset amount field
      setFormData({
        ...formData,
        amount: ""
      });

    } catch (error) {
      console.error("Transfer error:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Transfer failed");
      }
    } finally {
      setTransferring(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transfer Funds</h1>
        <p className="text-muted-foreground">Transfer funds between your trading accounts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Transfer Form</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="fromAccountId">
                From Account
              </label>
              <select
                id="fromAccountId"
                name="fromAccountId"
                value={formData.fromAccountId}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select source account</option>
                {accounts && accounts.map((account) => (
                  <option key={`from-${account._id}`} value={account._id}>
                    {account.mt5Account} ({account.accountType}) - {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Make the arrow button clickable */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapAccounts}
                className="rounded-full border p-2 hover:bg-secondary transition-colors"
                aria-label="Swap accounts"
              >
                <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="toAccountId">
                To Account
              </label>
              <select
                id="toAccountId"
                name="toAccountId"
                value={formData.toAccountId}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select destination account</option>
                {accounts && accounts.map((account) => (
                  <option key={`to-${account._id}`} value={account._id}>
                    {account.mt5Account} ({account.accountType}) - {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="amount">
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2"
                  placeholder="Enter amount"
                  min="10"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Minimum transfer: $10</p>
            </div>
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Transfers between accounts are processed instantly.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={transferring}
            >
              {transferring ? "Processing..." : "Transfer Funds"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Account Balances</h2>
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
            {accounts && accounts.length > 0 ? accounts.map((account) => (
              <div className="rounded-lg border p-4" key={account._id}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{account.mt5Account}</h3>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs">{account.accountType}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                No trading accounts found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Recent Transfers</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">From</th>
                <th className="pb-2 text-left font-medium">To</th>
                <th className="pb-2 text-left font-medium">Amount</th>
                <th className="pb-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers && transfers.length > 0 ? (
                transfers.map((transfer) => (
                  <tr key={transfer._id} className="border-b last:border-0">
                    <td className="py-3 text-sm">{formatDate(transfer.createdAt)}</td>
                    <td className="py-3 text-sm">{transfer.fromAccount?.mt5Account || "Unknown"}</td>
                    <td className="py-3 text-sm">{transfer.toAccount?.mt5Account || "Unknown"}</td>
                    <td className="py-3 text-sm">{formatCurrency(transfer.amount)}</td>
                    <td className="py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transfer.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                        : transfer.status === 'Failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                        }`}>
                        {transfer.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No recent transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}