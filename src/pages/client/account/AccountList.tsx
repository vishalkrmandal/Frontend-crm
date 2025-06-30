// Frontend\src\pages\client\account\AccountList.tsx

import { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight, RefreshCw, Lock } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Interfaces
interface Account {
  _id: string;
  mt5Account: string;
  user: string;
  accountType: string;
  platform: string;
  balance: number;
  equity: number;
  status: boolean;
  leverage: string;
  name: string;
  investor_pwd: string;
  master_pwd: string;
  groupName: string;
  managerIndex: string;
  createdAt: string;
  updatedAt: string;
}

interface SummaryData {
  totalBalance: number;
  totalEquity: number;
  totalPL: number;
}

interface ApiResponse {
  success: boolean;
  data: Account[];
  message?: string;
}

interface PasswordDialogState {
  isOpen: boolean;
  accountId: string;
  accountNumber: string;
  leverage: string;
  investor_pwd: string;
  master_pwd: string;
  newInvestorPwd: string;
  confirmInvestorPwd: string;
  newMasterPwd: string;
  confirmMasterPwd: string;
  isChangingInvestor: boolean;
  isChangingMaster: boolean;
}

export default function AccountList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [summary, setSummary] = useState<SummaryData>({
    totalBalance: 0,
    totalEquity: 0,
    totalPL: 0
  });

  // Password dialog state
  const [passwordDialog, setPasswordDialog] = useState<PasswordDialogState>({
    isOpen: false,
    accountId: "",
    accountNumber: "",
    leverage: "",
    investor_pwd: "",
    master_pwd: "",
    newInvestorPwd: "",
    confirmInvestorPwd: "",
    newMasterPwd: "",
    confirmMasterPwd: "",
    isChangingInvestor: false,
    isChangingMaster: false
  });

  const ACCOUNTS_PER_PAGE = 10;

  // Fetch accounts from the backend
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("clientToken");
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/api/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const accountsData: Account[] = response.data.data;

        if (Array.isArray(accountsData)) {
          setAccounts(accountsData);
          setTotalPages(Math.ceil(accountsData.length / ACCOUNTS_PER_PAGE));

          // Calculate summary data
          const totalBalance = accountsData.reduce((sum: number, account: Account) =>
            sum + (typeof account.balance === 'number' ? account.balance : 0), 0);

          const totalEquity = accountsData.reduce((sum: number, account: Account) =>
            sum + (typeof account.equity === 'number' ? account.equity : 0), 0);

          const totalPL = totalEquity - totalBalance;

          setSummary({
            totalBalance,
            totalEquity,
            totalPL
          });
        } else {
          setAccounts([]);
          setTotalPages(1);
          setSummary({
            totalBalance: 0,
            totalEquity: 0,
            totalPL: 0
          });
        }
      } else {
        setError(response.data.message || "Failed to fetch accounts");
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      const error = err as AxiosError;
      setError(error.message || "An error occurred while fetching accounts");
    } finally {
      setLoading(false);
    }
  };

  // Refresh account data
  const handleRefresh = async (accountId: string) => {
    try {
      const token = localStorage.getItem("clientToken");
      await axios.post(`${API_BASE_URL}/api/accounts/${accountId}/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchAccounts();
    } catch (err) {
      console.error("Error refreshing account:", err);
      alert("Failed to refresh account data. Please try again.");
    }
  };

  // Open new account handler
  const handleOpenNewAccount = () => {
    window.location.href = "/client/account/new";
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get current page accounts
  const getCurrentPageAccounts = () => {
    const startIndex = (currentPage - 1) * ACCOUNTS_PER_PAGE;
    const endIndex = startIndex + ACCOUNTS_PER_PAGE;
    return accounts.slice(startIndex, endIndex);
  };

  // Password dialog handlers
  const openPasswordDialog = (account: Account) => {
    setPasswordDialog({
      isOpen: true,
      accountId: account._id,
      accountNumber: account.mt5Account,
      leverage: account.leverage,
      investor_pwd: account.investor_pwd,
      master_pwd: account.master_pwd,
      newInvestorPwd: "",
      confirmInvestorPwd: "",
      newMasterPwd: "",
      confirmMasterPwd: "",
      isChangingInvestor: false,
      isChangingMaster: false
    });
  };

  const closePasswordDialog = () => {
    setPasswordDialog({
      ...passwordDialog,
      isOpen: false,
      newInvestorPwd: "",
      confirmInvestorPwd: "",
      newMasterPwd: "",
      confirmMasterPwd: "",
      isChangingInvestor: false,
      isChangingMaster: false
    });
  };

  const toggleInvestorChange = () => {
    setPasswordDialog({
      ...passwordDialog,
      isChangingInvestor: !passwordDialog.isChangingInvestor,
      newInvestorPwd: "",
      confirmInvestorPwd: ""
    });
  };

  const toggleMasterChange = () => {
    setPasswordDialog({
      ...passwordDialog,
      isChangingMaster: !passwordDialog.isChangingMaster,
      newMasterPwd: "",
      confirmMasterPwd: ""
    });
  };

  const handlePasswordChange = async () => {
    try {
      const token = localStorage.getItem("clientToken");
      const payload: any = {};
      let hasChanges = false;
      let hasErrors = false;

      // Validate investor password change
      if (passwordDialog.isChangingInvestor) {
        if (!passwordDialog.newInvestorPwd) {
          alert("New investor password cannot be empty");
          hasErrors = true;
        } else if (passwordDialog.newInvestorPwd !== passwordDialog.confirmInvestorPwd) {
          alert("Investor passwords do not match");
          hasErrors = true;
        } else {
          payload.investor_pwd = passwordDialog.newInvestorPwd;
          hasChanges = true;
        }
      }

      // Validate master password change
      if (passwordDialog.isChangingMaster && !hasErrors) {
        if (!passwordDialog.newMasterPwd) {
          alert("New master password cannot be empty");
          hasErrors = true;
        } else if (passwordDialog.newMasterPwd !== passwordDialog.confirmMasterPwd) {
          alert("Master passwords do not match");
          hasErrors = true;
        } else {
          payload.master_pwd = passwordDialog.newMasterPwd;
          hasChanges = true;
        }
      }

      // Proceed with API call if validations pass
      if (hasChanges && !hasErrors) {
        await axios.put(
          `${API_BASE_URL}/api/accounts/${passwordDialog.accountId}/passwords`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        alert("Password(s) updated successfully");
        closePasswordDialog();
        fetchAccounts(); // Refresh accounts to get updated data
      }
    } catch (err) {
      console.error("Error updating passwords:", err);
      alert("Failed to update password(s). Please try again.");
    }
  };

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trading Accounts</h1>
          <p className="text-muted-foreground">Manage and monitor all your trading accounts.</p>
        </div>
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          onClick={handleOpenNewAccount}
        >
          Open New Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border bg-red-50 p-4 text-red-800">
          <p>Error: {error}</p>
          <button
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            onClick={fetchAccounts}
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Account</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Platform</th>
                  <th className="px-4 py-3 text-left font-medium">Leverage</th>
                  <th className="px-4 py-3 text-left font-medium">Balance</th>
                  <th className="px-4 py-3 text-left font-medium">Equity</th>
                  <th className="px-4 py-3 text-left font-medium">Profit/Loss</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageAccounts().length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      No accounts found. Click "Open New Account" to create one.
                    </td>
                  </tr>
                ) : (
                  getCurrentPageAccounts().map((account) => {
                    const profitLoss = account.equity - account.balance;
                    const isProfitable = profitLoss >= 0;

                    return (
                      <tr key={account._id} className="border-b last:border-0">
                        <td className="px-4 py-4 text-sm font-medium">{account.mt5Account}</td>
                        <td className="px-4 py-4 text-sm">{account.name}</td>
                        <td className="px-4 py-4 text-sm">{account.accountType}</td>
                        <td className="px-4 py-4 text-sm">{account.platform}</td>
                        <td className="px-4 py-4 text-sm">1:{account.leverage}</td>
                        <td className="px-4 py-4 text-sm">{formatCurrency(account.balance)}</td>
                        <td className="px-4 py-4 text-sm">{formatCurrency(account.equity)}</td>
                        <td
                          className={`px-4 py-4 text-sm font-medium ${isProfitable ? "text-green-600" : "text-red-600"}`}
                        >
                          {isProfitable ? "+" : ""}{formatCurrency(profitLoss)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${account.status
                              ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                              }`}
                          >
                            {account.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            {/* <button
                              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              title="View Details"
                              onClick={() => window.location.href = `/accounts/${account._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button> */}
                            <button
                              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              title="Change Passwords"
                              onClick={() => openPasswordDialog(account)}
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                            {/* <button
                              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              title="Refresh Account"
                              onClick={() => handleRefresh(account._id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {accounts.length > ACCOUNTS_PER_PAGE && (
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ACCOUNTS_PER_PAGE + 1} to {Math.min(currentPage * ACCOUNTS_PER_PAGE, accounts.length)} of {accounts.length} accounts
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className={`rounded-md p-1 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                  disabled={currentPage === 1}
                  onClick={goToPreviousPage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button
                  className={`rounded-md p-1 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                  disabled={currentPage === totalPages}
                  onClick={goToNextPage}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Account Summary</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="font-medium">{formatCurrency(summary.totalBalance)}</p>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-sm text-muted-foreground">Total Equity</p>
              <p className="font-medium">{formatCurrency(summary.totalEquity)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
              <p className={`font-medium ${summary.totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {summary.totalPL >= 0 ? "+" : ""}{formatCurrency(summary.totalPL)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Quick Actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              onClick={() => navigate("/client/financial/deposit")}
              className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Deposit Funds
            </button>
            <button
              onClick={() => navigate("/client/financial/withdrawal")}
              className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Withdraw Funds
            </button>
            <button
              onClick={() => navigate("/client/financial/transfer")}
              className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Internal Transfer
            </button>
            <button
              onClick={() => window.open("https://example.com/platform-download", "_blank")}
              className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Download Platform
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      {passwordDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium">Account Passwords</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm"
                    value={passwordDialog.accountNumber}
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Leverage</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm"
                    value={`1:${passwordDialog.leverage}`}
                    disabled
                  />
                </div>
              </div>

              {/* Investor Password Section */}
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Investor Password</h4>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={toggleInvestorChange}
                  >
                    {passwordDialog.isChangingInvestor ? "Cancel" : "Change"}
                  </button>
                </div>

                {passwordDialog.isChangingInvestor ? (
                  <div className="mt-2 space-y-2">
                    <div>
                      <input
                        type="password"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder={passwordDialog.investor_pwd}
                        value={passwordDialog.newInvestorPwd}
                        onChange={(e) => setPasswordDialog({ ...passwordDialog, newInvestorPwd: e.target.value })}
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Confirm new investor password"
                        value={passwordDialog.confirmInvestorPwd}
                        onChange={(e) => setPasswordDialog({ ...passwordDialog, confirmInvestorPwd: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      type="password"
                      className="w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm"
                      value={passwordDialog.investor_pwd}
                      disabled
                    />
                  </div>
                )}
              </div>

              {/* Master Password Section */}
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Master Password</h4>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={toggleMasterChange}
                  >
                    {passwordDialog.isChangingMaster ? "Cancel" : "Change"}
                  </button>
                </div>

                {passwordDialog.isChangingMaster ? (
                  <div className="mt-2 space-y-2">
                    <div>
                      <input
                        type="password"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder={passwordDialog.master_pwd}
                        value={passwordDialog.newMasterPwd}
                        onChange={(e) => setPasswordDialog({ ...passwordDialog, newMasterPwd: e.target.value })}
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Confirm new master password"
                        value={passwordDialog.confirmMasterPwd}
                        onChange={(e) => setPasswordDialog({ ...passwordDialog, confirmMasterPwd: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      type="password"
                      className="w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm"
                      value={passwordDialog.master_pwd}
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={closePasswordDialog}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                onClick={handlePasswordChange}
                disabled={!passwordDialog.isChangingInvestor && !passwordDialog.isChangingMaster}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}