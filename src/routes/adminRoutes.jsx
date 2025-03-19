import Dashboard from '../pages/admin/Dashboard';
import CustomerManagement from '../pages/admin/CustomerManagement';
import OwnerManagement from '../pages/admin/OwnerManagement';
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
]; 