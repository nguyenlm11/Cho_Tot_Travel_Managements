import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaGoogle, FaFacebook, FaApple, FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import authService from '../../services/api/authAPI';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            when: "beforeChildren",
            staggerChildren: 0.1
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

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        address: '',
        email: '',
        phone: '',
        bankAccountNumber: 'string',
        taxCode: 'string',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5'
                }
            });
            setLoading(false);
            return;
        }

        try {
            const response = await authService.register(formData);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #6EE7B7'
                }
            });
            navigate('/verify-otp', {
                state: {
                    email: formData.email,
                    maskedEmail: formData.email.replace(/(.{3})(.*)(@.*)/, '$1***$3')
                }
            });
        } catch (error) {
            toast.error(error?.message || 'Có lỗi xảy ra khi đăng ký!', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5'
                }
            });
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
                        src="https://images.unsplash.com/photo-1582719508461-905c673771fd"
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
                            Tạo tài khoản<br />Homestay Manager
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-white/80 text-lg"
                        >
                            Bắt đầu quản lý nhà nghỉ của bạn<br />một cách chuyên nghiệp
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Section - Register Form */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto"
            >
                <div className="max-w-md w-full">
                    {/* Logo & Title */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center mb-8"
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
                            Đăng ký tài khoản
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Điền thông tin để tạo tài khoản mới
                        </motion.p>
                    </motion.div>

                    {/* Register Form */}
                    <motion.form
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username Input */}
                            <motion.div variants={itemVariants} className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên đăng nhập <span className="text-red-500">*</span>
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

                            {/* Full Name Input */}
                            <motion.div variants={itemVariants} className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200"
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 
                                        text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Email Input */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200"
                                    placeholder="Nhập địa chỉ email"
                                    required
                                />
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                        </motion.div>

                        {/* Phone & Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants} className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200"
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 
                                        text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Địa chỉ <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                        rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-4 focus:ring-primary/20 focus:border-primary
                                        transition-all duration-200"
                                        placeholder="Nhập địa chỉ"
                                        required
                                    />
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 
                                        text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Password Fields */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
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
                                        text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200"
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                />
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary transition-colors" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 
                                        text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
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
                                flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    <FaUser className="w-5 h-5" />
                                    Đăng ký
                                </>
                            )}
                        </motion.button>

                        {/* Login Link */}
                        <motion.p
                            variants={itemVariants}
                            className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
                        >
                            Đã có tài khoản?{" "}
                            <Link
                                to="/login"
                                className="text-primary hover:text-primary-dark font-medium 
                                    transition-colors duration-200"
                            >
                                Đăng nhập ngay
                            </Link>
                        </motion.p>
                    </motion.form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register; 