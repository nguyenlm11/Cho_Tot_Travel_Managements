import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaMapMarkerAlt, FaStar, FaBed, FaShower, FaWifi, FaParking, FaSwimmingPool, FaUtensils,
    FaEdit, FaChartLine, FaCalendarAlt, FaImages, FaChevronLeft, FaChevronRight, FaRegClock,
    FaClock,
    FaTag
} from 'react-icons/fa';
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { IoPricetag } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import homestayAPI from '../../services/api/homestayAPI';
import { EditHomestayModal } from '../../components/modals/EditHomestayModal';
import { formatDate } from '../../utils/utils';
import { FaTicket } from 'react-icons/fa6';
import AddpolicyModal from '../../components/modals/AddPolicyModal';
import EditPolicyModal from '../../components/modals/EditPolicyModal';
import toast, { Toaster } from 'react-hot-toast';
import CountUp from 'react-countup';

const HomestayDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const { id } = useParams();
    const [homestayData, setHomestayData] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingHomestay, setEditingHomestay] = useState(null);
    // const [loading, setLoading] = useState(false);
    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [isEditPolicyModalOpen, setIsEditPolicyModalOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (id)
            fectchHomestayDetail();
        // console.log(homestayData);
    }, [id]);

    const fectchHomestayDetail = async () => {
        try {
            // setLoading(true);
            const response = await homestayAPI.getHomestaysById(id);
            if (response.statusCode === 200 && response.data)
                // console.log(response.data.name);
                setHomestayData(response.data);

        } catch (error) {
            console.log(error);
        }
    }

    const openEditModal = (homestay) => {
        setEditingHomestay(homestay);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingHomestay(null);
    };

    const homestay = {
        name: "Sunset Beach Villa",
        description: "Tận hưởng kỳ nghỉ tuyệt vời tại biệt thự nghỉ dưỡng sang trọng với view biển tuyệt đẹp. Thiết kế hiện đại kết hợp với nội thất sang trọng mang đến không gian sống đẳng cấp và tiện nghi.",
        location: "Bãi Biển Mỹ Khê, Đà Nẵng",
        rating: 4.8,
        reviews: 124,
        price: 2500000,
        status: 'active',
        totalBookings: 45,
        revenue: 112500000,
        occupancyRate: 85,
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd",
            "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd",
            "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        ],
        amenities: [
            { icon: <FaBed />, name: "3 Phòng ngủ" },
            { icon: <FaShower />, name: "2 Phòng tắm" },
            { icon: <FaWifi />, name: "Wifi miễn phí" },
            { icon: <FaParking />, name: "Bãi đậu xe" },
            { icon: <FaSwimmingPool />, name: "Hồ bơi" },
            { icon: <FaUtensils />, name: "Nhà bếp" },
        ],
        details: `Biệt thự nghỉ dưỡng Sunset Beach Villa tọa lạc tại vị trí đắc địa với tầm nhìn ra biển tuyệt đẹp. 
        Không gian sống rộng rãi với 3 phòng ngủ, 2 phòng tắm, phòng khách và bếp được thiết kế theo phong cách hiện đại.`
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const [statsCardsData, setStatsCardsData] = useState([
        {
            title: "Tổng số đặt phòng",
            value: [],
            icon: <FaCalendarAlt />,
            gradient: "from-blue-500 to-blue-600"
        },
        {
            title: "Doanh thu",
            value: [],
            icon: <FaChartLine />,
            gradient: "from-green-500 to-green-600"
        },
        {
            title: "Đánh giá",
            value: [],
            icon: <FaStar />,
            gradient: "from-yellow-500 to-yellow-600"
        }
    ])
    const { id: homeStayID } = useParams();
    useEffect(() => {
        // console.log(homeStayID);
        fetchDashboardForHomestayDetail();
    }, [])

    const fetchDashboardForHomestayDetail = async () => {
        try {
            const responeAverageRatings = await homestayAPI.getAverageRatingForHomeStayByHomestayID(homeStayID)
            const responeBookings = await homestayAPI.getStaticBookingsForHomeStayByHomestayID(homeStayID)
            const responseRevenue = await homestayAPI.getTotalBookingsAndAmountForHomeStayByHomestayID(homeStayID)
            if (responseRevenue?.statusCode === 200 && responeBookings?.statusCode === 200 && responeAverageRatings?.statusCode === 200) {
                const formatData = [
                    {
                        title: "Tổng số đặt phòng",
                        value: responseRevenue?.data?.totalBookings,
                        icon: <FaCalendarAlt />,
                        gradient: "from-blue-500 to-blue-600"
                    },
                    {
                        title: "Doanh thu",
                        value: responseRevenue?.data?.totalBookingsAmount,
                        icon: <FaChartLine />,
                        gradient: "from-green-500 to-green-600"
                    },
                    {
                        title: "Đánh giá",
                        value: responeAverageRatings?.data,
                        icon: <FaStar />,
                        gradient: "from-yellow-500 to-yellow-600"
                    }
                ]
                setStatsCardsData(formatData);
            }
        } catch (error) {
            console.log(error);
        }
    }




    const navigate = useNavigate();
    const handleViewService = () => {
        navigate(`/owner/homestays/${homestayData?.homeStayID}/services`);
    }
    const handleViewBookingList = () => {
        navigate(`/owner/homestays/${homestayData?.homeStayID}/bookings`);
    }
    const handleViewRating = () => {
        navigate(`/owner/homestays/${homestayData?.homeStayID}/ratings`);
    }
    const handleViewDashboard = () => {
        navigate(`/owner/homestays/${homestayData?.homeStayID}/reports`);
    }

    if (!homestay) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12"
        >
            <Toaster />
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 shadow-lg mb-8">
                {/* {homestayApi.map((homestayApi) => { */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {homestayData?.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-2 w-[600px]">
                                    <FaMapMarkerAlt className="text-primary" />
                                    <span className=''>{homestayData?.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* <IoPricetag className="text-primary" /> */}
                                    {/* <span>{homestay.price.toLocaleString()}đ/đêm</span> */}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {user?.role === "Owner" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openEditModal(homestayData)}
                                    className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2
                                    hover:bg-primary-dark transition-colors"
                                >
                                    <FaEdit />
                                    Chỉnh sửa
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowGallery(true)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 
                                    dark:text-gray-300 rounded-lg flex items-center gap-2
                                    hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <FaImages />
                                Xem ảnh
                            </motion.button>
                        </div>
                    </div>
                </div>
                {/* })} */}
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsCardsData.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            variants={itemVariants}
                            className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-6 text-white`}
                        >
                            <div className="flex items-center gap-4" key={index}>
                                <div className="p-3 bg-white/10 rounded-lg">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">{stat.title}</p>
                                    <h3 className="text-2xl font-bold">
                                        <CountUp
                                            end={stat.value}
                                            duration={2}
                                            decimals={
                                                stat.title === "Đánh giá" ? 1 : 0  // Chỉ hiển thị số thập phân cho đánh giá
                                            }
                                            suffix={
                                                stat.title === "Doanh thu" ? " đ" :
                                                    stat.title === "Đánh giá" ? "/5" : ""
                                            }
                                        />
                                    </h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images Grid */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-2"
                        >
                            {homestayData?.imageHomeStays.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative h-50 overflow-hidden cursor-pointer group"
                                    onClick={() => {
                                        setSelectedImage(index);
                                        setShowGallery(true);
                                    }}
                                >
                                    <img
                                        src={image?.image}
                                        alt={`${homestay.name} ${index + 1}`}
                                        className="w-full h-[300px] object-cover transition-transform duration-300 
                                            group-hover:scale-110"
                                    />
                                    {index === 3 && homestayData?.imageHomeStays > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center 
                                            justify-center group-hover:bg-black/70 transition-colors">
                                            <div className="text-white text-center">
                                                <span className="text-3xl font-bold">+{homestayData?.imageHomeStays - 4}</span>
                                                <p className="text-sm">ảnh khác</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-300" />
                                </div>
                            ))}
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                        >
                            <div className='flex justify-between items-center'>
                                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                                    Thông tin chi tiết
                                </h2>
                                <div className='flex items-center justify-center gap-2 -mt-2'>
                                    <span>
                                        <FaClock color='gray' />
                                    </span>
                                    <span className='text-gray-500'>
                                        Ngày khởi tạo: {formatDate(homestayData?.createAt)}
                                    </span>

                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {homestayData?.description}
                            </p>
                        </motion.div>


                        {homestayData?.cancelPolicy && (<motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                        >
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">
                                Chính sách hoàn trả
                            </h2>

                            <div className='flex justify-between items-center mb-3'>
                                <div className='flex items-center justify-center gap-2 -mt-2'>
                                    <span>
                                        <FaClock color='gray' />
                                    </span>
                                    <span className='text-gray-500'>
                                        Ngày khởi tạo: {formatDate(homestayData?.cancelPolicy?.createAt)}
                                    </span>
                                </div>
                                <div className='flex items-center justify-center gap-2 -mt-2'>
                                    <span>
                                        <FaClock color='gray' />
                                    </span>
                                    <span className='text-gray-500'>
                                        Ngày cập nhật: {formatDate(homestayData?.cancelPolicy?.updateAt)}
                                    </span>
                                </div>
                            </div>

                            <p className='text-gray-600 dark:text-gray-300 leading-relaxed mb-3'>
                                Hủy trước: {homestayData?.cancelPolicy?.dayBeforeCancel} ngày
                            </p>
                            <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                                Tỉ lệ hoàn trả: {homestayData?.cancelPolicy?.refundPercentage * 100}%
                            </p>

                        </motion.div>)}
                        {/* Amenities */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                        >
                            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                                Tiện nghi
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {homestay.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center 
                                            justify-center text-primary">
                                            {amenity.icon}
                                        </div>
                                        <span>{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <motion.div
                        variants={itemVariants}
                        className="space-y-6"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                                Thao tác nhanh
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleViewBookingList}
                                    className="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg
                                    font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                                    <FaCalendarAlt />
                                    Xem lịch đặt phòng
                                </button>
                                <button
                                    onClick={handleViewDashboard}
                                    className="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg
                                    font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                                    <FaChartLine />
                                    Báo cáo doanh thu
                                </button>
                                <button
                                    onClick={handleViewRating}
                                    className="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg
                                    font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                                    <FaStar />
                                    Xem đánh giá
                                </button>
                                <button
                                    onClick={handleViewService}
                                    className="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg
                                    font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                                    <FaTag />
                                    Xem dịch vụ
                                </button>
                                {user?.role === "Owner" && (
                                    <button
                                        onClick={() => homestayData?.cancelPolicy ? setIsEditPolicyModalOpen(true) : setIsAddPolicyModalOpen(true)}
                                        className="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg
                                    font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                                        <HiOutlineReceiptRefund />
                                        {homestayData?.cancelPolicy ? "Cập nhật chính sách hoàn trả" : "Thêm chính sách hoàn trả"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center"
                    >
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute top-80 right-7 text-white text-xl bg-black/50 
                                p-1 rounded-full hover:bg-black/70 transition-colors"
                        >
                            ✕
                        </button>
                        <button
                            onClick={() => setSelectedImage(prev =>
                                prev > 0 ? prev - 1 : homestayData?.imageHomeStays.length - 1)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white 
                                bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <FaChevronLeft />
                        </button>
                        <img
                            src={homestayData?.imageHomeStays[selectedImage]?.image}
                            alt={homestayData?.name}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <button
                            onClick={() => setSelectedImage(prev =>
                                prev < homestayData?.imageHomeStays.length - 1 ? prev + 1 : 0)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white 
                                bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <FaChevronRight />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <EditHomestayModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                homestay={editingHomestay}
                // setLoading={setLoading}
                fetchHomestays={fectchHomestayDetail}
            />
            {isAddPolicyModalOpen && (
                <AddpolicyModal
                    isOpen={isAddPolicyModalOpen}
                    onClose={() => setIsAddPolicyModalOpen(false)}
                    homeStayID={homestayData?.homeStayID}
                    fetchHomestay={fectchHomestayDetail}
                />
            )}

            {isEditPolicyModalOpen && (
                <EditPolicyModal
                    isOpen={isEditPolicyModalOpen}
                    onClose={() => setIsEditPolicyModalOpen(false)}
                    cancelPolicy={homestayData?.cancelPolicy}
                    fetchHomestay={fectchHomestayDetail}
                />
            )}
        </motion.div>
    );
};

export default HomestayDetail; 