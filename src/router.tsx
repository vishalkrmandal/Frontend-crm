// router.tsx - Updated with referral signup routes
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
import IBDashboard from './pages/client/Partner/IBDashboard';
import IBAccounts from './pages/client/Partner/IBAccounts';
import AutoRebateReport from './pages/client/Partner/AutoRebateReport';
import TicketDetail from './pages/client/support/app/client/ticket/TicketDetail';
import ClientPortal from './pages/client/support/app/client/ClientPortal';
import ProfilePage from './pages/client/layout/profile/ProfilePage';
import IBWithdrawal from './pages/client/Partner/IBWithdrawal';
import TradeCommission from './pages/client/Partner/TradeCommission';
import PartnerSummary from './pages/client/Partner/Commission/PartnerSummary';
import AgentLayout from './pages/agent/layout/Layout';

// import Rating from './pages/client/copytrading/Rating';
// import CopierArea from './pages/client/copytrading/CopierArea';
// import MasterArea from './pages/client/copytrading/MasterArea';
// import TermsConditions from './pages/client/copytrading/TermsConditions';
// import TradingSignals from './pages/client/trading-signals/TradingSignals';

import AdminPortal from './pages/admin/support/admin/AdminPortal';
import AdminTicketDetail from './pages/admin/support/admin/ticket/AdminTicketDetail';
import AdminNewTicket from './pages/admin/support/admin/CreateTicket';
import AdminClientDetail from './pages/admin/support/admin/ticket/ClientDetail';
import AdminLayout from './pages/admin/layout/Layout';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import ClientsPage from './pages/admin/features/ClientsPage';
import DepositsPage from './pages/admin/features/DepositsPage';
import WithdrawalsPage from './pages/admin/features/WithdrawalsPage';
import TransactionsPage from './pages/admin/features/TransactionsPage';
import IBPartnersPage from './pages/admin/Ibpartner/IBPartnersPage';
import ConfigurationPage from './pages/admin/configure/ConfigurePage';
import ClientTickets from './pages/admin/support/admin/ticket/ClientTickets';
import IBWithdrawalManagement from './pages/admin/Ibpartner/IBWithdrawalManagement';
import SignIn from './pages/auth/sign-in/SignIn';
import SignUp from './pages/auth/sign-in/SignUp';
import ReferralRouteHandler from './pages/auth/sign-in/ReferralRouteHandler';
import ResetPassword from './pages/auth/sign-in/components/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import { Navigate } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <SignIn />
  },
  {
    path: '/login',
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
  {
    path: '/signup/:referralCode',
    element: <ReferralRouteHandler />
  },

  // Client routes (protected)
  {
    element: <ProtectedRoute allowedRoles={['client']} />,
    children: [
      {
        path: '/client',
        element: <Layout />,
        children: [
          // FIXED: Add explicit redirect from /client to /client/dashboard
          {
            index: true,
            element: <Navigate to="/client/dashboard" replace />
          },

          // FIXED: Add explicit dashboard route
          {
            path: 'dashboard',
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

          // Partner Zone - UPDATED ROUTES
          {
            path: 'partner',
            children: [
              {
                path: 'new-account',
                element: <CreatePartnerAccount />
              },
              {
                path: 'dashboard',
                element: <IBDashboard />
              },
              {
                path: 'ib-withdrawal',
                element: <IBWithdrawal />
              },
              {
                path: 'ib-commission',
                element: <TradeCommission />
              },
              {
                path: 'summary',
                element: <PartnerSummary />
              },
              {
                path: 'ib-commission/:partnerId',
                element: <TradeCommission />
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
          // {
          //   path: 'copy-trading',
          //   children: [
          //     {
          //       path: 'rating',
          //       element: <Rating />
          //     },
          //     {
          //       path: 'copier-area',
          //       element: <CopierArea />
          //     },
          //     {
          //       path: 'master-area',
          //       element: <MasterArea />
          //     },
          //     {
          //       path: 'terms',
          //       element: <TermsConditions />
          //     }
          //   ]
          // },

          // Trading Signals
          // {
          //   path: 'trading-signals',
          //   element: <TradingSignals />
          // }
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
          // FIXED: Add explicit redirect from /admin to /admin/dashboard  
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />
          },

          // FIXED: Add explicit admin dashboard route
          {
            path: 'dashboard',
            element: <AdminDashboard />
          },

          // Admin Features
          {
            path: 'features',
            children: [
              {
                path: 'clients',
                element: <ClientsPage />
              },
              {
                path: 'deposits',
                element: <DepositsPage />
              },
              {
                path: 'withdrawals',
                element: <WithdrawalsPage />
              },
              {
                path: 'transactions',
                element: <TransactionsPage />
              }
            ]
          },
          {
            path: 'partner',
            children: [
              {
                path: 'ib-partners',
                element: <IBPartnersPage />
              },
              {
                path: 'ib-withdrawals',
                element: <IBWithdrawalManagement />
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
              },
              {
                path: 'client/:id',
                element: <AdminClientDetail />
              },
              {
                path: 'client/:id/tickets',
                element: <ClientTickets />
              }
            ]
          }
        ]
      }
    ]
  },

  // Agent routes (protected)
  {
    element: <ProtectedRoute allowedRoles={['agent', 'admin', 'superadmin']} />,
    children: [
      {
        path: '/agent',
        element: <AgentLayout />,
        children: [
          // FIXED: Add explicit redirect from /agent to /agent/dashboard
          {
            index: true,
            element: <Navigate to="/agent/dashboard" replace />
          },

          // FIXED: Add explicit agent dashboard route
          {
            path: 'dashboard',
            element: <AdminPortal />
          },

          // Agent Support
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
              },
              {
                path: 'client/:id',
                element: <AdminClientDetail />
              },
              {
                path: 'client/:id/tickets',
                element: <ClientTickets />
              }
            ]
          }
        ]
      }
    ]
  }
];

export default createBrowserRouter(routes);