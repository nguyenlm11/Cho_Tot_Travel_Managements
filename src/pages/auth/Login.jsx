import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaGoogle, FaFacebook, FaApple, FaHome, FaUser } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import authService from '../../services/api/authAPI';
import { API_CONFIG } from '../../services/config';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);

    // Kiểm tra nếu đã đăng nhập thì redirect
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo?.role?.includes('Admin')) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/owner/homestays', { replace: true });
            }
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'remember' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { user } = await authService.login(formData.username, formData.password);
            toast.success('Đăng nhập thành công!', API_CONFIG.TOAST_CONFIG.SUCCESS);

            if (user.role.includes('Admin')) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/owner/homestays', { replace: true });
            }
        } catch (error) {
            toast.error(
                error?.message || 'Email hoặc mật khẩu không chính xác!',
                API_CONFIG.TOAST_CONFIG.ERROR
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <Toaster />
            {/* Left Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image với Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f"
                        alt="Luxury Homestay"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/90" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-12 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-6xl font-bold text-white mb-6">
                            Homestay<br />Manager
                        </h1>
                        <p className="text-white/80 text-lg">
                            Nền tảng quản lý nhà nghỉ chuyên nghiệp dành cho chủ nhà và quản trị viên
                        </p>
                    </motion.div>
                </div>

                {/* Additional Decorative Elements */}
                <div className="absolute top-0 right-0 z-10">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                        <path
                            d="M200 0L200 200L0 200"
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="40"
                        />
                    </svg>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
                                <FaHome className="w-8 h-8 text-primary" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark 
                bg-clip-text text-transparent">
                                Homestay Manager
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Đăng nhập vào tài khoản
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
                        </p>
                    </div>

                    {/* Login Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border 
              border-gray-200 dark:border-gray-700 p-8 space-y-6"
                    >
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Tên người dùng
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                                    placeholder="Nhập tên người dùng"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                                    placeholder="Nhập mật khẩu của bạn"
                                />
                            </div>
                        </div>

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary focus:ring-primary 
                    border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:text-primary-dark transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark
                text-white rounded-xl font-medium transition-all duration-200 
                hover:shadow-lg hover:shadow-primary/25
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin">⏳</span>
                            ) : 'Đăng nhập'}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">hoặc</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="flex justify-center space-x-4">
                            {[FaGoogle, FaFacebook, FaApple].map((Icon, index) => (
                                <motion.button
                                    key={index}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600
                    hover:border-primary dark:hover:border-primary
                    hover:bg-primary/5 dark:hover:bg-primary/10
                    transition-all duration-200"
                                >
                                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-primary hover:text-primary-dark 
                transition-colors duration-200"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login; 