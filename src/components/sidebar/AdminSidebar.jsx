import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaUserTie, FaHome, FaClock, FaHotel, FaChartBar, FaChevronDown, FaBars } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <FaChartLine />
    },
    {
      title: 'Quản lý người dùng',
      path: '/admin/users',
      icon: <FaUsers />,
      submenu: [
        {
          title: 'Chủ nhà',
          path: '/admin/users/owners',
          icon: <FaUserTie />
        },
        {
          title: 'Khách hàng',
          path: '/admin/users/customers',
          icon: <FaUsers />
        }
      ]
    },
    {
      title: 'Quản lý nhà nghỉ',
      path: '/admin/homestays',
      icon: <FaHotel />,
      submenu: [
        {
          title: 'Tất cả nhà nghỉ',
          path: '/admin/homestays/all',
          icon: <FaHome />
        },
        {
          title: 'Chờ phê duyệt',
          path: '/admin/homestays/pending',
          icon: <FaClock />
        }
      ]
    },
    {
      title: 'Quản lý doanh thu',
      path: '/admin/revenue',
      icon: <FaMoneyBillWave />,
      submenu: [
        {
          title: 'Thống kê doanh thu',
          path: '/admin/revenue/statistics',
          icon: <FaChartBar />
        },
        {
          title: 'Lịch sử giao dịch',
          path: '/admin/revenue/transactions',
          icon: <FaMoneyBillWave />
        }
      ]
    }
  ];

  return (
    <motion.div
      className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen bg-primary dark:bg-gray-900 
        text-white fixed left-0 top-0 overflow-y-auto transition-all duration-300`}
    >
      <div className={`${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8`}>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <FaUserTie className="text-3xl text-white dark:text-primary" />
                <h2 className="font-bold text-xl text-white dark:text-primary">
                  Admin Panel
                </h2>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FaUserTie className="text-3xl text-white dark:text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={item.path || index}>
              <Link
                to={item.path || '#'}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} 
                  px-4 py-3 rounded-xl transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-primary text-white font-medium'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
                onClick={(e) => {
                  if (item.submenu) {
                    e.preventDefault();
                    setExpandedMenus(prev => ({ ...prev, [index]: !prev[index] }));
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
                    ${location.pathname === item.path ? 'text-primary' : ''}`}>
                    {item.icon}
                  </div>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {!isCollapsed && item.submenu && (
                  <FaChevronDown
                    className={`w-4 h-4 transition-transform duration-200
                      ${expandedMenus[index] ? 'rotate-180' : ''}
                      ${location.pathname === item.path ? 'text-primary' : ''}`}
                  />
                )}
              </Link>

              {!isCollapsed && item.submenu && expandedMenus[index] && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-12 mt-2 space-y-2"
                >
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block py-2 px-4 rounded-lg transition-colors
                        ${location.pathname === subItem.path
                          ? 'bg-primary text-white font-medium'
                          : 'text-white/70 hover:text-white hover:bg-white/10'}`}
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