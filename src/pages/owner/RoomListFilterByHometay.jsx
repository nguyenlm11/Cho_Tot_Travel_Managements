import React, { useState, useRef, useEffect, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FaSearch, FaFilter, FaChevronDown, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaUser, FaCheck, FaMoneyBillWave, FaInfoCircle, FaSync, FaEllipsisV, FaEye, FaTag } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import CountUp from 'react-countup';
import { useNavigate, useParams } from 'react-router-dom';
import bookingAPI from '../../services/api/bookingAPI';
import roomAPI from '../../services/api/roomAPI';
import FilterRoomStartAndEndDate from '../../components/modals/FilterRoomStartAndEndDate';
import { formatPrice } from '../../utils/utils';

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
  }
};

// Trạng thái đặt dịch vụ
const ServiceBookingStatus = {
  isActive: true,
  isUsed: false,
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


const FilterBar = ({ searchTerm, setSearchTerm, handleSearch, setActualSearchTerm, fetchRoomByHomestayID }) => {
  const searchInputRef = useRef(null);

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
  const [isFilterRoomOpen, setIsFilterRoomOpen] = useState(false)
  const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15 }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    tap: { scale: 0.95 }
  };

  const handleClickFilter = (data) => {
    // log 2 ngày start và end đã format
    // console.log(data);

    fetchRoomByHomestayID(data.startDate, data.endDate);

  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-10">
        <div className="flex-1 relative group flex">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm theo số phòng hoặc căn thuê..."
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

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsFilterRoomOpen(true)}
            className="w-full py-3  bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center justify-center font-medium"
          >
            <FaFilter className='mr-2' /> Filter room
          </motion.button>

        </div>
      </div>

      {isFilterRoomOpen && (
        <FilterRoomStartAndEndDate
          isOpen={isFilterRoomOpen}
          onClose={() => setIsFilterRoomOpen(false)}
          onSave={handleClickFilter}
        />
      )}

    </div>
  );
};

const RoomListFilterByHomestay = () => {
  const { homestayId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'bookingServicesDate', direction: 'desc' });

  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (homestayId) {
      fetchRoomByHomestayID();
    } else {
      toast.error('Không tìm thấy thông tin homestay');
      navigate('/owner/homestays');
    }
  }, [homestayId]);



  const fetchRoomByHomestayID = async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      const response = await roomAPI.getRoomsByHomestayID(homestayId, startDate, endDate);
      // console.log(response);

      if (response.statusCode === 200) {
        setRooms(response.data || []);
        // console.log(rooms);
        // toast.success(`Đã tìm thấy: ${response.data.length} phòng`)
      } else {
        toast.error('Không thể tải danh sách phòng thuê');
      }
    } catch (error) {
      console.error('Error fetching room bookings:', error);
      toast.error('Không thể tải danh sách phòng thuê');
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const handleSearch = () => {
    setActualSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredServiceBookings = useMemo(() => {
    let filtered = [...rooms];

    // Filter theo searchTerm
    if (actualSearchTerm) {
      const searchLower = actualSearchTerm.toLowerCase();
      filtered = filtered.filter(room =>
        (room?.roomNumber?.toLowerCase().includes(searchLower) || '') ||
        (room?.roomTypeName?.toLowerCase().includes(searchLower) || '') ||
        (room?.homeStayRentalName?.toLowerCase().includes(searchLower) || '')
      );
    }

    // Filter theo status nếu có
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === parseInt(selectedStatus));
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA, valB;
        switch (sortConfig.key) {
          case 'roomNumber':
            valA = a.roomNumber || '';
            valB = b.roomNumber || '';
            break;
          case 'roomTypeName':
            valA = a.roomTypeName || '';
            valB = b.roomTypeName || '';
            break;
          case 'homeStayRentalName':
            valA = a.homeStayRentalName || '';
            valB = b.homeStayRentalName || '';
            break;
          case 'rentPrice':
            valA = a.rentPrice || 0;
            valB = b.rentPrice || 0;
            break;
          default:
            return 0;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [rooms, actualSearchTerm, selectedStatus, sortConfig]);

  const totalPages = Math.ceil(filteredServiceBookings.length / itemsPerPage);
  const paginatedServiceBookings = filteredServiceBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [actualSearchTerm, selectedStatus]);

  const handleViewRoomBooking = (roomId) => {
    navigate(`/owner/homestays/${homestayId}/room-bookings-detail/${roomId}`);
  };

  const handleRefresh = () => {
    fetchRoomByHomestayID();
    toast.success('Đã làm mới danh sách phòng', {
      id: 'refresh-success',
      style: {
        borderRadius: '10px',
        background: '#ECFDF5',
        color: '#065F46',
        border: '1px solid #6EE7B7'
      },
    });
  };

  const TableHeader = ({ label, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th
        onClick={() => handleSort(sortKey)}
        className="px-6 py-3 text-left cursor-pointer group hover:bg-gray-100 
          dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <div className={`transition-colors ${isSorted ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
            {isSorted && (
              sortConfig.direction === 'asc'
                ? <FaSortAmountUp className="w-4 h-4" />
                : <FaSortAmountDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </th>
    );
  };

  const statsData = useMemo(() => [
    { label: 'Tổng phòng', value: rooms.length, color: 'bg-blue-500', icon: <FaTag className="w-6 h-6" /> },
    { label: 'Đang hoạt động', value: rooms.filter(b => b.isActive === ServiceBookingStatus.isActive).length, color: 'bg-green-500', icon: <FaCheck className="w-6 h-6" /> },
    //   { label: 'Phòng đang thuê', value: rooms?.isUsed === true, color: 'bg-indigo-500', icon: <FaCheck className="w-6 h-6" /> },
    // { label: 'Phòng đang trống', value: rooms.filter(b => b.isUsed === ServiceBookingStatus.isUsed).length, color: 'bg-yellow-500', icon: <FaCalendarAlt className="w-6 h-6" /> }
  ], [rooms]);
  // console.log(rooms);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('.relative.inline-block.text-left');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
          const menu = dropdown.querySelector('.absolute');
          if (menu) menu.classList.add('hidden');
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const homestayName = localStorage.getItem('homestayName')
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Toaster position="top-right" />

      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Danh sách phòng thuê của {homestayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý tất cả các phòng thuê
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                            font-medium rounded-lg transition-colors shadow-sm hover:shadow-lg"
            >
              <FaSync className="w-4 h-4" /> Làm mới
            </button>
          </div>
        </div>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
          }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                      <CountUp end={stat.value} duration={2.5} separator="," delay={0.1} enableScrollSpy scrollSpyOnce>
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

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        handleSearch={handleSearch}
        setActualSearchTerm={setActualSearchTerm}
        actualSearchTerm={actualSearchTerm}
        fetchRoomByHomestayID={fetchRoomByHomestayID}
      />

      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <TableHeader label="Số phòng" sortKey="roomNumber" />
                  <TableHeader label="Loại phòng" sortKey="roomTypeName" />
                  <TableHeader label="Tên căn thuê" sortKey="homeStayRentalName" />
                  <TableHeader label="Giá thuê" sortKey="rentPrice" />
                  <TableHeader label="Trạng thái" sortKey="status" />
                  <th className="px-6 py-3 text-left">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Hành động
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedServiceBookings.map((booking) => {
                  return (
                    <motion.tr
                      key={booking.bookingServicesID}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {booking?.roomNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {booking?.roomTypeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400">
                          {booking?.homeStayRentalName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatPrice(booking?.rentPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400 ">
                          <div className={`px-3 py-1.5 rounded-full text-xs font-medium w-20
                                        ${booking?.isActive
                              ? 'bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-100'
                              : 'bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-100'}`
                          }>
                            {booking?.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                          </div>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.currentTarget.nextElementSibling.classList.toggle('hidden');
                            }}
                            className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          >
                            <FaEllipsisV className="w-5 h-5" />
                          </button>

                          <div className="hidden absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  // console.log(booking);
                                  handleViewRoomBooking(booking.roomID);
                                  e.currentTarget.parentElement.parentElement.classList.add('hidden');
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaEye className="mr-3 w-4 h-4" />
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            <AnimatePresence>
              {filteredServiceBookings.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mt-6"
                >
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <FaSearch className="mx-auto w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Không tìm thấy phòng
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {actualSearchTerm || selectedStatus !== 'all'
                      ? 'Không có đặt phòng nào phù hợp với bộ lọc của bạn'
                      : 'Chưa có đặt phòng nào được tạo cho homestay này'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
    // <></>
  );
};

export default RoomListFilterByHomestay; 