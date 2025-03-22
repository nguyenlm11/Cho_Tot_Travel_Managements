import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaHome, FaPlus, FaInfoCircle, FaBed, FaCalendarAlt, FaUsers, FaTicketAlt, FaArrowLeft, FaTag, FaStar, FaChevronDown, FaChevronRight, FaBars } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import homestayAPI from '../../services/api/homestayAPI';

const Sidebar = ({ selectedHomestay, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userHomestays, setUserHomestays] = useState([]);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkHomestayAccess = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo?.AccountID) {
          navigate('/login');
          return;
        }

        // Lấy danh sách homestay của owner
        const response = await homestayAPI.getHomestaysByOwner(userInfo.AccountID);
        if (response.statusCode === 200) {
          const ownerHomestays = response.data.map(h => h.homeStayID.toString());
          setUserHomestays(ownerHomestays);

          if (selectedHomestay && !ownerHomestays.includes(selectedHomestay)) {
            navigate('/owner/homestays');
          }
        }
      } catch (error) {
        navigate('/owner/homestays');
      }
    };

    if (selectedHomestay) {
      checkHomestayAccess();
    }
  }, [selectedHomestay, navigate]);

  // Menu mặc định cho Owner
  const defaultMenuItems = [
    {
      title: 'Quản lý nhà nghỉ',
      icon: <FaHome />,
      path: '/owner/homestays',
    },
    {
      title: 'Thêm nhà nghỉ',
      icon: <FaPlus />,
      path: '/owner/homestays/add',
    },
  ];

  // Menu khi quản lý nhà nghỉ cho Owner
  const homestayMenuItems = [
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
  ];

  const isManagingHomestay =
    location.pathname.match(/^\/(owner)\/homestays\/[^/]+(?!\/add)/) && !location.pathname.includes('/add');
  const menuItems = isManagingHomestay ? homestayMenuItems : defaultMenuItems;

  const isActive = (path) => {
    if (!path) return false;
    if (path === location.pathname) return true;
    if (path.includes('/bookings') && location.pathname.includes('/bookings')) return true;
    return false;
  };

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
    <motion.div
      className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen bg-primary dark:bg-gray-900 
        text-white fixed left-0 top-0 overflow-y-auto transition-all duration-300`}
    >
      <div className={`${isCollapsed ? 'p-4' : 'p-6'}`}>
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8`}>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <FaHome className="text-3xl text-white dark:text-primary" />
                <h2 className="font-bold text-xl text-white dark:text-primary">
                  {!isManagingHomestay ? 'Owner Panel' : 'Quản lý nhà nghỉ'}
                </h2>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FaHome className="text-3xl text-white dark:text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} 
                  px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-primary text-white font-medium'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'}
                  ${item.className || ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={'w-5 h-5 content-center'}>
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
                      ${expandedMenus[index] ? 'rotate-180' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSubmenu(index);
                    }}
                  />
                )}
              </Link>

              {/* Submenu */}
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
                        ${isSubmenuActive(subItem.path)
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

export default Sidebar;