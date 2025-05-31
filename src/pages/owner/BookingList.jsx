import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FaSearch, FaFilter, FaChevronDown, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaQrcode, FaCheck, FaSync, FaEllipsisV, FaEye, FaComments } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import QRScannerModal from '../../components/modals/QRScannerModal';
import CountUp from 'react-countup';
import { useNavigate, useParams } from 'react-router-dom';
import bookingAPI from '../../services/api/bookingAPI';
import { FaExchangeAlt } from "react-icons/fa";
import { ChangeRoomModal } from '../../components/modals/ChangeRoomModal';
import { FaDeleteLeft } from 'react-icons/fa6';
import chatAPI from '../../services/api/chatAPI';
import ReactDOM from 'react-dom';

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

const BookingStatus = { Pending: 0, Confirmed: 1, InProgress: 2, Completed: 3, Cancelled: 4, NoShow: 5, Refund: 6, RequestCancelled: 7 };
const PaymentStatus = { Pending: 0, Deposited: 1, FullyPaid: 2, Refunded: 3 };
const bookingStatusConfig = {
    [BookingStatus.Pending]: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100', text: 'Chờ xác nhận' },
    [BookingStatus.Confirmed]: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'Chờ nhận phòng' },
    [BookingStatus.InProgress]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Đang phục vụ' },
    [BookingStatus.Completed]: { color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-100', text: 'Đã trả phòng' },
    [BookingStatus.Cancelled]: { color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100', text: 'Đã hủy' },
    [BookingStatus.NoShow]: { color: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100', text: 'Chấp nhận hoàn tiền' },
    [BookingStatus.Refund]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Yêu cầu hoàn tiền' },
    [BookingStatus.RequestCancelled]: { color: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-100', text: 'Yêu cầu hủy' }
};
const paymentStatusConfig = {
    [PaymentStatus.Pending]: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100', text: 'Chưa thanh toán' },
    [PaymentStatus.Deposited]: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'Đặt cọc' },
    [PaymentStatus.FullyPaid]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Thanh toán đủ' },
    [PaymentStatus.Refunded]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Đã hoàn tiền' }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ActionDropdown = ({ booking, homestayId, handleViewBooking, handleRefund, handleScanResult, handleStartChat, handleRequestCancelToAdmin, handleRequestRefundToAdmin }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const [isChangeRoomModal, setIsChangeRoomModal] = useState(false);
    const [selectBooking, setSelectBooking] = useState(null);
    const [isSameCheckinDate, setIsSameCheckinDate] = useState(false);

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 200;
            const dropdownHeight = 250;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            let top = rect.bottom + window.scrollY + 8;
            let left = rect.left + window.scrollX - 50;
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                top = rect.top + window.scrollY - dropdownHeight - 8;
            }
            if (left + dropdownWidth > window.innerWidth - 16) {
                left = window.innerWidth - dropdownWidth - 16;
            }
            if (left < 16) {
                left = 16;
            }

            setDropdownStyle({
                position: 'absolute',
                top: top,
                left: left,
                zIndex: 9999,
                minWidth: dropdownWidth,
            });
        }
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target) &&
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        const currentDate = new Date();
        const bookingDate = new Date(booking?.bookingDetails?.[0]?.checkInDate);

        currentDate.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        setIsSameCheckinDate(currentDate >= bookingDate);
    }, [booking]);

    const handleActionClick = (action) => {
        action();
        closeDropdown();
    };

    const dropdownContent = (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={dropdownStyle}
            className="rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700"
            role="menu"
            aria-orientation="vertical"
        >
            <div className="py-1" role="none">
                {booking.status === BookingStatus.Refund && booking.status !== BookingStatus.Cancelled && (
                    <button
                        onClick={() => handleActionClick(() => handleRequestRefundToAdmin(booking.bookingID, BookingStatus.NoShow))}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        role="menuitem"
                    >
                        Chấp nhận hoàn tiền
                    </button>
                )}
                {booking.status !== BookingStatus.Cancelled &&
                    booking.status !== BookingStatus.NoShow &&
                    booking.status !== BookingStatus.InProgress &&
                    booking.status !== BookingStatus.Completed &&
                    booking.paymentStatus !== 0 &&
                    booking.status == BookingStatus.Confirmed &&
                    isSameCheckinDate &&
                    (
                        <button
                            onClick={() => handleActionClick(() => handleScanResult(booking.bookingID, booking, BookingStatus.InProgress))}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            role="menuitem"
                        >
                            <FaQrcode className="mr-3 w-4 h-4 text-green-500" aria-hidden="true" />
                            Check-in
                        </button>
                    )}
                {booking.status == BookingStatus.InProgress && (
                    <button
                        onClick={() => handleActionClick(() => handleScanResult(booking.bookingID, booking, BookingStatus.Completed))}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        role="menuitem"
                    >
                        <FaQrcode className="mr-3 w-4 h-4 text-green-500" aria-hidden="true" />
                        Check-out
                    </button>
                )}

                {booking.status == BookingStatus.Pending &&
                    booking.paymentStatus !== 0 &&
                    (booking.paymentStatus == PaymentStatus.Deposited ||
                        booking.paymentStatus == PaymentStatus.FullyPaid) && (
                        <button
                            onClick={() => handleActionClick(() => handleScanResult(booking.bookingID, booking, BookingStatus.Confirmed))}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            role="menuitem"
                        >
                            <FaCheck className="mr-3 w-4 h-4 text-green-500" aria-hidden="true" />
                            Xác nhận
                        </button>
                    )}

                {booking.status == BookingStatus.Confirmed && (
                    <button
                        onClick={() => handleActionClick(() => handleRequestCancelToAdmin(booking.bookingID, BookingStatus.RequestCancelled))}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        role="menuitem"
                    >
                        <FaDeleteLeft className="mr-3 w-4 h-4 text-red-500" aria-hidden="true" />
                        Hủy
                    </button>
                )}

                {booking.bookingDetails?.some(item => item.roomID != null) &&
                    booking.status !== BookingStatus.Cancelled &&
                    booking.status !== BookingStatus.NoShow &&
                    booking.status !== BookingStatus.Completed &&
                    booking.paymentStatus !== 0 && (
                        <button
                            onClick={() => {
                                handleActionClick(() => {
                                    setIsChangeRoomModal(true);
                                    setSelectBooking(booking);
                                });
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            role="menuitem"
                        >
                            <FaExchangeAlt className="w-3 h-4 mr-3 text-blue-500" aria-hidden="false" />
                            Change room
                        </button>
                    )
                }

                <button
                    onClick={() => handleActionClick(() => handleViewBooking(booking.bookingID))}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                >
                    <FaEye className="mr-3 w-4 h-4 text-green-500" aria-hidden="true" />
                    Xem chi tiết
                </button>
                <button
                    onClick={() => handleActionClick(handleStartChat)}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                >
                    <FaComments className="mr-3 w-4 h-4 text-blue-500" aria-hidden="true" />
                    Chat
                </button>
            </div>
        </motion.div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="inline-flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <FaEllipsisV className="w-5 h-5" />
            </button>
            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
            <ChangeRoomModal
                isOpen={isChangeRoomModal}
                onClose={() => setIsChangeRoomModal(false)}
                booking={selectBooking}
            />
        </>
    );
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);
    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: '0', label: 'Chờ xác nhận', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
        { value: '1', label: 'Chờ nhận phòng', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
        { value: '2', label: 'Đang ở', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
        { value: '3', label: 'Đã trả phòng', icon: <div className="w-2 h-2 rounded-full bg-indigo-500" /> },
        { value: '4', label: 'Đã hủy', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> },
        { value: '5', label: 'Chấp nhận hoàn tiền', icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> },
        { value: '6', label: 'Yêu cầu hoàn tiền', icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> },
        { value: '7', label: 'Yêu cầu hủy', icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> }
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
                        placeholder="Tìm kiếm theo tên khách hàng hoặc email..."
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
                        <FaChevronDown className="w-4 h-4 text-gray-400" />
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

const BookingList = () => {
    const { id: homestayId } = useParams();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'bookingDate', direction: 'desc' });
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, [homestayId]);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await bookingAPI.getBookingsByHomeStay(homestayId);
            // console.log(response.data);
            setBookings(response.data || []);
        } catch (error) {
            toast.error('Không thể tải danh sách đặt phòng');
            console.log(error);
        } finally {
            setTimeout(() => setIsLoading(false), 1500);
        }
    };

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };
    // console.log(bookings);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredBookings = useMemo(() => {
        let filtered = [...bookings];
        // console.log(actualSearchTerm);
        if (actualSearchTerm) {
            const searchLower = actualSearchTerm.toLowerCase();
            filtered = filtered.filter(booking =>
                booking.account.name.toLowerCase().includes(searchLower) ||
                booking.account.email.toLowerCase().includes(searchLower) ||
                booking.bookingCode.toLowerCase().includes(searchLower)
            );
        }
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(booking => booking.status === parseInt(selectedStatus));
        }
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'customerName') {
                    const valA = a.account.name;
                    const valB = b.account.name;
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
                if (sortConfig.key === 'homestayName') {
                    const valA = a.bookingDetails[0]?.homeStayRentals?.name || '';
                    const valB = b.bookingDetails[0]?.homeStayRentals?.name || '';
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
                if (sortConfig.key === 'checkInDate') {
                    const valA = new Date(a.bookingDetails[0]?.checkInDate || 0);
                    const valB = new Date(b.bookingDetails[0]?.checkOutDate || 0);
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }

                const valA = new Date(a.bookingDate);
                const valB = new Date(b.bookingDate);
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [bookings, actualSearchTerm, selectedStatus, sortConfig]);

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [actualSearchTerm, selectedStatus]);

    const handleScanResult = async (bookingId, booking = null, bookingStatus = null) => {
        console.log("Booking:", booking);
        console.log("BookingStatus:", bookingStatus);

        try {
            const parsedBookingId = parseInt(bookingId, 10);
            if (isNaN(parsedBookingId)) {
                throw new Error('bookingId không hợp lệ');
            }

            const currentBooking = bookings.find(booking => booking.bookingID === parsedBookingId);
            if (!currentBooking) {
                throw new Error('Không tìm thấy booking với ID này');
            }

            if (bookingStatus === null || bookingStatus === undefined) {
                throw new Error('Trạng thái booking không hợp lệ');
            }

            if (bookingStatus === BookingStatus.InProgress) {
                if (currentBooking.status !== BookingStatus.Confirmed) {
                    throw new Error('Không thể check-in');
                }
                const bookingCheckInDate = new Date(currentBooking.bookingDetails[0]?.checkInDate);
                const today = new Date();
                bookingCheckInDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                if (today < bookingCheckInDate) {
                    throw new Error('Chỉ có thể check-in từ ngày nhận phòng trở đi');
                }
            }

            if (bookingStatus === BookingStatus.Completed) {
                if (currentBooking.status !== BookingStatus.InProgress) {
                    throw new Error('Không thể check-out');
                }
            }
            const bookingData = {
                bookingId: parsedBookingId,
                status: bookingStatus,
                paymentStatus: currentBooking.paymentStatus
            };
            console.log("Sending data:", bookingData);
            const response = await bookingAPI.updateBookingStatus(
                bookingData.bookingId,
                bookingData.status,
                bookingData.paymentStatus
            );

            const messageStatus = { 1: "Xác nhận thành công", 2: "Check-in thành công", 3: "Check-out thành công", 4: "Hủy thành công", 5: "Chấp nhận hoàn tiền thành công" }

            toast.success(messageStatus?.[bookingStatus], {
                id: 'check-in-success',
                style: {
                    borderRadius: '10px',
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #6EE7B7'
                },
            });
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.bookingID === parsedBookingId
                        ? { ...booking, status: bookingStatus }
                        : booking
                )
            );
            setIsScannerOpen(false);
            return true;
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi check-in', {
                id: 'check-in-error',
                style: {
                    borderRadius: '10px',
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5'
                },
            });
            throw error;
        }
    };
    const handleViewBooking = async (bookingId) => {
        navigate(`/owner/homestays/${homestayId}/bookings/${bookingId}`);

    };

    const handleRefund = async (bookingId, homestayId) => {
        try {
            const userInfoString = localStorage.getItem('userInfo');
            let accountID;
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                accountID = userInfo.AccountID;
            } else {
                throw new Error('Không tìm thấy userInfo trong localStorage');
            }
            setIsLoading(true);
            localStorage.setItem('currentBookingInfo', JSON.stringify({
                bookingId,
                homestayId
            }));

            const response = await bookingAPI.processVnPayRefund(bookingId, homestayId, accountID);
            console.log('Response từ API VNPay:', response);
            if (response) {
                window.location.href = response;
            }
        } catch (error) {
            console.error('Error processing VNPay refund:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchBookings();
        toast.success('Đã làm mới danh sách đặt phòng', {
            id: 'refresh-success',
            style: {
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #6EE7B7'
            },
        });
    };

    const handleRequestCancelToAdmin = async (bookingId) => {
        // console.log(bookingId);
        try {
            const response = await bookingAPI.requestCancelToAdmin(bookingId);
            if (response?.statusCode === 200) {
                toast.success('Đã yêu cầu hủy')
                fetchBookings();
            } else {
                toast.error('Hủy không thành công')
            }
        } catch (error) {
            console.log(error);
        }

    }

    const handleRequestRefundToAdmin = async (bookingId) => {
        // console.log(bookingId);
        try {
            const response = await bookingAPI.requestRefundToAdmin(bookingId)
            if (response?.statusCode === 200) {
                toast.success('Chấp nhận hoàn tiền thành công')
                fetchBookings();
            } else {
                toast.error('Chấp nhận hoàn tiền thất bại')
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleStartChat = async (customerId, homestayId) => {
        try {
            const response = await chatAPI.createConversation(customerId, homestayId);
            console.log(response.data.conversationID);
            localStorage.setItem('selectedConversationId', response.data.conversationID);
            navigate(`/owner/homestays/${homestayId}/chat`);
            toast.success('Đã tạo cuộc trò chuyện mới');
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Không thể tạo cuộc trò chuyện');
        }
    };

    const TableHeader = ({ label, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th
                onClick={() => handleSort(sortKey)}
                className="px-6 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
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
        { label: 'Tổng số đặt phòng', value: bookings.length, color: 'bg-blue-500', icon: <FaCalendarAlt className="w-6 h-6" /> },
        // { label: 'Đang ở', value: bookings.filter(b => b.status === BookingStatus.InProgress).length, color: 'bg-green-500', icon: <FaUser className="w-6 h-6" /> },
        { label: 'Chờ nhận phòng', value: bookings.filter(b => b.status === BookingStatus.Confirmed).length, color: 'bg-indigo-500', icon: <FaCheck className="w-6 h-6" /> },
        { label: 'Chờ xác nhận', value: bookings.filter(b => b.status === BookingStatus.Pending).length, color: 'bg-yellow-500', icon: <FaCalendarAlt className="w-6 h-6" /> }
    ], [bookings]);
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
                            Quản lý đặt phòng {bookings[0]?.homestayName}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý tất cả các đặt phòng của khách hàng
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
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white 
                            font-medium rounded-lg transition-colors shadow-sm hover:shadow-lg hover:shadow-primary/20"
                        >
                            <FaQrcode className="w-4 h-4" /> Quét QR Check-in
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
            />

            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="w-24 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('bookingDate')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Ngày đặt
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'bookingDate' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'bookingDate' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-32 px-4 py-3 text-left">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                            Mã đặt phòng
                                        </span>
                                    </th>
                                    <th className="w-48 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('customerName')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Khách hàng
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'customerName' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'customerName' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-24 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('homestayName')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Căn thuê
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'homestayName' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'homestayName' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-28 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('checkInDate')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Nhận phòng
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'checkInDate' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'checkInDate' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-28 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('checkOutDate')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Trả phòng
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'checkOutDate' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'checkOutDate' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-32 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Trạng thái
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'status' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'status' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-28 px-4 py-3 text-left cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                        onClick={() => handleSort('paymentStatus')}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                Thanh toán
                                            </span>
                                            <div className={`transition-colors ${sortConfig.key === 'paymentStatus' ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {sortConfig.key === 'paymentStatus' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <FaSortAmountUp className="w-4 h-4" />
                                                        : <FaSortAmountDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="w-20 px-4 py-3 text-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedBookings.map((booking) => {
                                    const bookingDetail = booking.bookingDetails[0] || {};
                                    const bookingStatusInfo = bookingStatusConfig[booking.status];
                                    const paymentStatusInfo = paymentStatusConfig[booking.paymentStatus];
                                    return (
                                        <motion.tr
                                            key={booking.bookingID}
                                            variants={cardVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit={{ opacity: 0, y: -20 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="w-24 px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(booking.bookingDate)}
                                                </span>
                                            </td>
                                            <td className="w-32 px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={booking?.bookingCode}>
                                                    {booking?.bookingCode}
                                                </div>
                                            </td>
                                            <td className="w-48 px-4 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={booking.account.name}>
                                                        {booking.account.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate" title={booking.account.email}>
                                                        {booking.account.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="w-24 px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate block" title={bookingDetail.homeStayRentals?.name || 'N/A'}>
                                                    {bookingDetail.homeStayRentals?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="w-28 px-4 py-4 whitespace-nowrap">
                                                {bookingDetail.checkInDate && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatDate(bookingDetail.checkInDate)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="w-28 px-4 py-4 whitespace-nowrap">
                                                {bookingDetail.checkOutDate && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatDate(bookingDetail.checkOutDate)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="w-32 px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bookingStatusInfo.color}`}>
                                                    {bookingStatusInfo.text}
                                                </span>
                                            </td>
                                            <td className="w-28 px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}>
                                                    {paymentStatusInfo.text}
                                                </span>
                                            </td>
                                            <td className="w-20 px-4 py-4 whitespace-nowrap text-center">
                                                <ActionDropdown
                                                    booking={booking}
                                                    homestayId={homestayId}
                                                    handleViewBooking={handleViewBooking}
                                                    handleRefund={handleRefund}
                                                    handleRequestCancelToAdmin={handleRequestCancelToAdmin}
                                                    handleRequestRefundToAdmin={handleRequestRefundToAdmin}
                                                    handleScanResult={handleScanResult}
                                                    handleStartChat={() => handleStartChat(booking.accountID, homestayId)}
                                                />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Empty State */}
                        <AnimatePresence>
                            {filteredBookings.length === 0 && (
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
                                        Không tìm thấy đặt phòng
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

            {isScannerOpen && (
                <QRScannerModal
                    onClose={() => setIsScannerOpen(false)}
                    onScanSuccess={handleScanResult}
                />
            )}
        </motion.div>
    );
};

export default BookingList;