import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBed, FaBath, FaWifi, FaChild, FaUser, FaUsers, FaArrowLeft, FaCloudUploadAlt, FaTrash, FaCheck, FaPlus, FaHome, FaUtensils, FaCalendarAlt, FaMoneyBillWave, FaTag, FaInfoCircle, FaDollarSign } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import homestayRentalAPI from '../../services/api/homestayrentalAPI';
import pricingAPI from '../../services/api/pricingAPI';
import { MdNotificationsActive } from "react-icons/md";

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

const EditHomestayRental = () => {
    const { homestayId, rentalId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [step, setStep] = useState(1);
    const [pricingIDEdit, setPricingIDEdit] = useState(null);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        homeStayID: parseInt(homestayId),
        numberBedRoom: 1,
        numberBathRoom: 1,
        numberKitchen: 1,
        numberWifi: 1,
        status: true,
        rentWhole: true,
        maxAdults: 2,
        maxChildren: 0,
        maxPeople: 2,
        // Images: [],
        pricing: [],
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
        const fetchRentalDetail = async () => {
            setLoading(true);
            try {
                const response = await homestayRentalAPI.getHomeStayRentalDetail(rentalId);
                if (response && response.statusCode === 200) {
                    // setRentals(response.data || []);
                    setFormData((prev) => ({ ...prev, ...response.data, pricingEntries: response.data?.pricing }));
                } else {
                    toast.error("Không thể tải danh sách căn thuê");
                }
            } catch (error) {
                console.error('Error fetching rentals:', error);
                toast.error('Không thể tải danh sách căn thuê');
            } finally {
                setTimeout(() => setLoading(false), 1000);
            }
        }

        fetchRentalDetail();
    }, [rentalId])

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Tên phòng thuê là bắt buộc';
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
        if (formData.numberKitchen < 0) {
            newErrors.numberKitchen = 'Số bếp không thể là số âm';
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
        // if (formData.Images.length === 0) {
        //     newErrors.Images = 'Vui lòng tải lên ít nhất một hình ảnh';
        // }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (formData.rentWhole) {
            formData.pricingEntries.forEach((entry, index) => {
                if (entry.unitPrice <= 0) newErrors[`unitPrice_${index}`] = `Đơn giá phải lớn hơn 0 VNĐ`;
                if (entry.rentPrice <= 0) newErrors[`rentPrice_${index}`] = `Giá thuê phải lớn hơn 0 VNĐ`;
                if (entry.unitPrice > entry.rentPrice) {
                    newErrors[`unitPrice_${index}`] = `Đơn giá không được lớn hơn giá thuê`;
                }
                if (!entry.description.trim()) newErrors[`description_${index}`] = `Vui lòng nhập mô tả giá`;

                if (parseInt(entry.dayType) === 2) {
                    if (!entry.startDate) newErrors[`startDate_${index}`] = `Vui lòng chọn ngày bắt đầu`;
                    if (!entry.endDate) newErrors[`endDate_${index}`] = `Vui lòng chọn ngày kết thúc`;
                    if (entry.startDate && entry.endDate && new Date(entry.startDate) > new Date(entry.endDate)) {
                        newErrors[`startDate_${index}`] = `Ngày bắt đầu không thể sau ngày kết thúc`;
                    }
                }
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            const numValue = parseInt(value) || 0;
            if (name === 'maxAdults' || name === 'maxChildren') {
                const otherField = name === 'maxAdults' ? 'maxChildren' : 'maxAdults';
                const totalPeople = numValue + (formData[otherField] || 0);
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue,
                    maxPeople: totalPeople
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue
                }));
            }
        } else if (name === 'rentWhole') {
            setFormData(prev => ({
                ...prev,
                [name]: value === 'true'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
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
        toast.success('Đã thêm gói giá mới!');
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
        toast.success('Đã xóa gói giá!');
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (step === 1) {
            if (!validateForm()) {
                const firstError = Object.keys(errors)[0];
                const element = document.querySelector(`[name="${firstError}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            setIsModalOpen(true);
        } else if (step === 2) {
            if (!validateStep2()) {
                return;
            }
            setIsModalOpen(true);
        }
    };

    const confirmSubmit = async () => {
        setIsModalOpen(false);
        setLoading(true);
        const loadingToast = toast.loading('Đang cập nhật...');
        if (step === 1) {
            try {
                const rentalData = {
                    name: formData.name,
                    description: formData.description,
                    homeStayID: formData.homeStayID,
                    numberBedRoom: formData.numberBedRoom,
                    numberBathRoom: formData.numberBathRoom,
                    numberKitchen: formData.numberKitchen,
                    numberWifi: formData.numberWifi,
                    status: formData.status,
                    rentWhole: formData.rentWhole,
                    maxAdults: formData.maxAdults,
                    maxChildren: formData.maxChildren,
                    maxPeople: formData.maxPeople,
                };
                // console.log(rentalData);

                const response = await homestayRentalAPI.updateHomestayRental(rentalData, rentalId);
                if (response.statusCode === 200) {
                    toast.dismiss(loadingToast);
                    toast.success('Cập nhật phòng thuê thành công!');
                    navigate(`/owner/homestays/${homestayId}/homestay-rental`);
                } else {
                    throw new Error(response.message || "Cập nhật phòng thuê thất bại");
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error(error.message || 'Có lỗi xảy ra khi cập nhật phòng thuê');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const pricingFormData = formData?.pricingEntries.find(pricing => pricing?.pricingID === pricingIDEdit);
                const rentalData = {
                    pricingID: pricingFormData.pricingID,
                    unitPrice: pricingFormData.unitPrice,
                    rentPrice: pricingFormData.rentPrice,
                    startDate: pricingFormData.startDate || null,
                    endDate: pricingFormData.endDate || null,
                    isDefault: pricingFormData.isDefault,
                    isActive: pricingFormData.isActive,
                    dayType: pricingFormData.dayType,
                    description: pricingFormData.description || ""
                };


                const response = await pricingAPI.updatePricing(rentalData?.pricingID, rentalData);
                if (response.statusCode === 200) {
                    toast.dismiss(loadingToast);
                    toast.success('Cập nhật gói phòng thành công!');
                    navigate(`/owner/homestays/${homestayId}/homestay-rental`);
                } else {
                    throw new Error(response.message || "Cập nhật gói phòng thất bại");
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error(error.message || 'Có lỗi xảy ra khi cập nhật gói phòng thuê');
            } finally {
                setLoading(false);
            }
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
                        onClick={() => navigate(`/owner/homestays/${homestayId}/homestay-rental`)}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors py-2 px-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Quay lại danh sách căn thuê</span>
                    </button>

                    <div className="hidden sm:flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                        <span className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <span className='cursor-pointer' onClick={() => setStep(1)}>Thông tin cơ bản</span>
                        {/* <span className="w-5 h-px bg-gray-300 dark:bg-gray-600"></span> */}
                        {/* <span className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span> */}
                        {/* <span className='cursor-pointer' onClick={() => setStep(2)}>Thiết lập giá</span> */}
                    </div>
                </div>

                <div className="mt-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Chỉnh sửa căn thuê
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {step === 1 ?
                            'Nhập thông tin cơ bản về căn thuê của bạn.' :
                            'Thiết lập giá cho căn thuê của bạn.'}
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
                                    <FaHome className="text-primary mr-2" />
                                    Thông tin cơ bản
                                </>
                            ) : (
                                <>
                                    <FaMoneyBillWave className="text-primary mr-2" />
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
                                        className="space-y-6"
                                    >
                                        {/* Basic Information */}
                                        {user?.role === "Owner" && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Thông tin cơ bản
                                                </h3>


                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Tên phòng <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập tên phòng thuê"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                    </div>
                                                    {errors.name && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors.name}
                                                        </p>
                                                    )}
                                                </div>



                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Mô tả <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        rows="3"
                                                        placeholder="Mô tả chi tiết về phòng thuê này..."
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                                                    />
                                                    {errors.description && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Loại thuê <span className="text-red-500 ">*</span>
                                                    </label>
                                                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                                                        <div className={`flex items-center p-3 rounded-lg border ${formData.rentWhole ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                                                            <input
                                                                type="radio"
                                                                id="rentWhole"
                                                                name="rentWhole"
                                                                value="true"
                                                                checked={formData.rentWhole === true}
                                                                onChange={handleInputChange}
                                                                className="mr-2"
                                                            />
                                                            <label htmlFor="rentWhole" className="cursor-pointer">
                                                                <span className="font-medium">Thuê nguyên căn</span>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Khách thuê toàn bộ không gian</p>
                                                            </label>
                                                        </div>
                                                        <div className={`flex items-center p-3 rounded-lg border ${!formData.rentWhole ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                                                            <input
                                                                type="radio"
                                                                id="rentRoom"
                                                                name="rentWhole"
                                                                value="false"
                                                                checked={formData.rentWhole === false}
                                                                onChange={handleInputChange}
                                                                className="mr-2"
                                                            />
                                                            <label htmlFor="rentRoom" className="cursor-pointer">
                                                                <span className="font-medium">Thuê từng phòng</span>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Khách thuê từng phòng riêng biệt</p>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}



                                        {/* Room Facilities */}
                                        {user?.role === "Owner" && (
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Tiện nghi riêng của căn
                                                </h3>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaBed className="mr-1 text-gray-400" />
                                                            Phòng ngủ <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberBedRoom"
                                                            value={formData.numberBedRoom}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="10"
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
                                                            Phòng tắm <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberBathRoom"
                                                            value={formData.numberBathRoom}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="10"
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
                                                            <FaUtensils className="mr-1 text-gray-400" />
                                                            Phòng bếp <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberKitchen"
                                                            value={formData.numberKitchen}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="10"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.numberKitchen && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.numberKitchen}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                                            <FaWifi className="mr-1 text-gray-400" />
                                                            Wifi <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="numberWifi"
                                                            value={formData.numberWifi}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            max="5"
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
                                        )}


                                        {/* Guest Capacity */}
                                        {user?.role === "Owner" && (
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
                                                            Trẻ em <span className="text-red-500 ml-1">*</span>
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
                                                            Giới hạn <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="maxPeople"
                                                            value={formData.maxPeople}
                                                            onChange={handleInputChange}
                                                            readOnly
                                                            min="1"
                                                            max="30"
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors.maxPeople && (
                                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors.maxPeople}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}




                                        {/* Images */}
                                        {/* <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Hình ảnh
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Hình ảnh phòng thuê <span className="text-red-500">*</span>
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
                                                        onChange={handleImageChange}
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
                                            )}
                                        </div> */}



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
                                                            checked={formData.status}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-12 h-6 rounded-full transition-colors duration-200 
                                                    ${formData.status ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full 
                                                        transition-transform duration-200 shadow
                                                        ${formData.status ? 'translate-x-6' : 'translate-x-0'}`}>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {formData.status ? 'Đang hoạt động' : 'Tạm ngưng'}
                                                    </span>
                                                </label>
                                            </div>
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
                                                        <FaTag className="text-primary inline mr-2" />
                                                        Gói giá {index + 1}
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePricingEntry(index)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Content with price settings */}
                                                <div className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Unit Price */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                <FaMoneyBillWave className="inline mr-1 text-gray-400" />
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
                                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                    <FaInfoCircle className="mr-1" /> {errors[`unitPrice_${index}`]}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Rent Price */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                <FaMoneyBillWave className="inline mr-1 text-gray-400" />
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
                                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                    <FaInfoCircle className="mr-1" /> {errors[`rentPrice_${index}`]}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Day Type */}
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                                Áp dụng cho loại ngày <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <select
                                                                    value={entry.dayType}
                                                                    onChange={(e) => handlePricingChange(index, "dayType", e.target.value)}
                                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 appearance-none"
                                                                >
                                                                    <option value="0">Ngày thường</option>
                                                                    <option value="1">Ngày cuối tuần (Thứ 6, Thứ 7, Chủ nhật)</option>
                                                                    <option value="2">Ngày đặc biệt (ngày lễ, sự kiện)</option>
                                                                </select>
                                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                                    <FaCalendarAlt className="h-4 w-4" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Special day date range */}
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
                                                                        {errors[`startDate_${index}`] && (
                                                                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                                                                <FaInfoCircle className="mr-1" /> {errors[`startDate_${index}`]}
                                                                            </p>
                                                                        )}
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
                                                                        {errors[`endDate_${index}`] && (
                                                                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                                                                <FaInfoCircle className="mr-1" /> {errors[`endDate_${index}`]}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* description */}
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                <FaTag className="inline mr-1 text-gray-400" />
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
                                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                                    <FaInfoCircle className="mr-1" /> {errors[`description_${index}`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-end gap-4">
                                                    <button
                                                        type='submit'
                                                        onClick={() => setPricingIDEdit(entry?.pricingID)}
                                                        disabled={loading}
                                                        className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                    >
                                                        {loading ? (
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        ) : (
                                                            <>
                                                                <FaCheck className="mr-2" />
                                                                <span>Cập nhật</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                            </div>
                                        ))}

                                        {/* Add new price button */}
                                        {/* <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={addPricingEntry}
                                                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark flex items-center"
                                            >
                                                <FaPlus className="mr-2" /> Thêm gói giá mới
                                            </button>
                                        </div> */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation buttons */}
                        {step === 1 && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-end gap-4">

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
                                        <span>Cập nhật</span>
                                    </>
                                )}
                            </button>
                        </div>}
                    </form>
                </div>
            </div >

            {/* Confirmation Modal */}
            <AnimatePresence AnimatePresence >
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
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
                                        Bạn có chắc muốn cập nhật phòng thuê không?
                                    </p>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                    <p className="flex items-start">
                                        <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>Phòng thuê: <span className="font-medium text-gray-800 dark:text-white">{formData.name}</span></span>
                                    </p>
                                    <p className="flex items-start">
                                        <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span>Sức chứa: <span className="font-medium text-gray-800 dark:text-white">{formData.maxPeople} người</span></span>
                                    </p>
                                    {formData.pricingEntries.length > 0 && (
                                        <p className="flex items-start">
                                            <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                            <span>Số gói giá: <span className="font-medium text-gray-800 dark:text-white">{formData.pricingEntries.length}</span></span>
                                        </p>
                                    )}
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
                    </motion.div>
                )}
            </AnimatePresence >
        </motion.div >
    );
};

export default EditHomestayRental;