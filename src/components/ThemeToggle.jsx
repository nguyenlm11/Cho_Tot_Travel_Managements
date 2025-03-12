import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-200
        dark:bg-dark-surface bg-light-surface
        dark:text-dark-text-primary text-light-text-primary
        hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle; 