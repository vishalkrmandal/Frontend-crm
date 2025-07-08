// Frontend\src\pages\client\financial\TransactionHistory.tsx

"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, X, Calendar } from "lucide-react"
import axios from "axios"
import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


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
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
      params.append("limit", itemsPerPage.toString())

      const response = await axios.get(`${API_BASE_URL}/api/transactions?${params.toString()}`, {
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
  }, [transactionType, status, currentPage, itemsPerPage])

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

      const token = localStorage.getItem("clientToken")
      const response = await axios.get(`${API_BASE_URL}/api/transactions/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const transactions = response.data.data

        // Format data for Excel
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Transactions')

        // Add header row
        worksheet.addRow([
          "Date & Time",
          "Type",
          "Description",
          "Amount",
          "Account",
          "Status"
        ])

        // Add data rows
        transactions.forEach((transaction: Transaction) => {
          worksheet.addRow([
            transaction.formattedDate,
            transaction.type,
            transaction.description,
            transaction.amount,
            transaction.account,
            transaction.status
          ])
        })

        // Style header row
        worksheet.getRow(1).font = { bold: true }

        // Auto width for columns
        worksheet.columns.forEach((column) => {
          let maxLength = 10
          if (typeof column.eachCell === "function") {
            column.eachCell({ includeEmpty: true }, (cell) => {
              const cellValue = cell.value ? cell.value.toString() : ''
              maxLength = Math.max(maxLength, cellValue.length)
            })
          }
          column.width = maxLength + 2
        })

        // Generate filename with current date
        const dateStr = new Date().toISOString().split('T')[0]
        const fileName = `transaction_history_${dateStr}.xlsx`

        // Download file
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error("Error exporting to Excel:", err)
      setError("Failed to export transactions. Please try again.")
    }
  }

  // Export transactions to PDF
  const exportToPDF = async () => {
    try {
      console.log("Starting PDF export...") // Debug log

      // Build query parameters for export (without pagination)
      const params = new URLSearchParams()
      if (transactionType !== "all") params.append("type", transactionType)
      if (status !== "all") params.append("status", status)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (search) params.append("search", search)

      const token = localStorage.getItem("clientToken")
      console.log("Making API request...") // Debug log

      const response = await axios.get(`${API_BASE_URL}/api/transactions/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("API response:", response.data) // Debug log

      if (response.data.success) {
        const transactions = response.data.data
        console.log("Transactions data:", transactions) // Debug log

        // Create PDF document
        const doc = new jsPDF()
        console.log("Created PDF document") // Debug log

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

        // Create table with proper structure including serial numbers
        let currentY = yPos + 15
        const lineHeight = 6 // Increased line height
        const pageHeight = doc.internal.pageSize.height
        const marginLeft = 10 // Reduced left margin
        const tableWidth = 182 // Increased table width
        const colWidths = [12, 38, 18, 35, 22, 35, 22] // Adjusted column widths
        let colPositions = [marginLeft]

        // Calculate column positions
        for (let i = 0; i < colWidths.length - 1; i++) {
          colPositions.push(colPositions[i] + colWidths[i])
        }

        // Function to draw table borders
        const drawTableBorders = (startY: number, endY: number) => {
          // Vertical lines
          colPositions.forEach(pos => {
            doc.line(pos, startY, pos, endY)
          })
          doc.line(colPositions[colPositions.length - 1] + colWidths[colWidths.length - 1], startY,
            colPositions[colPositions.length - 1] + colWidths[colWidths.length - 1], endY)

          // Horizontal lines
          doc.line(marginLeft, startY, marginLeft + tableWidth, startY)
          doc.line(marginLeft, endY, marginLeft + tableWidth, endY)
        }

        // Draw table header
        doc.setFillColor(66, 66, 66)
        doc.rect(marginLeft, currentY, tableWidth, lineHeight, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8) // Reduced font size
        doc.setFont('', 'bold')

        const headers = ['S.No', 'Date & Time', 'Type', 'Description', 'Amount', 'Account', 'Status']
        headers.forEach((header, index) => {
          doc.text(header, colPositions[index] + 1, currentY + 5) // Better positioning
        })

        const headerEndY = currentY + lineHeight
        currentY = headerEndY

        // Draw header borders
        drawTableBorders(headerEndY - lineHeight, headerEndY)

        // Draw table rows
        doc.setTextColor(0, 0, 0)
        doc.setFont('', 'normal')
        doc.setFontSize(7) // Smaller font for data

        transactions.forEach((transaction: Transaction, index: number) => {
          if (currentY > pageHeight - 30) {
            // Add page break
            doc.addPage()
            currentY = 20

            // Redraw header on new page
            doc.setFillColor(66, 66, 66)
            doc.rect(marginLeft, currentY, tableWidth, lineHeight, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(8)
            doc.setFont('', 'bold')

            headers.forEach((header, index) => {
              doc.text(header, colPositions[index] + 1, currentY + 5)
            })

            drawTableBorders(currentY, currentY + lineHeight)
            currentY += lineHeight

            doc.setTextColor(0, 0, 0)
            doc.setFont('', 'normal')
            doc.setFontSize(7)
          }

          // Alternate row colors
          if (index % 2 === 0) {
            doc.setFillColor(248, 249, 250)
            doc.rect(marginLeft, currentY, tableWidth, lineHeight, 'F')
          }

          // Format date and time properly
          let formattedDateTime = ''
          if (transaction.formattedDate) {
            formattedDateTime = transaction.formattedDate
          } else if (transaction.date) {
            const date = new Date(transaction.date)
            formattedDateTime = date.toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }

          // Add row data including serial number
          const rowData = [
            (index + 1).toString(),
            formattedDateTime,
            transaction.type || '',
            transaction.description || '',
            transaction.amount || '',
            transaction.account || '',
            transaction.status || ''
          ]

          rowData.forEach((data, colIndex) => {
            let text = data.toString()

            // Better text truncation based on actual column width
            const maxWidth = colWidths[colIndex] - 2 // Leave 2 units padding
            const charWidth = 1.2 // Approximate character width for font size 7
            const maxChars = Math.floor(maxWidth / charWidth)

            if (text.length > maxChars) {
              text = text.substring(0, maxChars - 3) + '...'
            }

            // Better text positioning - center vertically in cell
            doc.text(text, colPositions[colIndex] + 1, currentY + 5)
          })

          // Draw row borders
          drawTableBorders(currentY, currentY + lineHeight)
          currentY += lineHeight
        })

        console.log("AutoTable created") // Debug log

        // Generate filename with current date
        const fileName = `transaction_history_${dateStr.replace(/\//g, '-')}.pdf`

        // Download file
        console.log("Saving PDF with filename:", fileName) // Debug log
        doc.save(fileName)
        console.log("PDF saved successfully") // Debug log
      } else {
        console.error("API response not successful:", response.data)
        setError("Failed to fetch transaction data for PDF export")
      }
    } catch (err) {
      console.error("Error exporting to PDF:", err)
      setError("Failed to export transactions to PDF. Please try again.")
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
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-input bg-background shadow-lg z-10">
                  <ul className="py-1">
                    <li
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onClick={() => {
                        exportToExcel()
                        setShowExportMenu(false)
                      }}
                    >
                      Export to Excel
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onClick={() => {
                        exportToPDF()
                        setShowExportMenu(false)
                      }}
                    >
                      Export to PDF
                    </li>
                  </ul>
                </div>
              )}
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
          <div className="mt-6">
            {/* Desktop Table View */}
            <div className="hidden md:block pb-4">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                            <div className="truncate" title={transaction.description}>
                              {transaction.description}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                            }`}>
                            {transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {transaction.account}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "Completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : transaction.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                  : transaction.status === "Approved"
                                    ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
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
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-800 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No transactions found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 -my-2 -mx-4">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction._id} className="bg-card rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
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
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                          : transaction.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                            : transaction.status === "Approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                          }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Amount</span>
                        <span className={`text-sm font-semibold ${transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                          }`}>
                          {transaction.amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Account</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{transaction.account}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Description</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-right max-w-[60%]">
                          {transaction.description}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>

                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-800 dark:text-gray-400">
                  <svg className="w-12 h-12 mb-4 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && transactions.length > 0 && (
          <div className="border-t mt-6 md:mt-0 pt-4 ">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</strong> to{" "}
                <strong>{Math.min(currentPage * itemsPerPage, totalCount)}</strong> of{" "}
                <strong>{totalCount}</strong> transactions
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm whitespace-nowrap">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="text-xs sm:text-sm"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageToShow;
                      if (totalPages <= 5) {
                        pageToShow = i + 1;
                      } else if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 2 + i;
                      }

                      if (pageToShow > 0 && pageToShow <= totalPages) {
                        return (
                          <Button
                            key={i}
                            variant={pageToShow === currentPage ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0 text-xs"
                            onClick={() => setCurrentPage(pageToShow)}
                            disabled={loading}
                          >
                            {pageToShow}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="text-xs sm:text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}