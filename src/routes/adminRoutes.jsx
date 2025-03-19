import Dashboard from '../pages/admin/Dashboard';
import CustomerManagement from '../pages/admin/CustomerManagement';
// ... other admin page imports

export const adminRoutes = [
  {
    path: 'dashboard',
    element: <Dashboard />
  },
  {
    path: 'users/owners',
    element: <CustomerManagement />
  },
  {
    path: 'users/customers',
    element: <CustomerManagement />
  },
]; 