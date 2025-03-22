import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaHome, FaPlus, FaInfoCircle, FaBed, FaCalendarAlt, FaUsers, FaTicketAlt, FaArrowLeft, FaTag, FaStar, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import homestayAPI from '../../services/api/homestayAPI';

const OwnerSidebar = ({ selectedHomestay, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null); // Chỉ lưu index của menu đang mở
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

        const response = await homestayAPI.getHomestaysByOwner(userInfo.AccountID);
        if (response.statusCode === 200) {
          const ownerHomestays = response.data.map(h => h.homeStayID.toString());
          setUserHomestays(ownerHomestays);

          if (selectedHomestay &&
            !ownerHomestays.includes(selectedHomestay) &&
            !location.pathname.endsWith('/add')) {
            navigate('/owner/homestays');
          }
        }
      } catch (error) {
        if (!location.pathname.endsWith('/add')) {
          // navigate('/owner/homestays');
        }
      }
    };

    const isManagingHomestay = location.pathname.match(/^\/owner\/homestays\/[^/]+(?!\/add)/);
    if (selectedHomestay && isManagingHomestay) {
      checkHomestayAccess();
    }
  }, [selectedHomestay, navigate, location.pathname]);

  // Menu mặc định cho Owner
  const defaultMenuItems = [
    { title: 'Quản lý nhà nghỉ', icon: <FaHome />, path: '/owner/homestays' },
    { title: 'Thêm nhà nghỉ', icon: <FaPlus />, path: '/owner/homestays/add' },
  ];

  // Menu khi quản lý nhà nghỉ
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

  const isSubmenuActive = (path) => location.pathname === path;

  const toggleSubmenu = (index) => {
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
            <FaHome className="text-3xl text-white dark:text-primary" />
          ) : (
            <div className="flex items-center gap-3 w-full">
              <FaHome className="text-3xl text-white dark:text-primary" />
              <h2 className="font-bold text-xl text-white dark:text-primary truncate">
                {!isManagingHomestay ? 'Owner Panel' : 'Quản lý nhà nghỉ'}
              </h2>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-colors duration-200
                  ${isActive(item.path) ? 'bg-primary-dark text-white font-medium' : 'hover:bg-white/10 text-white/80 hover:text-white'}
                  ${item.className || ''}`}
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
                        ${isSubmenuActive(subItem.path) ? 'bg-primary-dark text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
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

export default OwnerSidebar;