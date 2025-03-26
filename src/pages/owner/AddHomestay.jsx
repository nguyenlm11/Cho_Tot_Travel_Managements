import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaCloudUploadAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import homestayAPI from '../../services/api/homestayAPI';

const API_KEY = "MdlDIjhDKvUnozmB9NJjiW4L5Pu5ogxX";
const BASE_URL = "https://mapapis.openmap.vn/v1/autocomplete";

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const inputGroupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
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
    const [errors, setErrors] = useState({});

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
    }, [navigate]);

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
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
        >
            <Toaster position="top-right" />

            {/* Back button and title */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate('/owner/homestays')}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    <span>Quay lại danh sách homestay</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Thêm homestay mới
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Điền thông tin để tạo homestay mới cho hệ thống của bạn
                </p>
            </div>

            {/* Main form */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                            <FaHome className="text-primary" />
                            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                Thông tin homestay
                            </span>
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left column */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                        <FaHome className="mr-2 text-primary" />
                                        Thông tin cơ bản
                                    </h2>

                                    {/* Name */}
                                    <motion.div variants={inputGroupVariants} className="group">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Tên homestay <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên homestay"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div variants={inputGroupVariants} className="group">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Mô tả <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Mô tả chi tiết về homestay này..."
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 resize-none"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </motion.div>

                                    {/* Address */}
                                    <motion.div variants={inputGroupVariants} className="group relative">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center">
                                            <FaMapMarkerAlt className="mr-2 text-primary" />
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nhập địa chỉ của nhà nghỉ"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                        />
                                        {errors.address && (
                                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                        )}

                                        {/* Address suggestions */}
                                        <AnimatePresence>
                                            {showSuggestions && searchResults.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto"
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

                                    {/* Area */}
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
                                </div>

                                {/* Right column */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                        <FaCloudUploadAlt className="mr-2 text-primary" />
                                        Hình ảnh
                                    </h2>

                                    {/* Image Upload */}
                                    <motion.div variants={inputGroupVariants} className="space-y-4">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 block">
                                            Hình ảnh homestay <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 
                                            flex flex-col items-center justify-center cursor-pointer hover:border-primary 
                                            transition-all duration-300 bg-gray-50 dark:bg-gray-700/30"
                                            onClick={() => document.getElementById('image-upload').click()}
                                        >
                                            <input
                                                id="image-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <FaCloudUploadAlt className="text-primary text-4xl mb-2" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-1">
                                                Kéo thả hoặc click để tải ảnh lên
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                Hỗ trợ JPG, PNG, WEBP (Tối đa 5 ảnh)
                                            </p>
                                        </div>
                                        {errors.images && (
                                            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                                        )}
                                    </motion.div>

                                    {/* Preview Images */}
                                    {previewImages.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Xem trước ({previewImages.length} ảnh)
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {previewImages.map((img, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group rounded-xl overflow-hidden h-40"
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setPreviewImages(prev => prev.filter((_, i) => i !== index));
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        images: prev.images.filter((_, i) => i !== index)
                                                                    }));
                                                                }}
                                                                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="px-8 py-6 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => navigate('/owner/homestays')}
                                className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                            >
                                Hủy
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                                        <span>Thêm homestay</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AddHomestay;