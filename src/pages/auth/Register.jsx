import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaGoogle, FaFacebook, FaApple, FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        address: '',
        email: '',
        phone: '',
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
            // API call here
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/otp-verification', { state: { email: formData.email } });
        } catch (error) {
            toast.error('Có lỗi xảy ra khi đăng ký!', {
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
            {/* Left Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image với Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1582719508461-905c673771fd"
                        alt="Luxury Homestay"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/90" />
                </div>

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
                            Tham gia cùng chúng tôi để quản lý nhà nghỉ của bạn một cách chuyên nghiệp
                        </p>
                    </motion.div>
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
                            Đăng ký tài khoản
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Tạo tài khoản để bắt đầu quản lý nhà nghỉ của bạn
                        </p>
                    </div>

                    {/* Register Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border 
                            border-gray-200 dark:border-gray-700 p-8 space-y-6"
                    >
                        {/* Username Field */}
                        <InputField
                            icon={<FaUser />}
                            label="Tên đăng nhập"
                            name="username"
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={formData.username}
                            onChange={handleInputChange}
                        />

                        {/* Full Name Field */}
                        <InputField
                            icon={<FaUser />}
                            label="Họ và tên"
                            name="fullName"
                            type="text"
                            placeholder="Nhập họ và tên"
                            value={formData.fullName}
                            onChange={handleInputChange}
                        />

                        {/* Address Field */}
                        <InputField
                            icon={<FaMapMarkerAlt />}
                            label="Địa chỉ"
                            name="address"
                            type="text"
                            placeholder="Nhập địa chỉ"
                            value={formData.address}
                            onChange={handleInputChange}
                        />

                        {/* Email Field */}
                        <InputField
                            icon={<FaEnvelope />}
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="Nhập email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />

                        {/* Phone Field */}
                        <InputField
                            icon={<FaPhone />}
                            label="Số điện thoại"
                            name="phone"
                            type="tel"
                            placeholder="Nhập số điện thoại"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />

                        {/* Password Field */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 
                                        rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-4 focus:ring-primary/20 focus:border-primary
                                        transition-all duration-200"
                                    placeholder="Nhập mật khẩu"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 
                                        rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-4 focus:ring-primary/20 focus:border-primary
                                        transition-all duration-200"
                                    placeholder="Xác nhận mật khẩu"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
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
                            ) : 'Đăng ký'}
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

                        {/* Social Register */}
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

                    {/* Login Link */}
                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary-dark 
                                transition-colors duration-200"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

// Input Field Component
const InputField = ({ icon, label, name, type, placeholder, value, onChange }) => (
    <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {label}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
                {React.cloneElement(icon, { className: "h-5 w-5 text-gray-400" })}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required
                className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                    rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default Register; 