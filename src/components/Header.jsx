import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { isDarkMode } = useTheme();

  return (
    <header className="h-16 transition-colors duration-200
      dark:bg-dark-surface bg-light-surface
      dark:text-dark-text-primary text-light-text-primary
      shadow-md flex items-center px-6 justify-between"
    >
      <div className="flex items-center space-x-4">
        {/* Add other header content here */}
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">
          Action
        </button>
        <div className="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-600"></div>
      </div>
    </header>
  );
};

export default Header; 