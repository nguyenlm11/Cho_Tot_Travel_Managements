import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaMapMarkerAlt, FaStar, FaBed, FaShower, FaWifi,
    FaParking, FaSwimmingPool, FaUtensils, FaHeart,
    FaShare, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { IoPricetag, IoTime, IoCalendarClear } from 'react-icons/io5';

const HomestayDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showGallery, setShowGallery] = useState(false);

    // Mock data - replace with API call later
    const homestay = {
        name: "Sunset Beach Villa",
        description: "Tận hưởng kỳ nghỉ tuyệt vời tại biệt thự nghỉ dưỡng sang trọng với view biển tuyệt đẹp. Thiết kế hiện đại kết hợp với nội thất sang trọng mang đến không gian sống đẳng cấp và tiện nghi.",
        location: "Bãi Biển Mỹ Khê, Đà Nẵng",
        rating: 4.8,
        reviews: 124,
        price: 2500000,
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd",
            "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f",
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
        Không gian sống rộng rãi với 3 phòng ngủ, 2 phòng tắm, phòng khách và bếp được thiết kế theo phong cách hiện đại. 
        Nội thất cao cấp cùng trang thiết bị tiện nghi đáp ứng mọi nhu cầu của bạn.
        
        Điểm nhấn đặc biệt là hồ bơi vô cực với view biển panorama, nơi bạn có thể thư giãn và ngắm hoàng hôn tuyệt đẹp. 
        Khu vực BBQ ngoài trời lý tưởng cho những bữa tiệc ấm cúng cùng gia đình và bạn bè.`
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const galleryVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            {/* Hero Section */}
            <div className="relative h-[70vh] overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <img
                        src={homestay.images[selectedImage]}
                        alt={homestay.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        {homestay.name}
                    </motion.h1>
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-primary" />
                            <span>{homestay.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            <span>{homestay.rating} ({homestay.reviews} đánh giá)</span>
                        </div>
                    </motion.div>
                </div>

                {/* Image Navigation */}
                <div className="absolute bottom-8 right-8 flex gap-4">
                    <button
                        onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : homestay.images.length - 1))}
                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-50"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={() => setSelectedImage((prev) => (prev < homestay.images.length - 1 ? prev + 1 : 0))}
                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-50"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                                Giới thiệu
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {homestay.description}
                            </p>
                        </motion.div>

                        {/* Amenities */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                                Tiện nghi
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {homestay.amenities.map((amenity, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            {amenity.icon}
                                        </div>
                                        <span>{amenity.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Details */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                                Chi tiết
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {homestay.details}
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:sticky lg:top-8 h-fit"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <IoPricetag className="text-primary text-xl" />
                                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {homestay.price.toLocaleString()}đ
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">/đêm</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                                        text-gray-600 dark:text-gray-300 hover:bg-gray-200 
                                        dark:hover:bg-gray-600 transition-colors">
                                        <FaHeart />
                                    </button>
                                    <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                                        text-gray-600 dark:text-gray-300 hover:bg-gray-200 
                                        dark:hover:bg-gray-600 transition-colors">
                                        <FaShare />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <IoTime className="text-primary" />
                                    <span>Nhận phòng: 14:00 - Trả phòng: 12:00</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <IoCalendarClear className="text-primary" />
                                    <span>Đặt tối thiểu 2 đêm</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 px-4 bg-primary text-white rounded-xl 
                                    font-semibold hover:bg-primary-dark transition-colors"
                            >
                                Đặt ngay
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Full Screen Gallery */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        variants={galleryVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    >
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute top-4 right-4 text-white text-2xl"
                        >
                            ✕
                        </button>
                        <img
                            src={homestay.images[selectedImage]}
                            alt={homestay.name}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {homestay.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-2 h-2 rounded-full ${index === selectedImage ? 'bg-white' : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HomestayDetail; 