import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaDollarSign, FaClock, FaTag, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle, FaTimes, FaChevronLeft, FaChevronRight, FaCheck, FaChartLine } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import ServiceModal from '../../components/modals/ServiceModal';
import CountUp from 'react-countup';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import serviceAPI from '../../services/api/serviceAPI';

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
        if (e.key === 'Enter') {
            handleSearch();
        }
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
    const { id: homestayId } = useParams();

    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [services, setServices] = useState([]);
    const itemsPerPage = 6;

    const getStatusText = (status) => {
        switch (status) {
            case true:
                return 'active';
            case false:
                return 'inactive';
            default:
                return 'unknown';
        }
    };

    const fetchServices = async () => {
        try {
            const response = await serviceAPI.getAllServices(homestayId);
            if (response.statusCode === 200) {
                const formattedServices = response.data.map(service => ({
                    id: service.servicesID,
                    name: service.servicesName,
                    description: service.description,
                    price: service.servicesPrice,
                    unitPrice: service.unitPrice,
                    status: getStatusText(service.status),
                    createdAt: service.createAt,
                    updatedAt: service.updateAt,
                    image: service.imageServices[0]?.image || '',
                    images: service.imageServices.map(img => img.image),
                }));
                setServices(formattedServices);
            }
            setIsLoading(false);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải danh sách dịch vụ');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [homestayId]);

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

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(actualSearchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [services, actualSearchTerm, selectedStatus]);

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    const ServiceCard = ({ service, onEdit, onDelete }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <motion.div
                layout
                initial="initial"
                animate="animate"
                exit={{ opacity: 0 }}
                whileHover={{ y: -20, ransition: { type: "spring", stiffness: 800, damping: 50 } }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden
                    border border-gray-100 dark:border-gray-700 group relative
                    transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
                <div className="flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 
                              transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                                ${statusConfig[service.status].color} shadow-lg`}>
                                {statusConfig[service.status].text}
                            </span>
                        </div>

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
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <FaClock className="text-primary" />
                                <span>{formatDate(service.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const handleDeleteClick = (service) => {
        setServiceToDelete(service);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (serviceToDelete) {
            console.log('Delete service:', serviceToDelete);
            setServices(prevServices =>
                prevServices.filter(service => service.id !== serviceToDelete.id)
            );
            setNotification({
                message: 'Xóa dịch vụ thành công',
                type: 'success'
            });
        }
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
    };

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

    const handleAddService = () => {
        setIsModalOpen(true);
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
        fetchServices();
    };

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const statsData = [
        {
            label: 'Tổng số dịch vụ',
            value: services.length,
            color: 'from-blue-500 to-blue-600',
            icon: <FaTag className="w-6 h-6" />
        },
        {
            label: 'Hoạt động',
            value: services.filter(s => s.status === 'active').length,
            color: 'from-green-500 to-green-600',
            icon: <FaCheck className="w-6 h-6" />
        },
        {
            label: 'Doanh thu từ dịch vụ',
            value: services.reduce((acc, curr) => acc + (curr.revenue || 0), 0),
            color: 'from-purple-500 to-purple-600',
            icon: <FaChartLine className="w-6 h-6" />,
            isCurrency: true
        }
    ];

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                    />
                </div>
            )}

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {statsData.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                            className={`bg-gradient-to-r ${stat.color} 
                                rounded-xl p-6 transform transition-all duration-300 
                                hover:scale-105 hover:shadow-xl hover:shadow-${stat.color.split('-')[1]}/20`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium">
                                        {stat.label}
                                    </p>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 100, delay: index * 0.2 }}
                                        className="text-2xl font-bold text-white flex items-center gap-1"
                                    >
                                        {stat.isCurrency && <span>₫</span>}
                                        <CountUp
                                            end={stat.value}
                                            duration={2}
                                            separator=","
                                            decimal="."
                                            decimals={stat.isCurrency ? 0 : 0}
                                            delay={0.5}
                                            enableScrollSpy
                                            scrollSpyOnce
                                        >
                                            {({ countUpRef }) => (
                                                <span ref={countUpRef} />
                                            )}
                                        </CountUp>
                                        {stat.isCurrency && (
                                            <span className="text-sm font-normal ml-1">VNĐ</span>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

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

            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {paginatedServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onEdit={handleEditService}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {filteredServices.length === 0 && !isLoading && (
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
            >
                <Pagination />
            </motion.div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                serviceName={serviceToDelete?.name}
            />

            <AnimatePresence>
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            <ServiceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedHomestay={homestayId}
                service={selectedService}
            />
        </motion.div>
    );
};

export default ServiceList;