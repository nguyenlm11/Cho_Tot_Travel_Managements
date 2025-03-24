import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import homestayRentalAPI from "../../services/api/homestayrentalAPI";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
    }
};

const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const inputGroupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5, ease: "easeIn" } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: "easeIn" } }
};

const AddHomestayRental = () => {
    const navigate = useNavigate();
    const { id: homestayId } = useParams();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        Name: "",
        Description: "",
        HomeStayID: homestayId,
        numberBedRoom: 0,
        numberBathRoom: 0,
        numberKitchen: 0,
        numberWifi: 0,
        RentWhole: true,
        MaxAdults: 0,
        MaxChildren: 0,
        MaxPeople: 0,
        Images: [],
        Pricing: [],
        pricingEntries: [{
            unitPrice: 0,
            rentPrice: 0,
            startDate: "",
            endDate: "",
            isDefault: true,
            isActive: true,
            dayType: 0,
            description: "",
        }],
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.Name.trim()) newErrors.Name = 'Vui lòng nhập tên phòng';
        if (!formData.Description.trim()) newErrors.Description = 'Vui lòng nhập mô tả chi tiết';
        if (formData.numberBedRoom <= 0) newErrors.numberBedRoom = 'Số phòng ngủ phải lớn hơn 0';
        if (formData.numberBathRoom <= 0) newErrors.numberBathRoom = 'Số phòng tắm phải lớn hơn 0';
        if (formData.numberKitchen < 0) newErrors.numberKitchen = 'Số nhà bếp không được âm';
        if (formData.numberWifi < 0) newErrors.numberWifi = 'Số wifi không được âm';
        if (formData.MaxAdults <= 0) newErrors.MaxAdults = 'Số người lớn tối đa phải lớn hơn 0';
        if (formData.MaxChildren < 0) newErrors.MaxChildren = 'Số trẻ em không được âm';
        if (formData.MaxPeople <= 0) newErrors.MaxPeople = 'Tổng số người tối đa phải lớn hơn 0';
        if (formData.MaxPeople < (formData.MaxAdults + formData.MaxChildren)) {
            newErrors.MaxPeople = 'Tổng số người tối đa phải lớn hơn hoặc bằng số người lớn và trẻ em';
        }
        if (formData.Images.length === 0) newErrors.Images = 'Vui lòng tải lên ít nhất 1 hình ảnh';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (formData.RentWhole) {
            formData.pricingEntries.forEach((entry, index) => {
                if (entry.unitPrice <= 0) newErrors[`unitPrice_${index}`] = `Đơn giá phải lớn hơn 0 VNĐ`;
                if (entry.rentPrice <= 0) newErrors[`rentPrice_${index}`] = `Giá thuê phải lớn hơn 0 VNĐ`;
                if (entry.unitPrice > entry.rentPrice) {
                    newErrors[`unitPrice_${index}`] = `Đơn giá không được lớn hơn giá thuê`;
                }
                if (entry.dayType < 0) newErrors[`dayType_${index}`] = `Loại ngày không được âm`;
                if (!entry.description.trim()) newErrors[`description_${index}`] = `Vui lòng nhập mô tả giá`;
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value === "true" || value === "false" ? value === "true" : value
        }));
    };

    const handlePricingChange = (index, field, value) => {
        setFormData(prev => {
            const updatedPricingEntries = [...prev.pricingEntries];
            updatedPricingEntries[index] = {
                ...updatedPricingEntries[index],
                [field]: field === "unitPrice" || field === "rentPrice" || field === "dayType" ? Number(value) : value
            };
            return { ...prev, pricingEntries: updatedPricingEntries };
        });
    };

    const addPricingEntry = () => {
        setFormData(prev => ({
            ...prev,
            pricingEntries: [
                ...prev.pricingEntries,
                { unitPrice: 0, rentPrice: 0, startDate: "", endDate: "", isDefault: true, isActive: true, dayType: 0, description: "" }
            ]
        }));
    };

    const removePricingEntry = (index) => {
        if (formData.pricingEntries.length === 1) {
            toast.error('Phải có ít nhất một mục giá.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            pricingEntries: prev.pricingEntries.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = files.length + formData.Images.length;

        if (totalImages > 5) {
            toast.error(`Chỉ được tải lên tối đa 5 hình ảnh (${totalImages - 5} ảnh quá giới hạn)`);
            return;
        }

        const validImages = files.filter(file => {
            const isValidSize = file.size <= 5 * 1024 * 1024;
            const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);

            if (!isValidSize) toast.error(`Hình ảnh ${file.name} vượt quá 5MB`);
            if (!isValidType) toast.error(`Hình ảnh ${file.name} không đúng định dạng`);

            return isValidSize && isValidType;
        });

        setFormData(prev => ({
            ...prev,
            Images: [...prev.Images, ...validImages]
        }));

        Promise.all(validImages.map(file =>
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            })
        )).then(results => {
            setPreviewImages(prev => [...prev, ...results]);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            Images: prev.Images.filter((_, i) => i !== index)
        }));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            if (formData.RentWhole === true) {
                setStep(2);
            } else {
                setIsModalOpen(true);
            }
        } else {
            return;
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateStep1()) {
            setStep(1);
            return;
        }

        if (formData.RentWhole === true && !validateStep2()) {
            return;
        }

        setIsModalOpen(true);
    };

    const confirmSubmit = async () => {
        setIsModalOpen(false);
        setLoading(true);
        const loadingToast = toast.loading('Đang xử lý yêu cầu của bạn...');

        try {
            const rentalData = {
                Name: formData.Name,
                Description: formData.Description,
                HomeStayID: formData.HomeStayID,
                numberBedRoom: formData.numberBedRoom,
                numberBathRoom: formData.numberBathRoom,
                numberKitchen: formData.numberKitchen,
                numberWifi: formData.numberWifi,
                Status: true, // Mặc định luôn là true
                RentWhole: formData.RentWhole,
                MaxAdults: formData.MaxAdults,
                MaxChildren: formData.MaxChildren,
                MaxPeople: formData.MaxPeople,
                Images: formData.Images,
                PricingJson: formData.RentWhole ? JSON.stringify(
                    formData.pricingEntries.map(entry => ({
                        unitPrice: entry.unitPrice,
                        rentPrice: entry.rentPrice,
                        startDate: entry.startDate || null,
                        endDate: entry.endDate || null,
                        isDefault: entry.isDefault,
                        isActive: entry.isActive,
                        dayType: entry.dayType,
                        description: entry.description || ""
                    }))
                ) : ""
            };

            const response = await homestayRentalAPI.createHomestayRental(rentalData);

            if (response.statusCode === 201) {
                toast.dismiss(loadingToast);
                toast.success('Thêm phòng thuê thành công!');
                navigate(`/owner/homestays/${homestayId}/homestay-rental`);
            } else {
                throw new Error(response.message || "Thêm phòng thuê thất bại");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Có lỗi xảy ra khi thêm phòng thuê');
        } finally {
            setLoading(false);
        }
    };

    const cancelSubmit = () => {
        setIsModalOpen(false);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6"
        >
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-block p-2 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4 backdrop-blur-sm">
                        <FaHome className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent mb-4">
                        Thêm phòng thuê mới
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Tạo không gian nghỉ dưỡng tuyệt vời cho khách hàng của bạn
                    </p>
                </motion.div>

                <motion.form
                    variants={formVariants}
                    onSubmit={handleSubmit}
                    className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
                >
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                            <FaHome className="text-primary" />
                            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                {step === 1 ? 'Thông tin cơ bản' : 'Thiết lập giá'}
                            </span>
                        </h2>
                    </div>

                    <div className="p-8 space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <motion.div variants={inputGroupVariants} className="group">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <span>Tên phòng</span>
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                name="Name"
                                                placeholder="Nhập tên phòng"
                                                value={formData.Name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                required
                                            />
                                            <FaHome className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                        </div>
                                        {errors.Name && <p className="text-red-500 text-sm mt-1">{errors.Name}</p>}
                                    </motion.div>

                                    <motion.div variants={inputGroupVariants} className="group">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <span>Mô tả</span>
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="Description"
                                            placeholder="Mô tả chi tiết về phòng thuê"
                                            value={formData.Description}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 min-h-[120px] resize-y"
                                            required
                                        />
                                        {errors.Description && <p className="text-red-500 text-sm mt-1">{errors.Description}</p>}
                                    </motion.div>

                                    <motion.div variants={inputGroupVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Phòng ngủ <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="numberBedRoom"
                                                value={formData.numberBedRoom}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="50"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.numberBedRoom && <p className="text-red-500 text-sm mt-1">{errors.numberBedRoom}</p>}
                                        </div>
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Phòng tắm <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="numberBathRoom"
                                                value={formData.numberBathRoom}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="50"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.numberBathRoom && <p className="text-red-500 text-sm mt-1">{errors.numberBathRoom}</p>}
                                        </div>
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Nhà bếp
                                            </label>
                                            <input
                                                type="number"
                                                name="numberKitchen"
                                                value={formData.numberKitchen}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="10"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.numberKitchen && <p className="text-red-500 text-sm mt-1">{errors.numberKitchen}</p>}
                                        </div>
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Wifi
                                            </label>
                                            <input
                                                type="number"
                                                name="numberWifi"
                                                value={formData.numberWifi}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="10"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.numberWifi && <p className="text-red-500 text-sm mt-1">{errors.numberWifi}</p>}
                                        </div>
                                    </motion.div>

                                    <motion.div variants={inputGroupVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Người lớn tối đa <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="MaxAdults"
                                                value={formData.MaxAdults}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.MaxAdults && <p className="text-red-500 text-sm mt-1">{errors.MaxAdults}</p>}
                                        </div>
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Trẻ em tối đa
                                            </label>
                                            <input
                                                type="number"
                                                name="MaxChildren"
                                                value={formData.MaxChildren}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.MaxChildren && <p className="text-red-500 text-sm mt-1">{errors.MaxChildren}</p>}
                                        </div>
                                        <div className="group">
                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Tổng số người tối đa <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="MaxPeople"
                                                value={formData.MaxPeople}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="200"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                            />
                                            {errors.MaxPeople && <p className="text-red-500 text-sm mt-1">{errors.MaxPeople}</p>}
                                        </div>
                                    </motion.div>

                                    <motion.div variants={inputGroupVariants} className="group">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Loại hình thuê <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="RentWhole"
                                            value={formData.RentWhole}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                        >
                                            <option value={true}>Thuê nguyên căn</option>
                                            <option value={false}>Thuê từng phòng</option>
                                        </select>
                                    </motion.div>

                                    <motion.div variants={inputGroupVariants} className="space-y-4">
                                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 block">
                                            Hình ảnh <span className="text-red-500">*</span>
                                        </label>
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary dark:hover:border-primary transition-all duration-300 cursor-pointer relative bg-gray-50/50 dark:bg-gray-700/50 group"
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex flex-col items-center"
                                            >
                                                <FaHome className="w-12 h-12 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                                    Kéo thả hoặc click để tải ảnh lên
                                                </p>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Hỗ trợ: JPG, PNG (Tối đa 5MB)
                                                </p>
                                            </motion.div>
                                        </motion.div>
                                        {errors.Images && <p className="text-red-500 text-sm mt-1">{errors.Images}</p>}

                                        {previewImages.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6"
                                            >
                                                {previewImages.map((preview, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                                                        >
                                                            <FaTimes className="w-4 h-4" />
                                                        </motion.button>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    {formData.pricingEntries.map((entry, index) => (
                                        <motion.div
                                            key={index}
                                            variants={inputGroupVariants}
                                            className="border-2 border-gray-200 dark:border-gray-600 p-6 rounded-xl relative bg-white/50 dark:bg-gray-700/50"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                Giá {index + 1}
                                            </h3>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removePricingEntry(index)}
                                                className="absolute top-4 right-4 p-1.5 bg-red-500/90 text-white rounded-full transition-all duration-300 hover:bg-red-600"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </motion.button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Đơn giá <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={entry.unitPrice}
                                                            onChange={(e) => handlePricingChange(index, "unitPrice", e.target.value)}
                                                            min="0"
                                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    {errors[`unitPrice_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`unitPrice_${index}`]}</p>}
                                                </div>
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Giá thuê <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={entry.rentPrice}
                                                            onChange={(e) => handlePricingChange(index, "rentPrice", e.target.value)}
                                                            min="0"
                                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    {errors[`rentPrice_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`rentPrice_${index}`]}</p>}
                                                </div>
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Ngày bắt đầu
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={entry.startDate}
                                                        onChange={(e) => handlePricingChange(index, "startDate", e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Ngày kết thúc
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={entry.endDate}
                                                        onChange={(e) => handlePricingChange(index, "endDate", e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Loại ngày
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={entry.dayType}
                                                        onChange={(e) => handlePricingChange(index, "dayType", e.target.value)}
                                                        min="0"
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                    />
                                                    {errors[`dayType_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`dayType_${index}`]}</p>}
                                                </div>
                                                <div className="md:col-span-2 group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Mô tả <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={entry.description}
                                                        onChange={(e) => handlePricingChange(index, "description", e.target.value)}
                                                        rows="3"
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                        placeholder="Mô tả thêm về giá thuê..."
                                                    />
                                                    {errors[`description_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`description_${index}`]}</p>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <motion.div variants={inputGroupVariants} className="flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={addPricingEntry}
                                            className="flex items-center px-6 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all duration-300"
                                        >
                                            <FaPlus className="mr-2" /> Thêm giá mới
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="px-8 py-6 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        {step === 2 && (
                            <motion.button
                                whileHover={{ scale: 1.02, x: -4 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                            >
                                <span>Quay lại</span>
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            type={step === 1 ? "button" : "submit"}
                            onClick={step === 1 ? handleNextStep : undefined}
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    <FaHome className="w-5 h-5" />
                                    <span>{step === 1 ? 'Tiếp tục' : 'Thêm phòng thuê'}</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md mx-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Xác nhận thêm phòng thuê
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={cancelSubmit}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </motion.button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Bạn có chắc chắn muốn thêm phòng thuê này không?
                            </p>
                            <div className="flex justify-end gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={cancelSubmit}
                                    className="px-6 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={confirmSubmit}
                                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                                >
                                    Xác nhận
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Toaster />
        </motion.div>
    );
};

export default AddHomestayRental;