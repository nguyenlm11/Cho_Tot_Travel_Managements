import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaBath, FaBed, FaChevronLeft, FaChevronRight, FaChild, FaCog, FaEdit, FaEye, FaHome, FaInfoCircle, FaMapMarkerAlt, FaPlus, FaRegCalendarAlt, FaRegClock, FaTags, FaTimes, FaTrash, FaUser, FaUsers, FaUtensils, FaWifi } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import homestayRentalAPI from '../../services/api/homestayrentalAPI';
import EditPricingModal from '../../components/modals/EditPricingModal';
import pricingAPI from '../../services/api/pricingAPI';
import axiosInstance from '../../services/config';

// Animation variants (giữ nguyên như code ban đầu)
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.15 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
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

const roomTypeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hover: {
        y: -5,
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 300, damping: 15 }
    }
};

const HomestayRentalDetail = () => {
    const { id: homestayId, rentalId } = useParams();
    const navigate = useNavigate();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [tabSelected, setTabSelected] = useState('info');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
    const [selectedPricing, setSelectedPricing] = useState(null);

    // Animation with scroll
    const { scrollY } = useScroll();
    const physicsScroll = useSpring(scrollY, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const headerOpacity = useTransform(
        physicsScroll,
        [0, 100],
        [1, 0.8]
    );

    const headerY = useTransform(
        physicsScroll,
        [0, 100],
        [0, -20]
    );

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

    const fetchRentalDetails = async () => {
        setLoading(true);
        try {
            const response = await homestayRentalAPI.getHomeStayRentalDetail(rentalId);
            if (response && response.statusCode === 200) {
                setRental(response.data);
            } else {
                toast.error('Không thể tải thông tin căn thuê');
                navigate(`/owner/homestays/${homestayId}/homestay-rental`);
            }
        } catch (error) {
            console.error('Error fetching rental details:', error);
            toast.error('Có lỗi xảy ra khi tải thông tin chi tiết');
            navigate(`/owner/homestays/${homestayId}/homestay-rental`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalDetails();

        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [rentalId]);

    // Handle delete rental
    const confirmDelete = async () => {
        if (!rental) return;

        setShowDeleteModal(false);
        const loadingToast = toast.loading('Đang xóa căn thuê...');

        try {
            if (!homestayRentalAPI.deleteHomeStayRental) {
                homestayRentalAPI.deleteHomeStayRental = async (id) => {
                    const response = await axiosInstance.delete(`/homestayrental/DeleteHomeStayRental/${id}`);
                    return response.data;
                };
            }

            const response = await homestayRentalAPI.deleteHomeStayRental(rental.homeStayRentalID);
            if (response && response.statusCode === 200) {
                toast.dismiss(loadingToast);
                toast.success('Xóa căn thuê thành công');
                navigate(`/owner/homestays/${homestayId}/homestay-rental`);
            } else {
                toast.dismiss(loadingToast);
                toast.error('Không thể xóa căn thuê');
            }
        } catch (error) {
            console.error('Error deleting rental:', error);
            toast.dismiss(loadingToast);
            toast.error('Không thể xóa căn thuê');
        }
    };

    // Room types pagination
    const totalPages = rental?.roomTypes ? Math.ceil(rental.roomTypes.length / itemsPerPage) : 0;
    const paginatedRoomTypes = rental?.roomTypes
        ? rental.roomTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    // Image navigation
    const handlePrevImage = () => {
        if (rental?.imageHomeStayRentals?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? rental.imageHomeStayRentals.length - 1 : prevIndex - 1
            );
        }
    };

    const handleNextImage = () => {
        if (rental?.imageHomeStayRentals?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === rental.imageHomeStayRentals.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    // Tab navigation - Chỉ hiển thị "Loại phòng" nếu rentWhole = false
    const tabs = [
        { id: 'info', label: 'Thông tin chung', icon: <FaInfoCircle className="mr-2" /> },
        ...(rental?.rentWhole === false ? [
            { id: 'roomTypes', label: 'Loại phòng', icon: <FaBed className="mr-2" /> }
        ] : []),
    ];

    // Thêm hàm xử lý khi click vào nút edit
    const handleEditPricing = (pricing) => {
        setSelectedPricing(pricing);
        setIsEditPricingModalOpen(true);
    };

    const handleSavePricing = async (updatedPricing) => {
        if (updatedPricing?.pricingID) {
            try {
                const res = await pricingAPI.updatePricing(updatedPricing.pricingID, updatedPricing);
                if (res.statusCode === 200) {
                    toast.success('Cập nhật giá thuê thành công!');
                    setIsEditPricingModalOpen(false);
                    setSelectedPricing(null);
                    fetchRentalDetails();
                } else {
                    toast.error('Không thể cập nhật giá thuê: ' + res.message);
                }
            } catch (error) {
                console.error('Error updating pricing:', error);
                toast.error('Không thể cập nhật giá thuê: ' + error.message);
            }
        }
    }


    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center"
            >
                <motion.div
                    animate={{
                        rotate: 360,
                        transition: { duration: 1, repeat: Infinity, ease: "linear" }
                    }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Đang tải thông tin...</p>
            </motion.div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16"
            >
                {/* Sticky Header with Animations */}
                <motion.div
                    style={{ opacity: headerOpacity, y: headerY }}
                    className={`sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${scrollPosition > 50 ? 'shadow-lg bg-white/95 backdrop-blur-md dark:bg-gray-800/95' : ''
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {rental?.name}
                                    </h1>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <FaMapMarkerAlt className="mr-1" />
                                        <span className="truncate max-w-[200px] md:max-w-xs">{rental?.homeStayName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column - Images and basic info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image gallery with glass morphism */}
                            <motion.div
                                variants={contentVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
                            >
                                <div className="relative h-[400px]">
                                    {rental?.imageHomeStayRentals && rental.imageHomeStayRentals.length > 0 ? (
                                        <>
                                            <AnimatePresence initial={false} mode="wait">
                                                <motion.img
                                                    key={currentImageIndex}
                                                    src={rental.imageHomeStayRentals[currentImageIndex].image}
                                                    alt={`${rental.name} - Ảnh ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                    variants={imageVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </AnimatePresence>

                                            {rental.imageHomeStayRentals.length > 1 && (
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
                                                        {currentImageIndex + 1} / {rental.imageHomeStayRentals.length}
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
                                {rental?.imageHomeStayRentals && rental.imageHomeStayRentals.length > 1 && (
                                    <div className="p-4 flex space-x-2 overflow-x-auto">
                                        {rental.imageHomeStayRentals.map((image, index) => (
                                            <motion.button
                                                key={image.imageHomeStayRentalsID}
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

                            {/* Tabs with animated underline */}
                            <motion.div variants={contentVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex overflow-x-auto scrollbar-hide">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setTabSelected(tab.id)}
                                                className={`relative px-6 py-4 text-sm font-medium transition-colors
                          ${tabSelected === tab.id
                                                        ? 'text-primary'
                                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    {tab.icon}
                                                    {tab.label}
                                                </div>
                                                {tabSelected === tab.id && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab content with smooth transitions */}
                                <div className="p-6">
                                    <AnimatePresence mode="wait">
                                        {tabSelected === 'info' && (
                                            <motion.div
                                                key="info"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-8"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mô tả</h2>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                            <FaRegClock className="mr-1" />
                                                            Cập nhật: {formatDate(rental?.updateAt !== "0001-01-01T00:00:00" ? rental?.updateAt : rental?.createAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                        {rental?.description || "Chưa có mô tả chi tiết cho căn thuê này."}
                                                    </p>
                                                </div>

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
                                                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{rental?.numberBedRoom}</p>
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
                                                                <p className="text-lg font-bold text-green-900 dark:text-green-100">{rental?.numberBathRoom}</p>
                                                            </div>
                                                        </motion.div>

                                                        <motion.div
                                                            variants={featureVariants}
                                                            whileHover="hover"
                                                            className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                                                        >
                                                            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                                                <FaUtensils className="text-purple-500 dark:text-purple-300 w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-purple-700 dark:text-purple-300">Phòng bếp</p>
                                                                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{rental?.numberKitchen}</p>
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
                                                                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{rental?.numberWifi}</p>
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
                                                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{rental?.maxPeople} người</p>
                                                            </div>
                                                        </motion.div>

                                                        <motion.div
                                                            variants={featureVariants}
                                                            whileHover="hover"
                                                            className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl"
                                                        >
                                                            <div className="p-3 bg-pink-100 dark:bg-pink-800 rounded-lg">
                                                                <FaHome className="text-pink-500 dark:text-pink-300 w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-pink-700 dark:text-pink-300">Loại thuê</p>
                                                                <p className="text-lg font-bold text-pink-900 dark:text-pink-100">
                                                                    {rental?.rentWhole ? 'Nguyên căn' : 'Theo phòng'}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                        <FaUsers className="mr-2 text-primary" />Sức chứa khách
                                                    </h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                                <p className="text-lg font-bold text-rose-900 dark:text-rose-100">Tối đa {rental?.maxAdults}</p>
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
                                                                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">Tối đa {rental?.maxChildren}</p>
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
                                                                <p className="text-lg font-bold text-sky-900 dark:text-sky-100">Tối đa {rental?.maxPeople}</p>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {tabSelected === 'roomTypes' && rental?.rentWhole === false && (
                                            <motion.div
                                                key="roomTypes"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                        <FaBed className="mr-2 text-primary" />
                                                        Loại phòng
                                                    </h2>
                                                    <motion.button
                                                        variants={buttonVariants}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                        onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/room-types/create`)}
                                                        className="px-4 py-2 bg-primary text-white rounded-lg flex items-center"
                                                    >
                                                        <FaPlus className="mr-2" /> Thêm loại phòng
                                                    </motion.button>
                                                </div>

                                                {rental?.roomTypes && rental.roomTypes.length > 0 ? (
                                                    <>
                                                        <div className="space-y-6">
                                                            {paginatedRoomTypes.map((roomType, index) => (
                                                                <motion.div
                                                                    key={roomType.roomTypesID}
                                                                    variants={roomTypeVariants}
                                                                    whileHover="hover"
                                                                    custom={index}
                                                                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden
                                    bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300"
                                                                >
                                                                    <div className="flex flex-col md:flex-row">
                                                                        <div className="md:w-1/3 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/10
                                      p-6 flex flex-col justify-center items-center text-center"
                                                                        >
                                                                            <motion.div
                                                                                whileHover={{ rotate: 5, scale: 1.1 }}
                                                                                className="text-primary dark:text-primary-light mb-3"
                                                                            >
                                                                                <FaBed className="w-16 h-16" />
                                                                            </motion.div>
                                                                            <h3 className="text-xl font-bold text-primary dark:text-primary-light mb-2">
                                                                                {roomType.name}
                                                                            </h3>
                                                                            <div className={`px-3 py-1 rounded-full text-xs font-medium
                                        ${roomType.status
                                                                                    ? 'bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-100'
                                                                                    : 'bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-100'}`
                                                                            }>
                                                                                {roomType.status ? 'Hoạt động' : 'Tạm ngưng'}
                                                                            </div>
                                                                        </div>

                                                                        <div className="md:w-2/3 p-6">
                                                                            <div className="mb-4">
                                                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                                    {roomType.description || "Không có mô tả"}
                                                                                </p>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                    <FaBed className="text-primary" />
                                                                                    <span>{roomType.numberBedRoom} phòng</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                    <FaBath className="text-primary" />
                                                                                    <span>{roomType.numberBathRoom} p.tắm</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                    <FaWifi className="text-primary" />
                                                                                    <span>{roomType.numberWifi} Wifi</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                    <FaUsers className="text-primary" />
                                                                                    <span>{roomType.maxPeople} người</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                                <FaRegCalendarAlt className="mr-1" />
                                                                                <span>Ngày tạo: {formatDate(roomType.createAt)}</span>
                                                                            </div>

                                                                            {roomType.pricings && roomType.pricings.length > 0 ? (
                                                                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                                                                        <FaTags className="mr-1 text-primary" /> Giá phòng:
                                                                                    </h4>
                                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                        {roomType.pricings.map(pricing => (
                                                                                            <div
                                                                                                key={pricing.pricingID}
                                                                                                className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 
                                                  p-2 rounded-lg"
                                                                                            >
                                                                                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                                                    {pricing.description || "Giá mặc định"}
                                                                                                </span>
                                                                                                <span className="font-medium text-primary">
                                                                                                    {formatPrice(pricing.rentPrice)}
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 italic">
                                                                                    Chưa có thông tin giá
                                                                                </p>
                                                                            )}


                                                                            <div className="mt-4 flex justify-between items-center">
                                                                                <Link
                                                                                    to={`/owner/homestays/${homestayId}/rentals/${rentalId}/room-types/${roomType.roomTypesID}/edit`}
                                                                                    className="text-blue-500 hover:text-blue-700 transition-colors flex items-center"
                                                                                >
                                                                                    <FaEdit className="inline mr-1" /> Chỉnh sửa
                                                                                </Link>
                                                                                <Link
                                                                                    to={`/owner/homestays/${homestayId}/rentals/${rentalId}/room-types/${roomType.roomTypesID}/rooms`}
                                                                                    className="text-blue-500 hover:text-blue-700 transition-colors flex items-center"
                                                                                >
                                                                                    <FaEdit className="inline mr-1" /> Quản lý
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        {/* Pagination for room types */}
                                                        {totalPages > 1 && (
                                                            <div className="flex justify-center items-center gap-2 mt-8">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                                    disabled={currentPage === 1}
                                                                    className={`p-2 rounded-lg ${currentPage === 1
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                                >
                                                                    <FaChevronLeft className="w-5 h-5" />
                                                                </motion.button>

                                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                                    <motion.button
                                                                        key={number}
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => setCurrentPage(number)}
                                                                        className={`w-10 h-10 rounded-lg ${number === currentPage
                                                                            ? 'bg-primary text-white'
                                                                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                                    >
                                                                        {number}
                                                                    </motion.button>
                                                                ))}

                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                                    disabled={currentPage === totalPages}
                                                                    className={`p-2 rounded-lg ${currentPage === totalPages
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                                >
                                                                    <FaChevronRight className="w-5 h-5" />
                                                                </motion.button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-xl"
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="mb-4"
                                                        >
                                                            <FaBed className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600" />
                                                        </motion.div>
                                                        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Chưa có loại phòng nào
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                                                            Thêm loại phòng để phục vụ khách hàng tốt hơn
                                                        </p>
                                                        <motion.button
                                                            variants={buttonVariants}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/room-types/create`)}
                                                            className="px-5 py-2.5 bg-primary text-white rounded-lg inline-flex items-center"
                                                        >
                                                            <FaPlus className="mr-2" /> Thêm loại phòng
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right column - Action panel */}
                        <div className="space-y-6">
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
                      ${rental?.status
                                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                                                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'}`
                                        }
                                    >
                                        {rental?.status ? 'Hoạt động' : 'Tạm ngưng'}
                                    </motion.div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Loại thuê:</span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                                        >
                                            {rental?.rentWhole ? 'Nguyên căn' : 'Theo phòng'}
                                        </motion.span>
                                    </div>

                                    {rental?.rentWhole === false && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Số loại phòng:</span>
                                            <motion.span
                                                whileHover={{ scale: 1.05 }}
                                                className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                                            >
                                                {(rental?.roomTypes?.length || 0)}
                                            </motion.span>
                                        </div>)}

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Số ảnh:</span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full font-medium"
                                        >
                                            {rental?.imageHomeStayRentals?.length || 0}
                                        </motion.span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-4">
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental.homeStayRentalID}/editHomestayRental`)}
                                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                                        >
                                            <FaEdit className="mr-2" /> Chỉnh sửa thông tin
                                        </motion.button>

                                        {rental?.rentWhole === false && (
                                            <motion.button
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/room-types/create`)}
                                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center"
                                            >
                                                <FaPlus className="mr-2" /> Thêm loại phòng
                                            </motion.button>
                                        )}

                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setShowDeleteModal(true)}
                                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                                        >
                                            <FaTrash className="mr-2" /> Xóa căn thuê
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={contentVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 backdrop-blur-sm
                  border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Các gói thuê</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Tổng số gói:</span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full font-medium"
                                        >
                                            {rental?.pricing?.length || 0}
                                        </motion.span>
                                    </div>
                                </div>
                            </motion.div>

                            {rental?.pricing?.map((pricing, index) => (
                                <motion.div
                                    key={index}
                                    variants={contentVariants}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 backdrop-blur-sm
                  border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gói {index + 1}</h2>
                                        <div className="flex items-center justify-center gap-2">
                                            {/* <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 bg-primary/10 text-primary hover:bg-primary/20 
                                  rounded-full transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <FaEye className="w-5 h-5" />
                                            </motion.button> */}
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
                </div>
            </motion.div>

            {/* Delete Confirmation Modal with glass morphism */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full
                shadow-xl border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Xác nhận xóa
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowDeleteModal(false)}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-500 dark:text-gray-400"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </motion.button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Bạn có chắc chắn muốn xóa căn thuê <span className="font-semibold text-primary">"{rental?.name}"</span>?
                            </p>

                            <div className="flex justify-end gap-3">
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700
                  dark:hover:bg-gray-600 text-gray-800 dark:text-white
                  rounded-lg transition-colors duration-200"
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white
                  rounded-lg transition-colors duration-200"
                                >
                                    Xác nhận xóa
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Thêm EditPricingModal vào cuối component */}
            {isEditPricingModalOpen && (
                <EditPricingModal
                    pricing={selectedPricing}
                    isOpen={isEditPricingModalOpen}
                    onClose={() => {
                        setIsEditPricingModalOpen(false);
                        setSelectedPricing(null);
                    }}
                    onSave={handleSavePricing}
                />
            )}
        </>
    );
};

export default HomestayRentalDetail;