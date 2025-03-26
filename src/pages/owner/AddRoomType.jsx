import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBed, FaChild, FaUser, FaUsers, FaArrowLeft, FaCloudUploadAlt, FaTrash, FaCheck, FaPlus } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import roomTypeAPI from '../../services/api/roomTypeAPI';
import homestayRentalAPI from '../../services/api/homestayrentalAPI';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5, ease: "easeIn" } }
};

const inputGroupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const AddRoomType = () => {
    const { id: homestayId, rentalId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rentalDetails, setRentalDetails] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        Name: '',
        Description: '',
        homeStayRentalId: parseInt(rentalId),
        numberBedRoom: 1,
        numberBathRoom: 1,
        numberWifi: 1,
        Status: true,
        MaxAdults: 2,
        MaxChildren: 0,
        MaxPeople: 2,
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

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchRentalDetails = async () => {
            try {
                const response = await homestayRentalAPI.getHomeStayRentalDetail(rentalId);
                if (response.statusCode === 200) {
                    setRentalDetails(response.data);
                }
            } catch (error) {
                console.error('Error fetching rental details:', error);
                toast.error('Không thể tải thông tin phòng thuê');
            }
        };

        fetchRentalDetails();
    }, [rentalId]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.Name.trim()) {
            newErrors.Name = 'Tên loại phòng là bắt buộc';
        }
        if (!formData.Description.trim()) {
            newErrors.Description = 'Mô tả là bắt buộc';
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
        if (formData.MaxAdults < 1) {
            newErrors.MaxAdults = 'Số người lớn tối thiểu là 1';
        }
        if (formData.MaxChildren < 0) {
            newErrors.MaxChildren = 'Số trẻ em không thể là số âm';
        }
        if (formData.MaxPeople < 1) {
            newErrors.MaxPeople = 'Số người tối đa phải lớn hơn 0';
        }
        if (formData.Images.length === 0) {
            newErrors.Images = 'Vui lòng tải lên ít nhất một hình ảnh';
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

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error('Chỉ được tải lên tối đa 5 ảnh');
            return;
        }
        setFormData(prev => ({
            ...prev,
            Images: files
        }));

        const newPreviews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === files.length) {
                    setPreviewImages(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        const newPreviews = [...previewImages];
        newPreviews.splice(index, 1);
        setPreviewImages(newPreviews);

        const newImages = [...formData.Images];
        newImages.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            Images: newImages
        }));
    };

    const validateStep2 = () => {
        const newErrors = {};
        formData.pricingEntries.forEach((entry, index) => {
            if (entry.unitPrice <= 0) newErrors[`unitPrice_${index}`] = `Đơn giá phải lớn hơn 0 VNĐ`;
            if (entry.rentPrice <= 0) newErrors[`rentPrice_${index}`] = `Giá thuê phải lớn hơn 0 VNĐ`;
            if (entry.unitPrice > entry.rentPrice) {
                newErrors[`unitPrice_${index}`] = `Đơn giá không được lớn hơn giá thuê`;
            }
            if (entry.dayType < 0) newErrors[`dayType_${index}`] = `Loại ngày không được âm`;
            if (!entry.description.trim()) newErrors[`description_${index}`] = `Vui lòng nhập mô tả giá`;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (step === 1) {
            if (validateForm()) {
                setStep(2);
            } else {
                const firstError = Object.keys(errors)[0];
                const element = document.querySelector(`[name="${firstError}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }
        if (step === 2) {
            if (validateStep2()) {
                setIsModalOpen(true);
            }
        }
    };

    const confirmSubmit = async () => {
        setIsModalOpen(false);
        setLoading(true);
        const loadingToast = toast.loading('Đang thêm loại phòng mới...');

        try {
            const roomTypeData = {
                Name: formData.Name,
                Description: formData.Description,
                numberBedRoom: formData.numberBedRoom,
                numberBathRoom: formData.numberBathRoom,
                numberWifi: formData.numberWifi,
                Status: formData.Status,
                MaxAdults: formData.MaxAdults,
                MaxChildren: formData.MaxChildren,
                MaxPeople: formData.MaxPeople,
                homeStayRentalId: parseInt(rentalId),
                Images: formData.Images,
                PricingJson: JSON.stringify(
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
                )
            };

            const response = await roomTypeAPI.createRoomType(roomTypeData, rentalId);
            if (response.statusCode === 201) {
                toast.dismiss(loadingToast);
                toast.success('Thêm loại phòng thành công!');
                navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}`);
            } else {
                throw new Error(response.message || "Thêm loại phòng thất bại");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Có lỗi xảy ra khi thêm loại phòng');
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    const cancelSubmit = () => {
        setIsModalOpen(false);
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
        >
            <Toaster position="top-right" />

            {/* Back button and title */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}`)}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    <span>Quay lại danh sách loại phòng</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Thêm loại phòng mới
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Điền thông tin để tạo loại phòng mới cho phòng thuê {rentalDetails?.name || ''}
                </p>
            </div>

            {/* Main form */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                            <FaBed className="text-primary" />
                            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                {step === 1 ? 'Thông tin cơ bản' : 'Thiết lập giá'}
                            </span>
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        variants={stepVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left column */}
                                            <div className="space-y-6">
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                                    <FaBed className="mr-2 text-primary" />
                                                    Thông tin cơ bản
                                                </h2>

                                                {/* Name */}
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Tên loại phòng <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="Name"
                                                        value={formData.Name}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập tên loại phòng (VD: Phòng Standard, Phòng Deluxe...)"
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                    />
                                                    {errors.Name && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.Name}</p>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Mô tả <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        name="Description"
                                                        value={formData.Description}
                                                        onChange={handleInputChange}
                                                        rows="4"
                                                        placeholder="Mô tả chi tiết về loại phòng này..."
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 resize-none"
                                                    />
                                                    {errors.Description && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.Description}</p>
                                                    )}
                                                </div>

                                                {/* Room Facilities */}
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Tiện nghi phòng</h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="group">
                                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                                Giường <span className="text-red-500">*</span>
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
                                                            {errors.numberBedRoom && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.numberBedRoom}</p>
                                                            )}
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
                                                            {errors.numberBathRoom && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.numberBathRoom}</p>
                                                            )}
                                                        </div>

                                                        <div className="group">
                                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                                Wifi <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="numberWifi"
                                                                value={formData.numberWifi}
                                                                onChange={handleInputChange}
                                                                min="0"
                                                                max="50"
                                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                            />
                                                            {errors.numberWifi && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.numberWifi}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Guest Capacity */}
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Sức chứa</h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="group">
                                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center">
                                                                <FaUser className="mr-2 text-primary" />
                                                                Người lớn <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="MaxAdults"
                                                                value={formData.MaxAdults}
                                                                onChange={handleInputChange}
                                                                min="1"
                                                                max="50"
                                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                            />
                                                            {errors.MaxAdults && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.MaxAdults}</p>
                                                            )}
                                                        </div>

                                                        <div className="group">
                                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center">
                                                                <FaChild className="mr-2 text-primary" />
                                                                Trẻ em <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="MaxChildren"
                                                                value={formData.MaxChildren}
                                                                onChange={handleInputChange}
                                                                min="0"
                                                                max="50"
                                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                            />
                                                            {errors.MaxChildren && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.MaxChildren}</p>
                                                            )}
                                                        </div>

                                                        <div className="group">
                                                            <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center">
                                                                <FaUsers className="mr-2 text-primary" />
                                                                Tổng <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="MaxPeople"
                                                                value={formData.MaxPeople}
                                                                onChange={handleInputChange}
                                                                min="1"
                                                                max="100"
                                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                                            />
                                                            {errors.MaxPeople && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.MaxPeople}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right column */}
                                            <div className="space-y-6">
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                                    <FaCloudUploadAlt className="mr-2 text-primary" />
                                                    Hình ảnh
                                                </h2>

                                                {/* Image Upload */}
                                                <div className="group">
                                                    <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                        Hình ảnh loại phòng <span className="text-red-500">*</span>
                                                    </label>
                                                    <div
                                                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 
                                                        flex flex-col items-center justify-center cursor-pointer hover:border-primary 
                                                        transition-all duration-300 bg-gray-50 dark:bg-gray-700/30"
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
                                                        <FaCloudUploadAlt className="text-primary text-4xl mb-2" />
                                                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                                                            Kéo thả hoặc click để tải ảnh lên
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                            Hỗ trợ JPG, PNG, WEBP (Tối đa 5 ảnh)
                                                        </p>
                                                    </div>
                                                    {errors.Images && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.Images}</p>
                                                    )}
                                                </div>

                                                {/* Preview Images */}
                                                {previewImages.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                            Xem trước ({previewImages.length} ảnh)
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {previewImages.map((img, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="relative group rounded-xl overflow-hidden h-40"
                                                                >
                                                                    <img
                                                                        src={img}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeImage(index)}
                                                                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                                                        >
                                                                            <FaTrash className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
                                                    type="button"
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
                                                type="button"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
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

                        {/* Nút điều hướng */}
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
                                type="submit"
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
                                        <FaBed className="w-5 h-5" />
                                        <span>{step === 1 ? 'Tiếp tục' : 'Thêm loại phòng'}</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Confirmation Modal */}
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
                                    Xác nhận thông tin
                                </h3>
                                <button
                                    onClick={cancelSubmit}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                >
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Bạn có chắc muốn thêm loại phòng mới không?
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                                    transition-colors"
                                >
                                    Hủy
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-primary text-white
                                    hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg
                                    disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                            />
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="mr-2" />
                                            <span>Xác nhận</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AddRoomType;