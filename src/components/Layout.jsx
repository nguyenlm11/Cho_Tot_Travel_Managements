import React from 'react';
import Sidebar from './sidebar/Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200
      ${isDarkMode ? 'dark' : ''}
      dark:bg-dark-background bg-light-background`}
    >
      <Sidebar />
      <div className="flex-1 ml-72">
        <Header />
        <main className="p-6 min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))]
          dark:text-dark-text-primary text-light-text-primary">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout; 