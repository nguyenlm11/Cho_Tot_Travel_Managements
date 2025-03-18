import React from 'react';
import { Route, Routes } from 'react-router-dom';
import adminRoutesElements from './admin.routes';
import ownerRoutesElements from './owner.routes';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      {adminRoutesElements}
      {ownerRoutesElements}
    </Routes>
  );
};

export { adminRoutes } from './admin.routes';
export { ownerRoutes } from './owner.routes';
export default AppRoutes; 