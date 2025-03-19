import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import authService from '../../services/api/authAPI';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, maskedEmail } = location.state || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const inputs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== '' && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (index > 0 && otp[index] === '') {
                inputs.current[index - 1].focus();
            }
            setOtp([...otp.map((d, idx) => (idx === index ? '' : d))]);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.some(x => isNaN(x))) return;

        setOtp(Array(6).fill('').map((_, idx) => pastedData[idx] || ''));
        inputs.current[5].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            toast.error('Vui lòng nhập đủ 6 số!');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOTP(email, otpValue);
            toast.success('Xác thực thành công!', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #6EE7B7'
                }
            });
            navigate('/login');
        } catch (error) {
            toast.error(error?.message || 'Mã OTP không chính xác!');
            setOtp(['', '', '', '', '', '']);
            inputs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timeLeft > 0) return;

        try {
            // API call to resend OTP
            setTimeLeft(60);
            toast.success('Đã gửi lại mã OTP!');
        } catch (error) {
            toast.error('Không thể gửi lại mã OTP!');
        }
    };

    return (
        <div className="min-h-screen flex">
            <Toaster />
            {/* Left Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
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
                            Xác thực<br />Tài khoản
                        </h1>
                        <p className="text-white/80 text-lg">
                            Nhập mã OTP đã được gửi đến email của bạn để hoàn tất đăng ký
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
                            Xác thực OTP
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nhập mã 6 số được gửi đến email của bạn
                        </p>
                    </div>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border 
                            border-gray-200 dark:border-gray-700 p-8"
                    >
                        {/* OTP Input Fields */}
                        <div className="flex justify-between gap-2 mb-8">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    ref={el => inputs.current[index] = el}
                                    value={otp[index]}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-2xl font-bold rounded-xl 
                                        border-2 border-gray-200 dark:border-gray-600
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-4 focus:ring-primary/20 focus:border-primary
                                        transition-all duration-200"
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.some(x => x === '')}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark
                                text-white rounded-xl font-medium transition-all duration-200 
                                hover:shadow-lg hover:shadow-primary/25
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2 mb-6"
                        >
                            {loading ? (
                                <span className="animate-spin">⏳</span>
                            ) : 'Xác nhận'}
                        </button>

                        {/* Resend OTP */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={timeLeft > 0}
                                className="flex items-center justify-center gap-2 mx-auto
                                    text-primary hover:text-primary-dark disabled:text-gray-400
                                    transition-colors duration-200"
                            >
                                <FaRedo className={timeLeft > 0 ? '' : 'animate-spin'} />
                                <span>
                                    {timeLeft > 0
                                        ? `Gửi lại mã sau ${timeLeft}s`
                                        : 'Gửi lại mã OTP'}
                                </span>
                            </button>
                        </div>
                    </motion.form>
                </motion.div>
            </div>
        </div>
    );
};

export default OTPVerification; 