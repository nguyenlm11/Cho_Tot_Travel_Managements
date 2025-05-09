import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import bookingAPI from '../../services/api/bookingAPI';
import { FaUser, FaMoneyBillWave, FaInfoCircle, FaHotel, FaBed, FaReceipt, FaMapMarkerAlt, FaSortAmountDown, FaSortAmountUp, FaSearch, FaTimes } from 'react-icons/fa';
import { formatPrice, formatDate } from '../../utils/utils';
import { FaHouse } from 'react-icons/fa6';
import roomAPI from '../../services/api/roomAPI';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoRefresh } from 'react-icons/io5';


const BookingStatus = { Pending: 0, Confirmed: 1, InProgress: 2, Completed: 3, Cancelled: 4, NoShow: 5, Refund: 6 };
const PaymentStatus = { Pending: 0, Deposited: 1, FullyPaid: 2, Refunded: 3 };

const statusConfig = {
  [BookingStatus.Pending]: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100', text: 'Chờ xác nhận' },
  [BookingStatus.Confirmed]: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'Đã xác nhận' },
  [BookingStatus.InProgress]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Đang phục vụ' },
  [BookingStatus.Completed]: { color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-100', text: 'Đã trả phòng' },
  [BookingStatus.Cancelled]: { color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100', text: 'Đã hủy' },
  [BookingStatus.NoShow]: { color: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100', text: 'Không đến' },
  [BookingStatus.Refund]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Yêu cầu hoàn tiền' }
};

const paymentStatusConfig = {
  [PaymentStatus.Pending]: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100', text: 'Chưa thanh toán' },
  [PaymentStatus.Deposited]: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'Đã đặt cọc' },
  [PaymentStatus.FullyPaid]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Đã thanh toán' },
  [PaymentStatus.Refunded]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Đã hoàn tiền' }
};



export default function RoomBookingDetail() {
  const { roomID } = useParams();
  const [booking, setBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true);
      try {
        const response = await roomAPI.getBookingsByRoomID(roomID);
        const formatData = response.data.map(booking => {
          let data = { account: booking?.account, bookingID: booking?.bookingID };
          booking?.bookingDetails?.forEach(bd => {
            data = { ...data, ...bd };
          });
          return data;
        });
        setBooking(formatData);
      } catch (error) {
        console.error('Error fetching room booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [roomID]);

  const handleSearch = () => {
    setActualSearchTerm(searchTerm);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActualSearchTerm('');
    setCurrentPage(1); // Reset về trang 1 khi xóa tìm kiếm
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset về trang 1 khi sắp xếp
  };

  const filteredBookings = React.useMemo(() => {
    let filtered = booking || [];
    if (actualSearchTerm) {
      const searchLower = actualSearchTerm.toLowerCase();
      filtered = filtered.filter(infor =>
        (infor?.rooms?.roomNumber?.toLowerCase()?.includes(searchLower) || '') ||
        (infor?.account?.name?.toLowerCase()?.includes(searchLower) || '') ||
        (infor?.homeStayRentals?.name?.toLowerCase()?.includes(searchLower) || '') ||
        (formatDate(infor?.checkInDate)?.toLowerCase()?.includes(searchLower) || '') ||
        (formatDate(infor?.checkOutDate)?.toLowerCase()?.includes(searchLower) || '')
      );
    }
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let valA, valB;
        switch (sortConfig.key) {
          case 'roomNumber':
            valA = a?.rooms?.roomNumber || '';
            valB = b?.rooms?.roomNumber || '';
            break;
          case 'accountName':
            valA = a?.account?.name || '';
            valB = b?.account?.name || '';
            break;
          case 'homeStayName':
            valA = a?.homeStayRentals?.name || '';
            valB = b?.homeStayRentals?.name || '';
            break;
          case 'rentType':
            valA = a?.homeStayRentals?.rentWhole ? "Nguyên căn" : "Theo phòng";
            valB = b?.homeStayRentals?.rentWhole ? "Nguyên căn" : "Theo phòng";
            break;
          case 'checkInDate':
            valA = a?.checkInDate ? new Date(a.checkInDate).getTime() : 0;
            valB = b?.checkInDate ? new Date(b.checkInDate).getTime() : 0;
            break;
          case 'checkOutDate':
            valA = a?.checkOutDate ? new Date(a.checkOutDate).getTime() : 0;
            valB = b?.checkOutDate ? new Date(b.checkOutDate).getTime() : 0;
            break;
          case 'rentPrice':
            valA = a?.rentPrice || 0;
            valB = b?.rentPrice || 0;
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
  }, [booking, actualSearchTerm, sortConfig]);

  // Phân trang
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const TableHeader = ({ label, sortKey }) => (
    <th
      className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-200">
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? (
            <FaSortAmountUp className="w-4 h-4 text-green-500" />
          ) : (
            <FaSortAmountDown className="w-4 h-4 text-green-500" />
          )
        )}
      </span>
    </th>
  );

  if (!booking && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full h-full flex flex-col items-center justify-center mt-9 bg-white dark:bg-gray-800"
        style={{ minHeight: '700px' }}
      >
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <FaCalendarAlt className="mx-auto w-16 h-16" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Không tìm thấy thông tin đặt phòng
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Đặt phòng này không tồn tại hoặc đã bị xóa
        </p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 15,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-9xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-6 text-white"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-center">Đơn đặt phòng</h2>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          variants={itemVariants}
        >
          {/* Search and Refresh */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Danh sách đặt phòng
            </h3>
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo số phòng, tên khách, tên căn, ngày..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 
                      dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 
                      dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 
                      transition-all duration-300 ease-in-out shadow-sm 
                      hover:shadow-md hover:border-green-400 placeholder-gray-400 
                      dark:placeholder-gray-500 focus:outline-none text-sm"
                    aria-label="Tìm kiếm đặt phòng"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium 
                    rounded-lg transition-all duration-300 ease-in-out shadow-sm 
                    hover:shadow-md hover:-translate-y-0.5 focus:outline-none 
                    focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
                  aria-label="Tìm kiếm"
                >
                  Tìm kiếm
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 
                    text-white font-medium rounded-lg transition-all duration-300 ease-in-out 
                    shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none 
                    focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
                  aria-label="Làm mới danh sách"
                >
                  <IoRefresh className="w-4 h-4" />
                  Làm mới
                </button>
              </div>
              {/* Search Term Display */}
              {actualSearchTerm && (
                <motion.div
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>Đang tìm kiếm: <strong>{actualSearchTerm}</strong></span>
                  <button
                    onClick={clearSearch}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    aria-label="Xóa tìm kiếm"
                  >
                    <FaTimes className="w-4 h-4" />
                    Xóa
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl">
            {isLoading ? (
              <div className="text-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-green-600 mx-auto"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Đang tải...</p>
              </div>
            ) : (
              <>
                <table className="min-w-full text-md text-left">
                  <thead className="bg-gray-50 text-md dark:bg-gray-900/50 sticky top-0 z-10">
                    <tr>
                      <TableHeader label="Số phòng" sortKey="roomNumber" />
                      <TableHeader label="Tên khách hàng" sortKey="accountName" />
                      <TableHeader label="Tên căn thuê" sortKey="homeStayName" />
                      <TableHeader label="Loại thuê" sortKey="rentType" />
                      <TableHeader label="Ngày check-in" sortKey="checkInDate" />
                      <TableHeader label="Ngày check-out" sortKey="checkOutDate" />
                      <TableHeader label="Tổng giá thuê" sortKey="rentPrice" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((infor, idx) => (
                      <motion.tr
                        key={idx}
                        className="border-b text-sm border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition"
                        variants={itemVariants}
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{infor?.rooms?.roomNumber || '-'}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{infor?.account?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{infor?.homeStayRentals?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {infor?.homeStayRentals?.rentWhole ? "Nguyên căn" : "Theo phòng"}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{formatDate(infor?.checkInDate)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{formatDate(infor?.checkOutDate)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{formatPrice(infor?.rentPrice)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {paginatedBookings.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Không có dữ liệu phù hợp !!!
                  </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 
                        disabled:cursor-not-allowed hover:bg-green-700 transition-all duration-300 
                        shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 
                        focus:ring-opacity-50 text-sm"
                      aria-label="Trang trước"
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 
                          ${currentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                        aria-label={`Trang ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 
                        disabled:cursor-not-allowed hover:bg-green-700 transition-all duration-300 
                        shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 
                        focus:ring-opacity-50 text-sm"
                      aria-label="Trang sau"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
