import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBed, FaUsers, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight, } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';

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

const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    hover: {
        y: -5,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
    }
};

const RoomTypeCard = ({ roomType, onView, onEdit, onDelete }) => {
    const statusConfig = {
        active: {
            color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
            text: 'Hoạt động',
        },
        inactive: {
            color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
            text: 'Tạm ngưng',
        }
    };

    const status = statusConfig[roomType.status];
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden
                border border-gray-100 dark:border-gray-700 group relative
                transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="flex flex-col">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={roomType.image}
                        alt={roomType.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 
                            transition-transform duration-500"
                    />
                    {/* Quick Actions Overlay */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onView(roomType)}
                                    className="p-2 bg-white/90 rounded-full hover:bg-white
                                        transform hover:scale-110 transition-all duration-200"
                                >
                                    <FaEye className="w-5 h-5 text-primary" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onEdit(roomType)}
                                    className="p-2 bg-white/90 rounded-full hover:bg-white
                                        transform hover:scale-110 transition-all duration-200"
                                >
                                    <FaEdit className="w-5 h-5 text-primary" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDelete(roomType)}
                                    className="p-2 bg-white/90 rounded-full hover:bg-white
                                        transform hover:scale-110 transition-all duration-200"
                                >
                                    <FaTrash className="w-5 h-5 text-red-500" />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2
                        group-hover:text-primary transition-colors duration-200">
                        {roomType.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {roomType.description}
                    </p>

                    {/* Room Details */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <FaUsers className="text-primary" />
                                <span>{roomType.capacity} người</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <FaBed className="text-primary" />
                                <span>{roomType.bedType}</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(roomType.lastUpdated).toLocaleDateString('vi-VN')}
                        </div>
                    </div>

                    {/* Bottom edit button */}
                    <div className="flex">
                        <button
                            onClick={() => onEdit(roomType)}
                            className="w-full bg-primary/10 dark:bg-primary/20 text-primary font-semibold
                                py-2.5 rounded-lg hover:bg-primary hover:text-white
                                transition-all duration-300 text-center"
                        >
                            Chỉnh sửa
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const RoomTypeList = () => {
    const { id: selectedHomestay } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 6;
    const navigate = useNavigate();

    // Updated mock data
    const [roomTypes] = useState([
        {
            id: 1,
            name: "Phòng Deluxe Hướng Biển",
            description: "Phòng sang trọng với view biển tuyệt đẹp, thiết kế hiện đại và đầy đủ tiện nghi cao cấp",
            capacity: 2,
            bedType: "1 giường đôi lớn",
            size: "35m²",
            price: 2500000,
            status: 'active',
            amenities: ["Smart TV", "Minibar", "Ban công riêng", "Máy lạnh", "Wifi tốc độ cao"],
            image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
            lastUpdated: "2024-03-15"
        },
        {
            id: 2,
            name: "Phòng Suite Gia Đình",
            description: "Phòng rộng rãi phù hợp cho gia đình, có khu vực sinh hoạt chung và bếp mini",
            capacity: 4,
            bedType: "2 giường đôi",
            size: "45m²",
            price: 3500000,
            status: 'inactive',
            amenities: ["Smart TV", "Bếp mini", "Bồn tắm", "Máy lạnh", "Wifi tốc độ cao"],
            image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
            lastUpdated: "2024-03-14"
        }
    ]);

    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const filteredRoomTypes = useMemo(() => {
        return roomTypes.filter(room => {
            const matchesSearch = room.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                room.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [roomTypes, debouncedSearchTerm, selectedStatus]);

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

    const handleViewRoomType = (roomType) => {
        navigate(`/owner/homestays/${selectedHomestay}/room-types/${roomType.id}`);
    };

    const handleEditRoomType = (roomType) => {
        // Handle edit action
        console.log('Edit room type:', roomType);
    };

    const handleDeleteRoomType = (roomType) => {
        // Handle delete action
        console.log('Delete room type:', roomType);
    };

    // Add these new state variables
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomTypeToDelete, setRoomTypeToDelete] = useState(null);
    const [notification, setNotification] = useState(null);

    // FilterBar component
    const FilterBar = () => {
        const searchInputRef = useRef(null);

        const statusOptions = [
            { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
            { value: 'active', label: 'Hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
            { value: 'inactive', label: 'Tạm ngưng', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
        ];

        return (
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                            <FaSearch className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 
                                dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                                dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                                focus:border-primary transition-all duration-200
                                hover:border-primary/50 hover:shadow-md"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 
                                    hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[220px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaFilter className="text-gray-400" />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 
                                dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                                dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                                focus:border-primary transition-all duration-200
                                hover:border-primary/50 hover:shadow-md appearance-none cursor-pointer"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                {(searchTerm || selectedStatus !== 'all') && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2"
                    >
                        {searchTerm && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                                bg-primary/10 text-primary text-sm">
                                <FaSearch className="w-3 h-3" />
                                {searchTerm}
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="hover:bg-primary/20 rounded-full p-1"
                                >
                                    <IoClose className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {selectedStatus !== 'all' && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                                bg-primary/10 text-primary text-sm">
                                {statusOptions.find(opt => opt.value === selectedStatus)?.icon}
                                {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                                <button
                                    onClick={() => setSelectedStatus('all')}
                                    className="hover:bg-primary/20 rounded-full p-1"
                                >
                                    <IoClose className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </motion.div>
                )}
            </div>
        );
    };

    // Pagination component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center items-center gap-2 mt-8">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <FaChevronLeft className="w-5 h-5" />
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className={`w-10 h-10 rounded-lg ${1 === currentPage
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="text-gray-400">...</span>}
                    </>
                )}

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`w-10 h-10 rounded-lg ${number === currentPage
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`w-10 h-10 rounded-lg ${totalPages === currentPage
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <FaChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            <div className="container">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent 
                                bg-gradient-to-r from-primary via-primary-dark to-primary 
                                tracking-tight mb-2 dark:text-white">
                                Quản lý loại phòng
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Quản lý tất cả các loại phòng của nhà nghỉ
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedRoomType(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-primary to-primary-dark text-white 
                                font-semibold px-6 py-3 rounded-xl flex items-center gap-2 
                                shadow-lg hover:shadow-primary/20 transition-all duration-300"
                        >
                            <FaPlus className="text-white" />
                            Thêm loại phòng mới
                        </motion.button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {[
                            {
                                label: 'Tổng số loại phòng',
                                value: roomTypes.length,
                                icon: <FaBed className="w-6 h-6" />,
                                gradient: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
                                iconBg: 'bg-blue-400/20',
                                hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
                            },
                            {
                                label: 'Đang hoạt động',
                                value: roomTypes.filter(r => r.status === 'active').length,
                                icon: <FaCheckCircle className="w-6 h-6" />,
                                gradient: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
                                iconBg: 'bg-emerald-400/20',
                                hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700'
                            },
                            {
                                label: 'Không hoạt động',
                                value: roomTypes.filter(r => r.status === 'inactive').length,
                                icon: <FaTimesCircle className="w-6 h-6" />,
                                gradient: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700',
                                iconBg: 'bg-rose-400/20',
                                hoverGradient: 'hover:from-rose-600 hover:to-rose-700'
                            }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={itemVariants}
                                className={`bg-gradient-to-r ${stat.gradient} ${stat.hoverGradient} 
                                    rounded-xl shadow-lg dark:shadow-gray-900/30`}
                            >
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                                            <div className="text-white">
                                                {stat.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/80 text-sm font-medium">
                                                {stat.label}
                                            </p>
                                            <h3 className="text-white text-2xl font-bold mt-1">
                                                {stat.value.toLocaleString()}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Enhanced FilterBar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
                >
                    <FilterBar />
                </motion.div>

                {/* Room Type Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {paginatedRoomTypes.map((roomType, index) => (
                        <RoomTypeCard
                            key={roomType.id}
                            roomType={roomType}
                            onView={handleViewRoomType}
                            onEdit={handleEditRoomType}
                            onDelete={handleDeleteRoomType}
                        />
                    ))}
                </motion.div>

                {/* Empty State */}
                <AnimatePresence>
                    {filteredRoomTypes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl
                                shadow-lg border border-gray-100 dark:border-gray-700 mt-8"
                        >
                            <div className="text-gray-400 dark:text-gray-500 mb-4">
                                <FaBed className="mx-auto w-16 h-16" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                {roomTypes.length === 0 ? "Chưa có loại phòng nào" : "Không tìm thấy kết quả"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {roomTypes.length === 0
                                    ? "Bắt đầu bằng cách thêm loại phòng đầu tiên"
                                    : "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"}
                            </p>
                            {roomTypes.length === 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedRoomType(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-6 py-3 bg-primary text-white 
                                        font-semibold rounded-xl hover:bg-primary-dark transition-all 
                                        duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/20"
                                >
                                    <FaPlus className="text-white" />
                                    Thêm loại phòng
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8"
                >
                    <Pagination />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default RoomTypeList; 