import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';
// import pricingAPI from '../../services/api/pricingAPI';
import { FaCalendarAlt, FaDollarSign, FaEdit, FaInfoCircle, FaMoneyBillWave, FaTag, FaPercentage, FaCheck, FaPlus } from 'react-icons/fa';
import commissionRateAPI from '../../services/api/commissionRateAPI';
import { MdCancel } from "react-icons/md";

const EditCommissionRateByAdminModal = ({ onClose, isOpen, commissionRateID, fetchHomestays, homeStayID }) => {
    // const [commissionRateData, setCommissionRateData] = useState()
    const [formData, setFormData] = useState({
        platformShare: 0,
        hostShare: 0,
        createAt: new Date().toISOString(),
        homeStayID: homeStayID,
        commissionRateID: commissionRateID,
        ownerAccepted: false,
        isAccepted: true,
        wantedHostShare: 0
    });
    // console.log();

    const [errors, setErrors] = useState({});
    const [commissionRateData, setCommissionRateData] = useState();

    const handleSave = async (e) => {
        e.preventDefault();
        const formatData = { ...formData, commissionRateID: formData?.commissionRateID, hostShare: Number(formData?.hostShare) / 100, platformShare: Number(formData?.platformShare) / 100, isAccepted: formData?.isAccepted, wantedHostShare: Number(formData?.wantedHostShare) / 100 }
        if (!validateForm()) {
            return;
        }
        // console.log(formatData);
        try {
            const response = await commissionRateAPI.updateCommissionRateByAdmin(formatData);
            if (response?.statusCode === 200) {
                toast.success("Cập nhật tỉ lệ thành công");
                onClose();
                // fetchHomestays();
            }
        } catch (error) {
            console.log(error);
            toast.error("Cập nhật tỉ lệ thất bại");
        }
    };

    useEffect(() => {

        fetchCommissionRateByHomestayID()
        // console.log(commissionRateID);
    }, [homeStayID, commissionRateID])

    const fetchCommissionRateByHomestayID = async () => {
        try {
            const respone = await commissionRateAPI.getCommissionRateByHomestayId(homeStayID);
            if (respone?.statusCode === 200) {
                setCommissionRateData(respone?.data)
                setFormData({ ...formData, platformShare: respone?.data?.platformShare * 100, hostShare: respone?.data?.hostShare * 100, commissionRateID: respone?.data?.commissionRateID, wantedHostShare: respone?.data?.wantedHostShare * 100 })
                // console.log(respone?.data?.platformShare);
                // console.log(respone?.data?.hostShare);
                // console.log(respone?.data?.commissionRateID);

            }
        } catch (error) {
            console.log(error);
        }
    }


    const validateForm = () => {
        const newErrors = {};
        // if (!formData.wantedHostShare || formData.wantedHostShare < 0 || formData.wantedHostShare > 100) {
        //     toast.error("Vui lòng nhập tỉ lệ hoa hồng hợp lệ (0-100%)");
        //     return;
        // }
        if (!formData.platformShare) {
            newErrors.platformShare = "Tỉ lệ hoa hồng là bắt buộc";
        }
        const percentage = Number(formData.platformShare);
        if (!formData.platformShare) {
            newErrors.platformShare = "Tỉ lệ hoa hồng là bắt buộc";
        } else if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            newErrors.platformShare = "Tỉ lệ hoa hồng phải nằm trong khoảng 0-100%";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

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
                                Tỉ lệ hoa hồng
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()}>
                            <div
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-6"
                            >
                                {/* Content with price settings */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Rent Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                Tỉ lệ hoa hồng của Admin (%) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type='number'
                                                    min={0}
                                                    max={100}
                                                    value={formData.platformShare}
                                                    onChange={(e) => setFormData({ ...formData, platformShare: e.target.value })}
                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                >

                                                </input>
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <FaPercentage />
                                                </span>
                                            </div>
                                            {errors[`platformShare`] && (
                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                    <FaInfoCircle className="mr-1" /> {errors[`platformShare`]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                                                Tỉ lệ hoa hồng của Owner (%) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type='number'
                                                    min={0}
                                                    max={100}
                                                    value={formData.hostShare}
                                                    onChange={(e) => setFormData({ ...formData, hostShare: e.target.value })}
                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                >

                                                </input>
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <FaPercentage />
                                                </span>
                                            </div>
                                            {errors[`platformShare`] && (
                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                    <FaInfoCircle className="mr-1" /> {errors[`platformShare`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {(commissionRateData?.ownerAccepted == false && commissionRateData?.wantedHostShare != null) && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <FaPercentage className="inline mr-1 text-gray-400" />
                                                Tỉ lệ hoa hồng Owner muốn (%) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type='number'
                                                    disabled
                                                    min={0}
                                                    max={100}
                                                    value={formData.wantedHostShare}
                                                    onChange={(e) => setFormData({ ...formData, wantedHostShare: e.target.value })}
                                                    className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                                                />
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <FaPercentage />
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    type="button"
                                    onClick={(e) => { handleSave(e) }}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                                    flex items-center gap-2"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    Cập nhật
                                </button>

                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditCommissionRateByAdminModal;
