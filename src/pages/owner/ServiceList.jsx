import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaDollarSign, FaClock, FaTag, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import ServiceModal from '../../components/modals/ServiceModal';

// Animation variants
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

const itemVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    hover: {
        y: -5,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    }
};

const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: 'active', label: 'Đang hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
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
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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
                        placeholder="Tìm kiếm theo tên dịch vụ..."
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

const ServiceList = () => {
    // States for search, filter, and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const itemsPerPage = 6;

    // Mock data - replace with API call later
    const [services] = useState([
        {
            id: 1,
            name: "Dịch vụ giặt ủi",
            description: "Dịch vụ giặt ủi với công nghệ hiện đại",
            price: 50000,
            status: "active",
            duration: "2 giờ",
            image: "https://maygiatcongnghiep1.com/wp-content/uploads/2021/09/giat-ui-la-gi.jpeg",
            lastUpdated: "2024-03-15T10:30:00"
        },
        {
            id: 2,
            name: "Dịch vụ spa",
            description: "Dịch vụ spa cao cấp với các liệu pháp thư giãn",
            price: 500000,
            status: "inactive",
            duration: "1 giờ",
            image: "https://img1.kienthucvui.vn/uploads/2021/01/13/anh-cham-soc-da-mat-tai-spa_022204667.jpg",
            lastUpdated: "2024-03-14T15:45:00"
        }
    ]);

    const statusConfig = {
        active: {
            color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
            text: 'Hoạt động'
        },
        inactive: {
            color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
            text: 'Tạm ngưng'
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Filter services based on search term and status
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(actualSearchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [services, actualSearchTerm, selectedStatus]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    // ServiceCard component
    const ServiceCard = ({ service, onEdit, onDelete }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <motion.div
                layout
                initial="initial"
                animate="animate"
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
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 
                              transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                                ${statusConfig[service.status]?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} 
                                shadow-lg`}>
                                {statusConfig[service.status]?.text || 'Không xác định'}
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
                                        onClick={() => onEdit(service)}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white
                                            transform hover:scale-110 transition-all duration-200"
                                    >
                                        <FaEdit className="w-5 h-5 text-primary" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onDelete(service)}
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
                    <div className="flex-1 p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2
                                group-hover:text-primary transition-colors duration-200">
                                {service.name}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {service.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <FaDollarSign className="text-primary" />
                                    <span>{formatPrice(service.price)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <FaClock className="text-primary" />
                                    <span>{service.duration}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <FaClock className="text-primary" />
                                <span>{formatDate(service.lastUpdated)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
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
                        {startPage > 2 && (
                            <span className="text-gray-400">...</span>
                        )}
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
                        {endPage < totalPages - 1 && (
                            <span className="text-gray-400">...</span>
                        )}
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

    // Add this new component for delete confirmation
    const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, serviceName }) => {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
                        >
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Xác nhận xóa dịch vụ
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Bạn có chắc chắn muốn xóa dịch vụ "{serviceName}" không?
                                Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                        text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                                        transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 rounded-lg bg-red-500 text-white
                                        hover:bg-red-600 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    // Add these state variables to ServiceList component
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Add these new state variables
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Add these handler functions
    const handleDeleteClick = (service) => {
        setServiceToDelete(service);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (serviceToDelete) {
            // Handle delete service
            console.log('Delete service:', serviceToDelete);
            // After successful deletion:
            setServices(prevServices =>
                prevServices.filter(service => service.id !== serviceToDelete.id)
            );
        }
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
    };

    // Add this notification component
    const Notification = ({ message, type, onClose }) => {
        useEffect(() => {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }, [onClose]);

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}
            >
                <div className="flex items-center gap-2">
                    {type === 'success' ? (
                        <FaCheckCircle className="w-5 h-5" />
                    ) : (
                        <FaExclamationCircle className="w-5 h-5" />
                    )}
                    <p>{message}</p>
                    <button
                        onClick={onClose}
                        className="ml-4 hover:text-white/80 transition-colors"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        );
    };

    // Add these handler functions before the return statement
    const handleAddService = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    const handleSubmitService = async (formData) => {
        setIsLoading(true);
        try {
            if (selectedService) {
                // Handle edit service
                console.log('Edit service:', { ...formData, id: selectedService.id });
                setNotification({
                    type: 'success',
                    message: 'Cập nhật dịch vụ thành công!'
                });
            } else {
                // Handle add new service
                console.log('Add new service:', formData);
                setNotification({
                    type: 'success',
                    message: 'Thêm dịch vụ mới thành công!'
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error:', error);
            setNotification({
                type: 'error',
                message: 'Có lỗi xảy ra. Vui lòng thử lại!'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm hàm handleViewService vào cùng vị trí với các hàm xử lý khác trong ServiceList component
    const handleViewService = (service) => {
        // Tạm thời chỉ log thông tin service, sau này có thể thêm logic để xem chi tiết
        console.log('View service:', service);
        // Có thể thêm logic để mở modal xem chi tiết
    };

    // Thêm hàm handleSearch
    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            {/* Header Section with improved styling */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            Quản lý dịch vụ
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý tất cả các dịch vụ của nhà nghỉ
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddService}
                        className="bg-gradient-to-r from-primary to-primary-dark text-white 
                font-semibold px-6 py-3 rounded-xl flex items-center gap-2 
                shadow-lg hover:shadow-primary/20 transition-all duration-300"
                    >
                        <FaPlus className="w-5 h-5" />
                        Thêm dịch vụ mới
                    </motion.button>
                </div>

                {/* Stats with improved layout for 3 items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {[
                        {
                            label: 'Tổng số dịch vụ',
                            value: services.length,
                            icon: <FaTag className="w-6 h-6" />,
                            gradient: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
                            iconBg: 'bg-blue-400/20',
                            hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
                        },
                        {
                            label: 'Đang hoạt động',
                            value: services.filter(s => s.status === 'active').length,
                            icon: <FaTag className="w-6 h-6" />,
                            gradient: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
                            iconBg: 'bg-emerald-400/20',
                            hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700'
                        },
                        {
                            label: 'Không hoạt động',
                            value: services.filter(s => s.status === 'inactive').length,
                            icon: <FaTag className="w-6 h-6" />,
                            gradient: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700',
                            iconBg: 'bg-rose-400/20',
                            hoverGradient: 'hover:from-rose-600 hover:to-rose-700'
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={cardVariants}
                            className={`bg-gradient-to-r ${stat.gradient} ${stat.hoverGradient} 
                    rounded-xl shadow-lg transform transition-all duration-300 
                    hover:scale-105 hover:shadow-xl overflow-hidden`}
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

            {/* Service Grid with improved layout */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {paginatedServices.map((service) => (
                        <ServiceCard key={service.id} service={service} onEdit={handleEditService} onDelete={handleDeleteClick} />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Enhanced Empty State */}
            <AnimatePresence>
                {filteredServices.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl
                                shadow-lg border border-gray-100 dark:border-gray-700 mt-8"
                    >
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <FaTag className="mx-auto w-16 h-16" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            {services.length === 0 ? "Chưa có dịch vụ nào" : "Không tìm thấy kết quả"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {services.length === 0
                                ? "Bắt đầu bằng cách thêm dịch vụ đầu tiên"
                                : "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"}
                        </p>
                        {services.length === 0 && (
                            <button
                                onClick={handleAddService}
                                className="inline-flex items-center px-6 py-3 bg-primary text-white 
                                        font-semibold rounded-xl hover:bg-primary-dark transition-all 
                                        duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/20"
                            >
                                <FaPlus className="w-5 h-5 mr-2" />
                                Thêm dịch vụ
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Pagination */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
            >
                <Pagination />
            </motion.div>

            {/* Add the DeleteConfirmationModal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                serviceName={serviceToDelete?.name}
            />

            {/* Add the Notification component */}
            <AnimatePresence>
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            {/* ServiceModal */}
            <ServiceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                service={selectedService}
                onSubmit={handleSubmitService}
            />
        </motion.div>
    );
};

export default ServiceList; 