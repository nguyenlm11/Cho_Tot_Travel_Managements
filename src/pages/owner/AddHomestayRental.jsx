import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaBed, FaBath, FaWifi, FaUtensils, FaUsers, FaUpload, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import homestayAPI from "../../services/api/homestayAPI";

const AddHomestayRental = () => {
    const navigate = useNavigate();
    const { id: homestayId } = useParams();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Thêm trạng thái để ngăn gửi trùng lặp
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        Name: "",
        Description: "",
        HomeStayID: homestayId,
        numberBedRoom: 0,
        numberBathRoom: 0,
        numberKitchen: 0,
        numberWifi: 0,
        Status: true,
        RentWhole: true,
        MaxAdults: 0,
        MaxChildren: 0,
        MaxPeople: 0,
        Images: [],
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
        if (formData.MaxAdults <= 0) newErrors.MaxAdults = 'Số người lớn tối đa phải lớn hơn 0';
        if (formData.MaxChildren < 0) newErrors.MaxChildren = 'Số trẻ em không được âm';
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
                if (entry.unitPrice <= 0) newErrors[`unitPrice_${index}`] = `Đơn giá của giá ${index + 1} phải lớn hơn 0 VNĐ`;
                if (entry.rentPrice <= 0) newErrors[`rentPrice_${index}`] = `Giá thuê của giá ${index + 1} phải lớn hơn 0 VNĐ`;
                if (entry.unitPrice > entry.rentPrice) {
                    newErrors[`unitPrice_${index}`] = `Đơn giá của giá ${index + 1} không được lớn hơn giá thuê`;
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
        }));
    };

    const handlePricingChange = (index, field, value) => {
        setFormData(prev => {
            const updatedPricingEntries = [...prev.pricingEntries];
            updatedPricingEntries[index] = {
                ...updatedPricingEntries[index],
                [field]: field === "unitPrice" || field === "rentPrice" || field === "dayType" ? Number(value) : value
            };
            return {
                ...prev,
                pricingEntries: updatedPricingEntries
            };
        });
    };

    const addPricingEntry = () => {
        setFormData(prev => ({
            ...prev,
            pricingEntries: [
                ...prev.pricingEntries,
                {
                    unitPrice: 0,
                    rentPrice: 0,
                    startDate: "",
                    endDate: "",
                    isDefault: true,
                    isActive: true,
                    dayType: 0,
                    description: "",
                }
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
            if (formData.RentWhole) {
                setStep(2);
            } else {
                handleSubmit();
            }
        } else {
            toast.error('Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu trước khi tiếp tục.');
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (isSubmitting) return; // Ngăn chặn gửi trùng lặp

        if (!validateStep1()) {
            toast.error('Vui lòng kiểm tra và sửa các lỗi trong thông tin cơ bản.');
            setStep(1);
            return;
        }

        if (formData.RentWhole && !validateStep2()) {
            toast.error('Vui lòng kiểm tra và sửa các lỗi trong thông tin giá.');
            return;
        }

        const confirmSubmit = window.confirm('Bạn có chắc chắn muốn thêm phòng thuê này?');
        if (!confirmSubmit) return;

        setIsSubmitting(true);
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
                Status: formData.Status,
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

            console.log("formData.pricingEntries:", formData.pricingEntries);
            console.log("rentalData.PricingJson:", rentalData.PricingJson);

            const response = await homestayAPI.createHomestayRental(rentalData);

            if (response.statusCode === 201) {
                toast.dismiss(loadingToast);
                toast.success('Thêm phòng thuê thành công!');
                navigate(`/owner/homestays/${homestayId}/dashboard`);
            } else {
                throw new Error(response.message || "Thêm phòng thuê thất bại");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Có lỗi xảy ra khi thêm phòng thuê');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            Name: "",
            Description: "",
            HomeStayID: homestayId,
            numberBedRoom: 0,
            numberBathRoom: 0,
            numberKitchen: 0,
            numberWifi: 0,
            Status: true,
            RentWhole: true,
            MaxAdults: 0,
            MaxChildren: 0,
            MaxPeople: 0,
            Images: [],
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
        setPreviewImages([]);
        setErrors({});
        setStep(1);
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
                        <div className="flex items-center justify-center mb-4">
                            <div className={`flex items-center ${step === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <span className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-current">1</span>
                                <span className="ml-2">Thông tin cơ bản</span>
                            </div>
                            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                            <div className={`flex items-center ${step === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <span className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-current">2</span>
                                <span className="ml-2">Thiết lập giá</span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {step === 1 ? 'Thêm Phòng Thuê Mới - Thông Tin Cơ Bản' : 'Thêm Phòng Thuê Mới - Thiết Lập Giá'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {step === 1
                                ? 'Điền đầy đủ thông tin để tạo phòng thuê mới'
                                : 'Thiết lập giá cho phòng thuê nguyên căn'
                            }
                        </p>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên phòng *</label>
                                    <input
                                        type="text"
                                        name="Name"
                                        value={formData.Name}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                        placeholder="Nhập tên phòng"
                                    />
                                    {errors.Name && <p className="text-red-500 text-sm mt-1">{errors.Name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">HomeStay ID</label>
                                    <input
                                        type="number"
                                        name="HomeStayID"
                                        value={formData.HomeStayID}
                                        disabled
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả *</label>
                                <textarea
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    rows="4"
                                    placeholder="Mô tả chi tiết về phòng thuê"
                                />
                                {errors.Description && <p className="text-red-500 text-sm mt-1">{errors.Description}</p>}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phòng ngủ *</label>
                                    <input
                                        type="number"
                                        name="numberBedRoom"
                                        value={formData.numberBedRoom}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="50"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                    {errors.numberBedRoom && <p className="text-red-500 text-sm mt-1">{errors.numberBedRoom}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phòng tắm *</label>
                                    <input
                                        type="number"
                                        name="numberBathRoom"
                                        value={formData.numberBathRoom}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="50"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                    {errors.numberBathRoom && <p className="text-red-500 text-sm mt-1">{errors.numberBathRoom}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nhà bếp</label>
                                    <input
                                        type="number"
                                        name="numberKitchen"
                                        value={formData.numberKitchen}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="10"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Wifi</label>
                                    <input
                                        type="number"
                                        name="numberWifi"
                                        value={formData.numberWifi}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="10"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Người lớn tối đa *</label>
                                    <input
                                        type="number"
                                        name="MaxAdults"
                                        value={formData.MaxAdults}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                    {errors.MaxAdults && <p className="text-red-500 text-sm mt-1">{errors.MaxAdults}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trẻ em tối đa</label>
                                    <input
                                        type="number"
                                        name="MaxChildren"
                                        value={formData.MaxChildren}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                    {errors.MaxChildren && <p className="text-red-500 text-sm mt-1">{errors.MaxChildren}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tổng số người tối đa</label>
                                    <input
                                        type="number"
                                        name="MaxPeople"
                                        value={formData.MaxPeople}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="200"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    />
                                    {errors.MaxPeople && <p className="text-red-500 text-sm mt-1">{errors.MaxPeople}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="Status"
                                        checked={formData.Status}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">Hoạt động</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="RentWhole"
                                        checked={formData.RentWhole}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">Thuê nguyên căn</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hình ảnh *</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                {errors.Images && <p className="text-red-500 text-sm mt-1">{errors.Images}</p>}
                                {previewImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {previewImages.map((img, index) => (
                                            <div key={index} className="relative">
                                                <img src={img} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formData.pricingEntries.map((entry, index) => (
                                <div key={index} className="border p-4 rounded-md relative">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Giá {index + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => removePricingEntry(index)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đơn giá *</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={entry.unitPrice}
                                                    onChange={(e) => handlePricingChange(index, "unitPrice", e.target.value)}
                                                    min="0"
                                                    className="mt-1 block w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md"
                                                    placeholder="0"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">VNĐ</span>
                                            </div>
                                            {errors[`unitPrice_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`unitPrice_${index}`]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Giá thuê *</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={entry.rentPrice}
                                                    onChange={(e) => handlePricingChange(index, "rentPrice", e.target.value)}
                                                    min="0"
                                                    className="mt-1 block w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md"
                                                    placeholder="0"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">VNĐ</span>
                                            </div>
                                            {errors[`rentPrice_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`rentPrice_${index}`]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                                            <input
                                                type="datetime-local"
                                                value={entry.startDate}
                                                onChange={(e) => handlePricingChange(index, "startDate", e.target.value)}
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                                            <input
                                                type="datetime-local"
                                                value={entry.endDate}
                                                onChange={(e) => handlePricingChange(index, "endDate", e.target.value)}
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Loại ngày</label>
                                            <input
                                                type="number"
                                                value={entry.dayType}
                                                onChange={(e) => handlePricingChange(index, "dayType", e.target.value)}
                                                min="0"
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Mô tả giá</label>
                                            <textarea
                                                value={entry.description}
                                                onChange={(e) => handlePricingChange(index, "description", e.target.value)}
                                                rows="3"
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                                placeholder="Mô tả thêm về giá thuê..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={addPricingEntry}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    <FaPlus className="mr-2" /> Thêm giá mới
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-4">
                        {step === 2 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-2 rounded-md border hover:bg-gray-100"
                            >
                                Quay lại
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type={step === 1 ? "button" : "submit"}
                            onClick={step === 1 ? handleNextStep : undefined}
                            disabled={loading || isSubmitting}
                            className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Đang xử lý...
                                </span>
                            ) : (
                                step === 1 ? 'Tiếp tục' : 'Thêm phòng thuê'
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
            <Toaster position="top-center" />
        </motion.div>
    );
};

export default AddHomestayRental;