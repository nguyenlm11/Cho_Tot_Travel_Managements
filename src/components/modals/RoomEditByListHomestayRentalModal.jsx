import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBed, FaRegTimesCircle, FaPlus, FaCloudUploadAlt, FaTrash, FaInfoCircle, FaBath, FaWifi, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import roomAPI from '../../services/api/roomAPI';
import { MdNotificationsActive } from 'react-icons/md';

const RoomEditByListHomestayRentalModal = ({ isOpen, onClose, roomTypeId, onSuccess, homeStayRentalName, totalBathRooms, totalWifis, totalBathRoomsRental, totalWifisRental, roomID }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        roomNumber: '',
        isUsed: false,
        isActive: true,
        RoomTypesID: '',
        numberBed: 0,
        numberBathRoom: 0,
        numberWifi: 0,
    });
    // console.log(totalBathRooms);
    // console.log(totalWifis);
    // console.log(roomID);

    useEffect(() => {
        if (roomID) {
            fetchRoomDetail();
        }
    }, [roomID])

    const fetchRoomDetail = async () => {
        try {
            const response = await roomAPI.getRoomsByRoomId(roomID);
            if (response?.statusCode === 200) {
                setFormData({
                    roomNumber: response?.data?.roomNumber,
                    isActive: response?.data?.isActive,
                    RoomTypesID: response?.data?.roomTypesID,
                    numberBed: response?.data?.numberBed,
                    numberBathRoom: response?.data?.numberBathRoom,
                    numberWifi: response?.data?.numberWifi,
                })
                // console.log(response?.data);
            }
        } catch (error) {
            console.log(error);

        }
    }


    const validateForm = () => {
        const newErrors = {};
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Số phòng là bắt buộc';
        if (!formData.RoomTypesID) newErrors.RoomTypesID = 'Vui lòng chọn loại phòng';
        if (formData.numberBed < 1) {
            newErrors.numberBed = 'Số giường tối thiểu là 1';
        }
        if (formData.numberBed > 5) {
            newErrors.numberBed = 'Số giường không được nhập quá 5';
        }
        if (formData.numberBathRoom < 0) {
            newErrors.numberBathRoom = 'Số phòng tắm không thể là số âm';
        }
        if (formData.numberBathRoom === "") {
            newErrors.numberBathRoom = 'Số phòng tắm không thể để trống';
        }
        if (formData.numberBathRoom > 5) {
            newErrors.numberBathRoom = 'Số phòng tắm không được nhập quá 5';
        }
        // if (formData.numberBathRoom > totalBathRooms) {
        //     newErrors.numberBathRoom = 'Số phòng tắm không thể vượt quá tổng phòng tắm của căn'
        // }
        if (formData.numberWifi < 0) {
            newErrors.numberWifi = 'Số wifi không thể là số âm';
        }
        if (formData.numberWifi > 5) {
            newErrors.numberWifi = 'Số wifi không được nhập quá 5';
        }
        if (formData.numberWifi === "") {
            newErrors.numberWifi = 'Số wifi không thể để trống';
        }
        // if (formData.numberWifi > totalWifis) {
        //     newErrors.numberWifi = 'Số wifi không thể vượt quá tổng wifi của căn'
        // }
        return newErrors;
    };
    // console.log(roomTypeId);
    // console.log(homeStayRentalName);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                const dataToSubmit = {
                    roomNumber: formData.roomNumber.trim(),
                    isUsed: false,
                    isActive: formData.isActive,
                    RoomTypesID: formData.RoomTypesID,
                    numberBed: formData.numberBed,
                    numberBathRoom: formData.numberBathRoom,
                    numberWifi: formData.numberWifi,
                };
                // console.log(dataToSubmit);

                await roomAPI.updateRoomsByRoomId(roomID, dataToSubmit);
                toast.success('Cập nhật phòng thành công!');
                resetForm();
                onSuccess?.();
                onClose();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi chỉnh sửa phòng');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'numberBathRoom') {
            const remainingBathRoom = totalBathRoomsRental - totalBathRooms
            if (value > remainingBathRoom) {
                toast.error(`Lưu ý chỉ còn lại ${remainingBathRoom} phòng tắm`)
                value = remainingBathRoom
            }
        }
        if (name === 'numberWifi') {
            const remainingWifi = totalWifisRental - totalWifis
            if (value > remainingWifi) {
                toast.error(`Lưu ý chỉ còn lại ${remainingWifi} wifi`)
                value = remainingWifi
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

    };

    const resetForm = () => {
        setFormData({
            roomNumber: '',
            isUsed: false,
            isActive: true,
            RoomTypesID: '',
            numberBed: '',
            numberBathRoom: '',
            numberWifi: '',
        });
        setErrors({});
    };
    const user = JSON.parse(localStorage.getItem('userInfo'));

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
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg 
        overflow-y-auto max-h-[100vh] border border-gray-200/50 dark:border-gray-700/50
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
                                    Chỉnh sửa phòng
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
                            {user?.role === 'Owner' && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Tiện nghi phòng
                            </h3> */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Loại phòng<span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <select
                                            value={formData.RoomTypesID}
                                            name='roomTypeId'
                                            onChange={(e) => setFormData({ ...formData, RoomTypesID: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Chọn loại phòng</option>
                                            {roomTypeId?.map((items) => (
                                                <option key={items.roomTypesID} value={items.roomTypesID}>
                                                    {items?.name} - {homeStayRentalName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.RoomTypesID && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-1 text-sm text-red-500 flex items-center gap-1"
                                            >
                                                <FaRegTimesCircle />
                                                {errors.RoomTypesID}
                                            </motion.p>
                                        )}
                                    </motion.div>




                                    {/* Số phòng */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Số phòng<span className="text-red-500 ml-1">*</span>
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
                                    </motion.div>
                                </form>
                            )}

                            {/* Room Facilities */}
                            <div className="space-y-3">
                                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Tiện nghi phòng
                                </h3> */}
                                <div className="grid grid-cols-3 gap-3">
                                    {user?.role === 'Owner' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                                                    <FaBed className="mr-1.5 text-gray-500 dark:text-gray-400" />
                                                    Giường <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="numberBed"
                                                    value={formData.numberBed}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="5"
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 shadow-sm"
                                                />
                                                {errors.numberBed && (
                                                    <p className="mt-1 text-sm text-red-500 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors.numberBed}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                                                    <FaBath className="mr-1.5 text-gray-500 dark:text-gray-400" />
                                                    Phòng tắm <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="numberBathRoom"
                                                    value={formData.numberBathRoom}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="5"
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 shadow-sm"
                                                />
                                                {errors.numberBathRoom && (
                                                    <p className="mt-1 text-sm text-red-500 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors.numberBathRoom}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                                                    <FaWifi className="mr-1.5 text-gray-500 dark:text-gray-400" />
                                                    Wifi <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="numberWifi"
                                                    value={formData.numberWifi}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="5"
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 shadow-sm"
                                                />
                                                {errors.numberWifi && (
                                                    <p className="mt-1 text-sm text-red-500 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors.numberWifi}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className='flex items-center justify-between'>
                                        <div className="mb-3">
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
                                                    {formData.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                            <FaEdit className="w-4 h-4" />
                                            <span>Cập nhật</span>
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

export default RoomEditByListHomestayRentalModal; 