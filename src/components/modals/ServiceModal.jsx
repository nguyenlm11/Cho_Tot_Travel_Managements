import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import serviceAPI from '../../services/api/serviceAPI';

const ServiceModal = ({ isOpen, onClose, selectedHomestay }) => {
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
                    className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl 
                            overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark 
                                    bg-clip-text text-transparent">
                                    Thêm dịch vụ mới
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tên dịch vụ */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
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
                                        <p className="mt-1 text-sm text-red-500">{errors.servicesName}</p>
                                    )}
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Mô tả *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                            dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                            focus:ring-primary/50 transition-all duration-200"
                                        placeholder="Mô tả chi tiết về dịch vụ..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Giá */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Đơn giá *
                                        </label>
                                        <input
                                            type="number"
                                            name="unitPrice"
                                            value={formData.unitPrice}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                                dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                                focus:ring-primary/50 transition-all duration-200"
                                            placeholder="0"
                                        />
                                        {errors.unitPrice && (
                                            <p className="mt-1 text-sm text-red-500">{errors.unitPrice}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Giá dịch vụ *
                                        </label>
                                        <input
                                            type="number"
                                            name="servicesPrice"
                                            value={formData.servicesPrice}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                                dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                                focus:ring-primary/50 transition-all duration-200"
                                            placeholder="0"
                                        />
                                        {errors.servicesPrice && (
                                            <p className="mt-1 text-sm text-red-500">{errors.servicesPrice}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hình ảnh * (Tối đa 3 ảnh)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                                        rounded-xl p-6 transition-all duration-200 
                                        hover:border-primary dark:hover:border-primary">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="flex flex-col items-center justify-center cursor-pointer"
                                        >
                                            <FaCloudUploadAlt className="w-12 h-12 text-gray-400 
                                                group-hover:text-primary transition-colors duration-200" />
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                Kéo thả hoặc click để tải ảnh lên
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                PNG, JPG (Tối đa 5MB)
                                            </p>
                                        </label>
                                    </div>

                                    {/* Image Preview */}
                                    {previewImages.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-4 grid grid-cols-3 gap-2"
                                        >
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
                                                        className="absolute top-1 right-1 p-1 bg-red-500 
                                                            text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <FaTimes className="w-4 h-4" />
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {errors.images && (
                                        <p className="mt-1 text-sm text-red-500">{errors.images}</p>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-gray-300 
                                    dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 
                                    transition-colors duration-200"
                            >
                                Hủy
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark 
                                    text-white transition-colors duration-200 flex items-center gap-2
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <span>Thêm dịch vụ</span>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ServiceModal;
