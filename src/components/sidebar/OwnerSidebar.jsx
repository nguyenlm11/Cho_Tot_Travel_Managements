import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaHome, FaPlus, FaInfoCircle, FaBed, FaCalendarAlt, FaUsers, FaTicketAlt, FaArrowLeft, FaTag, FaStar, FaChevronDown, FaChalkboardTeacher, FaComment } from 'react-icons/fa';
import { motion } from 'framer-motion';
import homestayAPI from '../../services/api/homestayAPI';

const OwnerSidebar = ({ selectedHomestay, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [userHomestays, setUserHomestays] = useState([]);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  useEffect(() => {
    const checkHomestayAccess = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo?.AccountID) {
          navigate('/login');
          return;
        }

        if (userInfo?.role === 'Staff') {
          setUserHomestays([userInfo?.homeStayID]);
        }

        if (userInfo?.role === 'Owner') {
          const response = await homestayAPI.getHomestaysByOwner(userInfo.AccountID);
          if (response.statusCode === 200) {
            const ownerHomestays = response.data.map(h => h.homeStayID.toString());
            setUserHomestays(ownerHomestays);

            const isManagingHomestay = location.pathname.match(/^\/owner\/homestays\/[^/]+(?!\/add)/);
            const isManagingRental = location.pathname.includes('/rentals/');
            const isManagingRoomType = location.pathname.includes('/room-types/');
            const isAddingHomestay = location.pathname.endsWith('/add');

            if (selectedHomestay && !ownerHomestays.includes(selectedHomestay)) {
              if (!isAddingHomestay) {
                navigate('/owner/homestays');
              }
            } else if (isManagingHomestay || isManagingRental || isManagingRoomType) {
              if (!selectedHomestay || !ownerHomestays.includes(selectedHomestay)) {
                navigate('/owner/homestays');
              }
            }
          } else {
            navigate('/owner/homestays');
          }
        }
      } catch (error) {
        console.error('Error checking homestay access:', error);
        if (!location.pathname.endsWith('/add')) {
          navigate('/owner/homestays');
        }
      }
    };

    checkHomestayAccess();
  }, [selectedHomestay, location.pathname, navigate]);

  const defaultMenuItems = [
    { title: 'Quản lý nhà nghỉ', icon: <FaHome />, path: '/owner/homestays' },
    { title: 'Quản lý nhân viên', icon: <FaUsers />, path: '/owner/staffs' },
    { title: 'Thêm nhà nghỉ', icon: <FaPlus />, path: '/owner/homestays/add' },
  ];

  const homestayMenuItems = [
    { title: 'Dashboard', path: `/owner/homestays/${selectedHomestay}/dashboard`, icon: <FaChartLine /> },
    { title: 'Thông tin nhà nghỉ', path: `/owner/homestays/${selectedHomestay}/info`, icon: <FaInfoCircle /> },
    {
      title: 'Quản lý căn',
      path: `/owner/homestays/${selectedHomestay}/room-types`,
      icon: <FaBed />,
      submenu: [
        { title: 'Tất cả căn', path: `/owner/homestays/${selectedHomestay}/homestay-rental` },
        // { title: 'Thêm căn', path: `/owner/homestays/${selectedHomestay}/create-homestay-rental` },
        ...(user?.role !== 'Staff' ? [{ title: 'Thêm căn', path: `/owner/homestays/${selectedHomestay}/create-homestay-rental` }] : []),
      ],
    },
    { title: 'Dịch vụ', path: `/owner/homestays/${selectedHomestay}/services`, icon: <FaTag /> },
    {
      title: 'Đặt phòng',
      path: `/owner/homestays/${selectedHomestay}/bookings`,
      icon: <FaCalendarAlt />,
      submenu: [
        { title: 'Đặt phòng nghỉ', path: `/owner/homestays/${selectedHomestay}/bookings` },
        { title: 'Đặt dịch vụ bổ sung', path: `/owner/homestays/${selectedHomestay}/service-bookings` },
        { title: 'Danh sách phòng thuê', path: `/owner/homestays/${selectedHomestay}/room-bookings` }
      ]
    },
    { title: 'Báo cáo doanh thu', path: `/owner/homestays/${selectedHomestay}/reports`, icon: <FaChartLine /> },
    { title: 'Khách hàng', path: `/owner/homestays/${selectedHomestay}/customers`, icon: <FaUsers /> },
    // { title: 'Mã giảm giá', path: `/owner/homestays/${selectedHomestay}/vouchers`, icon: <FaTicketAlt /> },
    { title: 'Trò chuyện', path: `/owner/homestays/${selectedHomestay}/chat`, icon: <FaComment /> },
    { title: 'Đánh giá', path: `/owner/homestays/${selectedHomestay}/ratings`, icon: <FaStar /> },
    ...(user?.role !== "Staff" ? [{ title: 'Quay lại danh sách', path: '/owner/homestays', icon: <FaArrowLeft />, className: 'mt-8 pt-4 border-t border-white/10 dark:border-gray-700' }] : []),
  ];

  const isManagingHomestay = useMemo(() => {
    return location.pathname.match(/^\/(owner)\/homestays\/[^/]+(?!\/add)/) &&
      !location.pathname.includes('/add') &&
      userHomestays.includes(selectedHomestay);
  }, [location.pathname, selectedHomestay, userHomestays]);

  const menuItems = useMemo(() => {
    return isManagingHomestay ? homestayMenuItems : defaultMenuItems;
  }, [isManagingHomestay]);

  const isActive = (path) => {
    if (!path) return false;
    if (path === location.pathname) return true;
    if (path.includes('/bookings') && location.pathname.includes('/bookings')) return true;
    if (path.includes('/room-types') && location.pathname.includes('/room-types')) return true;
    if (path.includes('/create-homestay-rental') && location.pathname.includes('/create-homestay-rental')) return true;
    return false;
  };

  const isSubmenuActive = (path) => location.pathname === path;

  const toggleSubmenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-primary dark:bg-gray-900 text-white fixed left-0 top-0"
    >
      <div className="p-4">
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