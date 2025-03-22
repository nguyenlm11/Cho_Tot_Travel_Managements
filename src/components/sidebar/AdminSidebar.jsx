import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaUserTie, FaHome, FaClock, FaHotel, FaChartBar, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminSidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null); // Chỉ lưu index của menu đang mở

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: <FaChartLine /> },
    {
      title: 'Quản lý người dùng',
      path: '/admin/users',
      icon: <FaUsers />,
      submenu: [
        { title: 'Chủ nhà', path: '/admin/users/owners', icon: <FaUserTie /> },
        { title: 'Khách hàng', path: '/admin/users/customers', icon: <FaUsers /> },
      ],
    },
    {
      title: 'Quản lý nhà nghỉ',
      path: '/admin/homestays',
      icon: <FaHotel />,
      submenu: [
        { title: 'Tất cả nhà nghỉ', path: '/admin/homestays/all', icon: <FaHome /> },
        { title: 'Chờ phê duyệt', path: '/admin/homestays/pending', icon: <FaClock /> },
      ],
    },
    {
      title: 'Quản lý doanh thu',
      path: '/admin/revenue',
      icon: <FaMoneyBillWave />,
      submenu: [
        { title: 'Lịch sử giao dịch', path: '/admin/revenue/transactions', icon: <FaMoneyBillWave /> },
      ],
    },
  ];

  const toggleSubmenu = (index) => {
    // Nếu menu đã mở thì đóng lại, ngược lại mở menu này và đóng các menu khác
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 288 }} // w-20 = 80px, w-72 = 288px
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-primary dark:bg-gray-900 text-white fixed left-0 top-0 overflow-y-auto"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          {isCollapsed ? (
            <FaUserTie className="text-3xl text-white dark:text-primary" />
          ) : (
            <div className="flex items-center gap-3 w-full">
              <FaUserTie className="text-3xl text-white dark:text-primary" />
              <h2 className="font-bold text-xl text-white dark:text-primary truncate">Admin Panel</h2>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={item.path}>
              <Link
                to={item.path || '#'}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-colors duration-200
                  ${location.pathname === item.path ? 'bg-primary-dark text-white font-medium' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
                onClick={(e) => {
                  if (item.submenu) {
                    e.preventDefault();
                    toggleSubmenu(index);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </div>
                {!isCollapsed && item.submenu && (
                  <FaChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${expandedMenu === index ? 'rotate-180' : ''}`}
                  />
                )}
              </Link>

              {/* Submenu */}
              {!isCollapsed && item.submenu && expandedMenu === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-12 mt-2 space-y-2"
                >
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block py-2 px-4 rounded-lg transition-colors
                        ${location.pathname === subItem.path ? 'bg-primary-dark text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;