import React from 'react';
import { Route } from 'react-router-dom';

// Import admin components
import AdminDashboard from '../pages/admin/Dashboard';
import CustomerManagement from '../pages/admin/CustomerManagement';
import PendingHomestay from '../pages/admin/PendingHomestay';
import OwnerManagement from '../pages/admin/OwnerManagement';
import TransactionHistory from '../pages/admin/TransactionHistory';
// import AdminCustomers from '../pages/admin/Customers';
// import AdminOwners from '../pages/admin/Owners';
// import AdminHomestays from '../pages/admin/Homestays';
// import AdminPendingHomestays from '../pages/admin/PendingHomestays';
// import AdminRevenue from '../pages/admin/Revenue';

export const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />
  },
  {
    path: "/admin/users/customers",
    element: <CustomerManagement />
  },
  {
    path: "/admin/users/owners",
    element: <OwnerManagement />, // <AdminOwners />
  },
  {
    path: "/admin/homestays/all",
    element: null, // <AdminHomestays />
  },
  {
    path: "/admin/homestays/pending",
    element: <PendingHomestay /> // <AdminPendingHomestays />
  },
  {
    path: "/admin/revenue/transactions",
    element: <TransactionHistory />, // <AdminRevenue />
  },
];

const adminRoutesElements = adminRoutes.map((route) => (
  <Route key={route.path} path={route.path} element={route.element} />
));

export default adminRoutesElements; 