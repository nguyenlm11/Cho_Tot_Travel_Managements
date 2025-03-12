import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartLine, 
  FaUsers, 
  FaHouseUser, 
  FaMoneyBillWave,
  FaChevronDown,
  FaUserFriends,
  FaHome,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 256 && newWidth <= 384) { // Min: 64*4, Max: 96*4
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setSidebarWidth(isCollapsed ? 288 : 80); // 288px khi mở, 80px khi thu gọn
  };

  const renderNavigation = ({ isCollapsed }) => (
    <nav className="space-y-2">
      {menuItems.map((item, index) => (
        <div key={index} className="group">
          <div
            className={`flex items-center justify-between rounded-lg cursor-pointer
              ${isActive(item.path) 
                ? 'bg-white dark:bg-primary text-primary dark:text-white font-semibold' 
                : 'text-white/90 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-primary/20'}
              transition-all duration-200 ease-in-out
              ${isCollapsed ? 'p-3 justify-center' : 'p-3 px-4'}`}
            onClick={() => !isCollapsed && item.submenu && toggleMenu(item.title)}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl group-hover:scale-110 transition-transform duration-200
                ${isActive(item.path) 
                  ? 'text-primary dark:text-white' 
                  : 'text-white/90 dark:text-gray-300'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-opacity duration-200">
                  {item.title}
                </span>
              )}
            </div>

            {!isCollapsed && item.submenu && (
              <FaChevronDown
                className={`text-sm transition-transform duration-200
                  ${expandedMenus[item.title] ? 'rotate-180' : ''}`}
              />
            )}
          </div>

          {/* Submenu with Tooltip for Collapsed State */}
          {!isCollapsed && item.submenu && expandedMenus[item.title] && (
            <div className="overflow-hidden transition-all duration-200 ease-in-out">
              {item.submenu.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  to={subItem.path}
                  className={`flex items-center gap-3 p-3 pl-12 rounded-lg my-1
                    ${isActive(subItem.path)
                      ? 'bg-white/20 dark:bg-primary/30 font-medium'
                      : 'text-white/80 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-primary/10'}
                    transition-all duration-200`}
                >
                  <span className="text-lg">{subItem.icon}</span>
                  <span className="text-sm">{subItem.title}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Tooltip for Collapsed State */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 pl-1 hidden group-hover:block">
              <div className="bg-gray-800 text-white text-sm py-2 px-4 rounded-md shadow-lg">
                {item.title}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div 
        className={`h-screen fixed left-0 top-0 z-50 
        transition-all duration-300 ease-in-out
        bg-primary dark:bg-gray-900 text-white
        ${isCollapsed ? 'w-20' : ''}`}
        style={{ width: isCollapsed ? '80px' : `${sidebarWidth}px` }}
      >
        {/* Toggle Collapse Button */}
        <button 
          onClick={toggleCollapse}
          className="absolute -right-4 top-6 bg-white dark:bg-gray-800 text-primary p-2 rounded-full 
          shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {isCollapsed ? (
            <FaAngleDoubleRight className="w-4 h-4" />
          ) : (
            <FaAngleDoubleLeft className="w-4 h-4" />
          )}
        </button>

        {/* Resize Handle */}
        <div
          className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100
          bg-primary/20 dark:bg-gray-700/20 transition-opacity duration-200"
          onMouseDown={handleMouseDown}
        />

        <div className="p-6">
          {/* Header */}
          <div className={`flex items-center gap-3 mb-8 
            ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <FaHome className="text-3xl text-white dark:text-primary" />
            <h2 className={`font-bold text-xl text-white dark:text-primary transition-opacity duration-200
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Admin Panel
            </h2>
          </div>

          {/* Navigation */}
          {renderNavigation({ isCollapsed })}
        </div>
      </div>

      {/* Overlay when resizing */}
      {isResizing && (
        <div className="fixed inset-0 z-40 bg-black/20 cursor-ew-resize" />
      )}
    </>
  );
};

export default AdminSidebar;