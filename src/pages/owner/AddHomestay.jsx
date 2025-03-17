import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const API_KEY = "MdlDIjhDKvUnozmB9NJjiW4L5Pu5ogxX";
const BASE_URL = "https://mapapis.openmap.vn/v1/autocomplete";

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0, y: -20 }
};

const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 }
    }
};

const AddHomestay = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: '',
        rentalType: 'daily',
        longitude: '',
        latitude: ''
    });

    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const addressTimeoutRef = useRef(null);

    const rentalTypes = [
        { value: 'daily', label: 'Theo ngày' },
        { value: 'weekly', label: 'Theo tuần' },
        { value: 'monthly', label: 'Theo tháng' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'address') {
            handleAddressInput(value);
        }
    };

    const handleAddressInput = async (value) => {
        if (addressTimeoutRef.current) {
            clearTimeout(addressTimeoutRef.current);
        }

        if (!value.trim()) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        addressTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await axios.get(BASE_URL, {
                    params: {
                        text: value,
                        apikey: API_KEY,
                        size: 6, // Giới hạn 6 gợi ý
                    },
                });
                setAddressSuggestions(response.data.features || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching address suggestions from Openmap.vn:', error);
            }
        }, 300);
    };

    const handleSelectAddress = (suggestion) => {
        const { label } = suggestion.properties;
        const [lng, lat] = suggestion.geometry.coordinates;

        setFormData(prev => ({
            ...prev,
            address: label,
            latitude: lat,
            longitude: lng
        }));
        setShowSuggestions(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên nhà nghỉ';
        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Vui lòng điền đầy đủ thông tin!', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5'
                },
            });
            return;
        }

        setLoading(true);
        try {
            console.log(formData);
            toast.success('Thêm nhà nghỉ thành công!', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #6EE7B7'
                },
                icon: <FaHome className="text-primary" />
            });

            navigate('/owner/homestays');
        } catch (error) {
            console.error('Error adding homestay:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại!', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5'
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 
                dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
        >
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <motion.div
                    variants={inputVariants}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark 
                        bg-clip-text text-transparent mb-4">
                        Thêm nhà nghỉ mới
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Tạo không gian nghỉ dưỡng tuyệt vời cho khách hàng của bạn
                    </p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                        border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 
                        dark:from-primary/5 dark:to-primary-dark/5 px-8 py-6 border-b 
                        border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white 
                            flex items-center gap-3">
                            <FaHome className="text-primary" />
                            Thông tin cơ bản
                        </h2>
                    </div>

                    <div className="p-8 space-y-8">
                        <motion.div variants={inputVariants}>
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Tên nhà nghỉ
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.name
                                    ? 'border-red-500 dark:border-red-500'
                                    : 'border-gray-200 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                focus:ring-4 focus:ring-primary/20 focus:border-primary
                                transition-all duration-200`}
                                placeholder="VD: Sunset Beach Villa"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <FaTimes className="w-4 h-4" />
                                    {errors.name}
                                </p>
                            )}
                        </motion.div>

                        <motion.div variants={inputVariants} className="relative">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Địa chỉ
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.address
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-4 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200 pr-12`}
                                    placeholder="Nhập địa chỉ để tìm kiếm"
                                />
                                <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 w-5 h-5" />
                            </div>
                            {errors.address && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <FaTimes className="w-4 h-4" />
                                    {errors.address}
                                </p>
                            )}

                            <AnimatePresence>
                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 
                                            rounded-xl shadow-xl border border-gray-200 dark:border-gray-600
                                            overflow-hidden"
                                    >
                                        {addressSuggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSelectAddress(suggestion)}
                                                className="px-4 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 
                                                    cursor-pointer flex items-start gap-3 transition-colors duration-200
                                                    border-b last:border-b-0 border-gray-100 dark:border-gray-600"
                                            >
                                                <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-200 text-sm">
                                                    {suggestion.properties.label}
                                                </span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div variants={inputVariants}>
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Loại cho thuê
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {rentalTypes.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, rentalType: type.value }))}
                                        className={`px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                                            ${formData.rentalType === type.value
                                                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants}>
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.description
                                    ? 'border-red-500 dark:border-red-500'
                                    : 'border-gray-200 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                focus:ring-4 focus:ring-primary/20 focus:border-primary
                                transition-all duration-200 resize-none`}
                                placeholder="Mô tả chi tiết về nhà nghỉ của bạn..."
                            />
                            {errors.description && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <FaTimes className="w-4 h-4" />
                                    {errors.description}
                                </p>
                            )}
                        </motion.div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t 
                        border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/owner/homestays')}
                            className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark
                                text-white font-medium transition-all duration-200 
                                hover:shadow-lg hover:shadow-primary/25
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <FaHome className="w-5 h-5" />
                                    Thêm nhà nghỉ
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </motion.div>
    );
};

export default AddHomestay;