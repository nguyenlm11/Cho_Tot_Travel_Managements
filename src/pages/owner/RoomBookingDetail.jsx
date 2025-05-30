import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaHotel, FaBed, FaSortAmountDown, FaSortAmountUp, FaSearch, FaTimes, FaFilter, FaBath, FaWifi, FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { IoRefresh } from 'react-icons/io5';
import { formatPrice, formatDate } from '../../utils/utils';
import roomAPI from '../../services/api/roomAPI';
import bookingAPI from '../../services/api/bookingAPI';
import FilterRoomOfRentalBookingModal from '../../components/modals/FilterRoomOfRentalBookingModal';

const BookingStatus = { Pending: 0, Confirmed: 1, InProgress: 2, Completed: 3, Cancelled: 4, RequestRefund: 5, Refund: 6, RequestCancel: 7 };

const statusConfig = {
  [BookingStatus.Pending]: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100', text: 'Chờ xác nhận' },
  [BookingStatus.Confirmed]: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'Đã xác nhận' },
  [BookingStatus.InProgress]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Đang phục vụ' },
  [BookingStatus.Completed]: { color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-100', text: 'Đã trả phòng' },
  [BookingStatus.Cancelled]: { color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100', text: 'Đã hủy' },
  [BookingStatus.RequestRefund]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Yêu cầu hoàn tiền' },
  [BookingStatus.Refund]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Hoàn tiền' },
  [BookingStatus.RequestCancel]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Yêu cầu hủy' }
};

export default function RoomBookingDetail() {
  const { roomID } = useParams();
  const [booking, setBooking] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filterDates, setFilterDates] = useState({ startDate: null, endDate: null });
  const itemsPerPage = 10;
  const [isFilterRoomBookingOpen, setIsFilterRoomBookingOpen] = useState(false)

  useEffect(() => {
    fetchBooking();
    fetchRoomDetails();
  }, [roomID]);

  const fetchRoomDetails = async () => {
    setIsLoadingRoom(true);
    try {
      const response = await roomAPI.getRoomsByRoomId(roomID);
      if (response.statusCode === 200) {
        setRoomDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setIsLoadingRoom(false);
    }
  };

  const fetchDetailedBookingInfo = async (bookingId) => {
    try {
      const response = await bookingAPI.getBookingsByID(bookingId);
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed booking:', error);
      return null;
    }
  };

  const fetchBooking = async (startDate = null, endDate = null) => {
    setIsLoading(true);
    try {
      const response = await roomAPI.getBookingsByRoomID(roomID, startDate, endDate);
      console.log('=== API Response Debug ===');
      console.log('Response data:', response.data);

      if (!response.data || response.data.length === 0) {
        setBooking([]);
        return;
      }

      // Check if data is incomplete (missing dates) and we have filter dates
      const hasIncompleteData = response.data.some(booking =>
        !booking.checkInDate || !booking.checkOutDate ||
        (booking.bookingDetails && booking.bookingDetails.length === 0)
      );

      if (hasIncompleteData && (startDate || endDate)) {
        console.log('Detected incomplete data after filtering, fetching all data and filtering client-side...');
        // Fetch all data without filter and filter client-side
        const allDataResponse = await roomAPI.getBookingsByRoomID(roomID);
        if (allDataResponse.data && allDataResponse.data.length > 0) {
          let allBookings = allDataResponse.data.map(booking => {
            if (booking?.bookingDetails && booking.bookingDetails.length > 0) {
              return {
                ...booking,
                ...booking.bookingDetails[0]
              };
            }
            return booking;
          });

          // Client-side filtering
          if (startDate || endDate) {
            allBookings = allBookings.filter(booking => {
              const checkIn = booking.checkInDate ? new Date(booking.checkInDate) : null;
              const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate) : null;
              const filterStart = startDate ? new Date(startDate) : null;
              const filterEnd = endDate ? new Date(endDate) : null;

              if (filterStart && checkIn && checkIn < filterStart) return false;
              if (filterEnd && checkOut && checkOut > filterEnd) return false;
              return true;
            });
          }

          console.log('Client-side filtered data:', allBookings);
          setBooking(allBookings);
          return;
        }
      }

      const formatData = await Promise.all(response.data.map(async (booking) => {
        if (booking?.bookingDetails && booking.bookingDetails.length > 0) {
          let data = {
            ...booking,
            ...booking.bookingDetails[0]
          };
          return data;
        } else {
          if (!booking.checkInDate || !booking.checkOutDate) {
            console.log(`Fetching detailed info for booking ${booking.bookingID}`);
            const detailedBooking = await fetchDetailedBookingInfo(booking.bookingID);
            if (detailedBooking) {
              return {
                ...booking,
                ...detailedBooking,
                account: booking.account || detailedBooking.account
              };
            }
          }
          return booking;
        }
      }));

      console.log('Final formatted data:', formatData);
      setBooking(formatData);
    } catch (error) {
      console.error('Error fetching room booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setActualSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActualSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const filteredBookings = React.useMemo(() => {
    let filtered = booking || [];
    if (actualSearchTerm) {
      const searchLower = actualSearchTerm.toLowerCase();
      filtered = filtered.filter(infor => {
        const bookingCode = (infor?.bookingCode || '').toString().toLowerCase();
        const customerName = (infor?.account?.name || '').toLowerCase();
        const bookingDate = formatDate(infor?.bookingDate)?.toLowerCase() || '';
        const checkInDate = (infor?.checkInDate ? formatDate(infor.checkInDate) :
          (infor?.bookingDetails?.[0]?.checkInDate ? formatDate(infor.bookingDetails[0].checkInDate) : ''))?.toLowerCase() || '';
        const checkOutDate = (infor?.checkOutDate ? formatDate(infor.checkOutDate) :
          (infor?.bookingDetails?.[0]?.checkOutDate ? formatDate(infor.bookingDetails[0].checkOutDate) : ''))?.toLowerCase() || '';
        const numberOfAdults = (infor?.numberOfAdults || '').toString().toLowerCase();
        const numberOfChildren = (infor?.numberOfChildren || '').toString().toLowerCase();
        const status = (statusConfig[infor?.status]?.text || '').toLowerCase();

        return bookingCode.includes(searchLower) ||
          customerName.includes(searchLower) ||
          bookingDate.includes(searchLower) ||
          checkInDate.includes(searchLower) ||
          checkOutDate.includes(searchLower) ||
          numberOfAdults.includes(searchLower) ||
          numberOfChildren.includes(searchLower) ||
          status.includes(searchLower);
      });
    }
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let valA, valB;
        switch (sortConfig.key) {
          case 'bookingCode':
            valA = a?.bookingCode || '';
            valB = b?.bookingCode || '';
            break;
          case 'accountName':
            valA = a?.account?.name || '';
            valB = b?.account?.name || '';
            break;
          case 'bookingDate':
            valA = a?.bookingDate ? new Date(a.bookingDate).getTime() : 0;
            valB = b?.bookingDate ? new Date(b.bookingDate).getTime() : 0;
            break;
          case 'checkInDate':
            valA = (a?.checkInDate ? new Date(a.checkInDate).getTime() :
              (a?.bookingDetails?.[0]?.checkInDate ? new Date(a.bookingDetails[0].checkInDate).getTime() : 0));
            valB = (b?.checkInDate ? new Date(b.checkInDate).getTime() :
              (b?.bookingDetails?.[0]?.checkInDate ? new Date(b.bookingDetails[0].checkInDate).getTime() : 0));
            break;
          case 'checkOutDate':
            valA = (a?.checkOutDate ? new Date(a.checkOutDate).getTime() :
              (a?.bookingDetails?.[0]?.checkOutDate ? new Date(a.bookingDetails[0].checkOutDate).getTime() : 0));
            valB = (b?.checkOutDate ? new Date(b.checkOutDate).getTime() :
              (b?.bookingDetails?.[0]?.checkOutDate ? new Date(b.bookingDetails[0].checkOutDate).getTime() : 0));
            break;
          case 'numberOfAdults':
            valA = a?.numberOfAdults || 0;
            valB = b?.numberOfAdults || 0;
            break;
          case 'numberOfChildren':
            valA = a?.numberOfChildren || 0;
            valB = b?.numberOfChildren || 0;
            break;
          case 'status':
            valA = a?.status || 0;
            valB = b?.status || 0;
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

  const handleClickFilter = (data) => {
    setFilterDates({ startDate: data.startDate, endDate: data.endDate });
    fetchBooking(data.startDate, data.endDate);
  }

  const nextImage = () => {
    if (roomDetails?.imageRooms?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === roomDetails.imageRooms.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (roomDetails?.imageRooms?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? roomDetails.imageRooms.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          variants={itemVariants}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {roomDetails ? `Chi tiết phòng ${roomDetails.roomNumber}` : 'Chi tiết phòng'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Thông tin chi tiết và lịch sử đặt phòng
            </p>
          </div>
        </motion.div>

        {isLoadingRoom ? (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
            variants={itemVariants}
          >
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin phòng...</p>
            </div>
          </motion.div>
        ) : roomDetails && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="border-b border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Phòng {roomDetails.roomNumber}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {roomDetails.homeStayRentalName || 'Thông tin chi tiết phòng'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${roomDetails.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${roomDetails.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {roomDetails.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Hình ảnh phòng
                  </h3>
                  {roomDetails.imageRooms && roomDetails.imageRooms.length > 0 ? (
                    <div className="relative">
                      <div className="relative h-80 rounded-lg overflow-hidden">
                        <img
                          src={roomDetails.imageRooms[currentImageIndex]?.image}
                          alt={`Phòng ${roomDetails.roomNumber} - ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {roomDetails.imageRooms.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 
                                text-white rounded-full transition-all duration-200 hover:scale-110"
                            >
                              <FaChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 
                                text-white rounded-full transition-all duration-200 hover:scale-110"
                            >
                              <FaChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                          {currentImageIndex + 1} / {roomDetails.imageRooms.length}
                        </div>
                      </div>

                      {roomDetails.imageRooms.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                          {roomDetails.imageRooms.map((image, index) => (
                            <button
                              key={image.imageRoomID}
                              onClick={() => goToImage(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === currentImageIndex
                                  ? 'border-green-500 ring-2 ring-green-200'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                                }`}
                            >
                              <img
                                src={image.image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-80 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 
                      flex items-center justify-center">
                      <div className="text-center">
                        <FaHotel className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Chưa có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <FaBed className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Số giường</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {roomDetails.numberBed}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <FaBath className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phòng tắm</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {roomDetails.numberBathRoom}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <FaWifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Wifi</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {roomDetails.numberWifi}
                            </p>
                          </div>
                        </div>
                      </div>

                      {roomDetails.rentPrice && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                              <FaMoneyBillWave className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Giá thuê</p>
                              <p className="font-semibold text-green-600">
                                {formatPrice(roomDetails.rentPrice)}/đêm
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          variants={itemVariants}
        >
          <div className="border-b border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {roomDetails ? `Lịch sử đặt phòng ${roomDetails.roomNumber}` : 'Danh sách đặt phòng'}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý và theo dõi các booking của phòng này
              </p>
              {(filterDates.startDate || filterDates.endDate) && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 
                    text-green-700 dark:text-green-300 rounded-full text-sm">
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>
                      {filterDates.startDate && filterDates.endDate
                        ? `${formatDate(filterDates.startDate)} - ${formatDate(filterDates.endDate)}`
                        : filterDates.startDate
                          ? `Từ: ${formatDate(filterDates.startDate)}`
                          : `Đến: ${formatDate(filterDates.endDate)}`
                      }
                    </span>
                    <button
                      onClick={() => {
                        setFilterDates({ startDate: null, endDate: null });
                        fetchBooking();
                      }}
                      className="ml-1 p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đặt phòng, tên khách, ngày đặt, ngày nhận/trả phòng, số người, trạng thái..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 
                      dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 
                      dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 
                      transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium 
                    rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <FaSearch className="w-4 h-4" />
                  Tìm kiếm
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium 
                    rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <IoRefresh className="w-4 h-4" />
                  Làm mới
                </button>
                <button
                  onClick={() => setIsFilterRoomBookingOpen(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium 
                    rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <FaFilter className="w-4 h-4" />
                  Lọc
                </button>
              </div>
            </div>

            {actualSearchTerm && (
              <motion.div
                className="mt-4 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 
                  text-green-700 dark:text-green-300 rounded-full text-sm">
                  <FaSearch className="w-3 h-3" />
                  <span>Tìm kiếm: <strong>{actualSearchTerm}</strong></span>
                  <button
                    onClick={clearSearch}
                    className="ml-1 p-0.5 hover:bg-green-100 dark:hover:bg-green-800 rounded-full transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <TableHeader label="Mã đặt phòng" sortKey="bookingCode" />
                      <TableHeader label="Tên khách hàng" sortKey="accountName" />
                      <TableHeader label="Ngày đặt" sortKey="bookingDate" />
                      <TableHeader label="Ngày nhận phòng" sortKey="checkInDate" />
                      <TableHeader label="Ngày trả phòng" sortKey="checkOutDate" />
                      <TableHeader label="Số người lớn" sortKey="numberOfAdults" />
                      <TableHeader label="Số trẻ em" sortKey="numberOfChildren" />
                      <TableHeader label="Trạng thái" sortKey="status" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedBookings.map((infor, idx) => (
                      <motion.tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        variants={itemVariants}
                      >
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium text-center">
                          {infor?.bookingCode || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white text-center">
                          {infor?.account?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-center">
                          {infor?.bookingDate ? formatDate(infor.bookingDate) : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-center">
                          {infor?.checkInDate ? formatDate(infor.checkInDate) :
                            (infor?.bookingDetails?.[0]?.checkInDate ? formatDate(infor.bookingDetails[0].checkInDate) : '-')}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-center">
                          {infor?.checkOutDate ? formatDate(infor.checkOutDate) :
                            (infor?.bookingDetails?.[0]?.checkOutDate ? formatDate(infor.bookingDetails[0].checkOutDate) : '-')}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-center">
                          {infor?.numberOfAdults || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-center">
                          {infor?.numberOfChildren || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {infor?.status !== undefined ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[infor.status]?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                              {statusConfig[infor.status]?.text || 'Không xác định'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {paginatedBookings.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <FaCalendarAlt className="mx-auto w-16 h-16" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Không có dữ liệu
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {actualSearchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có booking nào cho phòng này'}
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed 
                        hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed 
                        hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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

      {isFilterRoomBookingOpen && (
        <FilterRoomOfRentalBookingModal
          isOpen={isFilterRoomBookingOpen}
          onClose={() => setIsFilterRoomBookingOpen(false)}
          onSave={handleClickFilter}
        />
      )}
    </div>
  );
}