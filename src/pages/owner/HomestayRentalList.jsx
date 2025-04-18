import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaRegClock, FaEdit, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaChartLine, FaHome, FaBed, FaBath, FaUtensils, FaWifi, FaUsers, FaEye, FaUser, FaChild } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import CountUp from 'react-countup';
import homestayRentalAPI from '../../services/api/homestayrentalAPI';

const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hover: {
        y: -5,
        transition: { type: "spring", stiffness: 400, damping: 10 }
    }
};


const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: 'active', label: 'Hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
        { value: 'inactive', label: 'Tạm ngưng', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
    ];

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setActualSearchTerm('');
        searchInputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') { handleSearch() }
    };

    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group flex">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm theo tên căn..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyPress}
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
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors duration-200">
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
};

const HomestayRentalCard = ({ rental, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { id: homestayId } = useParams();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };


    // Lấy giá đầu tiên trong mảng pricing (nếu có)
    const firstPricing = rental.pricing && rental.pricing.length > 0 ? rental.pricing[0] : null;

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden
        border border-gray-100 dark:border-gray-700 
        transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="flex flex-col h-full">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={rental.imageHomeStayRentals?.[0]?.image || 'https://via.placeholder.com/600x400?text=No+Image'}
                        alt={rental.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                          ${rental.status
                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'} 
                          shadow-lg`}>
                            {rental.status ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {rental.name}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {rental.description || "Không có mô tả"}
                    </p>

                    {/* Room Features */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaBed className="text-primary" />
                            <span>{rental.numberBedRoom} phòng ngủ</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaBath className="text-primary" />
                            <span>{rental.numberBathRoom} phòng tắm</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaUtensils className="text-primary" />
                            <span>{rental.numberKitchen} phòng bếp</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            {rental.rentWhole ? (
                                <>
                                    <FaHome className="text-primary" />
                                    <span>Nguyên căn</span>
                                </>
                            ) : (
                                <>
                                    <FaBed className="text-primary" />
                                    <span>Theo phòng</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Secondary Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {rental.numberKitchen > 0 && (
                            <span className="inline-flex justify-center items-center gap-1 py-1 rounded-md text-xs
                              bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                                <FaUsers className="w-3 h-3" /> {rental.maxPeople} người
                            </span>
                        )}
                        {rental.maxAdults > 0 && (
                            <span className="inline-flex justify-center items-center gap-1 py-1 rounded-md text-xs
                              bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                                <FaUser className="w-3 h-3" /> {rental.maxAdults} người lớn
                            </span>
                        )}
                        {rental.maxChildren > 0 && (
                            <span className="inline-flex justify-center items-center gap-1 py-1 rounded-md text-xs
                              bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                                <FaChild className="w-3 h-3" /> {rental.maxChildren} trẻ em
                            </span>
                        )}
                        {rental.numberWifi > 0 && (
                            <span className="inline-flex justify-center items-center gap-1 py-1 rounded-md text-xs
                              bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                                <FaWifi className="w-3 h-3" /> {rental.numberWifi} Wifi
                            </span>
                        )}
                    </div>

                    {/* Create date */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 mt-3">
                        <FaRegClock className="inline-block mr-1 text-primary" />
                        Ngày tạo: {formatDate(rental.createAt)}
                    </div>

                    {/* Footer with price and management buttons */}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 
                      flex items-center justify-between">
                        <div>
                            {firstPricing && rental.rentWhole ? (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-primary">
                                            {formatPrice(firstPricing.rentPrice)}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Giá theo loại phòng
                                </p>
                            )}
                        </div>

                        {/* Management buttons on the right */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental.homeStayRentalID}`)}
                                className="p-2 bg-primary/10 text-primary hover:bg-primary/20 
                                  rounded-full transition-colors"
                                title="Xem chi tiết"
                            >
                                <FaEye className="w-5 h-5" />
                            </motion.button>
                            {user?.role === "Owner" && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onEdit && onEdit(rental)}
                                    className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 
                                  rounded-full transition-colors"
                                    title="Chỉnh sửa"
                                >
                                    <FaEdit className="w-5 h-5" />
                                </motion.button>
                            )}

                            {user?.role === "Owner" && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDelete && onDelete(rental)}
                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 
                                  rounded-full transition-colors"
                                    title="Xóa"
                                >
                                    <FaTrash className="w-5 h-5" />
                                </motion.button>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const HomestayRentalList = () => {
    const { id: homestayId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rentalToDelete, setRentalToDelete] = useState(null);
    const navigate = useNavigate();
    const itemsPerPage = 6;
    const user = JSON.parse(localStorage.getItem('userInfo'));

    // Sửa hàm fetchRentals để sử dụng homestayRentalAPI
    const fetchRentals = async () => {
        setLoading(true);
        try {
            const response = await homestayRentalAPI.getHomeStayRentalsByHomeStay(homestayId);
            if (response && response.statusCode === 200) {
                setRentals(response.data || []);
            } else {
                toast.error("Không thể tải danh sách căn thuê");
            }
        } catch (error) {
            console.error('Error fetching rentals:', error);
            toast.error('Không thể tải danh sách căn thuê');
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    useEffect(() => {
        fetchRentals();
    }, [homestayId]);


    // Lọc và phân trang
    const filteredRentals = useMemo(() => {
        return rentals.filter(rental => {
            const matchesSearch = rental.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
                (rental.description && rental.description.toLowerCase().includes(actualSearchTerm.toLowerCase()));

            const statusMap = {
                'all': true,
                'active': rental.status === true,
                'inactive': rental.status === false
            };

            const matchesStatus = statusMap[selectedStatus];

            return matchesSearch && matchesStatus;
        });
    }, [rentals, actualSearchTerm, selectedStatus]);

    const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
    const paginatedRentals = filteredRentals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleDeleteClick = (rental) => {
        setRentalToDelete(rental);
        setShowDeleteModal(true);
    };

    // Sửa hàm confirmDelete để sử dụng homestayRentalAPI
    const confirmDelete = async () => {
        if (!rentalToDelete) return;

        setShowDeleteModal(false);
        const loadingToast = toast.loading('Đang xóa căn thuê...');

        try {
            const response = await homestayRentalAPI.deleteHomestayRental(rentalToDelete.homeStayRentalID);
            if (response && response.statusCode === 200) {
                toast.dismiss(loadingToast);
                toast.success('Xóa căn thuê thành công');
                setRentals(rentals.filter(r => r.homeStayRentalID !== rentalToDelete.homeStayRentalID));
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

    const statsData = [
        {
            label: 'Tổng số căn',
            value: rentals.length,
            color: 'bg-blue-500',
            icon: <FaBed className="w-6 h-6" />
        },
        {
            label: 'Hoạt động',
            value: rentals.filter(r => r.status === true).length,
            color: 'bg-green-500',
            icon: <FaBed className="w-6 h-6" />
        },
        {
            label: 'Tạm ngưng',
            value: rentals.filter(r => r.status === false).length,
            color: 'bg-red-500',
            icon: <FaBed className="w-6 h-6" />
        }
    ];

    return (
        <>
            <Toaster />
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                Danh sách căn thuê
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Quản lý tất cả các căn thuê của bạn tại đây
                            </p>
                        </div>
                        {user?.role === "Owner" && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/owner/homestays/${homestayId}/create-homestay-rental`)}
                                className="bg-primary hover:bg-primary-dark text-white font-semibold 
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 
              transform hover:scale-105 shadow-lg hover:shadow-primary/20"
                            >
                                <FaPlus className="w-5 h-5" />
                                Thêm căn thuê mới
                            </motion.button>
                        )}
                    </div>

                    {/* Stats Summary */}
                    <motion.section
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, scale: 0.8 },
                            visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                        }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {statsData.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    variants={{
                                        hidden: { opacity: 0, y: 50, scale: 0.8, rotate: -5 },
                                        visible: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 150, damping: 10 } }
                                    }}
                                    className={`${stat.color} rounded-xl p-6 text-white shadow-lg`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            className="p-3 bg-white/10 rounded-lg"
                                            initial={{ rotate: -15, scale: 0 }}
                                            animate={{ rotate: 0, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                        <div>
                                            <p className="text-white/80 text-sm">{stat.label}</p>
                                            <h3 className="text-2xl font-bold">
                                                <CountUp end={stat.value} duration={4} separator="," >
                                                    {({ countUpRef }) => (
                                                        <motion.span
                                                            ref={countUpRef}
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 150, damping: 8, delay: index * 0.2 }}
                                                        />
                                                    )}
                                                </CountUp>
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </motion.div>

                {/* Filter Bar */}
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    handleSearch={handleSearch}
                    setActualSearchTerm={setActualSearchTerm}
                    actualSearchTerm={actualSearchTerm}
                />

                {/* Grid Layout or Loading State */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {paginatedRentals.map((rental) => (
                                <HomestayRentalCard
                                    key={rental.homeStayRentalID}
                                    rental={rental}
                                    onEdit={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental.homeStayRentalID}/editHomestayRental`)}
                                    onDelete={() => handleDeleteClick(rental)}
                                />
                            ))}
                        </motion.div>

                        {/* Empty State */}
                        <AnimatePresence>
                            {filteredRentals.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl
                  border border-gray-100 dark:border-gray-700 mt-6"
                                >
                                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                                        <FaBed className="mx-auto w-16 h-16" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                        {rentals.length === 0 ? "Chưa có căn thuê nào" : "Không tìm thấy kết quả"}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        {rentals.length === 0
                                            ? "Bắt đầu bằng cách thêm căn thuê đầu tiên của bạn"
                                            : "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"}
                                    </p>
                                    {rentals.length === 0 && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/owner/homestays/${homestayId}/create-homestay-rental`)}
                                            className="inline-flex items-center px-6 py-3 bg-primary text-white 
                      font-semibold rounded-xl hover:bg-primary-dark transition-all 
                      duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/20"
                                        >
                                            <FaPlus className="w-5 h-5 mr-2" />
                                            Thêm căn thuê
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {!loading && totalPages > 1 && (
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
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
                )}
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Xác nhận xóa
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Bạn có chắc chắn muốn xóa căn "{rentalToDelete?.name}"? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700
                  dark:hover:bg-gray-600 text-gray-800 dark:text-white
                  rounded-lg transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white
                  rounded-lg transition-colors duration-200"
                                >
                                    Xóa
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default HomestayRentalList; 