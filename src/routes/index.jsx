import React from 'react';
import { Routes } from 'react-router-dom';
import adminRoutesElements from './admin.routes';
import ownerRoutesElements from './owner.routes';

const AppRoutes = () => {
  return (
    <Routes>
      {adminRoutesElements}
      {ownerRoutesElements}
    </Routes>
  );
};

export { adminRoutes } from './admin.routes';
export { ownerRoutes } from './owner.routes';
export default AppRoutes; 