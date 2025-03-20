import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import homestayAPI from '../../services/api/homestayAPI';

const API_KEY = "MdlDIjhDKvUnozmB9NJjiW4L5Pu5ogxX";
const BASE_URL = "https://mapapis.openmap.vn/v1/autocomplete";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const inputGroupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5 }
    }
};

const AddHomestay = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        longitude: 0,
        latitude: 0,
        rentalType: 1,
        area: '',
        accountId: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo?.AccountID) {
            setFormData(prev => ({
                ...prev,
                accountId: userInfo.AccountID
            }));
        } else {
            toast.error('Không tìm thấy thông tin tài khoản');
            navigate('/login');
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'address') {
            searchAddress(value);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImages(prev => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await homestayAPI.createHomestay(formData);
            toast.success('Tạo homestay thành công!');
            navigate('/owner/homestays');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo homestay');
        } finally {
            setLoading(false);
        }
    };

    const searchAddress = async (query) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (!query) {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await axios.get(BASE_URL, {
                    params: { text: query, apikey: API_KEY, size: 6 }
                });
                setSearchResults(response.data.features || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error searching address:', error);
            }
        }, 300);
    };

    const handleSelectAddress = (result) => {
        const { label } = result.properties;
        const [lng, lat] = result.geometry.coordinates;
        setFormData(prev => ({
            ...prev,
            address: label,
            longitude: lng,
            latitude: lat,
        }));
        setShowSuggestions(false);
        setSearchResults([]);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 
                dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header Section với animation cải tiến */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-block p-2 bg-primary/10 dark:bg-primary/20 
                        rounded-2xl mb-4 backdrop-blur-sm">
                        <FaHome className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary 
                        bg-clip-text text-transparent mb-4">
                        Thêm nhà nghỉ mới
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Tạo không gian nghỉ dưỡng tuyệt vời cho khách hàng của bạn
                    </p>
                </motion.div>

                <motion.form
                    variants={formVariants}
                    onSubmit={handleSubmit}
                    className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl 
                        border border-gray-100 dark:border-gray-700 overflow-hidden
                        backdrop-blur-sm"
                >
                    {/* Form Header với gradient cải tiến */}
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5
                        dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 
                        px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white 
                            flex items-center gap-3">
                            <FaHome className="text-primary" />
                            <span className="bg-gradient-to-r from-primary to-primary-dark 
                                bg-clip-text text-transparent">
                                Thông tin cơ bản
                            </span>
                        </h2>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Name Input với hiệu ứng focus cải tiến */}
                        <motion.div variants={inputGroupVariants} className="group">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 
                                flex items-center gap-2">
                                <span>Tên nhà nghỉ</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder='Nhập tên nhà nghỉ'
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 
                                        dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                                        focus:border-primary dark:focus:border-primary
                                        focus:ring-4 focus:ring-primary/20
                                        transition-all duration-300"
                                    required
                                />
                                <FaHome className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary 
                                    transition-colors duration-300" />
                            </div>
                        </motion.div>

                        {/* Description Input với auto-resize */}
                        <motion.div variants={inputGroupVariants} className="group">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 
                                flex items-center gap-2">
                                <span>Mô tả</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                placeholder='Mô tả chi tiết về nhà nghỉ'
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                    dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                                    focus:border-primary dark:focus:border-primary
                                    focus:ring-4 focus:ring-primary/20
                                    transition-all duration-300 min-h-[120px] resize-y"
                                required
                            />
                        </motion.div>

                        {/* Address Input với Autocomplete cải tiến */}
                        <motion.div variants={inputGroupVariants} className="group relative">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 
                                flex items-center gap-2">
                                <span>Địa chỉ</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder='Nhập địa chỉ của nhà nghỉ'
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 
                                        border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                                        focus:border-primary dark:focus:border-primary
                                        focus:ring-4 focus:ring-primary/20
                                        transition-all duration-300"
                                    required
                                />
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary 
                                    transition-colors duration-300" />
                            </div>

                            {/* Address Suggestions với animation cải tiến */}
                            <AnimatePresence>
                                {showSuggestions && searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 
                                            rounded-xl shadow-xl border border-gray-100 
                                            dark:border-gray-600 overflow-hidden"
                                    >
                                        {searchResults.map((result, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{
                                                    backgroundColor: "rgba(var(--color-primary), 0.1)",
                                                    x: 4
                                                }}
                                                className="px-4 py-3 cursor-pointer hover:bg-primary/5 
                                                    dark:hover:bg-primary/20 transition-all duration-300
                                                    flex items-center gap-3"
                                                onClick={() => handleSelectAddress(result)}
                                            >
                                                <FaMapMarkerAlt className="text-primary" />
                                                <span className="text-gray-700 dark:text-gray-200">
                                                    {result.properties.label}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Area Input với validation visual */}
                        <motion.div variants={inputGroupVariants} className="group">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Khu vực
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                        dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                                        focus:border-primary dark:focus:border-primary
                                        focus:ring-4 focus:ring-primary/20
                                        transition-all duration-300"
                                />
                            </div>
                        </motion.div>

                        {/* Image Upload với drag & drop cải tiến */}
                        <motion.div variants={inputGroupVariants} className="space-y-4">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 block">
                                Hình ảnh
                            </label>
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                                    rounded-xl p-8 text-center hover:border-primary dark:hover:border-primary 
                                    transition-all duration-300 cursor-pointer relative
                                    bg-gray-50/50 dark:bg-gray-700/50 group"
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="flex flex-col items-center"
                                >
                                    <FaHome className="w-12 h-12 text-gray-400 
                                        group-hover:text-primary transition-colors duration-300" />
                                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                        Kéo thả hoặc click để tải ảnh lên
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Hỗ trợ: JPG, PNG (Tối đa 5MB)
                                    </p>
                                </motion.div>
                            </motion.div>

                            {/* Image Preview Grid với animation */}
                            {previewImages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6"
                                >
                                    {previewImages.map((preview, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group rounded-lg overflow-hidden
                                                shadow-md hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover transform 
                                                    group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    setPreviewImages(prev => prev.filter((_, i) => i !== index));
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        images: prev.images.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500/90 
                                                    text-white rounded-full opacity-0 group-hover:opacity-100 
                                                    transition-all duration-300 hover:bg-red-600"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Form Actions với button cải tiến */}
                    <div className="px-8 py-6 bg-gray-50/80 dark:bg-gray-800/80 border-t 
                        border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -4 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => navigate('/owner/homestays')}
                            className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-700 
                                transition-all duration-300 flex items-center gap-2"
                        >
                            <span>Hủy</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark
                                text-white font-medium transition-all duration-300 
                                hover:shadow-lg hover:shadow-primary/25
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center gap-2"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    <FaHome className="w-5 h-5" />
                                    <span>Thêm nhà nghỉ</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
            <Toaster />
        </motion.div>
    );
};

export default AddHomestay;