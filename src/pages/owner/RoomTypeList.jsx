import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBed, FaUsers, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return [debouncedValue];
}

const RoomTypeList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 6;

    // Mock data - replace with API call later
    const [roomTypes] = useState([
        {
            id: 1,
            name: "Phòng Deluxe Hướng Biển",
            description: "Phòng sang trọng với view biển tuyệt đẹp",
            capacity: 2,
            bedType: "1 giường đôi lớn",
            size: "35m²",
            price: 2500000,
            amenities: ["TV", "Minibar", "Ban công", "Máy lạnh", "Wifi"],
            image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a"
        },
        {
            id: 2,
            name: "Phòng Suite Gia Đình",
            description: "Phòng rộng rãi phù hợp cho gia đình",
            capacity: 4,
            bedType: "2 giường đôi",
            size: "45m²",
            price: 3500000,
            amenities: ["TV", "Minibar", "Bồn tắm", "Máy lạnh", "Wifi"],
            image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a"
        }
    ]);

    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const filteredRoomTypes = useMemo(() => {
        return roomTypes.filter(room =>
            room.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            room.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [roomTypes, debouncedSearchTerm]);

    const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage);
    const paginatedRoomTypes = filteredRoomTypes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 md:mb-0"
                >
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Quản lý loại phòng
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Quản lý các loại phòng và tiện nghi
                    </p>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl
                        hover:bg-primary-dark transition-colors"
                >
                    <FaPlus />
                    <span>Thêm loại phòng</span>
                </motion.button>
            </div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm loại phòng..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 
                            dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                            dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                            focus:border-primary transition-all duration-200"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                                hover:text-gray-600"
                        >
                            <IoClose className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Room Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {paginatedRoomTypes.map((roomType, index) => (
                        <motion.div
                            key={roomType.id}
                            variants={itemVariants}
                            layout
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg 
                                hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Room Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={roomType.image}
                                    alt={roomType.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="text-lg font-semibold">{roomType.name}</p>
                                    <p className="text-sm opacity-80">{roomType.size}</p>
                                </div>
                            </div>

                            {/* Room Details */}
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <FaUsers className="text-primary" />
                                        <span>{roomType.capacity} người</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <FaBed className="text-primary" />
                                        <span>{roomType.bedType}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {roomType.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {roomType.amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 
                                                text-gray-600 dark:text-gray-300 rounded-full text-sm"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                                        {roomType.price.toLocaleString()}đ
                                        <span className="text-sm text-gray-500 dark:text-gray-400">/đêm</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg 
                                                transition-colors"
                                        >
                                            <FaEdit />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
                                                rounded-lg transition-colors"
                                        >
                                            <FaTrash />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredRoomTypes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <FaBed className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Không tìm thấy loại phòng
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Thử tìm kiếm với từ khóa khác
                    </p>
                </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <motion.button
                            key={number}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(number)}
                            className={`w-10 h-10 rounded-lg ${
                                number === currentPage
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {number}
                        </motion.button>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default RoomTypeList; 