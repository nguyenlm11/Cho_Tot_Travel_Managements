import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import serviceAPI from '../../services/api/serviceAPI';

const ServiceUpdateModal = ({ isOpen, onClose, service, onSuccess }) => {
    const [formData, setFormData] = useState({
        servicesName: '',
        description: '',
        unitPrice: '',
        servicesPrice: '',
        status: true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (service) {
            setFormData({
                servicesName: service.name,
                description: service.description,
                unitPrice: service.unitPrice,
                servicesPrice: service.price,
                status: service.status === 'active',
            });
        }
    }, [service]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.servicesName.trim()) newErrors.servicesName = 'Tên dịch vụ là bắt buộc';
        if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Đơn giá phải lớn hơn 0';
        if (!formData.servicesPrice || formData.servicesPrice <= 0) newErrors.servicesPrice = 'Giá dịch vụ phải lớn hơn 0';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                await serviceAPI.updateService(service.id, formData);
                toast.success('Cập nhật dịch vụ thành công!');
                onSuccess?.();
                onClose();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ');
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
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
                setFormData(prev => ({ ...prev, [name]: numValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStatusChange = (e) => {
        setFormData(prev => ({
            ...prev,
            status: e.target.checked
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl 
                            overflow-hidden border border-gray-200/50 dark:border-gray-700/50
                            backdrop-blur-xl backdrop-saturate-150"
                    >
                        {/* Header với gradient và animation */}
                        <motion.div
                            className="p-6 border-b border-gray-200/50 dark:border-gray-700/50
                                bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                        >
                            <div className="flex justify-between items-center">
                                <motion.h2
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark 
                                        bg-clip-text text-transparent"
                                >
                                    Cập nhật dịch vụ
                                </motion.h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                                        transition-colors duration-200"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Form Content với animation cho từng field */}
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
                                            dark:border-gray-600 dark:bg-gray-700/50 focus:ring-2 
                                            focus:ring-primary/50 transition-all duration-200
                                            hover:border-primary/50"
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
                                            Đơn giá(VNĐ) *
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
                                            Giá dịch vụ(VNĐ) *
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

                                {/* Status Toggle với animation đẹp */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="pt-4"
                                >
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={formData.status}
                                                onChange={handleStatusChange}
                                                className="sr-only"
                                            />
                                            <div className={`w-14 h-8 rounded-full transition-all duration-300 
                                                ${formData.status ? 'bg-primary shadow-lg shadow-primary/25' : 'bg-gray-300'}`}>
                                                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full 
                                                    transition-all duration-300 shadow-sm
                                                    ${formData.status ? 'translate-x-6' : 'translate-x-0'}
                                                    group-hover:scale-110`}>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium transition-colors duration-200
                                            ${formData.status ? 'text-primary' : 'text-gray-500'}`}>
                                            {formData.status ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </label>
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
                                        'Cập nhật'
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

export default ServiceUpdateModal; 