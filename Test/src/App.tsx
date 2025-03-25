import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import Deposit from "./pages/financial/Deposit"
import Withdrawal from "./pages/financial/Withdrawal"
import Transfer from "./pages/financial/Transfer"
import TransactionHistory from "./pages/financial/TransactionHistory"
import OpenNewAccount from "./pages/account/OpenNewAccount"
import AccountList from "./pages/account/AccountList"
import TradingContest from "./pages/account/TradingContest"
import TradingPlatforms from "./pages/TradingPlatforms"
import ReferFriend from "./pages/ReferFriend"
import CreatePartnerAccount from "./pages/partner/CreatePartnerAccount"
import PartnerDashboard from "./pages/partner/PartnerDashboard"
import MultiLevelIB from "./pages/partner/MultiLevelIB"
import IBAccounts from "./pages/partner/IBAccounts"
import AutoRebateReport from "./pages/partner/AutoRebateReport"
import MyEnquiries from "./pages/support/MyEnquiries"
import Rating from "./pages/copytrading/Rating"
import CopierArea from "./pages/copytrading/CopierArea"
import MasterArea from "./pages/copytrading/MasterArea"
import TermsConditions from "./pages/copytrading/TermsConditions"
import TradingSignals from "./pages/TradingSignals"

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />

                        {/* Financial Operations */}
                        <Route path="/financial/deposit" element={<Deposit />} />
                        <Route path="/financial/withdrawal" element={<Withdrawal />} />
                        <Route path="/financial/transfer" element={<Transfer />} />
                        <Route path="/financial/history" element={<TransactionHistory />} />

                        {/* My Account */}
                        <Route path="/account/new" element={<OpenNewAccount />} />
                        <Route path="/account/list" element={<AccountList />} />
                        <Route path="/account/trading-contest" element={<TradingContest />} />

                        {/* Trading Platforms */}
                        <Route path="/trading-platforms" element={<TradingPlatforms />} />

                        {/* Refer A Friend */}
                        <Route path="/refer-friend" element={<ReferFriend />} />

                        {/* Partner Zone */}
                        <Route path="/partner/new-account" element={<CreatePartnerAccount />} />
                        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                        <Route path="/partner/multi-level-ib" element={<MultiLevelIB />} />
                        <Route path="/partner/ib-accounts" element={<IBAccounts />} />
                        <Route path="/partner/auto-rebate-report" element={<AutoRebateReport />} />

                        {/* Customer Support */}
                        <Route path="/support/enquiries" element={<MyEnquiries />} />

                        {/* Copy Trading */}
                        <Route path="/copy-trading/rating" element={<Rating />} />
                        <Route path="/copy-trading/copier-area" element={<CopierArea />} />
                        <Route path="/copy-trading/master-area" element={<MasterArea />} />
                        <Route path="/copy-trading/terms" element={<TermsConditions />} />

                        {/* Trading Signals */}
                        <Route path="/trading-signals" element={<TradingSignals />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    )
}

export default App

