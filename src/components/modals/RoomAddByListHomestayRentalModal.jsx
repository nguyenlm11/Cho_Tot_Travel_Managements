import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBed, FaRegTimesCircle, FaPlus, FaCloudUploadAlt, FaTrash, FaInfoCircle, FaBath, FaWifi } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import roomAPI from '../../services/api/roomAPI';

const RoomAddByListHomestayRentalModal = ({ isOpen, onClose, roomTypeId, onSuccess, homeStayRentalName, totalBathRooms, totalWifis, totalBathRoomsRental, totalWifisRental }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImages, setPreviewImages] = useState([]);
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

    // console.log(totalBathRoomsRental);
    // console.log(totalWifisRental);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Số phòng là bắt buộc';
        if (!formData.RoomTypesID) newErrors.RoomTypesID = 'Vui lòng chọn loại phòng';
        if (!formData.Images || formData.Images.length === 0) {
            newErrors.Images = 'Vui lòng tải lên ít nhất một hình ảnh';
        }
        if (formData.numberBed < 1) {
            newErrors.numberBed = 'Số giường tối thiểu là 1';
        }
        if (formData.numberBed > 5) {
            newErrors.numberBed = 'Số giường tối đa là 5';
        }
        if (formData.numberBathRoom < 0) {
            newErrors.numberBathRoom = 'Số phòng tắm không thể là số âm';
        }
        if (formData.numberBathRoom === "") {
            newErrors.numberBathRoom = 'Số phòng tắm không thể để trống';
        }
        if (formData.numberBathRoom > 5) {
            newErrors.numberBathRoom = 'Số phòng tắm tối đa là 5';
        }
        // if (formData.numberBathRoom > totalBathRooms) {
        //     newErrors.numberBathRoom = 'Số phòng tắm không thể vượt quá tổng phòng tắm của căn'
        // }
        if (formData.numberWifi < 0) {
            newErrors.numberWifi = 'Số wifi không thể là số âm';
        }
        if (formData.numberWifi === '') {
            newErrors.numberWifi = 'Số wifi không thể để trống';
        }
        if (formData.numberWifi > 5) {
            newErrors.numberWifi = 'Số wifi tối đa là 5';
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
                    isActive: true,
                    RoomTypesID: formData.RoomTypesID,
                    numberBed: Number(formData.numberBed),
                    numberBathRoom: Number(formData.numberBathRoom),
                    numberWifi: Number(formData.numberWifi),
                    Images: formData.Images
                };
                // console.log(dataToSubmit);

                await roomAPI.createRoom(dataToSubmit);
                toast.success('Thêm phòng mới thành công!');
                resetForm();
                onSuccess?.();
                onClose();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm phòng');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };
    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Kiểm tra số lượng ảnh hiện tại + ảnh mới không vượt quá 5
        if (previewImages.length + files.length > 5) {
            toast.error('Chỉ được tải lên tối đa 5 ảnh');
            return;
        }

        // Cập nhật formData với mảng ảnh mới
        setFormData(prev => ({
            ...prev,
            Images: [...(prev.Images || []), ...files] // Thêm kiểm tra prev.Images
        }));

        // Tạo preview cho các ảnh mới
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            Images: (prev.Images || []).filter((_, i) => i !== index) // Thêm kiểm tra prev.Images
        }));
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
            numberBed: 0,
            numberBathRoom: 0,
            numberWifi: 0,
            Images: [] // Reset Images về mảng rỗng
        });
        setPreviewImages([]); // Reset preview images
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
                                    Thêm phòng mới
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

                            {/* Room Facilities */}
                            <div className="space-y-3">
                                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Tiện nghi phòng
                                </h3> */}
                                <div className="grid grid-cols-3 gap-3">
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
                                </div>
                            </div>



                            {/* Images */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Hình ảnh
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Hình ảnh loại phòng <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                                        onClick={() => document.getElementById('image-upload').click()}
                                    >
                                        <input
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <FaCloudUploadAlt className="mx-auto h-10 w-10 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Kéo thả hoặc click để tải ảnh lên
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Hỗ trợ JPG, PNG, WEBP (Tối đa 5 ảnh)
                                        </p>
                                    </div>
                                    {errors.Images && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                            <FaInfoCircle className="mr-1" /> {errors.Images}
                                        </p>
                                    )}
                                </div>

                                {/* Preview Images */}
                                {previewImages.length > 0 && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Xem trước ({previewImages.length} ảnh)
                                            </h3>
                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                                {previewImages.length}/5 ảnh
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {previewImages.map((img, index) => (
                                                <div key={index} className="relative rounded-lg overflow-hidden h-32">
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="p-1 bg-red-500 rounded-full text-white"
                                                        >
                                                            <FaTrash className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                            <FaPlus className="w-4 h-4" />
                                            <span>Thêm phòng</span>
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

export default RoomAddByListHomestayRentalModal; 