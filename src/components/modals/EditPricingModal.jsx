import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';
import pricingAPI from '../../services/api/pricingAPI';
import { FaCalendarAlt, FaDollarSign, FaEdit, FaInfoCircle, FaMoneyBillWave, FaTag, FaPercent } from 'react-icons/fa';


const EditPricingModal = ({ pricing, onClose, onSave, isOpen, rental }) => {
    const [formData, setFormData] = useState({
        pricingID: null,
        homeStayRentalID: null,
        roomTypesID: null,
        unitPrice: 0,
        rentPrice: 0,
        percentage: 0,
        startDate: "",
        endDate: "",
        isDefault: true,
        isActive: true,
        dayType: 0,
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [regularPrice, setRegularPrice] = useState(0);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateStep2()) {
            return;
        }
        try {
            let updatedData = {
                pricingID: formData.pricingID,
                description: formData.description,
                startDate: formData.dayType == 2 ? formData.startDate : null,
                endDate: formData.dayType == 2 ? formData.endDate : null,
                isDefault: formData.dayType == 2 ? false : true,
                isActive: formData.isActive,
                dayType: formData.dayType,
                homeStayRentalID: formData.homeStayRentalID,
                roomTypesID: formData.roomTypesID || null,
            };
            if (formData.dayType === 0) {
                updatedData = {
                    ...updatedData,
                    unitPrice: formData.unitPrice || 0,
                    rentPrice: formData.rentPrice || 0,
                }
            } else {
                updatedData = {
                    ...updatedData,
                    percentage: formData.percentage || 0,
                }
            }

            onSave(updatedData);
        } catch (error) {
            console.error('Error updating pricing:', error);
            toast.error('Không thể cập nhật giá thuê: ' + error.message);
        }
    };
    // console.log(rental);

    useEffect(() => {
        if (pricing?.pricingID) {
            fechtPricingByID();
            const regularPricing = rental?.pricing?.find(item => item.dayType === 0);
            // console.log('regularPricing:', regularPricing); 
            if (regularPricing) {
                setRegularPrice(regularPricing?.rentPrice);
            }
        }
    }, [pricing]);

    const fechtPricingByID = async () => {
        const response = await pricingAPI.getPricingByID(pricing?.pricingID);
        console.log(response.data);

        if (response.statusCode === 200) {
            setFormData({
                ...response.data,
                unitPrice: response.data.unitPrice || 0,
                percentage: response.data.percentage || 0,
                rentPrice: response.data.rentPrice || 0,
                startDate: response.data.startDate ? response.data.startDate?.split("T")[0] : null,
                endDate: response.data.endDate ? response.data.endDate?.split("T")[0] : null
            });
        }
    }

    const handlePricingChange = (field, value) => {
        setFormData(prev => {
            let newValue = field === "dayType" ? parseInt(value) : value;
            if (field === "unitPrice" || field === "rentPrice") {
                newValue = Math.round(Number(value));
            }
            return { ...prev, [field]: newValue };
        });
    };

    const validateStep2 = () => {
        const newErrors = {};
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (formData.dayType !== 0) {
            if (!formData.percentage && formData.percentage !== 0) {
                newErrors[`percentage`] = `Vui lòng chọn phần trăm tăng giá`;
            } else if (formData.percentage < 0 || formData.percentage > 100) {
                newErrors[`percentage`] = `Vui lòng nhập trong khoảng 0-100%`;
            }
        }
        if (formData.rentPrice <= 0) newErrors[`rentPrice`] = `Giá thuê phải lớn hơn 0 VNĐ`;
        if ((formData.unitPrice > formData.rentPrice) && formData.dayType === 0) {
            newErrors[`unitPrice`] = `Đơn giá không được lớn hơn giá thuê`;
        }
        if (!formData.description.trim()) newErrors[`description`] = `Vui lòng nhập mô tả giá`;

        if (parseInt(formData.dayType) === 2) {
            if (!formData.startDate) newErrors[`startDate`] = `Vui lòng chọn ngày bắt đầu`;
            if (!formData.endDate) newErrors[`endDate`] = `Vui lòng chọn ngày kết thúc`;
            if (formData.startDate && new Date(formData.startDate) < currentDate) {
                newErrors[`startDate`] = `Ngày bắt đầu không thể là ngày trong quá khứ`;
            }
            if (formData.endDate && new Date(formData.endDate) < currentDate) {
                newErrors[`endDate`] = `Ngày kết thúc không thể là ngày trong quá khứ`;
            }
            if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors[`startDate`] = `Ngày bắt đầu không thể sau ngày kết thúc`;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
                                Chỉnh sửa gói
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form>
                            <div
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-6"
                            >
                                {/* Header with pricing name and delete button */}
                                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                                        <FaTag className="text-primary inline mr-2" />
                                        Gói {pricing?.dayType == 0 ? "ngày thường" : pricing?.dayType == 1 ? "ngày cuối tuần" : "ngày đặc biệt (lễ, tết)"}
                                    </h3>
                                </div>

                                {/* Content with price settings */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Unit Price */}
                                        {pricing?.dayType === 0 ? (
                                            <>
                                                {/* <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                        Đơn giá <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={formData.unitPrice}
                                                            onChange={(e) => handlePricingChange("unitPrice", e.target.value)}
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
                                                    {errors[`unitPrice`] && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors[`unitPrice`]}
                                                        </p>
                                                    )}
                                                </div> */}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                        Giá thuê <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={formData.rentPrice}
                                                            onChange={(e) => handlePricingChange("rentPrice", e.target.value)}
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
                                                    {errors[`rentPrice`] && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors[`rentPrice`]}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className='col-span-2'>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                        Chọn phần trăm (%) <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            value={formData.percentage}
                                                            onChange={(e) => {
                                                                const selectedPercentage = Number(e.target.value);
                                                                if (selectedPercentage >= 0 && selectedPercentage <= 100) {
                                                                    const newRentPrice = regularPrice + (regularPrice * (selectedPercentage / 100));
                                                                    handlePricingChange("percentage", selectedPercentage);
                                                                    handlePricingChange("rentPrice", newRentPrice);
                                                                }
                                                            }}
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary/50 appearance-none"
                                                        />
                                                        <div className="pointer-events-none absolute inset-y-0 right-[430px] flex items-center px-2 text-gray-500">
                                                            <FaPercent className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                    {errors[`percentage`] && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors[`percentage`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                        Giá thuê <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={Math.round(formData.rentPrice)}
                                                            disabled
                                                            onChange={(e) => handlePricingChange("rentPrice", e.target.value)}
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
                                                    {errors[`rentPrice`] && (
                                                        <p className="mt-1 text-sm text-red-500 flex items-center">
                                                            <FaInfoCircle className="mr-1" /> {errors[`rentPrice`]}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}


                                        {/* Day Type */}
                                        {/* <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                Áp dụng cho loại ngày <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.dayType}
                                                    onChange={(e) => handlePricingChange("dayType", e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 appearance-none"
                                                >
                                                    
                                                    {!rental?.pricing?.find(item => item.dayType === 0) && (
                                                        <option value="0">Ngày thường</option>
                                                    )}
                                                    {!rental?.pricing?.find(item => item.dayType === 1) && (
                                                        <option value="1">Ngày cuối tuần (Thứ 6, Thứ 7, Chủ nhật)</option>
                                                    )}
                                                    <option value="2">Ngày đặc biệt (ngày lễ, sự kiện)</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <FaCalendarAlt className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div> */}

                                        {/* Special day date range */}
                                        {parseInt(formData.dayType) === 2 && (
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
                                                            value={formData.startDate}
                                                            onChange={(e) => handlePricingChange("startDate", e.target.value)}
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors[`startDate`] && (
                                                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors[`startDate`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Ngày kết thúc <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={formData.endDate}
                                                            onChange={(e) => handlePricingChange("endDate", e.target.value)}
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                        />
                                                        {errors[`endDate`] && (
                                                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                                                <FaInfoCircle className="mr-1" /> {errors[`endDate`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaTag className="inline mr-1 text-gray-400" />
                                                Mô tả gói giá <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => handlePricingChange("description", e.target.value)}
                                                rows="2"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                                                placeholder="Mô tả thêm về gói giá thuê này..."
                                            />
                                            {errors[`description`] && (
                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                    <FaInfoCircle className="mr-1" /> {errors[`description`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                       flex items-center gap-2"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>

                        {/* Thêm phần hiển thị thông tin phần trăm */}
                        {/* {formData.unitPrice ? (
                            <div className="col-span-2 mt-2">
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <FaInfoCircle className="mt-0.5 text-primary" />
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            <p className="font-medium mb-1">Thông tin giá sau khi áp dụng phần trăm:</p>
                                            <p className="font-medium mb-1">Tỷ lệ phần trăm tăng so với giá ngày thường đã chọn:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Đơn giá tăng: {formData.unitPrice}% </li>
                                                <li>Giá thuê tăng: {formData.rentPrice}% </li>
                                                {parseInt(formData.unitPrice) > parseInt(formData.rentPrice) && (
                                                    <li className="text-red-500">
                                                        Cảnh báo: Đơn giá không nên cao hơn giá thuê!
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null} */}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditPricingModal;
