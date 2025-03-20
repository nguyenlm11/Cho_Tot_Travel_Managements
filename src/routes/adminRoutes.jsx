import Dashboard from '../pages/admin/Dashboard';
import CustomerManagement from '../pages/admin/CustomerManagement';
import OwnerManagement from '../pages/admin/OwnerManagement';
import PendingHomestay from '../pages/admin/PendingHomestay';
import TransactionHistory from '../pages/admin/TransactionHistory';
import AdminHomestay from '../pages/admin/AdminHomestay';
// ... other admin page imports

export const adminRoutes = [
  {
    path: 'dashboard',
    element: <Dashboard />
  },
  {
    path: 'users/owners',
    element: <OwnerManagement />
  },
  {
    path: 'users/customers',
    element: <CustomerManagement />
  },
  {
    path: "homestays/all",
    element: <AdminHomestay />, // <AdminHomestays />
  },
  {
    path: "homestays/pending",
    element: <PendingHomestay /> // <AdminPendingHomestays />
  },
  {
    path: "revenue/transactions",
    element: <TransactionHistory />, // <AdminRevenue />
  },
]; 