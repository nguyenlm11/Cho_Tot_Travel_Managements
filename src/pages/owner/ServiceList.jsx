import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaTag, FaDollarSign, FaClock, FaCheckCircle, FaExclamationCircle, FaTimes, FaImage, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import ServiceModal from '../../components/modals/ServiceModal';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return [debouncedValue];
}

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

const StatusSwitch = ({ isActive, onToggle }) => {
    return (
        <motion.button
            onClick={onToggle}
            whileTap={{ scale: 0.95 }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 
                ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
        >
            <motion.span
                layout
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                    ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </motion.button>
    );
};

const ServiceList = () => {
    // States for search, filter, and pagination
    const [searchTerm, setSearchTerm] = useState('');
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
            description: "Giặt ủi quần áo theo yêu cầu",
            price: 50000,
            status: "active",
            duration: "2 giờ",
            image: "https://maygiatcongnghiep1.com/wp-content/uploads/2021/09/giat-ui-la-gi.jpeg",
            lastUpdated: "2024-03-15T10:30:00"
        },
        {
            id: 2,
            name: "Dịch vụ spa",
            description: "Massage và chăm sóc da",
            price: 300000,
            status: "inactive",
            duration: "1 giờ",
            image: "https://img1.kienthucvui.vn/uploads/2021/01/13/anh-cham-soc-da-mat-tai-spa_022204667.jpg",
            lastUpdated: "2024-03-14T15:45:00"
        }
    ]);

    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

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
            const matchesSearch = service.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [services, debouncedSearchTerm, selectedStatus]);

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

    // FilterBar component
    const FilterBar = () => {
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
            searchInputRef.current?.focus();
        };

        return (
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                            <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoComplete="off"
                            autoFocus
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 
                dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                focus:border-primary transition-all duration-200
                hover:border-primary/50 hover:shadow-md"
                        />
                        {searchTerm && (
                            <button
                                onClick={handleSearchClear}
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
                                    onClick={handleSearchClear}
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

    // ServiceCard component
    const ServiceCard = ({ service, index }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
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
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
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
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
                                >
                                    <button
                                        onClick={() => handleEditService(service)}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white
                                            transform hover:scale-110 transition-all duration-200"
                                    >
                                        <FaEdit className="w-5 h-5 text-primary" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(service)}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white
                                            transform hover:scale-110 transition-all duration-200"
                                    >
                                        <FaTrash className="w-5 h-5 text-red-500" />
                                    </button>
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

                        {/* Bottom edit button */}
                        <div className="flex">
                            <button
                                onClick={() => handleEditService(service)}
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

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            <div className="container">
                {/* Header Section with improved styling */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-primary via-primary-dark to-primary 
                  tracking-tight mb-2"
                            >
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

                    {/* Stats with improved layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
                                label: 'Chờ duyệt',
                                value: services.filter(s => s.status === 'pending').length,
                                icon: <FaTag className="w-6 h-6" />,
                                gradient: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
                                iconBg: 'bg-amber-400/20',
                                hoverGradient: 'hover:from-amber-600 hover:to-amber-700'
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
                    <FilterBar />
                </motion.div>

                {/* Service Grid with improved layout */}
                <motion.div
                    variants={cardVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {paginatedServices.map((service, index) => (
                        <ServiceCard key={service.id} service={service} index={index} />
                    ))}
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
            </div>

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