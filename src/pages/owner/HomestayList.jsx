import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { Toaster, toast } from 'react-hot-toast';
import { FaBed, FaChartLine, FaChevronLeft, FaChevronRight, FaEdit, FaFilter, FaHome, FaMapMarkerAlt, FaPlus, FaRegClock, FaSearch, FaStar, FaTrash } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import homestayAPI from '../../services/api/homestayAPI';
import { EditHomestayModal } from '../../components/modals/EditHomestayModal';

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
  pending: {
    color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    text: 'Chờ duyệt'
  },
  inactive: {
    color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    text: 'Không hoạt động'
  },
  cancel: {
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
    text: 'Đã bị từ chối'
  }
};

// FilterBar Component (Giữ nguyên)
const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
  const searchInputRef = useRef(null);
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
    { value: 'active', label: 'Hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
    { value: 'pending', label: 'Chờ duyệt', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
    { value: 'inactive', label: 'Tạm ngưng', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> },
    { value: 'cancel', label: 'Đã hủy', icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> }
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
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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

// HomestayCard Component
const HomestayCard = ({ homestay, index, onEdit, setShowDeleteModal }) => {
  console.log(homestay)
  const navigate = useNavigate();
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
            src={homestay.image}
            alt={homestay.name}
            className="w-full h-full object-cover transform 
            group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${statusConfig[homestay.status].color} shadow-lg`}>
              {statusConfig[homestay.status].text}
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
                  onClick={() => onEdit(homestay)}
                >
                  <FaEdit className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/90 rounded-full hover:bg-white
                    transform hover:scale-110 transition-all duration-200"
                  onClick={() => setShowDeleteModal({ homestaySelect: homestay.id, isOpen: true })}
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
            {homestay.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="text-primary w-6 h-6" />
            <span className="line-clamp-2">{homestay.address}</span>
          </p>
          <div className="flex items-center justify-between mt-4 mb-6">
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <FaBed className="text-primary" />
                <span>{homestay.rooms} phòng</span>
              </div> */}
              {homestay.rating !== null ? (
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar />
                  <span>{homestay.rating}/5</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-500">
                  Chưa có đánh giá
                </div>
              )}

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
  const [actualSearchTerm, setActualSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 6;
  const [editingHomestay, setEditingHomestay] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ isOpen: false, homestaySelect: null });

  // Validate Role Staff
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user?.role === 'Staff') {
      navigate(`/owner/homestays/${user?.homeStayID}/dashboard`, { replace: true });
    }
  }, [location, navigate]);

  // Hàm lấy trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'pending';
      case 1:
        return 'active';
      case 2:
        return 'cancel';
      case 3:
        return 'inactive';
      default:
        return 'pending';
    }
  };

  // Hàm gọi API
  const fetchHomestays = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo?.AccountID) {
        navigate('/login');
        return;
      }

      const response = await homestayAPI.getHomestaysByOwner(userInfo.AccountID);
      if (response.statusCode === 200) {
        const formattedHomestays = response.data.map(homestay => ({
          id: homestay.homeStayID,
          homeStayID: homestay.homeStayID,
          name: homestay.name,
          address: homestay.address,
          status: getStatusText(homestay.status),
          rooms: homestay.numberOfRoom || 0,
          rating: homestay.sumRate,
          image: homestay.imageHomeStays?.[0]?.image,
          lastUpdated: homestay.createAt,
          description: homestay.description || '',
          area: homestay.area || '',
          rentalType: homestay.rentalType || 0
        }));
        setHomestays(formattedHomestays);
        const homestayIds = response.data.map(h => h.homeStayID.toString());
        localStorage.setItem('userHomestays', JSON.stringify(homestayIds));
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      toast.error('Không thể tải danh sách homestay');
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [navigate]);

  useEffect(() => {
    fetchHomestays();
  }, [fetchHomestays]);

  const handleDelete = useCallback(async (id) => {
    try {
      const res = await homestayAPI.deleteHomestay(id);
      if (res.statusCode === 200) {
        fetchHomestays();
        toast.success("Xóa homestay thành công");
      }
    } catch (error) {
      console.log(error);
      toast.error("Xóa homestay thất bại");
    } finally {
      setShowDeleteModal(prev => ({ ...prev, isOpen: false }))
    }
  }, [fetchHomestays])

  // Lọc và phân trang
  const filteredHomestays = useMemo(() => {
    return homestays.filter(homestay => {
      const matchesSearch = homestay.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
        homestay.address.toLowerCase().includes(actualSearchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || homestay.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [homestays, actualSearchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredHomestays.length / itemsPerPage);
  const paginatedHomestays = filteredHomestays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    setActualSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const statsData = [
    {
      label: 'Đang hoạt động',
      value: homestays.filter(h => h.status === 'active').length,
      color: 'bg-green-500',
      icon: <FaHome className="w-6 h-6" />
    },
    {
      label: 'Chờ phê duyệt',
      value: homestays.filter(h => h.status === 'pending').length,
      color: 'bg-yellow-500',
      icon: <FaHome className="w-6 h-6" />
    },
    {
      label: 'Không hoạt động',
      value: homestays.filter(h => h.status === 'inactive').length,
      color: 'bg-red-500',
      icon: <FaHome className="w-6 h-6" />
    },
    {
      label: 'Đã bị từ chối',
      value: homestays.filter(h => h.status === 'cancel').length,
      color: 'bg-purple-500',
      icon: <FaHome className="w-6 h-6" />
    }
  ];

  const openEditModal = (homestay) => {
    setEditingHomestay(homestay);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingHomestay(null);
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
          <motion.section
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
            }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              {paginatedHomestays.map((homestay, index) => (
                <HomestayCard
                  key={homestay.id}
                  homestay={homestay}
                  index={index}
                  onEdit={openEditModal}
                  setShowDeleteModal={setShowDeleteModal}
                />
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
          </>
        )}

        {/* Pagination */}
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

      {/* Edit Modal */}
      <EditHomestayModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        homestay={editingHomestay}
        setLoading={setLoading}
        fetchHomestays={fetchHomestays}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal.isOpen && (
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
                Bạn có chắc chắn muốn xóa chứ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700
                  dark:hover:bg-gray-600 text-gray-800 dark:text-white
                  rounded-lg transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.homestaySelect)}
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

export default HomestayList;