import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaHome, FaPlus, FaInfoCircle, FaBed, FaCalendarAlt, FaUsers, FaTicketAlt, FaArrowLeft } from 'react-icons/fa';

const OwnerSidebar = ({ selectedHomestay }) => {
  const location = useLocation();

  const defaultMenuItems = [
    {
      title: 'Danh sách nhà nghỉ',
      path: '/owner/homestays',
      icon: <FaHome />
    },
    {
      title: 'Thêm nhà nghỉ',
      path: '/owner/homestays/add',
      icon: <FaPlus />
    }
  ];

  const homestayMenuItems = [
    {
      title: 'Dashboard',
      path: `/owner/homestays/${selectedHomestay}/dashboard`,
      icon: <FaChartLine />
    },
    {
      title: 'Thông tin nhà nghỉ',
      path: `/owner/homestays/${selectedHomestay}/info`,
      icon: <FaInfoCircle />
    },
    {
      title: 'Loại phòng',
      path: `/owner/homestays/${selectedHomestay}/room-types`,
      icon: <FaBed />
    },
    {
      title: 'Dịch vụ',
      path: `/owner/homestays/${selectedHomestay}/services`,
      icon: <FaCalendarAlt />
    },
    {
      title: 'Đặt phòng',
      path: `/owner/homestays/${selectedHomestay}/bookings`,
      icon: <FaCalendarAlt />
    },
    {
      title: 'Khách hàng',
      path: `/owner/homestays/${selectedHomestay}/customers`,
      icon: <FaUsers />
    },
    {
      title: 'Mã giảm giá',
      path: `/owner/homestays/${selectedHomestay}/vouchers`,
      icon: <FaTicketAlt />
    },
    {
      title: 'Quay lại danh sách',
      path: '/owner/homestays',
      icon: <FaArrowLeft />,
      className: 'mt-8 pt-4 border-t border-white/10 dark:border-gray-700'
    }
  ];

  const menuItems = selectedHomestay ? homestayMenuItems : defaultMenuItems;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-72 h-screen bg-primary dark:bg-gray-900 text-white fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <FaHome className="text-3xl text-white dark:text-primary" />
          <h2 className="font-bold text-xl text-white dark:text-primary">
            {selectedHomestay ? 'Quản lý nhà nghỉ' : 'Owner Panel'}
          </h2>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg
                ${item.className || ''}
                ${isActive(item.path)
                  ? 'bg-white dark:bg-primary text-primary dark:text-white font-semibold'
                  : 'text-white/90 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-primary/20'}
                transition-all duration-200 ease-in-out group p-3 px-4`}
            >
              <span className={`text-xl group-hover:scale-110 transition-transform duration-200
                ${isActive(item.path)
                  ? 'text-primary dark:text-white'
                  : 'text-white/90 dark:text-gray-300'}
                ${item.title === 'Quay lại danh sách' ? 'group-hover:-translate-x-1' : ''}`}>
                {item.icon}
              </span>
              <span className="whitespace-nowrap">
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default OwnerSidebar; 