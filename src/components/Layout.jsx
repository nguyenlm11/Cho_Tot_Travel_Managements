import React from 'react';
import Sidebar from './sidebar/Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-200
      ${isDarkMode ? 'dark' : ''}
      dark:bg-dark-background bg-light-background
      flex relative`}
    >
      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 h-screen z-30
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed z-40 top-[4.5rem] 
          ${isCollapsed ? 'left-16' : 'left-[17rem]'}
          w-8 h-8 rounded-full
          bg-white dark:bg-gray-800
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          group`}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          className="text-primary dark:text-white"
        >
          {isCollapsed ? (
            <FaChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          ) : (
            <FaChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </motion.div>
      </button>

      {/* Main Content */}
      <motion.div
        layout
        className="min-h-screen flex-1"
        animate={{
          marginLeft: isCollapsed ? '5rem' : '18rem',
        }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 
          shadow-sm border-b border-gray-200 dark:border-gray-700">
          <Header />
        </div>

        {/* Main Content */}
        <main className="p-6 relative z-10
          min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))]
          dark:text-dark-text-primary text-light-text-primary">
          {children}
        </main>

        {/* Footer */}
        <div className="relative z-20 bg-white dark:bg-gray-800 
          border-t border-gray-200 dark:border-gray-700">
          <Footer />
        </div>
      </motion.div>
    </div>
  );
};

export default Layout; 