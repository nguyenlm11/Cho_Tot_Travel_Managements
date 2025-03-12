import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage } from 'react-icons/fa';

// Add these animation variants
const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { 
        scale: 1, 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    exit: { 
        scale: 0.95, 
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 }
    }
};

const ServiceModal = ({ isOpen, onClose, service, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || '',
                description: service.description || '',
                price: service.price || '',
                duration: service.duration || '',
                image: null
            });
            setImagePreview(service.image);
        } else {
            resetForm();
        }
    }, [service]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: '',
            image: null
        });
        setImagePreview(null);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tên dịch vụ là bắt buộc';
        if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Giá dịch vụ phải lớn hơn 0';
        if (!formData.duration.trim()) newErrors.duration = 'Thời gian là bắt buộc';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
            onClose();
            resetForm();
        } else {
            setErrors(newErrors);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Enhanced backdrop with blur */}
                    <motion.div
                        variants={overlayVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
                        onClick={onClose}
                    />
                    
                    <div className="fixed inset-0 z-[1000] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center p-4">
                            <motion.div
                                variants={modalVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl
                                    relative mx-auto my-8 overflow-hidden border border-gray-100 
                                    dark:border-gray-700"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Enhanced header with gradient */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700
                                    bg-gradient-to-r from-primary/5 to-primary-dark/5"
                                >
                                    <div className="flex items-center justify-between">
                                        <motion.h2 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-2xl font-semibold text-gray-800 dark:text-white"
                                        >
                                            {service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                                        </motion.h2>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={onClose}
                                            className="p-2 text-gray-400 hover:text-gray-600 
                                                dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 
                                                dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Enhanced form with animations */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    {/* Image upload with enhanced interaction */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 
                                            dark:text-gray-300 mb-2"
                                        >
                                            Hình ảnh
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="service-image"
                                            />
                                            <label
                                                htmlFor="service-image"
                                                className="cursor-pointer flex flex-col items-center justify-center 
                                                    w-full h-48 border-2 border-dashed border-gray-300 
                                                    dark:border-gray-600 rounded-xl group-hover:border-primary 
                                                    dark:group-hover:border-primary transition-all duration-300"
                                            >
                                                {imagePreview ? (
                                                    <motion.img
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-6">
                                                        <motion.div
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <FaImage className="w-12 h-12 text-gray-400" />
                                                        </motion.div>
                                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            Kéo thả hoặc click để chọn ảnh
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </motion.div>

                                    {/* Form fields with stagger animation */}
                                    <motion.div 
                                        className="space-y-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tên dịch vụ
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className={`w-full px-4 py-2 rounded-lg border ${errors.name
                                                    ? 'border-red-500 dark:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                    focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Mô tả
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                rows={3}
                                                className={`w-full px-4 py-2 rounded-lg border ${errors.description
                                                    ? 'border-red-500 dark:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                    focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                            )}
                                        </div>

                                        {/* Price and Duration */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Giá dịch vụ (VNĐ)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                                    className={`w-full px-4 py-2 rounded-lg border ${errors.price
                                                        ? 'border-red-500 dark:border-red-500'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                        focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                                                />
                                                {errors.price && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Thời gian
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                                    placeholder="VD: 2 giờ"
                                                    className={`w-full px-4 py-2 rounded-lg border ${errors.duration
                                                        ? 'border-red-500 dark:border-red-500'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                        focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                                                />
                                                {errors.duration && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Enhanced action buttons */}
                                    <motion.div 
                                        className="flex justify-end gap-4 mt-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <motion.button
                                            type="button"
                                            onClick={onClose}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-6 py-2 rounded-lg border border-gray-300 
                                                dark:border-gray-600 text-gray-700 dark:text-gray-300 
                                                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Hủy
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-6 py-2 rounded-lg bg-gradient-to-r 
                                                from-primary to-primary-dark text-white hover:shadow-lg 
                                                hover:shadow-primary/20 transition-all"
                                        >
                                            {service ? 'Cập nhật' : 'Thêm mới'}
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceModal;
