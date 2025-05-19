// router.tsx
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Layout from "./pages/client/layout/Layout"
import Dashboard from "./pages/client/Dashboard/Dashboard"
import Deposit from "./pages/client/financial/Deposit"
import Withdrawal from "./pages/client/financial/Withdrawal"
import Transfer from "./pages/client/financial/Transfer"
import TransactionHistory from "./pages/client/financial/TransactionHistory"
import OpenNewAccount from "./pages/client/account/OpenNewAccount"
import AccountList from "./pages/client/account/AccountList"
import TradingContest from "./pages/client/account/TradingContest"
import TradingPlatforms from './pages/client/Trading/TradingPlatforms';
import ReferFriend from './pages/client/Refer/ReferFriend';
import CreatePartnerAccount from './pages/client/Partner/CreatePartnerAccount';
import PartnerDashboard from './pages/client/Partner/PartnerDashboard';
import MultiLevelIB from './pages/client/Partner/MultiLevelIB';
import IBAccounts from './pages/client/Partner/IBAccounts';
import AutoRebateReport from './pages/client/Partner/AutoRebateReport';
import Rating from './pages/client/copytrading/Rating';
import CopierArea from './pages/client/copytrading/CopierArea';
import MasterArea from './pages/client/copytrading/MasterArea';
import TermsConditions from './pages/client/copytrading/TermsConditions';
import TradingSignals from './pages/client/trading-signals/TradingSignals';
import SignIn from './pages/auth/sign-in/SignIn';
import SignUp from './pages/auth/sign-in/SignUp';
import ClientPortal from './pages/client/support/app/client/ClientPortal';
import AdminPortal from './pages/admin/support/admin/AdminPortal';
import TicketDetail from './pages/client/support/app/client/ticket.tsx/TicketDetail';
import AdminTicketDetail from './pages/admin/support/admin/ticket/AdminTicketDetail';
import AdminNewTicket from './pages/admin/support/admin/CreateTicket';
import AdminLayout from './pages/admin/layout/Layout';
import AdminDashboard from './pages/admin/features/AdminDashboard';
import ClientsPage from './pages/admin/features/ClientsPage';
import DepositsPage from './pages/admin/features/DepositsPage';
import WithdrawalsPage from './pages/admin/features/WithdrawalsPage';
import TransactionsPage from './pages/admin/features/TrasactionsPage';
import IBPartnersPage from './pages/admin/features/IBPartnersPage';
import ConfigurationPage from './pages/admin/configure/ConfigurePage';
import ProtectedRoute from './ProtectedRoute';
import ResetPassword from './pages/auth/sign-in/components/ResetPassword';
import ProfilePage from './pages/client/layout/profile/ProfilePage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <SignIn />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />
  },
  {
    path: '/signup',
    element: <SignUp />
  },

  // Client routes (protected)
  {
    element: <ProtectedRoute allowedRoles={['client']} />,
    children: [
      {
        path: '/client',
        element: <Layout />,
        children: [
          // All client routes as before...
          {
            index: true,
            element: <Dashboard />
          },

          // Profile
          {
            path: 'profile',
            children: [
              {
                path: 'my-profile',
                element: <ProfilePage />
              }
            ]
          },
          // Financial Operations
          {
            path: 'financial',
            children: [
              {
                path: 'deposit',
                element: <Deposit />
              },
              {
                path: 'withdrawal',
                element: <Withdrawal />
              },
              {
                path: 'transfer',
                element: <Transfer />
              },
              {
                path: 'history',
                element: <TransactionHistory />
              }
            ]
          },

          // My Account
          {
            path: 'account',
            children: [
              {
                path: 'new',
                element: <OpenNewAccount />
              },
              {
                path: 'list',
                element: <AccountList />
              },
              {
                path: 'trading-contest',
                element: <TradingContest />
              }
            ]
          },

          // Trading Platforms
          {
            path: 'trading-platforms',
            element: <TradingPlatforms />
          },

          // Refer A Friend
          {
            path: 'refer-friend',
            element: <ReferFriend />
          },

          // Partner Zone
          {
            path: 'partner',
            children: [
              {
                path: 'new-account',
                element: <CreatePartnerAccount />
              },
              {
                path: 'dashboard',
                element: <PartnerDashboard />
              },
              {
                path: 'multi-level-ib',
                element: <MultiLevelIB />
              },
              {
                path: 'ib-accounts',
                element: <IBAccounts />
              },
              {
                path: 'auto-rebate-report',
                element: <AutoRebateReport />
              }
            ]
          },

          // Customer Support
          {
            path: 'support',
            children: [
              {
                path: 'clientportal',
                element: <ClientPortal />
              },
              {
                path: 'ticket/:id',
                element: <TicketDetail />
              },
            ]
          },

          // Copy Trading
          {
            path: 'copy-trading',
            children: [
              {
                path: 'rating',
                element: <Rating />
              },
              {
                path: 'copier-area',
                element: <CopierArea />
              },
              {
                path: 'master-area',
                element: <MasterArea />
              },
              {
                path: 'terms',
                element: <TermsConditions />
              }
            ]
          },

          // Trading Signals
          {
            path: 'trading-signals',
            element: <TradingSignals />
          }
        ]
      }
    ]
  },


  // Admin routes (protected)
  {
    element: <ProtectedRoute allowedRoles={['admin', 'superadmin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          // All admin routes as before...
          {
            index: true,
            element: <AdminDashboard />
          },
          // ...other admin routes
          // Admin Dashboard
          {
            path: 'dashboard',
            children: [
              {
                path: 'clients',
                element: <ClientsPage />
              },
              // Admin should have their own components for these routes
              {
                path: 'deposits',
                element: <DepositsPage />  // Should be AdminDeposit
              },
              {
                path: 'withdrawals',
                element: <WithdrawalsPage />  // Should be AdminWithdrawal
              },
              {
                path: 'transactions',
                element: <TransactionsPage />  // Should be AdminTransactionHistory
              },
              {
                path: 'ib-partners',
                element: <IBPartnersPage />  // Should be AdminPartners
              }
            ]
          },

          // Admin Configure
          {
            path: 'configure',
            element: <ConfigurationPage />
          },

          // Admin Support
          {
            path: 'support',
            children: [
              {
                path: 'portal',
                element: <AdminPortal />
              },
              {
                path: 'ticket/:id',
                element: <AdminTicketDetail />
              },
              {
                path: 'new-ticket',
                element: <AdminNewTicket />
              }
            ]
          }
        ]
      }
    ]
  }

];

export default createBrowserRouter(routes);