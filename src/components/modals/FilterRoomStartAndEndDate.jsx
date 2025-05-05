import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';
// import pricingAPI from '../../services/api/pricingAPI';
import { FaCalendarAlt, FaDollarSign, FaEdit, FaInfoCircle, FaMoneyBillWave, FaPercent, FaSearch, FaTag } from 'react-icons/fa';


const FilterRoomStartAndEndDate = ({ onClose, onSave, isOpen }) => {
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: ""
    });
    const [errors, setErrors] = useState({});

    function convertToFullISOString(dateStr) {
        const [year, month, day] = dateStr.split("-");
        const now = new Date();
        const date = new Date(`${year}-${month}-${day}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds()}`);
        return date.toISOString();
      }
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!validateStep2()) {
            return;
        }
        try {
            const data = {
                startDate:convertToFullISOString(formData.startDate),
                endDate:convertToFullISOString(formData.endDate)
            };
            // console.log(data);
            onSave(data);
            onClose();
        } catch (error) {
            console.error('Error searching room:', error);
            toast.error('Không thể tìm thấy phòng thuê: ' + error.message);
        }
    };
    const handlePricingChange = (field, value) => {
        setFormData(prev => {
            // Chuyển đổi value sang số nếu là dayType
            const newValue = field === "dayType" ? parseInt(value) : value;
            return { ...prev, [field]: newValue };
        });
    };


    const validateStep2 = () => {
        const newErrors = {};
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time part to start of day
    
            if (!formData.startDate) newErrors[`startDate`] = `Vui lòng chọn ngày bắt đầu`;
            if (!formData.endDate) newErrors[`endDate`] = `Vui lòng chọn ngày kết thúc`;
            if (formData.startDate && new Date(formData.startDate) < currentDate) {
                newErrors[`startDate`] = `Ngày bắt đầu không thể là ngày trong quá khứ`;
            }
            if (formData.endDate && new Date(formData.endDate) < currentDate) {
                newErrors[`endDate`] = `Ngày kết thúc không thể là ngày trong quá khứ`;
            }
            if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors[`startDate`] = `Ngày bắt đầu không thể sau ngày kết thúc`;
            }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
                                Bộ lọc phòng
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form>
                            <div>
                                {/* Content with price settings */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Khoảng thời gian áp dụng
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.startDate}
                                                        onChange={(e) => handlePricingChange("startDate", e.target.value)}
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
                                        </div>
                                    </div>
                                </div>




                            </div>
                            <div className='flex justify-end'>
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                       flex items-center gap-2"
                                >
                                    <FaSearch className="w-4 h-4" />
                                    Tìm kiếm
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};

export default FilterRoomStartAndEndDate;
