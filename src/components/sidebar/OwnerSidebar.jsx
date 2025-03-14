import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaHome, FaPlus, FaInfoCircle, FaBed, FaCalendarAlt, FaUsers, FaTicketAlt, FaArrowLeft, FaTag, FaStar, FaChevronDown } from 'react-icons/fa';

const Sidebar = ({ selectedHomestay, role = 'owner' }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Menu mặc định cho Owner
  const defaultMenuItems = [
    {
      title: 'Quản lý nhà nghỉ',
      icon: <FaHome />,
      submenu: [
        { title: 'Tất cả nhà nghỉ', path: '/owner/homestays' },
        { title: 'Thêm nhà nghỉ', path: '/owner/homestays/add' },
      ],
    },
    {
      title: 'Quản lý nhân viên',
      icon: <FaUsers />,
      submenu: [
        { title: 'Tất cả nhân viên', path: '/owner/staff' },
        { title: 'Thêm nhân viên', path: '/owner/staff/add' },
      ],
    },
  ];

  // Menu khi quản lý nhà nghỉ
  const homestayMenuItems = {
    owner: [
      { title: 'Dashboard', path: `/owner/homestays/${selectedHomestay}/dashboard`, icon: <FaChartLine /> },
      { title: 'Thông tin nhà nghỉ', path: `/owner/homestays/${selectedHomestay}/info`, icon: <FaInfoCircle /> },
      { title: 'Loại phòng', path: `/owner/homestays/${selectedHomestay}/room-types`, icon: <FaBed /> },
      { title: 'Dịch vụ', path: `/owner/homestays/${selectedHomestay}/services`, icon: <FaTag /> },
      {
        title: 'Đặt phòng',
        path: `/owner/homestays/${selectedHomestay}/bookings`,
        icon: <FaCalendarAlt />,
        submenu: [
          { title: 'Tất cả đặt phòng', path: `/owner/homestays/${selectedHomestay}/bookings` },
          { title: 'Chờ xác nhận', path: `/owner/homestays/${selectedHomestay}/bookings/pending` },
        ],
      },
      { title: 'Khách hàng', path: `/owner/homestays/${selectedHomestay}/customers`, icon: <FaUsers /> },
      { title: 'Mã giảm giá', path: `/owner/homestays/${selectedHomestay}/vouchers`, icon: <FaTicketAlt /> },
      { title: 'Đánh giá', path: `/owner/homestays/${selectedHomestay}/ratings`, icon: <FaStar /> },
      { title: 'Quay lại danh sách', path: '/owner/homestays', icon: <FaArrowLeft />, className: 'mt-8 pt-4 border-t border-white/10 dark:border-gray-700' },
    ],
    staff: [
      { title: 'Dashboard', path: `/staff/homestays/${selectedHomestay}/dashboard`, icon: <FaChartLine /> },
      { title: 'Thông tin nhà nghỉ', path: `/staff/homestays/${selectedHomestay}/info`, icon: <FaInfoCircle /> },
      { title: 'Đặt phòng', path: `/staff/homestays/${selectedHomestay}/bookings`, icon: <FaCalendarAlt /> },
      { title: 'Nhiệm vụ', path: `/staff/homestays/${selectedHomestay}/tasks`, icon: <FaUsers /> },
    ],
  };

  const isManagingHomestay =
    location.pathname.match(/^\/(owner|staff)\/homestays\/[^/]+(?!\/add)/) && !location.pathname.includes('/add');
  const menuItems = role === 'staff' || (role === 'owner' && isManagingHomestay)
    ? homestayMenuItems[role]
    : defaultMenuItems;

  const isActive = (path) => {
    // Nếu path không tồn tại (undefined), trả về false
    if (!path) return false;
    if (path === location.pathname) return true;
    if (path.includes('/bookings') && location.pathname.includes('/bookings')) return true;
    return false;
  };

  // Kiểm tra submenu active
  const isSubmenuActive = (path) => {
    return location.pathname === path;
  };

  const toggleSubmenu = (index) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="w-72 h-screen bg-primary dark:bg-gray-900 text-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <FaHome className="text-3xl text-white dark:text-primary" />
          <h2 className="font-bold text-xl text-white dark:text-primary">
            {role === 'owner' && !isManagingHomestay ? 'Owner Panel' : 'Quản lý nhà nghỉ'}
          </h2>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <div className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg
                      ${item.className || ''}
                      ${isActive(item.path)
                        ? 'bg-white dark:bg-primary text-primary dark:text-white font-semibold'
                        : 'text-white/90 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-primary/20'}
                      transition-all duration-200 ease-in-out group p-3 px-4`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xl group-hover:scale-110 transition-transform duration-200
                          ${isActive(item.path)
                            ? 'text-primary dark:text-white'
                            : 'text-white/90 dark:text-gray-300'}`}
                      >
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap">{item.title}</span>
                    </div>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${expandedMenus[index] ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${expandedMenus[index] ? 'max-h-48' : 'max-h-0'
                      }`}
                  >
                    {item.submenu.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className={`flex items-center pl-12 py-2 rounded-lg
                          ${isSubmenuActive(subItem.path)
                            ? 'bg-white/10 dark:bg-primary/10 text-white font-semibold'
                            : 'text-white/80 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-primary/5'}
                          transition-all duration-200`}
                      >
                        <span className="whitespace-nowrap">{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg
                    ${item.className || ''}
                    ${isActive(item.path)
                      ? 'bg-white dark:bg-primary text-primary dark:text-white font-semibold'
                      : 'text-white/90 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-primary/20'}
                    transition-all duration-200 ease-in-out group p-3 px-4`}
                >
                  <span
                    className={`text-xl group-hover:scale-110 transition-transform duration-200
                      ${isActive(item.path)
                        ? 'text-primary dark:text-white'
                        : 'text-white/90 dark:text-gray-300'}
                      ${item.title === 'Quay lại danh sách' ? 'group-hover:-translate-x-1' : ''}`}
                  >
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;