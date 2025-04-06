import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
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
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
        if (e) e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            setIsConfirmModalOpen(true);
        } else {
            setErrors(newErrors);
        }
    };

    const confirmSubmit = async () => {
        setLoading(true);
        try {
            await serviceAPI.updateService(service.id, formData);
            toast.success('Cập nhật dịch vụ thành công!');
            onSuccess?.();
            setIsConfirmModalOpen(false);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ');
        } finally {
            setLoading(false);
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleStatusChange = (e) => {
        setFormData(prev => ({
            ...prev,
            status: e.target.checked
        }));
    };

    const cancelConfirm = () => {
        setIsConfirmModalOpen(false);
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
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl 
                            overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                    Cập nhật dịch vụ
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-5 space-y-4">
                            <form onSubmit={handleSubmit}>
                                {/* Tên dịch vụ */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Tên dịch vụ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="servicesName"
                                        value={formData.servicesName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                                            dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                            focus:ring-primary/50 focus:border-primary"
                                        placeholder="Nhập tên dịch vụ..."
                                    />
                                    {errors.servicesName && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                            <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                            {errors.servicesName}
                                        </p>
                                    )}
                                </div>

                                {/* Mô tả */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Mô tả <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                                            dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                            focus:ring-primary/50 focus:border-primary resize-none"
                                        placeholder="Mô tả chi tiết về dịch vụ..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                            <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Giá với layout 2 cột */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Đơn giá (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="unitPrice"
                                            value={formData.unitPrice}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                                                dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                                focus:ring-primary/50 focus:border-primary"
                                            placeholder="0"
                                        />
                                        {errors.unitPrice && (
                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                                {errors.unitPrice}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Giá dịch vụ (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="servicesPrice"
                                            value={formData.servicesPrice}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                                                dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                                focus:ring-primary/50 focus:border-primary"
                                            placeholder="0"
                                        />
                                        {errors.servicesPrice && (
                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                                {errors.servicesPrice}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={formData.status}
                                                onChange={handleStatusChange}
                                                className="sr-only"
                                            />
                                            <div className={`w-12 h-6 rounded-full transition-colors duration-200 
                                                ${formData.status ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full 
                                                    transition-transform duration-200 shadow
                                                    ${formData.status ? 'translate-x-6' : 'translate-x-0'}`}>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.status ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-gray-300 
                                        dark:border-gray-600 text-gray-700 dark:text-gray-300 
                                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-lg bg-primary text-white 
                                        hover:bg-primary-dark disabled:opacity-50
                                        transition-colors disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Đang xử lý...</span>
                                        </div>
                                    ) : (
                                        <span>Cập nhật</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isConfirmModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl"
                        >
                            <div className="text-center mb-4">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-200 text-green-600 mb-4">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                                    Xác nhận thay đổi
                                </h3>
                            </div>
                            <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">
                                Bạn có chắc chắn muốn lưu những thay đổi này?
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={cancelConfirm}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors min-w-[100px]"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors min-w-[100px] flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Xác nhận"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export default ServiceUpdateModal; 