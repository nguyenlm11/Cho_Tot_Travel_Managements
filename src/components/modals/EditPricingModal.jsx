import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import pricingAPI from '../../services/api/pricingAPI';

const EditPricingModal = ({ pricing, onClose, onSave }) => {
    const [unitPrice, setUnitPrice] = useState(pricing?.unitPrice || '');
    const [rentPrice, setRentPrice] = useState(pricing?.rentPrice || '');
    const [startDate, setStartDate] = useState(pricing?.startDate || '');
    const [endDate, setEndDate] = useState(pricing?.endDate || '');
    const [description, setDescription] = useState(pricing?.description || '');
    const [dayType, setDayType] = useState(pricing?.dayType || 0);
    const [isDefault, setIsDefault] = useState(pricing?.isDefault || false);
    const [homeStayRentalID, setHomeStayRentalID] = useState(pricing?.homeStayRentalID || '');

    useEffect(() => {
        // Reset giá trị khi mở modal
        setUnitPrice(pricing?.unitPrice || '');
        setRentPrice(pricing?.rentPrice || '');
        setStartDate(pricing?.startDate?.slice(0, 10) || '');
        setEndDate(pricing?.endDate?.slice(0, 10) || '');
        setDescription(pricing?.description || '');
        setDayType(pricing?.dayType || 0);
        setIsDefault(pricing?.isDefault || false);
        setHomeStayRentalID(pricing?.homeStayRentalID || '')
    }, [pricing]);

    const handleSave = async () => {
        try {
            const updatedData = {
                description,
                unitPrice,
                rentPrice,
                startDate: isDefault ? null : startDate,
                endDate: isDefault ? null : endDate,
                isDefault,
                isActive: true,
                dayType,
                homeStayRentalID: homeStayRentalID,
                roomTypesID: pricing.roomTypesID,
            };
            console.log(updatedData);  


            await pricingAPI.updatePricing(pricing.pricingID, updatedData);
            onSave(updatedData);
            toast.success('Cập nhật giá thuê thành công!');
            onClose();
        } catch (error) {
            console.error('Error updating pricing:', error);
            toast.error('Không thể cập nhật giá thuê: ' + error.message);
        }
    };

    const handlePriceChange = (setter) => (e) => {
        const value = e.target.value;
        if (value >= 0) {
            setter(value);
        }
    };
    useEffect(() => {
        fechtPricingByID();
    }, [pricing]);

    const fechtPricingByID = async () => {
        const response = await pricingAPI.getPricingByID(pricing?.pricingID);
        if (response.statusCode === 200) {
            setHomeStayRentalID(response.data.homeStayRentalID);
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-600 dark:text-white">Thiết lập giá</h2>
                    <button onClick={onClose} className="text-gray-300 dark:hover:text-gray-300">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đơn giá</label>
                        <input
                            type="number"
                            value={unitPrice}
                            onChange={handlePriceChange(setUnitPrice)}
                            className="border-gray-300 border rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá thuê</label>
                        <input
                            type="number"
                            value={rentPrice}
                            onChange={handlePriceChange(setRentPrice)}
                            className="border-gray-300 border rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border-gray-300 border rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Áp dụng cho loại ngày</label>
                        <select
                            value={dayType}
                            onChange={(e) => setDayType(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 appearance-none text-gray-700 dark:text-gray-300"
                        >
                            <option value="0" className='text-gray-700 dark:text-gray-300'>Ngày thường</option>
                            <option value="1" className='text-gray-700 dark:text-gray-300'>Ngày cuối tuần (Thứ 6, Thứ 7, Chủ nhật)</option>
                            <option value="2" className='text-gray-700 dark:text-gray-300'>Ngày đặc biệt (ngày lễ, sự kiện)</option>
                        </select>
                    </div>

                    {!isDefault && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                        Cập nhật
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default EditPricingModal;
