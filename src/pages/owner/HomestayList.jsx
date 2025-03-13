import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMapMarkerAlt, FaStar, FaBed, FaRegClock, FaEdit, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaChartLine, FaHome } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

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
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
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

const statusConfig = {
  active: {
    color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    text: 'Hoạt động'
  },
  pending: {
    color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    text: 'Chờ duyệt'
  },
  inactive: {
    color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    text: 'Không hoạt động'
  }
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus }) => {
  const searchInputRef = useRef(null);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
    { value: 'active', label: 'Đang hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
    { value: 'pending', label: 'Chờ duyệt', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
    { value: 'inactive', label: 'Không hoạt động', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
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
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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

        {/* Status Filter with custom dropdown */}
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

const HomestayCard = ({ homestay, index }) => {
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

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
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
            src={homestay.image}
            alt={homestay.name}
            className="w-full h-full object-cover transform group-hover:scale-110 
              transition-transform duration-500"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${statusConfig[homestay.status].color} shadow-lg`}>
              {statusConfig[homestay.status].text}
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
                <Link
                  to={`/owner/homestays/${homestay.id}/dashboard`}
                  className="p-2 bg-white/90 rounded-full hover:bg-white
                    transform hover:scale-110 transition-all duration-200"
                >
                  <FaChartLine className="w-5 h-5 text-primary" />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2
            group-hover:text-primary transition-colors duration-200">
            {homestay.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="text-primary" />
            {homestay.address}
          </p>

          <div className="flex items-center justify-between mt-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <FaBed className="text-primary" />
                <span>{homestay.rooms} phòng</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <FaStar />
                <span>{homestay.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <FaRegClock className="text-primary" />
              <span>{formatDate(homestay.lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HomestayList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock data - replace with API call later
  const [homestays] = useState([
    {
      id: 1,
      name: "Sunshine Villa",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      status: "active",
      rooms: 10,
      rating: 4.5,
      image: "https://www.homestayadvisor.in/uploads/2/1/7/1/21711386/glad-stone-sakleshpura-3_1.jpg",
      lastUpdated: "2024-03-15T10:30:00"
    },
    {
      id: 2,
      name: "Ocean View Resort",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      status: "pending",
      rooms: 15,
      rating: 4.8,
      image: "https://assets.cntraveller.in/photos/62a878354507a8eb3d09d137/master/w_1600%2Cc_limit/Photo%2520by%2520Joshua%2520D'silva%2520caption-%2520Cottage%2520at%2520dusk.jpg",
      lastUpdated: "2024-03-14T15:45:00"
    }
  ]);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const filteredHomestays = useMemo(() => {
    return homestays.filter(homestay => {
      const matchesSearch = homestay.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        homestay.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || homestay.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [homestays, debouncedSearchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredHomestays.length / itemsPerPage);
  const paginatedHomestays = filteredHomestays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Danh sách nhà nghỉ
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý tất cả các nhà nghỉ của bạn tại đây
            </p>
          </div>
          <Link
            to="/owner/homestays/add"
            className="bg-primary hover:bg-primary-dark text-white font-semibold 
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 
              transform hover:scale-105 shadow-lg hover:shadow-primary/20"
          >
            <FaPlus className="w-5 h-5" />
            Thêm nhà nghỉ mới
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Tổng số nhà nghỉ',
              value: homestays.length,
              color: 'bg-blue-500',
              icon: <FaHome className="w-6 h-6" />
            },
            {
              label: 'Đang hoạt động',
              value: homestays.filter(h => h.status === 'active').length,
              color: 'bg-green-500',
              icon: <FaHome className="w-6 h-6" />
            },
            {
              label: 'Chờ duyệt',
              value: homestays.filter(h => h.status === 'pending').length,
              color: 'bg-yellow-500',
              icon: <FaHome className="w-6 h-6" />
            },
            {
              label: 'Không hoạt động',
              value: homestays.filter(h => h.status === 'inactive').length,
              color: 'bg-red-500',
              icon: <FaHome className="w-6 h-6" />
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className={`${stat.color} rounded-xl p-6 text-white`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* Grid Layout */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {paginatedHomestays.map((homestay, index) => (
          <HomestayCard key={homestay.id} homestay={homestay} index={index} />
        ))}
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {filteredHomestays.length === 0 && (
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
              {homestays.length === 0 ? "Chưa có nhà nghỉ nào" : "Không tìm thấy kết quả"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {homestays.length === 0
                ? "Bắt đầu bằng cách thêm nhà nghỉ đầu tiên của bạn"
                : "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"}
            </p>
            {homestays.length === 0 && (
              <Link
                to="/owner/homestays/add"
                className="inline-flex items-center px-6 py-3 bg-primary text-white 
                  font-semibold rounded-xl hover:bg-primary-dark transition-all 
                  duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/20"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                Thêm nhà nghỉ
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
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
  );
};

export default HomestayList;