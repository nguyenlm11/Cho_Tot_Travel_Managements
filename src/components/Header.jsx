import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { FaBell, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import authService from '../services/api/authAPI';


const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState([]);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b 
      border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Page Title */}
        <div className="flex items-center gap-2">
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                transition-colors relative"
            >
              <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-dark 
                flex items-center justify-center text-white overflow-hidden">
                <FaUserCircle className="w-full h-full" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {userInfo.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userInfo.email}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl 
                    shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                        dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                        transition-colors duration-200"
                    >
                      <FaUserCircle className="w-4 h-4" />
                      Hồ sơ
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                        dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                        transition-colors duration-200"
                    >
                      <FaCog className="w-4 h-4" />
                      Cài đặt
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                    <button
                      onClick={() => handleLogout()}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 
                        hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 