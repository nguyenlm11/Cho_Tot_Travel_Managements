import React from 'react';
import { Route } from 'react-router-dom';

// Import admin components
import AdminDashboard from '../pages/admin/Dashboard';
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
    element: null, // <AdminCustomers />
  },
  {
    path: "/admin/users/owners",
    element: null, // <AdminOwners />
  },
  {
    path: "/admin/homestays/all",
    element: null, // <AdminHomestays />
  },
  {
    path: "/admin/homestays/pending",
    element: null, // <AdminPendingHomestays />
  },
  {
    path: "/admin/revenue",
    element: null, // <AdminRevenue />
  },
];

const adminRoutesElements = adminRoutes.map((route) => (
  <Route key={route.path} path={route.path} element={route.element} />
));

export default adminRoutesElements; 