import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import serviceAPI from '../../services/api/serviceAPI';

const ServiceAddModal = ({ isOpen, onClose, selectedHomestay, onSuccess }) => {
    const [formData, setFormData] = useState({
        servicesName: '',
        description: '',
        unitPrice: '',
        servicesPrice: '',
        homeStayID: selectedHomestay,
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.servicesName.trim()) newErrors.servicesName = 'Tên dịch vụ là bắt buộc';
        if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Đơn giá phải lớn hơn 0';
        if (!formData.servicesPrice || formData.servicesPrice <= 0) newErrors.servicesPrice = 'Giá dịch vụ phải lớn hơn 0';
        if (!formData.images.length) newErrors.images = 'Hình ảnh là bắt buộc';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                await serviceAPI.createService(formData);
                toast.success('Thêm dịch vụ thành công!');
                onSuccess?.();
                onClose();
                resetForm();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm dịch vụ');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'unitPrice' || name === 'servicesPrice') && value !== '') {
            // Chỉ cho phép số và kiểm tra giá trị dương
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
                setFormData(prev => ({ ...prev, [name]: numValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previewImages.length > 3) {
            toast.error('Chỉ được chọn tối đa 3 ảnh');
            return;
        }

        const newImages = files.slice(0, 3 - previewImages.length);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));

        newImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const resetForm = () => {
        setFormData({
            servicesName: '',
            description: '',
            unitPrice: '',
            servicesPrice: '',
            homeStayID: selectedHomestay,
            images: []
        });
        setPreviewImages([]);
        setErrors({});
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl 
                            overflow-hidden border border-gray-200/50 dark:border-gray-700/50
                            backdrop-blur-xl backdrop-saturate-150"
                    >
                        {/* Header */}
                        <motion.div
                            className="p-6 border-b border-gray-200/50 dark:border-gray-700/50
                                bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                        >
                            <div className="flex justify-between items-center">
                                <motion.h2
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-2xl font-bold bg-gradient-to-r from-primary 
                                    to-primary-dark bg-clip-text text-transparent"
                                >
                                    Thêm dịch vụ mới
                                </motion.h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                                    rounded-full transition-colors duration-200"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tên dịch vụ */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Tên dịch vụ *
                                    </label>
                                    <input
                                        type="text"
                                        name="servicesName"
                                        value={formData.servicesName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                            dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                            focus:ring-primary/50 transition-all duration-200"
                                        placeholder="Nhập tên dịch vụ..."
                                    />
                                    {errors.servicesName && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-1 text-sm text-red-500"
                                        >
                                            {errors.servicesName}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Mô tả */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Mô tả *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                            dark:border-gray-600 dark:bg-gray-700/50 focus:ring-2 
                                            focus:ring-primary/50 transition-all duration-200
                                            hover:border-primary/50 resize-none"
                                        placeholder="Mô tả chi tiết về dịch vụ..."
                                    />
                                    {errors.description && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-1 text-sm text-red-500"
                                        >
                                            {errors.description}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Giá với layout 2 cột */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Đơn giá *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="unitPrice"
                                                value={formData.unitPrice}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                                    dark:border-gray-600 dark:bg-gray-700/50 focus:ring-2 
                                                    focus:ring-primary/50 transition-all duration-200
                                                    hover:border-primary/50"
                                                placeholder="0"
                                            />
                                        </div>
                                        {errors.unitPrice && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-1 text-sm text-red-500"
                                            >
                                                {errors.unitPrice}
                                            </motion.p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Giá dịch vụ *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="servicesPrice"
                                                value={formData.servicesPrice}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                                    dark:border-gray-600 dark:bg-gray-700/50 focus:ring-2 
                                                    focus:ring-primary/50 transition-all duration-200
                                                    hover:border-primary/50"
                                                placeholder="0"
                                            />
                                        </div>
                                        {errors.servicesPrice && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-1 text-sm text-red-500"
                                            >
                                                {errors.servicesPrice}
                                            </motion.p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Image Upload Section */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-4"
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Hình ảnh dịch vụ *
                                    </label>
                                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 
                                        rounded-xl p-6 transition-all duration-200 
                                        hover:border-primary/50 group"
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-center">
                                            <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 
                                                group-hover:text-primary transition-colors duration-200" />
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                Kéo thả hoặc click để tải ảnh lên
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG, GIF tối đa 10MB (Tối đa 3 ảnh)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Previews */}
                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            {previewImages.map((preview, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative rounded-lg overflow-hidden aspect-video"
                                                >
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 
                                                            rounded-full text-white hover:bg-red-600
                                                            transition-colors duration-200"
                                                    >
                                                        <FaTimes className="w-4 h-4" />
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.images && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-1 text-sm text-red-500"
                                        >
                                            {errors.images}
                                        </motion.p>
                                    )}
                                </motion.div>
                            </form>
                        </div>

                        {/* Footer với gradient ngược */}
                        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50
                            bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                            <div className="flex justify-end gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02, x: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-gray-300 
                                        dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700
                                        transition-all duration-200"
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl bg-primary text-white 
                                        hover:bg-primary-dark disabled:opacity-50 shadow-lg
                                        hover:shadow-primary/25 transition-all duration-200
                                        disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            <span>Đang xử lý...</span>
                                        </div>
                                    ) : (
                                        'Thêm dịch vụ'
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ServiceAddModal;
