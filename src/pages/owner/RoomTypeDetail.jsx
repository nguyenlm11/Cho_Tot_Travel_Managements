import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBed, FaUsers, FaArrowLeft, FaEdit, FaTrash,
    FaDollarSign, FaWifi, FaTv, FaSnowflake, FaCheck, FaPlus, FaCog, FaBath, FaUtensils, FaHome, FaUser, FaChild
} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import roomTypeAPI from '../../services/api/roomTypeAPI';
import pricingAPI from '../../services/api/pricingAPI';
import AddPricingModal from '../../components/modals/AddPricingModal';
import EditPricingModal from '../../components/modals/EditPricingModal';
import EditRoomTypeModal from '../../components/modals/EditRoomTypeModal';

const RoomTypeDetail = () => {
    const { homestayId, rentalId, roomTypeId } = useParams();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomTypeDetailData, setRoomTypeDetailData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPricing, setSelectedPricing] = useState(null);
    const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
    const [isAddPricingModalOpen, setIsAddPricingModalOpen] = useState(false);
    const [isEditRoomTypeModalOpen, setIsEditRoomTypeModalOpen] = useState(false);
    const featureVariants = {
        initial: { opacity: 0, scale: 0.8 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 15 }
        },
        hover: {
            scale: 1.05,
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
            transition: { type: "spring", stiffness: 300, damping: 15 }
        }
    };

    const buttonVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 15 }
        },
        hover: {
            scale: 1.05,
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
            transition: { type: "spring", stiffness: 300, damping: 15 }
        },
        tap: { scale: 0.95 }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };
    const contentVariants = {
        initial: { opacity: 0, y: 30 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const imageVariants = {
        initial: { scale: 1.1, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.6 }
        }
    };

    // Thêm hàm xử lý khi click vào nút edit
    const handleEditPricing = (pricing) => {
        setSelectedPricing(pricing);
        setIsEditPricingModalOpen(true);

    };
    console.log(roomTypeDetailData);

    const handleUpdatePricing = async (updatedPricing) => {
        const formatData = { ...updatedPricing, roomTypesID: +roomTypeId, homeStayRentalID: +rentalId }
        if (updatedPricing?.pricingID) {
            if (roomTypeDetailData?.pricings
                ?.filter(item => item?.pricingID != updatedPricing?.pricingID)
                ?.find(item => (item?.dayType == 0 && updatedPricing?.dayType == 0) || (item?.dayType == 1 && updatedPricing?.dayType == 1))) {
                toast.error(`Gói ${updatedPricing?.dayType == 0 ? "ngày thường" : "ngày cuối tuần"} đã tồn tại`);
                return;
            }
            try {
                const res = await pricingAPI.updatePricing(formatData.pricingID, formatData);
                if (res.statusCode === 200) {
                    toast.success('Cập nhật giá thuê thành công!');
                    setIsEditPricingModalOpen(false);
                    setSelectedPricing(null);
                    fetchRoomTypeDetail();
                } else {
                    toast.error('Không thể cập nhật giá thuê: ' + res.message);
                }
            } catch (error) {
                console.error('Error updating pricing:', error);
                toast.error('Không thể cập nhật giá thuê: ' + error.message);
            }
        }
    }

    const handleAddPricing = async (data) => {
        const formatData = { ...data, roomTypesID: +roomTypeId, homeStayRentalID: +rentalId }
        if (roomTypeDetailData?.pricings?.find(item => (item?.dayType == 0 && formatData?.dayType == 0) || (item?.dayType == 1 && formatData?.dayType == 1))) {
            toast.error(`Gói ${formatData?.dayType == 0 ? "ngày thường" : "ngày cuối tuần"} đã tồn tại`);
            return;
        }

        try {
            const res = await pricingAPI.addPricing(formatData);
            if (res.statusCode === 200) {
                toast.success('Thêm giá thuê thành công!');
                setIsAddPricingModalOpen(false);
                fetchRoomTypeDetail();
            } else {
                toast.error('Không thể thêm giá thuê: ' + res.message);
            }
        } catch (error) {
            console.error('Error updating pricing:', error);
            toast.error('Không thể thêm giá thuê: ' + error.message);
        }
    }

    useEffect(() => {
        fetchRoomTypeDetail();
    }, [roomTypeId]);

    const fetchRoomTypeDetail = async () => {
        try {
            const response = await roomTypeAPI.getRoomTypeDetail(roomTypeId);
            if (response?.statusCode === 200) {
                setRoomTypeDetailData(response.data);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const handlePrevImage = () => {
        if (roomTypeDetailData?.imageRoomTypes?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? roomTypeDetailData?.imageRoomTypes.length - 1 : prevIndex - 1
            );
        }
    };

    const handleNextImage = () => {
        if (roomTypeDetailData?.imageRoomTypes?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === roomTypeDetailData?.imageRoomTypes.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <motion.div
                className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16"
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                variants={{
                    initial: { opacity: 0, y: 50 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -50 }
                }}
            >
                {/* Header */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                                transition-colors"
                        >
                            <FaArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {roomTypeDetailData?.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Chi tiết loại phòng
                            </p>
                        </div>
                    </div>

                    {/* Room Type Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Image Gallery */}
                        <div className="lg:col-span-8 space-y-4">
                            <motion.div
                                variants={contentVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
                            >
                                <div className="relative h-[400px]">
                                    {roomTypeDetailData?.imageRoomTypes && roomTypeDetailData?.imageRoomTypes.length > 0 ? (
                                        <>
                                            <AnimatePresence initial={false} mode="wait">
                                                <motion.img
                                                    key={currentImageIndex}
                                                    src={roomTypeDetailData?.imageRoomTypes[currentImageIndex].image}
                                                    alt={`${roomTypeDetailData?.name} - Ảnh ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                    variants={imageVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </AnimatePresence>

                                            {roomTypeDetailData?.imageRoomTypes.length > 1 && (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={handlePrevImage}
                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full
                              bg-black/40 text-white hover:bg-black/50 transition-colors"
                                                    >
                                                        <FaChevronLeft className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={handleNextImage}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full
                              bg-black/40 text-white hover:bg-black/50 transition-colors"
                                                    >
                                                        <FaChevronRight className="w-5 h-5" />
                                                    </motion.button>
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                            bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                                        {currentImageIndex + 1} / {roomTypeDetailData?.imageRoomTypes.length}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Không có hình ảnh</span>
                                        </div>
                                    )}
                                </div>

                                {/* Image thumbnails */}
                                {roomTypeDetailData?.imageRoomTypes && roomTypeDetailData?.imageRoomTypes.length > 1 && (
                                    <div className="p-4 flex space-x-2 overflow-x-auto">
                                        {roomTypeDetailData?.imageRoomTypes.map((image, index) => (
                                            <motion.button
                                                key={image.imageRoomTypesID}
                                                onClick={() => setCurrentImageIndex(index)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden 
                          transition-all duration-200 ${currentImageIndex === index
                                                        ? 'ring-2 ring-primary'
                                                        : 'opacity-70 hover:opacity-100'}`}
                                            >
                                                <img
                                                    src={image.image}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            <div className="space-y-6 border border-gray-200 dark:border-gray-700 rounded-xl px-6">
                                <div className="flex justify-between items-center w-full mt-4">
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Mô tả
                                    </p>
                                    {/* <p className="text-gray-600 dark:text-gray-400">
                                        Cập nhật: {new Date(roomTypeDetailData?.lastUpdated).toLocaleDateString('vi-VN')}
                                    </p> */}
                                </div>


                                <p className="text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl p-3  dark:bg-gray-900/50 bg-gray-50 dark:bg-gray-800">
                                    {roomTypeDetailData?.description}
                                </p>



                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <FaCog className="mr-2 text-primary" />Tính năng
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                                <FaBed className="text-blue-500 dark:text-blue-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">Phòng ngủ</p>
                                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{roomTypeDetailData?.numberBedRoom}</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                <FaBath className="text-green-500 dark:text-green-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-700 dark:text-green-300">Phòng tắm</p>
                                                <p className="text-lg font-bold text-green-900 dark:text-green-100">{roomTypeDetailData?.numberBathRoom}</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                                                <FaWifi className="text-yellow-500 dark:text-yellow-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">WiFi</p>
                                                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{roomTypeDetailData?.numberWifi}</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                                                <FaUsers className="text-indigo-500 dark:text-indigo-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-indigo-700 dark:text-indigo-300">Sức chứa</p>
                                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{roomTypeDetailData?.maxPeople} người</p>
                                            </div>
                                        </motion.div>

                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <FaUsers className="mr-2 text-primary" />Sức chứa khách
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-rose-100 dark:bg-rose-800 rounded-full">
                                                <FaUser className="text-rose-500 dark:text-rose-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-rose-700 dark:text-rose-300">Người lớn</p>
                                                <p className="text-lg font-bold text-rose-900 dark:text-rose-100">Tối đa {roomTypeDetailData?.maxAdults}</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full">
                                                <FaChild className="text-orange-500 dark:text-orange-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-orange-700 dark:text-orange-300">Trẻ em</p>
                                                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">Tối đa {roomTypeDetailData?.maxChildren}</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={featureVariants}
                                            whileHover="hover"
                                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl"
                                        >
                                            <div className="p-3 bg-sky-100 dark:bg-sky-800 rounded-full">
                                                <FaUsers className="text-sky-500 dark:text-sky-300 w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-sky-700 dark:text-sky-300">Tổng</p>
                                                <p className="text-lg font-bold text-sky-900 dark:text-sky-100">Tối đa {roomTypeDetailData?.maxPeople}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* right column */}
                        <div className="lg:col-span-4 space-y-6 gap-4">
                            {/* Status card with glassmorphism */}
                            <motion.div
                                variants={contentVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 backdrop-blur-sm
                  border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trạng thái</h2>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium
                      ${roomTypeDetailData?.status
                                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                                                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'}`
                                        }
                                    >
                                        {roomTypeDetailData?.status ? 'Hoạt động' : 'Tạm ngưng'}
                                    </motion.div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Loại thuê:</span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                                        >
                                            {roomTypeDetailData?.name}
                                        </motion.span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Số ảnh:</span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full font-medium"
                                        >
                                            {roomTypeDetailData?.imageRoomTypes?.length || 0}
                                        </motion.span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Giá ngày thường:</span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full font-medium"
                                        >
                                            {roomTypeDetailData?.pricings?.length > 0 ? (
                                                <p className="text-xl font-bold">
                                                    {formatPrice(roomTypeDetailData?.pricings[0]?.rentPrice)}
                                                </p>
                                            ) : (
                                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                                    Giá theo loại phòng
                                                </p>
                                            )}
                                        </motion.span>
                                    </div>

                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-4">
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            onClick={() => setIsEditRoomTypeModalOpen(true)}
                                            whileTap="tap"
                                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                                        >
                                            <FaEdit className="mr-2" /> Chỉnh sửa loại phòng
                                        </motion.button>

                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setIsAddPricingModalOpen(true)}
                                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center"
                                        >
                                            <FaPlus className="mr-2" /> Thêm gói
                                        </motion.button>

                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setShowDeleteModal(true)}
                                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                                        >
                                            <FaTrash className="mr-2" /> Xóa loại phòng
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            {roomTypeDetailData?.pricings?.map((pricing, index) => (
                                <motion.div
                                    key={index}
                                    variants={contentVariants}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 backdrop-blur-sm
                  border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gói {pricing?.dayType == 0 ? "ngày thường" : pricing?.dayType == 1 ? "ngày cuối tuần" : "ngày lễ"}</h2>
                                        <div className="flex items-center justify-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 
                                  rounded-full transition-colors"
                                                title="Chỉnh sửa"
                                                onClick={() => handleEditPricing(pricing)}
                                            >
                                                <FaEdit className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 
                                  rounded-full transition-colors"
                                                title="Xóa"
                                            >
                                                <FaTrash className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Đơn giá:</span>
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full font-medium text-sm"
                                                >
                                                    {formatPrice(pricing?.unitPrice)}
                                                </motion.span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Giá thuê:</span>
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full font-medium text-sm"
                                                >
                                                    {formatPrice(pricing?.rentPrice)}
                                                </motion.span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Loại ngày:</span>
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-full font-medium text-sm"
                                                >
                                                    {pricing?.dayType == 0 ? "Ngày thường" : pricing?.dayType == 1 ? "Ngày cuối tuần" : "Ngày lễ"}
                                                </motion.span>
                                            </div>
                                        </div>

                                        {!pricing?.isDefault && (<div className="space-y-3">
                                            <p className="text-gray-600 dark:text-gray-400">Có giá trị từ ngày:</p>
                                            <motion.p
                                                whileHover={{ scale: 1.05 }}
                                                className='flex items-center justify-between text-gray-300'
                                            >
                                                <span className='text-gray-600 dark:text-gray-400'>{formatDate(pricing?.startDate)}</span>
                                                <span>-</span>
                                                <span className='text-gray-600 dark:text-gray-400'>{formatDate(pricing?.endDate)}</span>
                                            </motion.p>
                                        </div>)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </motion.div>

            </motion.div>

            {isEditPricingModalOpen && (
                <EditPricingModal
                    pricing={selectedPricing}
                    isOpen={isEditPricingModalOpen}
                    onClose={() => {
                        setIsEditPricingModalOpen(false);
                        setSelectedPricing(null);
                    }}
                    onSave={handleUpdatePricing}
                />
            )}

            {isAddPricingModalOpen && (
                <AddPricingModal
                    isOpen={isAddPricingModalOpen}
                    onClose={() => setIsAddPricingModalOpen(false)}
                    onSave={handleAddPricing}
                />
            )}


            {isEditRoomTypeModalOpen && (
                <EditRoomTypeModal
                    roomType={roomTypeDetailData}
                    isOpen={isEditRoomTypeModalOpen}
                    onClose={() => setIsEditRoomTypeModalOpen(false)}
                    fetchRoomType={fetchRoomTypeDetail}
                />
            )}
        </>

    );
};

export default RoomTypeDetail; 