import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';
// import pricingAPI from '../../services/api/pricingAPI';
import { FaCalendarAlt, FaDollarSign, FaEdit, FaInfoCircle, FaMoneyBillWave, FaTag, FaPercentage } from 'react-icons/fa';
import cancelPolicyAPI from '../../services/api/cancelPolicyAPI';


const EditPolicyModal = ({ onClose, isOpen, cancelPolicy, fetchHomestay }) => {
    const [formData, setFormData] = useState({
        cancellationID: cancelPolicy.cancellationID,
        dayBeforeCancel: cancelPolicy.dayBeforeCancel,
        refundPercentage: cancelPolicy.refundPercentage * 100,
        homeStayID: cancelPolicy.homeStayID
    });
    const [errors, setErrors] = useState({});

    const handleSave = async (e) => {
        e.preventDefault();

        const formatData = { ...formData, refundPercentage: formData.refundPercentage / 100 }
        // console.log({ formatData });
        if (!validateForm()) {
            return;
        }

        try {
            const response = await cancelPolicyAPI.updateCancelPolicy(formatData);
            if (response.statusCode === 200) {
                toast.success("Cập nhật chính sách thành công");
                onClose();
                fetchHomestay();
            }
        } catch (error) {
            console.log(error);
            toast.error("Cập nhật chính sách thất bại");
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.dayBeforeCancel) {
            newErrors.dayBeforeCancel = "Hủy trước là bắt buộc";
        }
        if (!formData.refundPercentage) {
            newErrors.refundPercentage = "Tỉ lệ hoàn trả là bắt buộc";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 min-w-[600px] max-w-md mx-4 overflow-y-auto h-fit max-h-[95vh]"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Cập nhật chính sách hoàn trả
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form>
                            <div
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-6"
                            >
                                {/* Content with price settings */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Hàng thứ nhất */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                Hủy trước (ngày) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.dayBeforeCancel}
                                                    onChange={(e) => setFormData({ ...formData, dayBeforeCancel: e.target.value })}
                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                >
                                                    <option value="">Chọn số ngày</option>
                                                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                                        <option key={day} value={day}>
                                                            {day} ngày
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <FaCalendarAlt />
                                                </span>
                                            </div>
                                            {errors[`dayBeforeCancel`] && (
                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                    <FaInfoCircle className="mr-1" /> {errors[`dayBeforeCancel`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Rent Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                Tỉ lệ hoàn trả (%) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.refundPercentage}
                                                    onChange={(e) => setFormData({ ...formData, refundPercentage: e.target.value })}
                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                >
                                                    <option value="">Chọn phần trăm</option>
                                                    {[80, 90, 100].map((percent) => (
                                                        <option key={percent} value={percent}>
                                                            {percent}%
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <FaPercentage />
                                                </span>
                                            </div>
                                            {errors[`refundPercentage`] && (
                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                    <FaInfoCircle className="mr-1" /> {errors[`refundPercentage`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Day Type */}
                                        {/* <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                Khoảng thời gian áp dụng <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.startDate}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                    />
                                                    {errors[`startDate`] && (
                                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors[`startDate`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Ngày kết thúc <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.endDate}
                                                        onChange={(e) => handlePricingChange("endDate", e.target.value)}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                    />
                                                    {errors[`endDate`] && (
                                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors[`endDate`]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                       flex items-center gap-2"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditPolicyModal;
