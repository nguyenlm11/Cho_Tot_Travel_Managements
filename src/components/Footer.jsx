import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaHeart, FaGithub, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-6 py-8">
        {/* Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 dark:text-white mb-2"
            >
              <FaHome className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark 
                bg-clip-text text-transparent">
                Homestay Manager
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              Nền tảng quản lý nhà nghỉ chuyên nghiệp dành cho chủ nhà và quản trị viên
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
              <span>© {currentYear} Made with</span>
              <FaHeart className="w-4 h-4 text-red-500" />
              <span>by CTT Team</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-end gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                  text-gray-600 dark:text-gray-400 hover:bg-primary/10 
                  hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary 
                  transition-all duration-200"
              >
                <FaGithub className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                  text-gray-600 dark:text-gray-400 hover:bg-primary/10 
                  hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary 
                  transition-all duration-200"
              >
                <FaFacebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                  text-gray-600 dark:text-gray-400 hover:bg-primary/10 
                  hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary 
                  transition-all duration-200"
              >
                <FaTwitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                  text-gray-600 dark:text-gray-400 hover:bg-primary/10 
                  hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary 
                  transition-all duration-200"
              >
                <FaLinkedin className="w-5 h-5" />
              </motion.a>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/about"
                className="text-gray-600 dark:text-gray-400 hover:text-primary 
                  dark:hover:text-primary transition-colors duration-200"
              >
                Giới thiệu
              </Link>
              <Link
                to="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-primary 
                  dark:hover:text-primary transition-colors duration-200"
              >
                Chính sách
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-primary 
                  dark:hover:text-primary transition-colors duration-200"
              >
                Điều khoản
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 dark:text-gray-400 hover:text-primary 
                  dark:hover:text-primary transition-colors duration-200"
              >
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 