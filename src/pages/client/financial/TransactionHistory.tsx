// Frontend\src\pages\client\financial\TransactionHistory.tsx

"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, X, Calendar } from "lucide-react"
import axios from "axios"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function TransactionHistory() {
  interface Transaction {
    _id: string;
    date: string;
    type: string;
    description: string;
    amount: string;
    account: string;
    status: string;
    formattedDate?: string; // Optional property for formatted date
  }

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [status, setStatus] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Function to fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("clientToken")
      if (!token) {
        setError("Authentication required")
        setLoading(false)
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (transactionType !== "all") params.append("type", transactionType)
      if (status !== "all") params.append("status", status)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (search) params.append("search", search)
      params.append("page", currentPage.toString())
      params.append("limit", "10")

      const response = await axios.get(`${API_URL}/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setTransactions(response.data.data)
        setTotalPages(response.data.pagination.pages)
        setTotalCount(response.data.count)
      } else {
        setError("Failed to fetch transactions")
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Error fetching transaction history. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchTransactions()
  }, [transactionType, status, currentPage])

  // Handle search input submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
    fetchTransactions()
  }

  // Handle filter application
  const applyFilters = () => {
    setCurrentPage(1) // Reset to first page when filtering
    fetchTransactions()
    setShowFilters(false)
  }

  // Reset filters
  const resetFilters = () => {
    setStatus("all")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
    setShowFilters(false)
    // Keep the transaction type as is since it's part of the main filter
  }

  // Export transactions to Excel
  const exportToExcel = async () => {
    try {
      // Build query parameters for export (without pagination)
      const params = new URLSearchParams()
      if (transactionType !== "all") params.append("type", transactionType)
      if (status !== "all") params.append("status", status)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (search) params.append("search", search)
      params.append("format", "excel")

      const token = localStorage.getItem("clientToken")
      const response = await axios.get(`${API_URL}/transactions/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const transactions = response.data.data

        // Format data for Excel
        const worksheet = XLSX.utils.json_to_sheet(transactions.map((transaction: Transaction) => ({
          "Date & Time": transaction.formattedDate,
          "Type": transaction.type,
          "Description": transaction.description,
          "Amount": transaction.amount,
          "Account": transaction.account,
          "Status": transaction.status
        })))

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")

        // Generate filename with current date
        const dateStr = new Date().toISOString().split('T')[0]
        const fileName = `transaction_history_${dateStr}.xlsx`

        // Download file
        XLSX.writeFile(workbook, fileName)
      }
    } catch (err) {
      console.error("Error exporting to Excel:", err)
      setError("Failed to export transactions. Please try again.")
    }
  }

  // Export transactions to PDF
  const exportToPDF = async () => {
    try {
      // Build query parameters for export (without pagination)
      const params = new URLSearchParams()
      if (transactionType !== "all") params.append("type", transactionType)
      if (status !== "all") params.append("status", status)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (search) params.append("search", search)
      params.append("format", "pdf")

      const token = localStorage.getItem("clientToken")
      const response = await axios.get(`${API_URL}/transactions/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const transactions = response.data.data

        // Create PDF document
        const doc = new jsPDF()

        // Add title
        doc.setFontSize(16)
        doc.text("Transaction History", 14, 15)

        // Add filters info if any
        let yPos = 25
        if (transactionType !== "all" || status !== "all" || startDate || endDate || search) {
          doc.setFontSize(10)
          doc.text(`Filters applied: ${[
            transactionType !== "all" ? `Type: ${transactionType}` : "",
            status !== "all" ? `Status: ${status}` : "",
            startDate ? `From: ${startDate}` : "",
            endDate ? `To: ${endDate}` : "",
            search ? `Search: ${search}` : ""
          ].filter(Boolean).join(", ")}`, 14, yPos)
          yPos += 10
        }

        // Generate date
        const dateStr = new Date().toLocaleDateString()
        doc.setFontSize(10)
        doc.text(`Generated on: ${dateStr}`, 14, yPos)

        // Create table
        const tableColumn = ["Date & Time", "Type", "Description", "Amount", "Account", "Status"]
        const tableRows = transactions.map((transaction: Transaction) => [
          transaction.formattedDate,
          transaction.type,
          transaction.description,
          transaction.amount,
          transaction.account,
          transaction.status
        ])

        // @ts-ignore - TypeScript doesn't know about autoTable
        doc.autoTable({
          startY: yPos + 5,
          head: [tableColumn],
          body: tableRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 66, 66] }
        })

        // Generate filename with current date
        const fileName = `transaction_history_${dateStr.replace(/\//g, '-')}.pdf`

        // Download file
        doc.save(fileName)
      }
    } catch (err) {
      console.error("Error exporting to PDF:", err)
      setError("Failed to export transactions. Please try again.")
    }
  }

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">View and filter all your account transactions.</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <select
              value={transactionType}
              onChange={(e) => {
                setTransactionType(e.target.value)
                setCurrentPage(1)
              }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer">Transfers</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>

            <div className="relative">
              <button
                className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-input bg-background shadow-lg z-10 hidden">
                <ul className="py-1">
                  <li
                    className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={exportToExcel}
                  >
                    Export to Excel
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={exportToPDF}
                  >
                    Export to PDF
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 rounded-md border border-input bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Advanced Filters</h3>
              <button onClick={() => setShowFilters(false)} className="hover:text-accent-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={resetFilters}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Transactions Table */}
        {!loading && !error && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Date & Time</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-left font-medium">Description</th>
                  <th className="pb-2 text-left font-medium">Amount</th>
                  <th className="pb-2 text-left font-medium">Account</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{transaction.date}</td>
                      <td className="py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.type === "Deposit"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : transaction.type === "Withdrawal"
                              ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                            }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 text-sm">{transaction.description}</td>
                      <td
                        className={`py-3 text-sm font-medium ${transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {transaction.amount}
                      </td>
                      <td className="py-3 text-sm">{transaction.account}</td>
                      <td className="py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : transaction.status === "Pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                              : transaction.status === "Approved"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                            }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && transactions.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {transactions.length} of {totalCount} transactions
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ${currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ${currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}