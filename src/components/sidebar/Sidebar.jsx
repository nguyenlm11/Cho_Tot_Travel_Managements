import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import OwnerSidebar from './OwnerSidebar';

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const path = location.pathname;

  // Kiểm tra xem user đang ở trang admin hay owner
  const isAdmin = path.startsWith('/admin');

  // Kiểm tra xem owner đã chọn homestay chưa
  const getSelectedHomestay = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.role === 'Staff') {
      return userInfo?.homeStayID;
    }

    if (!path.startsWith('/owner/homestays/')) return null;
    const matches = path.match(/\/owner\/homestays\/([^/]+)/);
    return matches ? matches[1] : null;
  };

  return (
    <>
      {isAdmin ? (
        <AdminSidebar isCollapsed={isCollapsed} />
      ) : (
        <OwnerSidebar
          selectedHomestay={getSelectedHomestay()}
          isCollapsed={isCollapsed}
        />
      )}
    </>
  );
};

export default Sidebar; 