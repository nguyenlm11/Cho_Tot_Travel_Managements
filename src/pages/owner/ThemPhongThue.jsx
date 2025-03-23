import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBed, FaBath, FaWifi, FaUtensils, FaUsers, FaUpload, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import homestayAPI from '../../services/api/homestayAPI';

const ThemPhongThue = () => {
    const navigate = useNavigate();
    const { homestayId } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Name: '',
        Description: '',
        HomeStayID: homestayId,
        numberBedRoom: 0,
        numberBathRoom: 0,
        numberKitchen: 0,
        numberWiFi: 0,
        Status: false,
        RentWhole: true,
        MaxAdults: 0,
        MaxChildren: 0,
        MaxPeople: 0,
        IMAGES: [],
        PricingJson: '',
        Pricing: []
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Name.trim()) newErrors.Name = 'Vui lòng nhập tên phòng';
        if (!formData.Description.trim()) newErrors.Description = 'Vui lòng nhập mô tả';
        if (formData.numberBedRoom <= 0) newErrors.numberBedRoom = 'Số phòng ngủ phải lớn hơn 0';
        if (formData.numberBathRoom <= 0) newErrors.numberBathRoom = 'Số phòng tắm phải lớn hơn 0';
        if (formData.MaxAdults <= 0) newErrors.MaxAdults = 'Số người lớn tối đa phải lớn hơn 0';
        if (formData.MaxChildren < 0) newErrors.MaxChildren = 'Số trẻ em không được âm';
        if (formData.IMAGES.length === 0) newErrors.IMAGES = 'Vui lòng tải lên ít nhất 1 hình ảnh';
        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleToggleChange = (name) => {
        setFormData(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.IMAGES.length > 5) {
            toast.error('Chỉ được tải lên tối đa 5 hình ảnh');
            return;
        }

        const newImages = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Hình ảnh ${file.name} vượt quá 5MB`);
                return false;
            }
            return true;
        });

        setFormData(prev => ({
            ...prev,
            IMAGES: [...prev.IMAGES, ...newImages]
        }));

        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            IMAGES: prev.IMAGES.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Đang xử lý...');

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'IMAGES') {
                    formData.IMAGES.forEach(image => {
                        formDataToSend.append('IMAGES', image);
                    });
                } else if (key === 'Pricing') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await homestayAPI.createHomestayRental(formDataToSend);
            toast.dismiss(loadingToast);
            toast.success('Thêm phòng thuê thành công!');
            navigate(`/owner/homestay/${homestayId}/rooms`);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Có lỗi xảy ra khi thêm phòng thuê');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8"
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Thêm Phòng Thuê Mới
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Điền đầy đủ thông tin để tạo phòng thuê mới
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên phòng *
                                </label>
                                <input
                                    type="text"
                                    name="Name"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                />
                                {errors.Name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.Name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mô tả *
                                </label>
                                <textarea
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                />
                                {errors.Description && (
                                    <p className="mt-1 text-sm text-red-500">{errors.Description}</p>
                                )}
                            </div>
                        </div>

                        {/* Thông tin phòng */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số phòng ngủ *
                                </label>
                                <div className="relative">
                                    <FaBed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="numberBedRoom"
                                        value={formData.numberBedRoom}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                {errors.numberBedRoom && (
                                    <p className="mt-1 text-sm text-red-500">{errors.numberBedRoom}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số phòng tắm *
                                </label>
                                <div className="relative">
                                    <FaBath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="numberBathRoom"
                                        value={formData.numberBathRoom}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                {errors.numberBathRoom && (
                                    <p className="mt-1 text-sm text-red-500">{errors.numberBathRoom}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số nhà bếp
                                </label>
                                <div className="relative">
                                    <FaUtensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="numberKitchen"
                                        value={formData.numberKitchen}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số WiFi
                                </label>
                                <div className="relative">
                                    <FaWifi className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="numberWiFi"
                                        value={formData.numberWiFi}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Thông tin khách */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số người lớn tối đa *
                                </label>
                                <div className="relative">
                                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="MaxAdults"
                                        value={formData.MaxAdults}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                {errors.MaxAdults && (
                                    <p className="mt-1 text-sm text-red-500">{errors.MaxAdults}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số trẻ em tối đa
                                </label>
                                <div className="relative">
                                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="MaxChildren"
                                        value={formData.MaxChildren}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tổng số người tối đa
                                </label>
                                <div className="relative">
                                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="MaxPeople"
                                        value={formData.MaxPeople}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tùy chọn */}
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.Status}
                                    onChange={() => handleToggleChange('Status')}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Kích hoạt
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.RentWhole}
                                    onChange={() => handleToggleChange('RentWhole')}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Cho thuê nguyên căn
                                </span>
                            </label>
                        </div>

                        {/* Upload hình ảnh */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hình ảnh phòng *
                            </label>
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="border-2 border-dashed rounded-xl p-6 text-center
                                    hover:border-primary/50 transition-colors duration-200"
                            >
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
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <FaUpload className="w-10 h-10 text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Kéo thả hoặc click để tải lên hình ảnh
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Hỗ trợ: JPG, PNG (Tối đa 5MB/ảnh)
                                    </p>
                                </label>
                            </motion.div>

                            {/* Preview hình ảnh */}
                            {previewImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                    {previewImages.map((preview, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative aspect-video rounded-lg overflow-hidden"
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
                                                className="absolute top-2 right-2 p-1 bg-red-500 
                                                    rounded-full text-white hover:bg-red-600"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                            {errors.IMAGES && (
                                <p className="mt-1 text-sm text-red-500">{errors.IMAGES}</p>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex justify-end gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -4 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 rounded-xl border hover:bg-gray-100"
                        >
                            Hủy
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-primary text-white
                                hover:bg-primary-dark disabled:opacity-50 shadow-lg
                                hover:shadow-primary/25 transition-all duration-200"
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
                                'Thêm phòng thuê'
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
            <Toaster />
        </motion.div>
    );
};

export default ThemPhongThue; 