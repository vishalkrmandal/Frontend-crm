import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'

// Add Buffer polyfill for browser environments
if (typeof window !== 'undefined' && !window.Buffer) {
    import('buffer').then(bufferModule => {
        window.Buffer = bufferModule.Buffer;
    }).catch(err => {
        console.error('Failed to load Buffer polyfill:', err);
    });
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Get token from localStorage
const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('superadminToken');

// API headers with auth token and ngrok bypass
const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        'ngrok-skip-browser-warning': 'true'
    }
});

const withdrawalService = {
    getAllWithdrawals: async () => {
        const response = await axios.get(`${API_URL}/api/adminwithdrawals`, getAuthHeaders())
        console.log('Withdrawals:', response.data)
        return response.data
    },

    approveWithdrawal: async (withdrawalId: string, data: any) => {
        const response = await axios.patch(
            `${API_URL}/api/adminwithdrawals/${withdrawalId}/approve`,
            data,
            getAuthHeaders()
        )
        return response.data
    },

    rejectWithdrawal: async (withdrawalId: string, data: any) => {
        const response = await axios.patch(
            `${API_URL}/api/adminwithdrawals/${withdrawalId}/reject`,
            data,
            getAuthHeaders()
        )
        return response.data
    },

    exportWithdrawals: async (data: Array<{ user: { firstname: string; lastname: string; email: string }; account: { mt5Account: string; balance: number; accountType: string }; amount: number; paymentMethod: string; status: string; requestedDate: string; remarks?: string; bankDetails?: { bankName: string; accountHolderName: string; accountNumber: string; ifscCode: string }; eWalletDetails?: { walletId: string; type: string } }>, format: string) => {
        switch (format) {
            case 'pdf':
                const doc = new jsPDF()
                doc.text('Withdrawal Report', 14, 15)

                const tableData = data.map(withdrawal => [
                    `${withdrawal.user?.firstname || ''} ${withdrawal.user?.lastname || ''}`,
                    withdrawal.account?.mt5Account || '',
                    `$${(withdrawal.account?.balance || 0).toLocaleString()}`,
                    `$${withdrawal.amount.toLocaleString()}`,
                    withdrawal.account?.accountType || '',
                    withdrawal.paymentMethod,
                    withdrawal.status,
                    new Date(withdrawal.requestedDate).toLocaleDateString()
                ])

                autoTable(doc, {
                    head: [['User', 'Account Number', 'Balance', 'Withdrawal Amount', 'Plan Type', 'Payment Method', 'Status', 'Request Date']],
                    body: tableData,
                    startY: 20
                })

                doc.save('withdrawals.pdf')
                break

            case 'excel':
                const wsData = data.map(withdrawal => ({
                    'User Name': `${withdrawal.user?.firstname || ''} ${withdrawal.user?.lastname || ''}`,
                    'Email': withdrawal.user?.email || '',
                    'Account Number': withdrawal.account?.mt5Account || '',
                    'Balance': withdrawal.account?.balance || 0,
                    'Withdrawal Amount': withdrawal.amount,
                    'Plan Type': withdrawal.account?.accountType || '',
                    'Payment Method': withdrawal.paymentMethod,
                    'Status': withdrawal.status,
                    'Request Date': new Date(withdrawal.requestedDate).toLocaleDateString(),
                    'Remarks': withdrawal.remarks || ''
                }))

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Withdrawals');

                // Add header row
                worksheet.columns = [
                    { header: 'User Name', key: 'User Name', width: 20 },
                    { header: 'Email', key: 'Email', width: 25 },
                    { header: 'Account Number', key: 'Account Number', width: 18 },
                    { header: 'Balance', key: 'Balance', width: 15 },
                    { header: 'Withdrawal Amount', key: 'Withdrawal Amount', width: 18 },
                    { header: 'Plan Type', key: 'Plan Type', width: 15 },
                    { header: 'Payment Method', key: 'Payment Method', width: 18 },
                    { header: 'Status', key: 'Status', width: 12 },
                    { header: 'Request Date', key: 'Request Date', width: 15 },
                    { header: 'Remarks', key: 'Remarks', width: 20 }
                ];

                // Add data rows
                wsData.forEach(row => worksheet.addRow(row));

                // Create buffer and trigger download
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'withdrawals.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                break

            case 'csv':
                const csvData = data.map(withdrawal => ({
                    'User Name': `${withdrawal.user?.firstname || ''} ${withdrawal.user?.lastname || ''}`,
                    'Email': withdrawal.user?.email || '',
                    'Account Number': withdrawal.account?.mt5Account || '',
                    'Balance': withdrawal.account?.balance || 0,
                    'Withdrawal Amount': withdrawal.amount,
                    'Plan Type': withdrawal.account?.accountType || '',
                    'Payment Method': withdrawal.paymentMethod,
                    'Status': withdrawal.status,
                    'Request Date': new Date(withdrawal.requestedDate).toLocaleDateString(),
                    'Remarks': withdrawal.remarks || ''
                }))

                // Using ExcelJS to generate CSV
                const csvWorkbook = new ExcelJS.Workbook();
                const csvWorksheet = csvWorkbook.addWorksheet('Withdrawals');

                csvWorksheet.columns = [
                    { header: 'User Name', key: 'User Name', width: 20 },
                    { header: 'Email', key: 'Email', width: 25 },
                    { header: 'Account Number', key: 'Account Number', width: 18 },
                    { header: 'Balance', key: 'Balance', width: 15 },
                    { header: 'Withdrawal Amount', key: 'Withdrawal Amount', width: 18 },
                    { header: 'Plan Type', key: 'Plan Type', width: 15 },
                    { header: 'Payment Method', key: 'Payment Method', width: 18 },
                    { header: 'Status', key: 'Status', width: 12 },
                    { header: 'Request Date', key: 'Request Date', width: 15 },
                    { header: 'Remarks', key: 'Remarks', width: 20 }
                ];

                csvData.forEach(row => csvWorksheet.addRow(row));

                const csvBuffer = await csvWorkbook.csv.writeBuffer();
                const csvBlob = new Blob([csvBuffer], { type: 'text/csv' });
                const csvUrl = window.URL.createObjectURL(csvBlob);
                const csvLink = document.createElement('a');
                csvLink.href = csvUrl;
                csvLink.download = 'withdrawals.csv';
                document.body.appendChild(csvLink);
                csvLink.click();
                document.body.removeChild(csvLink);
                window.URL.revokeObjectURL(csvUrl);
                break

            case 'docx':
                try {
                    const docxContent = `
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 40px; }
                                h1 { text-align: center; margin-bottom: 20px; }
                                h2 { margin-top: 30px; margin-bottom: 10px; }
                                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; }
                                .separator { border-top: 1px solid #ddd; margin: 20px 0; }
                            </style>
                        </head>
                        <body>
                            <h1>Withdrawal Report</h1>
                            ${data.map(withdrawal => `
                                <h2>WITHDRAWAL REQUEST DETAILS</h2>
                                <table>
                                    <tr>
                                        <th style="width: 30%;">User</th>
                                        <td>${withdrawal.user?.firstname || ''} ${withdrawal.user?.lastname || ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>${withdrawal.user?.email || ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Account</th>
                                        <td>${withdrawal.account?.mt5Account || ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Balance</th>
                                        <td>$${(withdrawal.account?.balance || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Withdrawal Amount</th>
                                        <td>$${withdrawal.amount.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Plan Type</th>
                                        <td>${withdrawal.account?.accountType || ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Payment Method</th>
                                        <td>${withdrawal.paymentMethod}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>${withdrawal.status}</td>
                                    </tr>
                                    <tr>
                                        <th>Request Date</th>
                                        <td>${new Date(withdrawal.requestedDate).toLocaleDateString()}</td>
                                    </tr>
                                    ${withdrawal.remarks ? `
                                    <tr>
                                        <th>Remarks</th>
                                        <td>${withdrawal.remarks}</td>
                                    </tr>
                                    ` : ''}
                                </table>
                                
                                <h2>PAYMENT DETAILS</h2>
                                <table>
                                    ${withdrawal.paymentMethod.toLowerCase().includes('bank') && withdrawal.bankDetails ? `
                                        <tr>
                                            <th style="width: 30%;">Bank Name</th>
                                            <td>${withdrawal.bankDetails.bankName}</td>
                                        </tr>
                                        <tr>
                                            <th>Account Holder</th>
                                            <td>${withdrawal.bankDetails.accountHolderName}</td>
                                        </tr>
                                        <tr>
                                            <th>Account Number</th>
                                            <td>${withdrawal.bankDetails.accountNumber}</td>
                                        </tr>
                                        <tr>
                                            <th>IFSC Code</th>
                                            <td>${withdrawal.bankDetails.ifscCode}</td>
                                        </tr>
                                    ` : withdrawal.eWalletDetails ? `
                                        <tr>
                                            <th style="width: 30%;">Wallet ID</th>
                                            <td>${withdrawal.eWalletDetails.walletId}</td>
                                        </tr>
                                        <tr>
                                            <th>Wallet Type</th>
                                            <td>${withdrawal.eWalletDetails.type}</td>
                                        </tr>
                                    ` : `
                                        <tr>
                                            <td colspan="2">No payment details available</td>
                                        </tr>
                                    `}
                                </table>
                                <div class="separator"></div>
                            `).join('')}
                        </body>
                        </html>
                    `;

                    const blob = new Blob([docxContent], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'withdrawals.doc';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error('Error exporting to DOCX:', error);
                    throw error;
                }
                break;
        }
    }
}

export default withdrawalService