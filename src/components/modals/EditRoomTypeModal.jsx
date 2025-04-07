import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';
import { FaBed, FaBath, FaWifi, FaUser, FaChild, FaUsers, FaCheck, FaInfoCircle } from 'react-icons/fa';
import roomTypeAPI from '../../services/api/roomTypeAPI';


const EditRoomTypeModal = ({ roomType, onClose, isOpen, fetchRoomType }) => {
    const [formData, setFormData] = useState({
        name: roomType?.name,
        description: roomType?.description,
        numberBedRoom: roomType?.numberBedRoom,
        numberBathRoom: roomType?.numberBathRoom,
        numberWifi: roomType?.numberWifi,
        status: roomType?.status,
        maxAdults: roomType?.maxAdults,
        maxChildren: roomType?.maxChildren,
        maxPeople: roomType?.maxPeople,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(roomType);

    }, [roomType])

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Tên loại phòng là bắt buộc';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả là bắt buộc';
        }
        if (formData.numberBedRoom < 0) {
            newErrors.numberBedRoom = 'Số giường không thể là số âm';
        }
        if (formData.numberBathRoom < 0) {
            newErrors.numberBathRoom = 'Số phòng tắm không thể là số âm';
        }
        if (formData.numberWifi < 0) {
            newErrors.numberWifi = 'Số Wifi không thể là số âm';
        }
        if (formData.maxAdults < 1) {
            newErrors.maxAdults = 'Số người lớn tối thiểu là 1';
        }
        if (formData.maxChildren < 0) {
            newErrors.maxChildren = 'Số trẻ em không thể là số âm';
        }
        if (formData.maxPeople < 1) {
            newErrors.maxPeople = 'Số người tối đa phải lớn hơn 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            const numValue = parseInt(value) || 0;
            if (name === 'MaxAdults' || name === 'MaxChildren') {
                const otherField = name === 'MaxAdults' ? 'MaxChildren' : 'MaxAdults';
                const totalPeople = numValue + (formData[otherField] || 0);
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue,
                    MaxPeople: totalPeople
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // const handleSubmit = (e) => {

    //     if (validateForm()) {
    //         const firstError = Object.keys(errors)[0];
    //         const element = document.querySelector(`[name="${firstError}"]`);
    //         if (element) {
    //             element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //         }
    //     }
    // };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            const loadingToast = toast.loading('Đang cập nhật loại phòng...');

            try {
                const response = await roomTypeAPI.updateRoomType(roomType?.roomTypesID, formData);
                if (response.statusCode === 200) {
                    toast.dismiss(loadingToast);
                    toast.success('Cập nhật loại phòng thành công!');
                    onClose();
                    fetchRoomType();
                } else {
                    throw new Error(response.message || "Cập nhật loại phòng thất bại");
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error(error.message || 'Có lỗi xảy ra khi cập nhật loại phòng');
            } finally {
                setLoading(false);
                // setIsModalOpen(false);
            }
        }
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
                                Chỉnh sửa loại phòng
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key="step1"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Thông tin cơ bản
                                                </h3>

                                                {/* Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Tên loại phòng <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập tên loại phòng (VD: Phòng Standard, Phòng Deluxe...)"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                    </div>
                                                    {errors.name && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Mô tả <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        rows="3"
                                                        placeholder="Mô tả chi tiết về loại phòng này..."
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                                                    />
                                                    {errors.description && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Room Facilities */}
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Tiện nghi phòng
                                                </h3>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaBed className="mr-1 text-gray-400" />
                                                            Giường <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberBedRoom"
                                                            value={formData.numberBedRoom}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="50"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.numberBedRoom && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.numberBedRoom}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaBath className="mr-1 text-gray-400" />
                                                            Phòng tắm <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberBathRoom"
                                                            value={formData.numberBathRoom}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="50"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.numberBathRoom && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.numberBathRoom}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaWifi className="mr-1 text-gray-400" />
                                                            Wifi <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberWifi"
                                                            value={formData.numberWifi}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="50"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.numberWifi && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.numberWifi}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Guest Capacity */}
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Sức chứa
                                                </h3>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaUser className="mr-1 text-gray-400" />
                                                            Người lớn <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="maxAdults"
                                                            value={formData.maxAdults}
                                                            onChange={handleInputChange}
                                                            min="1"
                                                            max="10"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.maxAdults && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.maxAdults}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaChild className="mr-1 text-gray-400" />
                                                            Trẻ em <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="maxChildren"
                                                            value={formData.maxChildren}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="10"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.maxChildren && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.maxChildren}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaUsers className="mr-1 text-gray-400" />
                                                            Tổng <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="maxPeople"
                                                            value={formData.maxPeople}
                                                            onChange={handleInputChange}
                                                            min="1"
                                                            max="20"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.MaxPeople && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.MaxPeople}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Navigation buttons */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <>
                                            <FaCheck className="mr-2" />
                                            <span>Cập nhật loại phòng</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditRoomTypeModal;
