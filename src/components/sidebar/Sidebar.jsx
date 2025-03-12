import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import OwnerSidebar from './OwnerSidebar';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Kiểm tra xem user đang ở trang admin hay owner
  const isAdmin = path.startsWith('/admin');
  
  // Kiểm tra xem owner đã chọn homestay chưa
  const getSelectedHomestay = () => {
    if (!path.startsWith('/owner/homestays/')) return null;
    const matches = path.match(/\/owner\/homestays\/([^/]+)/);
    return matches ? matches[1] : null;
  };

  return (
    <>
      {isAdmin ? (
        <AdminSidebar />
      ) : (
        <OwnerSidebar selectedHomestay={getSelectedHomestay()} />
      )}
    </>
  );
};

export default Sidebar; 