import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBed, FaUsers, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight, } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';

const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0 }
};

const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
};

const itemVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// FilterBar component
const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setActualSearchTerm('');
        searchInputRef.current?.focus();
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: 'active', label: 'Hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
        { value: 'inactive', label: 'Tạm ngưng', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
    ];

    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative group flex">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc mô tả..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 pl-10 pr-[140px] py-3 rounded-l-xl border border-gray-200 
                            dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                            dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                            focus:border-primary transition-all duration-200
                            hover:border-primary/50 hover:shadow-md"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleSearchClear}
                            className="absolute right-[140px] top-1/2 -translate-y-1/2 p-1.5
                                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                                transition-all duration-200"
                        >
                            <IoClose className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleSearch}
                        className="px-6 bg-primary hover:bg-primary-dark text-white font-medium 
                            rounded-r-xl flex items-center gap-2 transition-all duration-200
                            hover:shadow-lg hover:shadow-primary/20 min-w-[120px] justify-center
                            border-l-0"
                    >
                        <FaSearch className="w-4 h-4" />
                        Tìm kiếm
                    </button>
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
            {(actualSearchTerm || selectedStatus !== 'all') && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                >
                    {actualSearchTerm && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary/10 text-primary text-sm font-medium"
                        >
                            <FaSearch className="w-3 h-3" />
                            {actualSearchTerm}
                            <button
                                onClick={handleSearchClear}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full
                                    transition-colors duration-200"
                            >
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                    {selectedStatus !== 'all' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary/10 text-primary text-sm font-medium"
                        >
                            {statusOptions.find(opt => opt.value === selectedStatus)?.icon}
                            {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                            <button
                                onClick={() => setSelectedStatus('all')}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full
                                    transition-colors duration-200"
                            >
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
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
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{
                y: -20,
                transition: { type: "spring", stiffness: 800, damping: 50 }
            }}
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
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                            ${statusConfig[roomType.status]?.color || 'bg-gray-100 dark:bg-gray-700'} 
                            shadow-lg`}>
                            {statusConfig[roomType.status]?.text || 'Không xác định'}
                        </span>
                    </div>

                    {/* Quick Actions Overlay */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                variants={overlayVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
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
                </div>
            </div>
        </motion.div>
    );
};

const RoomTypeList = () => {
    const { id: selectedHomestay } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
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

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const filteredRoomTypes = useMemo(() => {
        return roomTypes.filter(room => {
            const matchesSearch = room.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
                room.description.toLowerCase().includes(actualSearchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [roomTypes, actualSearchTerm, selectedStatus]);

    const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage);
    const paginatedRoomTypes = filteredRoomTypes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleViewRoomType = (roomType) => {
        navigate(`/owner/homestays/${selectedHomestay}/room-types/${roomType.id}`);
    };

    const handleEditRoomType = (roomType) => {
        console.log('Edit room type:', roomType);
    };

    const handleDeleteRoomType = (roomType) => {
        console.log('Delete room type:', roomType);
    };

    // Add these new state variables
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomTypeToDelete, setRoomTypeToDelete] = useState(null);
    const [notification, setNotification] = useState(null);

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
                    variants={itemVariants}
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

                    {/* Stats Grid adjusted for 3 items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
                    <FilterBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        handleSearch={handleSearch}
                        setActualSearchTerm={setActualSearchTerm}
                        actualSearchTerm={actualSearchTerm}
                    />
                </motion.div>

                {/* Room Type Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {paginatedRoomTypes.map((roomType) => (
                            <RoomTypeCard
                                key={roomType.id}
                                roomType={roomType}
                                onView={handleViewRoomType}
                                onEdit={handleEditRoomType}
                                onDelete={handleDeleteRoomType}
                            />
                        ))}
                    </AnimatePresence>
                </div>

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