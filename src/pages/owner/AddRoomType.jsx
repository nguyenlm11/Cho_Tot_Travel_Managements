import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBed, FaChild, FaUser, FaUsers, FaArrowLeft, FaCloudUploadAlt, FaTrash, FaCheck, FaPlus, FaDollarSign, FaInfoCircle, FaBath, FaWifi } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import roomTypeAPI from '../../services/api/roomTypeAPI';
import homestayRentalAPI from '../../services/api/homestayrentalAPI';

const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
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
        // numberBed: 1,
        // numberBathRoom: 1,
        // numberWifi: 1,
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
        // if (formData.numberBed < 0) {
        //     newErrors.numberBed = 'Số giường không thể là số âm';
        // }
        // if (formData.numberBathRoom < 0) {
        //     newErrors.numberBathRoom = 'Số phòng tắm không thể là số âm';
        // }
        // if (formData.numberWifi < 0) {
        //     newErrors.numberWifi = 'Số Wifi không thể là số âm';
        // }
        if (formData.MaxAdults < 1) {
            newErrors.MaxAdults = 'Số người lớn tối thiểu là 1';
        }
        if (formData.MaxChildren < 0) {
            newErrors.MaxChildren = 'Số trẻ em không thể là số âm';
        }
        if (formData.MaxPeople < formData.MaxAdults) {
            newErrors.MaxPeople = 'Số người tối đa phải lớn hơn số người lớn';
        }
        // if (formData.Images.length === 0) {
        //     newErrors.Images = 'Vui lòng tải lên ít nhất một hình ảnh';
        // }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            const numValue = parseInt(value) || 0;
            if (name === 'MaxAdults' || name === 'MaxChildren') {
                // const otherField = name === 'MaxAdults' ? 'MaxChildren' : 'MaxAdults';
                // const totalPeople = numValue + (formData[otherField] || 0);
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue,
                    // MaxPeople: totalPeople
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
    // const handleImageUpload = (e) => {
    //     const files = Array.from(e.target.files);
    //     if (files.length > 5) {
    //         toast.error('Chỉ được tải lên tối đa 5 ảnh');
    //         return;
    //     }
    //     setFormData(prev => ({
    //         ...prev,
    //         Images: files
    //     }));

    //     const newPreviews = [];
    //     files.forEach(file => {
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             newPreviews.push(reader.result);
    //             if (newPreviews.length === files.length) {
    //                 setPreviewImages(newPreviews);
    //             }
    //         };
    //         reader.readAsDataURL(file);
    //     });
    // };

    // const removeImage = (index) => {
    //     const newPreviews = [...previewImages];
    //     newPreviews.splice(index, 1);
    //     setPreviewImages(newPreviews);
    //     const newImages = [...formData.Images];
    //     newImages.splice(index, 1);
    //     setFormData(prev => ({
    //         ...prev,
    //         Images: newImages
    //     }));
    // };

    const validateStep2 = () => {
        const newErrors = {};
        formData.pricingEntries.forEach((entry, index) => {
            // if (entry.unitPrice <= 0) newErrors[`unitPrice_${index}`] = `Đơn giá phải lớn hơn 0 VNĐ`;
            // if (entry.rentPrice <= 0) newErrors[`rentPrice_${index}`] = `Giá thuê phải lớn hơn 0 VNĐ`;
            // if (entry.unitPrice > entry.rentPrice) {
            //     newErrors[`unitPrice_${index}`] = `Đơn giá không được lớn hơn giá thuê`;
            // }
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

    // const addPricingEntry = () => {
    //     setFormData(prev => ({
    //         ...prev,
    //         pricingEntries: [
    //             ...prev.pricingEntries,
    //             { unitPrice: 0, rentPrice: 0, startDate: "", endDate: "", isDefault: true, isActive: true, dayType: 0, description: "" }
    //         ]
    //     }));
    //     toast.success('Đã thêm gói giá mới!');
    // };

    const removePricingEntry = (index) => {
        if (formData.pricingEntries.length === 1) {
            toast.error('Phải có ít nhất một mục giá.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            pricingEntries: prev.pricingEntries.filter((_, i) => i !== index)
        }));
        toast.success('Đã xóa gói giá!');
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
                // numberBed: formData.numberBed,
                // numberBathRoom: formData.numberBathRoom,
                // numberWifi: formData.numberWifi,
                Status: formData.Status,
                MaxAdults: formData.MaxAdults,
                MaxChildren: formData.MaxChildren,
                MaxPeople: formData.MaxPeople,
                homeStayRentalId: parseInt(rentalId),
                // Images: formData.Images,
                PricingJson: JSON.stringify(
                    formData.pricingEntries.map(entry => ({
                        // unitPrice: entry.unitPrice,
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
            // console.log(roomTypeData);

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
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
        >
            <Toaster position="top-right" />

            {/* Back button and title section */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}`)}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors py-2 px-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Quay lại danh sách loại phòng</span>
                    </button>

                    <div className="hidden sm:flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                        <span className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span>Thông tin cơ bản</span>
                        <span className="w-5 h-px bg-gray-300 dark:bg-gray-600"></span>
                        <span className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span>Thiết lập giá</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Thêm loại phòng mới
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {step === 1 ?
                            `Nhập thông tin cơ bản cho loại phòng của ${rentalDetails?.name || 'phòng thuê này'}` :
                            'Thiết lập giá cho loại phòng mới.'}
                    </p>
                </div>
            </div>

            {/* Main form */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
                            {step === 1 ? (
                                <>
                                    <FaBed className="text-primary mr-2" />
                                    Thông tin cơ bản
                                </>
                            ) : (
                                <>
                                    <FaDollarSign className="text-primary mr-2" />
                                    Thiết lập giá
                                </>
                            )}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    // Step 1 - Basic information with simplified styling
                                    <motion.div
                                        key="step1"
                                        variants={stepVariants}
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
                                                            name="Name"
                                                            value={formData.Name}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập tên loại phòng (VD: Phòng Standard, Phòng Deluxe...)"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                    </div>
                                                    {errors.Name && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors.Name}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Mô tả <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        name="Description"
                                                        value={formData.Description}
                                                        onChange={handleInputChange}
                                                        rows="3"
                                                        placeholder="Mô tả chi tiết về loại phòng này..."
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                                                    />
                                                    {errors.Description && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors.Description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Room Facilities */}
                                            {/* <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
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
                                                            name="numberBed"
                                                            value={formData.numberBed}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="50"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.numberBed && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.numberBed}
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
                                            </div> */}

                                            {/* Guest Capacity */}
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Sức chứa
                                                </h3>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaUser className="mr-1 text-gray-400" />
                                                            Người lớn <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="MaxAdults"
                                                            value={formData.MaxAdults}
                                                            onChange={handleInputChange}
                                                            min="1"
                                                            max="10"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.MaxAdults && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.MaxAdults}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaChild className="mr-1 text-gray-400" />
                                                            Trẻ em <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="MaxChildren"
                                                            value={formData.MaxChildren}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="10"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.MaxChildren && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.MaxChildren}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaUsers className="mr-1 text-gray-400" />
                                                            Giới hạn <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="MaxPeople"
                                                            value={formData.MaxPeople}
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

                                            {/* Images */}
                                            {/* <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Hình ảnh
                                                </h3> */}

                                            {/* <div>
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
                                                </div> */}

                                            {/* Preview Images */}
                                            {/* {previewImages.length > 0 && (
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
                                                )} */}
                                            {/* </div> */}
                                        </div>
                                    </motion.div>
                                ) : (
                                    // Step 2 - Pricing setup with simplified styling
                                    <motion.div
                                        key="step2"
                                        variants={stepVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-6"
                                    >
                                        {formData.pricingEntries.map((entry, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-6"
                                            >
                                                {/* Header with pricing name and delete button */}
                                                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                                                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                                                        Gói giá {entry.dayType === 0 ? "ngày thường" : entry.dayType === 1 ? "ngày cuối tuần" : "ngày đặc biệt (lễ, tết)"}
                                                    </h3>
                                                    {/* <button
                                                        type="button"
                                                        onClick={() => removePricingEntry(index)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button> */}
                                                </div>

                                                {/* Content with price settings */}
                                                <div className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Unit Price */}


                                                        {/* <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Đơn giá <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={entry.unitPrice}
                                                                    onChange={(e) => handlePricingChange(index, "unitPrice", e.target.value)}
                                                                    min="0"
                                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                                    placeholder="0"
                                                                />
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                                    <FaDollarSign />
                                                                </span>
                                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                                    VNĐ
                                                                </span>
                                                            </div>
                                                            {errors[`unitPrice_${index}`] && (
                                                                <p className="mt-1 text-sm text-red-500">{errors[`unitPrice_${index}`]}</p>
                                                            )}
                                                        </div> */}



                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Giá thuê <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={entry.rentPrice}
                                                                    onChange={(e) => handlePricingChange(index, "rentPrice", e.target.value)}
                                                                    min="0"
                                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                                    placeholder="0"
                                                                />
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                                    <FaDollarSign />
                                                                </span>
                                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                                    VNĐ
                                                                </span>
                                                            </div>
                                                            {errors[`rentPrice_${index}`] && (
                                                                <p className="mt-1 text-sm text-red-500">{errors[`rentPrice_${index}`]}</p>
                                                            )}
                                                        </div>







                                                        {/* Day Type */}
                                                        {/* <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Loại ngày <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                value={entry.dayType}
                                                                onChange={(e) => handlePricingChange(index, "dayType", e.target.value)}
                                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                            >
                                                                <option value="0">Ngày thường</option>
                                                                <option value="1">Ngày cuối tuần (Thứ 6, Thứ 7, Chủ nhật)</option>
                                                                <option value="2">Ngày đặc biệt (ngày lễ, sự kiện)</option>
                                                            </select>
                                                            {errors[`dayType_${index}`] && (
                                                                <p className="mt-1 text-sm text-red-500">{errors[`dayType_${index}`]}</p>
                                                            )}
                                                        </div> */}

                                                        {/* Start Date and End Date for Special Day */}
                                                        {parseInt(entry.dayType) === 2 && (
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
                                                                            value={entry.startDate}
                                                                            onChange={(e) => handlePricingChange(index, "startDate", e.target.value)}
                                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                            Ngày kết thúc <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="date"
                                                                            value={entry.endDate}
                                                                            onChange={(e) => handlePricingChange(index, "endDate", e.target.value)}
                                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Description */}
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Mô tả gói giá <span className="text-red-500">*</span>
                                                            </label>
                                                            <textarea
                                                                value={entry.description}
                                                                onChange={(e) => handlePricingChange(index, "description", e.target.value)}
                                                                rows="2"
                                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                                                                placeholder="Mô tả thêm về gói giá thuê này..."
                                                            />
                                                            {errors[`description_${index}`] && (
                                                                <p className="mt-1 text-sm text-red-500">{errors[`description_${index}`]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add new price button */}
                                        {/* <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={addPricingEntry}
                                                className="flex items-center px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
                                            >
                                                <FaPlus className="mr-2" /> Thêm gói giá mới
                                            </button>
                                        </div> */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation buttons */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    <span>Quay lại</span>
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <>
                                        {step === 1 ? "Tiếp tục" : (
                                            <>
                                                <FaCheck className="mr-2" />
                                                <span>Thêm loại phòng</span>
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    <FaCheck className="inline mr-2 text-primary" />
                                    Xác nhận thông tin
                                </h3>
                                <button
                                    onClick={cancelSubmit}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Bạn có chắc muốn thêm loại phòng mới không?
                                    </p>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                    <p className="flex items-start">
                                        <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>Loại phòng: <span className="font-medium text-gray-800 dark:text-white">{formData.Name}</span></span>
                                    </p>
                                    <p className="flex items-start">
                                        <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>Sức chứa: <span className="font-medium text-gray-800 dark:text-white">{formData.MaxPeople} người</span></span>
                                    </p>
                                    <p className="flex items-start">
                                        <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>Số gói giá: <span className="font-medium text-gray-800 dark:text-white">{formData.pricingEntries.length}</span></span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="mr-2" />
                                            <span>Xác nhận</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AddRoomType; 