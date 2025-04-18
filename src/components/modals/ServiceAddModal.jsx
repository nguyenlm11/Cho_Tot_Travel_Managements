import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaCloudUploadAlt, FaCheck, FaInfoCircle, FaArrowLeft, FaArrowRight, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import serviceAPI from '../../services/api/serviceAPI';

const ServiceAddModal = ({ isOpen, onClose, selectedHomestay, onSuccess }) => {
    const [formData, setFormData] = useState({
        servicesName: '',
        description: '',
        unitPrice: '',
        servicesPrice: '',
        homeStayID: selectedHomestay,
        serviceType: '',
        quantity: 0,
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.servicesName.trim()) newErrors.servicesName = 'Tên dịch vụ là bắt buộc';
        if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Đơn giá phải lớn hơn 0';
        if (!formData.servicesPrice || formData.servicesPrice <= 0) newErrors.servicesPrice = 'Giá dịch vụ phải lớn hơn 0';
        if (!formData.serviceType) {
            newErrors.serviceType = 'Vui lòng chọn loại dịch vụ';
        }
        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }


        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.images.length) newErrors.images = 'Hình ảnh là bắt buộc';
        return newErrors;
    };

    const handleNextStep = () => {
        const newErrors = validateStep1();
        if (Object.keys(newErrors).length === 0) {
            setCurrentStep(2);
            setErrors({});
        } else {
            setErrors(newErrors);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(1);
        setErrors({});
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const newErrors = validateStep2();

        if (Object.keys(newErrors).length === 0) {
            setIsConfirmModalOpen(true);
        } else {
            setErrors(newErrors);
            // Scroll to the first error if any
            const firstErrorElement = document.querySelector('.text-red-500');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // Hiển thị thông báo lỗi
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    const confirmSubmit = async () => {
        setLoading(true);
        // console.log(formData);
        try {
            await serviceAPI.createService(formData);
            toast.success('Thêm dịch vụ thành công!');
            onSuccess?.();
            setIsConfirmModalOpen(false);
            onClose();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm dịch vụ');
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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previewImages.length > 3) {
            toast.error('Chỉ được chọn tối đa 3 ảnh');
            return;
        }

        const newImages = files.slice(0, 3 - previewImages.length);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));

        newImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
        if (errors.images) {
            setErrors(prev => ({ ...prev, images: null }));
        }
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        if (formData.images.length <= 1) {
            setErrors(prev => ({ ...prev, images: 'Hình ảnh là bắt buộc' }));
        }
    };

    const resetForm = () => {
        setFormData({
            servicesName: '',
            description: '',
            unitPrice: '',
            servicesPrice: '',
            homeStayID: selectedHomestay,
            serviceType: '',
            quantity: 0,
            images: []
        });
        setPreviewImages([]);
        setErrors({});
        setCurrentStep(1);
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
                                    Thêm dịch vụ mới
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
                        <div className="p-5">
                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Step 1: Basic Information */}
                                <AnimatePresence mode="wait">
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="mb-4">
                                                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Thông tin cơ bản
                                                </h3>
                                            </div>

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
                                                <div className='mb-4'>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                        Loại dịch vụ <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.serviceType}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, serviceType: e.target.value });
                                                            if (e.target.value) {
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    serviceType: null
                                                                }));
                                                            }
                                                        }}
                                                        className={`mt-1 block w-full border ${errors.serviceType ? 'border-red-500' : 'border-gray-300'
                                                            } rounded-md p-2 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                                    >
                                                        <option value="">Chọn loại dịch vụ</option>
                                                        <option value="0">Thuê theo số lượt</option>
                                                        <option value="2">Thuê theo ngày</option>
                                                    </select>
                                                    {errors.serviceType && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                                            {errors.serviceType}
                                                        </p>
                                                    )}
                                                </div>


                                                <div className='mb-4'>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                        Số lượng <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.quantity}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value);
                                                            if (value > 0 || e.target.value === '') {
                                                                setFormData({ ...formData, quantity: +e.target.value });
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '' || parseInt(value) <= 0) {
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    quantity: 'Số lượng phải lớn hơn 0'
                                                                }));
                                                            } else {
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    quantity: null
                                                                }));
                                                            }
                                                        }}
                                                        className={`mt-1 block w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'
                                                            } rounded-md p-2 dark:bg-gray-700 dark:text-white`}
                                                        min="1"
                                                        placeholder="Nhập số lượng..."
                                                    />
                                                    {errors.quantity && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                                            {errors.quantity}
                                                        </p>
                                                    )}
                                                </div>

                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Images */}
                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-4"
                                        >
                                            {/* Image Upload Section */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Hình ảnh dịch vụ <span className="text-red-500">*</span>
                                                    </label>
                                                </div>
                                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                                                    rounded-lg p-5 text-center cursor-pointer hover:border-primary transition-colors"
                                                    onClick={() => document.getElementById('service-images').click()}
                                                >
                                                    <input
                                                        id="service-images"
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                    <FaCloudUploadAlt className="mx-auto h-10 w-10 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        Kéo thả hoặc click để tải ảnh lên
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        PNG, JPG, GIF tối đa 10MB (Tối đa 3 ảnh)
                                                    </p>
                                                </div>
                                                {errors.images && (
                                                    <p className="mt-1 text-sm text-red-500 flex items-center">
                                                        <FaInfoCircle className="mr-1.5 flex-shrink-0" />
                                                        {errors.images}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Image Previews */}
                                            {previewImages.length > 0 && (
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                            <FaImage className="mr-2 text-primary" /> Xem trước
                                                        </h3>
                                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                                            {previewImages.length}/3 ảnh
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {previewImages.map((preview, index) => (
                                                            <div key={index} className="relative rounded-lg overflow-hidden aspect-video 
                                                                border border-gray-200 dark:border-gray-700 group">
                                                                <img
                                                                    src={preview}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                                                    transition-opacity duration-200 flex items-center justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImage(index)}
                                                                        className="p-2 bg-red-500 rounded-full text-white transform 
                                                                            transition-transform duration-200 hover:scale-110"
                                                                    >
                                                                        <FaTrash className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs 
                                                                    w-5 h-5 rounded-full flex items-center justify-center">
                                                                    {index + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}


                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className={`flex ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
                                {currentStep === 2 && (
                                    <button
                                        onClick={handlePrevStep}
                                        className="px-4 py-2 rounded-lg border border-gray-300 
                                            dark:border-gray-600 text-gray-700 dark:text-gray-300 
                                            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                            flex items-center"
                                    >
                                        <FaArrowLeft className="mr-2" />
                                        Quay lại
                                    </button>
                                )}

                                {currentStep === 1 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="px-5 py-2 rounded-lg bg-primary text-white 
                                            hover:bg-primary-dark transition-colors flex items-center"
                                    >
                                        Tiếp theo
                                        <FaArrowRight className="ml-2" />
                                    </button>
                                ) : (
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
                                            <span>Thêm dịch vụ</span>
                                        )}
                                    </button>
                                )}
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
                                    Xác nhận thêm mới
                                </h3>
                            </div>
                            <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">
                                Bạn có chắc chắn muốn thêm dịch vụ mới này?
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

export default ServiceAddModal;
