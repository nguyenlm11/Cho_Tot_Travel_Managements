import React from 'react';
import { Route, Routes } from 'react-router-dom';
import adminRoutesElements from './admin.routes';
import ownerRoutesElements from './owner.routes';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OTPVerification from '../pages/auth/OTPVerification';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/otp-verification' element={<OTPVerification />} />
      {adminRoutesElements}
      {ownerRoutesElements}
    </Routes>
  );
};

export { adminRoutes } from './admin.routes';
export { ownerRoutes } from './owner.routes';
export default AppRoutes; 