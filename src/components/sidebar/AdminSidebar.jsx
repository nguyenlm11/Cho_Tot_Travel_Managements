import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaUserTie, FaHome, FaClock, FaHotel, FaChartBar, FaChevronDown } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.path);
  };

  const toggleMenu = (index) => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="w-72 h-screen bg-primary dark:bg-gray-900 text-white fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <FaUserTie className="text-3xl text-white dark:text-primary" />
          <h2 className="font-bold text-xl text-white dark:text-primary">
            Admin Panel
          </h2>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={index} className="space-y-1">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(index)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg
                      ${isSubmenuActive(item.submenu)
                        ? 'bg-white/10 dark:bg-gray-700/50 text-primary dark:text-white'
                        : 'text-white/90 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50'}
                      transition-all duration-200 group`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl group-hover:scale-110 transition-transform duration-200
                        ${isSubmenuActive(item.submenu) ? 'text-primary dark:text-white' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <FaChevronDown className={`transition-transform duration-200
                      ${expandedMenus[index] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-200
                    ${expandedMenus[index] ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                    <div className="pl-4 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`flex items-center gap-3 rounded-lg px-4 py-2
                            ${isActive(subItem.path)
                              ? 'bg-white dark:bg-primary text-primary dark:text-white font-semibold'
                              : 'text-white/90 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-primary/20'}
                            transition-all duration-200 ease-in-out group`}
                        >
                          <span className={`text-lg group-hover:scale-110 transition-transform duration-200
                            ${isActive(subItem.path)
                              ? 'text-primary dark:text-white'
                              : 'text-white/90 dark:text-gray-300'}`}>
                            {subItem.icon}
                          </span>
                          <span className="text-sm">{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3
                    ${isActive(item.path)
                      ? 'bg-white dark:bg-primary text-primary dark:text-white font-semibold'
                      : 'text-white/90 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-primary/20'}
                    transition-all duration-200 ease-in-out group`}
                >
                  <span className={`text-xl group-hover:scale-110 transition-transform duration-200
                    ${isActive(item.path)
                      ? 'text-primary dark:text-white'
                      : 'text-white/90 dark:text-gray-300'}`}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;