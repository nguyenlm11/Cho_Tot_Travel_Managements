import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaDollarSign, FaClock, FaTag, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import ServiceAddModal from '../../components/modals/ServiceAddModal';
import CountUp from 'react-countup';
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import serviceAPI from '../../services/api/serviceAPI';
import ServiceUpdateModal from '../../components/modals/ServiceUpdateModal';

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
        transition: {
            type: "spring", stiffness: 400, damping: 10
        }
    }
};

const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
};

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

const ServiceCard = ({ service, handleEditService }) => {
    const [isHovered, setIsHovered] = useState(false);

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
        }).format(price);
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover={{ y: -20, transition: { type: "spring", stiffness: 800, damping: 50 } }}
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
                        className="w-full h-full object-cover transform 
            group-hover:scale-110 transition-transform duration-500"
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
                                    onClick={() => handleEditService(service)}
                                    className="p-2 bg-white/90 rounded-full hover:bg-white
                                            transform hover:scale-110 transition-all duration-200"
                                >
                                    <FaEdit className="w-5 h-5 text-primary" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 bg-white/90 rounded-full hover:bg-white
                                            transform hover:scale-110 transition-all duration-200"
                                >
                                    <FaTrash className="w-5 h-5 text-red-500" />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2
                                group-hover:text-primary transition-colors duration-200">
                        {service.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                        <span className="line-clamp-2">{service.description}</span>
                    </p>
                    {service?.serviceType == 2 ? (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm mt-2">
                                Loại thuê: theo ngày
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm mt-2">
                                Số lượng: {service?.quantity}
                            </p>
                        </div>

                    ) : service?.serviceType == 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm mt-2">
                            Loại thuê: theo số lượng
                        </p>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm mt-2">
                            Loại thuê: chưa xác định
                        </p>
                    )}
                    <div className="flex items-center justify-between mt-4 mb-6">
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

const ServiceList = () => {
    const { id: homestayId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const itemsPerPage = 6;

    const getStatusText = (status) => {
        return status ? 'active' : 'inactive';
    };

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await serviceAPI.getAllServices(homestayId);
            if (response.statusCode === 200) {
                const formattedServices = response.data.map(service => ({
                    id: service.servicesID,
                    name: service.servicesName,
                    description: service.description,
                    serviceType: service.serviceType,
                    quantity: service.quantity,
                    price: service.servicesPrice,
                    unitPrice: service.unitPrice,
                    status: getStatusText(service.status),
                    createdAt: service.createAt,
                    updatedAt: service.updateAt,
                    homeStayID: service.homeStayID,
                    image: service.imageServices[0]?.image || '',
                    images: service.imageServices.map(img => img.image),
                }));
                setServices(formattedServices);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải danh sách dịch vụ');
        } finally {
            setTimeout(() => setIsLoading(false), 1500);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [homestayId]);

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

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const statsData = [
        {
            label: 'Tổng số dịch vụ',
            value: services.length,
            color: 'bg-blue-500',
            icon: <FaTag className="w-6 h-6" />
        },
        {
            label: 'Hoạt động',
            value: services.filter(s => s.status === 'active').length,
            color: 'bg-green-500',
            icon: <FaCheck className="w-6 h-6" />
        },
        {
            label: 'Tạm ngưng',
            value: services.filter(s => s.status === 'inactive').length,
            color: 'bg-red-500',
            icon: <FaTag className="w-6 h-6" />
        },
    ];

    const handleAddService = () => {
        setIsModalOpen(true);
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setIsUpdateModalOpen(true);
    };

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
                                Danh sách dịch vụ
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Quản lý tất cả các dịch vụ của bạn tại đây
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddService}
                            className="bg-primary hover:bg-primary-dark text-white font-semibold 
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 
              transform hover:scale-105 shadow-lg hover:shadow-primary/20"
                        >
                            <FaPlus className="w-5 h-5" />
                            Thêm dịch vụ mới
                        </motion.button>
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
                                                <CountUp end={stat.value} duration={4} separator=",">
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
                {isLoading ? (
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
                            {paginatedServices.map((service, index) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    handleEditService={handleEditService}
                                />
                            ))}
                        </motion.div>

                        {/* Empty State */}
                        <AnimatePresence>
                            {filteredServices.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl
                  border border-gray-100 dark:border-gray-700 mt-6"
                                >
                                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                                        <FaSearch className="mx-auto w-16 h-16" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                        {services.length === 0 ? "Chưa có dịch vụ nào" : "Không tìm thấy kết quả"}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        {services.length === 0
                                            ? "Bắt đầu bằng cách thêm dịch vụ đầu tiên của bạn"
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
                    </>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
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

            <ServiceAddModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedService(null);
                }}
                selectedHomestay={homestayId}
                service={selectedService}
                onSuccess={fetchServices}
            />

            <ServiceUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedService(null);
                }}
                service={selectedService}
                onSuccess={fetchServices}
            />
        </>
    );
};

export default ServiceList; 