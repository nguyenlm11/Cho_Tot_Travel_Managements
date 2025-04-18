import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaGoogle, FaFacebook, FaApple, FaHome, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
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
    const [showPassword, setShowPassword] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

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

        const loadingToast = toast.loading('Đang đăng nhập...', {
            style: {
                background: '#1E293B',
                color: '#fff',
            }
        });

        try {
            const { user } = await authService.login(formData.username, formData.password);
            toast.dismiss(loadingToast);

            // Animation before navigation
            await new Promise(resolve => setTimeout(resolve, 500));

            if (user.role.includes('Admin')) {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.role.includes('Staff')) {
                navigate(`/owner/homestays/${user?.homeStayID}/dashboard`, { replace: true });
            } else {
                navigate('/owner/homestays', { replace: true });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
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

            {/* Left Section - Background */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
            >
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f"
                        alt="Luxury Homestay"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/90 backdrop-blur-sm" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-12 flex flex-col justify-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h1
                            variants={itemVariants}
                            className="text-6xl font-bold text-white mb-6"
                        >
                            Homestay<br />Manager
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-white/80 text-lg"
                        >
                            Nền tảng quản lý nhà nghỉ chuyên nghiệp<br />dành cho chủ nhà và quản trị viên
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Section - Login Form */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900"
            >
                <div className="max-w-md w-full space-y-8">
                    {/* Logo & Title */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-center gap-2 mb-6"
                        >
                            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
                                <FaHome className="w-8 h-8 text-primary" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark 
                                bg-clip-text text-transparent">
                                Homestay Manager
                            </span>
                        </motion.div>
                        <motion.h2
                            variants={itemVariants}
                            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        >
                            Đăng nhập
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
                        </motion.p>
                    </motion.div>

                    {/* Login Form */}
                    <motion.form
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-6"
                    >
                        {/* Username Input */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                />
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200"
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary transition-colors" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 
                                        text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                        focus:outline-none"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Remember & Forgot Password */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-between"
                        >
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-primary rounded border-gray-300 
                                        focus:ring-primary dark:border-gray-600"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Ghi nhớ đăng nhập
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:text-primary-dark 
                                    transition-colors duration-200"
                            >
                                Quên mật khẩu?
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark
                                text-white font-medium transition-all duration-200
                                hover:shadow-lg hover:shadow-primary/25
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                "Đăng nhập"
                            )}
                        </motion.button>

                        {/* Register Link */}
                        <motion.p
                            variants={itemVariants}
                            className="text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            Chưa có tài khoản?{" "}
                            <Link
                                to="/register"
                                className="text-primary hover:text-primary-dark font-medium 
                                    transition-colors duration-200"
                            >
                                Đăng ký ngay
                            </Link>
                        </motion.p>
                    </motion.form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login; 