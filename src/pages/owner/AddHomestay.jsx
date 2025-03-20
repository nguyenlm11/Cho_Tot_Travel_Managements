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
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 
                dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
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
                    variants={formVariants}
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                        border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 
                        dark:from-primary/5 dark:to-primary-dark/5 px-8 py-6 border-b 
                        border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white 
                            flex items-center gap-3">
                            <FaHome className="text-primary" />
                            Thông tin cơ bản
                        </h2>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Name Input */}
                        <motion.div variants={inputGroupVariants} className="group">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Tên nhà nghỉ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                    dark:border-gray-600 bg-transparent
                                    focus:border-primary dark:focus:border-primary
                                    focus:ring-2 focus:ring-primary/20
                                    transition-all duration-200"
                                required
                            />
                        </motion.div>

                        {/* Description Input */}
                        <motion.div variants={inputGroupVariants} className="group">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Mô tả <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                    dark:border-gray-600 bg-transparent
                                    focus:border-primary dark:focus:border-primary
                                    focus:ring-2 focus:ring-primary/20
                                    transition-all duration-200 min-h-[100px]"
                                required
                            />
                        </motion.div>

                        {/* Address Input with Autocomplete */}
                        <motion.div variants={inputGroupVariants} className="group relative">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 
                                        border-gray-200 dark:border-gray-600 bg-transparent
                                        focus:border-primary dark:focus:border-primary
                                        focus:ring-2 focus:ring-primary/20
                                        transition-all duration-200"
                                    required
                                />
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 
                                    text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            
                            {/* Address Suggestions */}
                            <AnimatePresence>
                                {showSuggestions && searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 
                                            rounded-xl shadow-lg border border-gray-100 
                                            dark:border-gray-600 overflow-hidden"
                                    >
                                        {searchResults.map((result, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                                                className="px-4 py-3 cursor-pointer hover:bg-gray-50 
                                                    dark:hover:bg-gray-600 transition-colors
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

                        {/* Area Input */}
                        <motion.div variants={inputGroupVariants} className="group">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Khu vực
                            </label>
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                    dark:border-gray-600 bg-transparent
                                    focus:border-primary dark:focus:border-primary
                                    focus:ring-2 focus:ring-primary/20
                                    transition-all duration-200"
                            />
                        </motion.div>

                        {/* Image Upload */}
                        <motion.div variants={inputGroupVariants} className="space-y-4">
                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 block">
                                Hình ảnh
                            </label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                                rounded-xl p-6 text-center hover:border-primary dark:hover:border-primary 
                                transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FaHome className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Kéo thả hoặc click để tải ảnh lên
                                </p>
                            </div>

                            {/* Image Previews */}
                            {previewImages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4"
                                >
                                    {previewImages.map((preview, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group rounded-lg overflow-hidden"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    setPreviewImages(prev => prev.filter((_, i) => i !== index));
                                                    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 
                                                    text-white rounded-full opacity-0 group-hover:opacity-100 
                                                    transition-opacity duration-200"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Form Actions */}
                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t 
                        border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => navigate('/owner/homestays')}
                            className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            Hủy
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
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
                        </motion.button>
                    </div>
                </motion.form>
            </div>
            <Toaster />
        </motion.div>
    );
};

export default AddHomestay;