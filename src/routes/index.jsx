import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OTPVerification from '../pages/auth/OTPVerification';
import ProtectedRoute from '../components/ProtectedRoute';
import { ownerRoutes } from './ownerRoutes';
import { adminRoutes } from './adminRoutes';
import PaymentCallback from '../pages/vnpay/PaymentCallback';

export const routes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/verify-otp',
    element: <OTPVerification />
  },
  {
    path: '/paymentsuccess',
    element: <PaymentCallback />
  },
  {
    path: '/api/booking-checkout/BookingPayment',
    element: <PaymentCallback />
  },
  {
    path: '/owner/*',
    element: (
      <ProtectedRoute role={["Owner", "Staff"]}>
        <Layout>
          <Routes>
            {ownerRoutes.map((route) => (
              <Route key={route.path} {...route} />
            ))}
          </Routes>
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute role={["Admin"]}>
        <Layout>
          <Routes>
            {adminRoutes.map((route) => (
              <Route key={route.path} {...route} />
            ))}
          </Routes>
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
];

const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default AppRoutes; 