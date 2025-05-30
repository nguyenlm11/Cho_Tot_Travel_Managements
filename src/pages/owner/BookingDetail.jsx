import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingAPI from '../../services/api/bookingAPI';
import { FaUser, FaMoneyBillWave, FaInfoCircle, FaHotel, FaBed, FaReceipt, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaHome, FaPhone, FaEnvelope, FaClock, FaUsers, FaChild, FaAddressBook } from 'react-icons/fa';
import { formatPrice, formatDate } from '../../utils/utils';

const BookingStatus = { Pending: 0, Confirmed: 1, InProgress: 2, Completed: 3, Cancelled: 4, NoShow: 5, Refund: 6, RequestCancelled: 7 };
const PaymentStatus = { Pending: 0, Deposited: 1, FullyPaid: 2, Refunded: 3 };

const statusConfig = {
    [BookingStatus.Pending]: { color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800', text: 'Chờ xác nhận' },
    [BookingStatus.Confirmed]: { color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800', text: 'Chờ nhận phòng' },
    [BookingStatus.InProgress]: { color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800', text: 'Đang phục vụ' },
    [BookingStatus.Completed]: { color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800', text: 'Đã trả phòng' },
    [BookingStatus.Cancelled]: { color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800', text: 'Đã hủy' },
    [BookingStatus.NoShow]: { color: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800', text: 'Chấp nhận hoàn tiền' },
    [BookingStatus.Refund]: { color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800', text: 'Yêu cầu hoàn tiền' },
    [BookingStatus.RequestCancelled]: { color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800', text: 'Yêu cầu hủy' }
};

const paymentStatusConfig = {
    [PaymentStatus.Pending]: { color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800', text: 'Chưa thanh toán' },
    [PaymentStatus.Deposited]: { color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800', text: 'Đã đặt cọc' },
    [PaymentStatus.FullyPaid]: { color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800', text: 'Đã trả đủ' },
    [PaymentStatus.Refunded]: { color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800', text: 'Đã hoàn tiền' }
};

export const BookingDetail = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true);
            try {
                const response = await bookingAPI.getBookingsByID(bookingId);
                setBooking(response.data);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mt-4">Đang tải thông tin...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <FaCalendarAlt className="mx-auto w-16 h-16" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Không tìm thấy thông tin đặt phòng
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Đặt phòng này không tồn tại hoặc đã bị xóa
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const StatusBadge = ({ status, config }) => (
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${config[status]?.color}`}>
            {config[status]?.text}
        </span>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Đơn đặt phòng: #{booking.bookingCode}
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaCalendarAlt className="mr-2" />
                                <span>Ngày đặt: {formatDate(booking.bookingDate)}</span>
                            </div>
                            <StatusBadge status={booking.status} config={statusConfig} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                    <FaHotel className="mr-2 text-green-600" />
                                    Thông tin HomeStay
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <FaHome className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Tên HomeStay</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{booking.homeStay.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <FaMapMarkerAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Địa chỉ</p>
                                            <p className="text-gray-900 dark:text-white">{booking.homeStay.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <FaInfoCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Mô tả</p>
                                            <p className="text-gray-900 dark:text-white">{booking.homeStay.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                    <FaBed className="mr-2 text-green-600" />
                                    Chi tiết phòng
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {booking.bookingDetails.map((detail, index) => (
                                        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border-l-4 border-green-500 shadow-sm">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                                                        <FaBed className="mr-2 text-green-600" />
                                                        {!detail?.rooms?.roomNumber ? 'Nguyên căn' : `Phòng ${detail?.rooms?.roomNumber}`}
                                                    </h4>

                                                    <div className="flex items-center gap-2">
                                                        <FaHome className="text-green-600 w-4 h-4" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Loại:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {!detail?.rooms?.roomNumber ? 'Nguyên căn' : detail?.rooms?.roomTypeName}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h5 className="font-semibold text-gray-900 dark:text-white">Thời gian</h5>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <FaCalendarAlt className="text-green-600 w-4 h-4" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Check-in:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {formatDate(detail.checkInDate)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <FaCalendarAlt className="text-green-600 w-4 h-4" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Check-out:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {formatDate(detail.checkOutDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-center items-center">
                                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border-2 border-green-200 dark:border-green-800">
                                                        <div className="flex items-center justify-center mb-2">
                                                            <FaMoneyBillWave className="text-green-600 w-5 h-5 mr-2" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền</span>
                                                        </div>
                                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                            {formatPrice(detail.totalAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {booking.bookingServices.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                        <FaReceipt className="mr-2 text-green-600" />
                                        Dịch vụ đi kèm
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {booking.bookingServices.map((service, index) => (
                                            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500 shadow-sm">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                                        <FaReceipt className="text-green-600 w-5 h-5" />
                                                        Mã dịch vụ: #{service.bookingServiceCode}
                                                    </h4>
                                                    <StatusBadge status={service.paymentServiceStatus} config={paymentStatusConfig} />
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {service.bookingServicesDetails.map((detail, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                            <div className="space-y-3">
                                                                <div className="border-b border-gray-200 dark:border-gray-600 pb-3">
                                                                    <h5 className="font-bold text-gray-900 dark:text-white text-lg">
                                                                        {detail.services.servicesName}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                        {detail.services.description}
                                                                    </p>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                                        <span className="text-gray-600 dark:text-gray-400">Số lượng:</span>
                                                                        <span className="font-semibold text-gray-900 dark:text-white ml-1">{detail.quantity}</span>
                                                                    </div>
                                                                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                                        <span className="text-gray-600 dark:text-gray-400">Số ngày:</span>
                                                                        <span className="font-semibold text-gray-900 dark:text-white ml-1">{detail.dayRent}</span>
                                                                    </div>
                                                                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                                        <span className="text-gray-600 dark:text-gray-400">Đơn giá:</span>
                                                                        <span className="font-semibold text-gray-900 dark:text-white ml-1">{formatPrice(detail.unitPrice)}</span>
                                                                    </div>
                                                                    <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                                                        <span className="text-gray-600 dark:text-gray-400">Tổng:</span>
                                                                        <span className="font-bold text-green-600 dark:text-green-400 ml-1">{formatPrice(detail.totalAmount)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Tổng tiền dịch vụ:</span>
                                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(service.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                    <FaUser className="mr-2 text-green-600" />
                                    Thông tin khách hàng
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                                            <FaUser className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{booking.account.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Khách hàng</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <FaPhone className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Điện thoại</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{booking.account.phone}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <FaEnvelope className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm break-all">{booking.account.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FaAddressBook className="w-4 h-4 text-green-600 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Địa chỉ</p>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{booking.account.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Số lượng khách</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <FaUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Người lớn</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-semibold">
                                        {booking.numberOfAdults}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <FaChild className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Trẻ em</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-semibold">
                                        {booking.numberOfChildren}
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Trạng thái thanh toán</p>
                                        <StatusBadge status={booking.paymentStatus} config={paymentStatusConfig} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết thanh toán</h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-l-4 border-green-500">
                                        <div className="text-center">
                                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                                                <FaMoneyBillWave className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng tiền thuê</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">Bao gồm tất cả phí</p>
                                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {formatPrice(booking.total)}
                                            </span>
                                        </div>
                                    </div>

                                    {booking.paymentStatus !== PaymentStatus.FullyPaid && (
                                        <>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border-l-4 border-blue-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                            <FaMoneyBillWave className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Tiền đặt cọc</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">Đã thanh toán</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                                        {formatPrice(booking.bookingDeposit)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg border-l-4 border-amber-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                            <FaMoneyBillWave className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Số tiền còn lại</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">Cần thanh toán</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                                                        {formatPrice(booking.remainingBalance)}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};