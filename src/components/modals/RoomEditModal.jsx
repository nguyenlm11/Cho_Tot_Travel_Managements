import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBed, FaRegTimesCircle, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import roomAPI from '../../services/api/roomAPI';
import { MdNotificationsActive } from 'react-icons/md';

const RoomEditModal = ({ isOpen, onClose, roomTypeId, onSuccess }) => {
    const [formData, setFormData] = useState({ roomNumber: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchRoomById = async () => {
            try {
                const response = await roomAPI.getRoomsByRoomId(isOpen?.roomSelect);
                if (response.statusCode === 200) {
                    setFormData(response.data);
                }
            } catch (error) {
                console.error('Error fetching homestays:', error);
                toast.error('Không thể tải homestay');
            }
        }
        if (isOpen?.roomSelect) fetchRoomById();
        setErrors({})
    }, [isOpen])

    const validateForm = () => {
        const newErrors = {};
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Số phòng là bắt buộc';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                const dataToSubmit = {
                    ...formData,
                    roomNumber: formData.roomNumber.trim(),
                };
                await roomAPI.updateRoomsByRoomId(isOpen?.roomSelect, dataToSubmit);
                toast.success('Cập nhật phòng mới thành công!');
                resetForm();
                onSuccess?.();
                onClose();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phòng');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const resetForm = () => {
        setFormData({ roomNumber: '' });
        setErrors({});
    };

    return (
        <AnimatePresence>
            {isOpen?.isOpen && (
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
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md 
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
                                    to-primary-dark bg-clip-text text-transparent flex items-center gap-2"
                                >
                                    <FaBed className="text-primary" />
                                    Cập nhât phòng
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
                                {/* Số phòng */}



                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {user?.role === "Owner" && (
                                        <>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Số phòng *
                                            </label>
                                            <input
                                                type="text"
                                                name="roomNumber"
                                                value={formData.roomNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 
                                            dark:border-gray-600 dark:bg-gray-700 focus:ring-2 
                                            focus:ring-primary/50 transition-all duration-200"
                                                placeholder="Nhập số phòng (vd: 101, A101, ...)"
                                            />
                                            {errors.roomNumber && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-1 text-sm text-red-500 flex items-center gap-1"
                                                >
                                                    <FaRegTimesCircle />
                                                    {errors.roomNumber}
                                                </motion.p>
                                            )}
                                        </>
                                    )}

                                    <div className='flex items-center justify-between'>
                                        <div className="my-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                <MdNotificationsActive className="mr-1 text-gray-400" />
                                                Trạng thái <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 
                                                    ${formData.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full 
                                                        transition-transform duration-200 shadow
                                                        ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {formData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                                </span>
                                            </label>
                                        </div>

                                        {/* <div className="my-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isUsed}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, isUsed: e.target.checked }))}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 
                                                    ${formData.isUsed ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full 
                                                        transition-transform duration-200 shadow
                                                        ${formData.isUsed ? 'translate-x-6' : 'translate-x-0'}`}>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {formData.isUsed ? 'Đang sử dụng' : 'Đang trống'}
                                                </span>
                                            </label>
                                        </div> */}
                                    </div>
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
                                        disabled:cursor-not-allowed flex items-center gap-2"
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
                                        <>
                                            <FaPlus className="w-4 h-4" />
                                            <span>Cập nhật phòng</span>
                                        </>
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

export default RoomEditModal; 