import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OTPVerification from '../pages/auth/OTPVerification';
import ProtectedRoute from '../components/ProtectedRoute';
import { ownerRoutes } from './ownerRoutes';
import { adminRoutes } from './adminRoutes';

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
    path: '/owner/*',
    element: (
      <ProtectedRoute>
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
      <ProtectedRoute>
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