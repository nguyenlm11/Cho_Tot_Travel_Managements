import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { FaBell, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import authService from '../services/api/authAPI';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState([]);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfileMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleMenuItemClick = (callback) => {
    setShowProfileMenu(false);
    if (callback) callback();
  };

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

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
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
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FaUserCircle className="w-full h-full" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {userInfo?.given_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userInfo?.email}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  ref={menuRef}
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl 
                    shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                  <div className="py-1">
                    <Link
                      to="#"
                      onClick={() => handleMenuItemClick()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                        dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                        transition-colors duration-200"
                    >
                      <FaUserCircle className="w-4 h-4" />
                      Hồ sơ
                    </Link>
                    <Link
                      to="#"
                      onClick={() => handleMenuItemClick()}
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
                      onClick={() => handleMenuItemClick(handleLogout)}
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