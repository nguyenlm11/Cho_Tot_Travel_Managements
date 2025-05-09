import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import bookingAPI from '../../services/api/bookingAPI';
import { FaUser, FaMoneyBillWave, FaInfoCircle, FaHotel, FaBed, FaReceipt, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { formatPrice, formatDate } from '../../utils/utils';
import { FaHouse } from 'react-icons/fa6';

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
    [PaymentStatus.FullyPaid]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Đã trả đủ' },
    [PaymentStatus.Refunded]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Đã hoàn tiền' }
};

// const paymentMethodConfig = {
//     0: {
//         icon: FaMoneyBillWave,
//         color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100',
//         text: 'Tiền mặt'
//     },
//     1: {
//         icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s',
//         color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100',
//         text: 'VNPay'
//     }
// };

export const BookingDetail = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await bookingAPI.getBookingsByID(bookingId);
                setBooking(response.data);
            } catch (error) {
                console.error('Error fetching booking:', error);
            }
        };

        fetchBooking();
    }, [bookingId]);

    if (!booking) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full flex flex-col items-center justify-center mt-9 bg-white dark:bg-gray-800"
                style={{ minHeight: '700px' }} // Có thể điều chỉnh minHeight nếu muốn
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
                stiffness: 100,
                damping: 10,
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
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const StatusBadge = ({ status, config }) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config[status]?.color}`}>
            {config[status]?.text}
        </span>
    );

    const InfoCard = ({ icon: Icon, title, children, className = '' }) => (
        <motion.div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
            variants={itemVariants}
        >
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                <Icon className="mr-2 text-blue-500" />
                {title}
            </h3>
            {children}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-5xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header with Booking Status */}
                <motion.div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Đơn đặt phòng #{booking.bookingID}</h2>
                            <p className="mt-2 text-blue-100">Ngày đặt: {formatDate(booking.bookingDate)}</p>
                        </div>
                        <StatusBadge status={booking.status} config={statusConfig} />
                    </div>
                </motion.div>

                {/* HomeStay Information */}
                <InfoCard icon={FaHotel} title="Thông tin HomeStay">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white flex items-center">
                                <p>
                                    <FaHouse className="mr-2" color='green' />
                                </p>
                                <p>
                                    {booking.homeStay.name}
                                </p>
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                <div className='flex items-center gap-2'>
                                    <span>
                                        <FaMapMarkerAlt color='green' />
                                    </span>
                                    <span>
                                        {booking.homeStay.address}
                                    </span>
                                </div>

                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                                <span>
                                    <FaInfoCircle color='green' />
                                </span>
                                <span>
                                    {booking.homeStay.description}
                                </span>

                            </p>
                        </div>
                        {booking.homeStay.imageHomeStays?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {booking.homeStay.imageHomeStays.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`HomeStay ${index + 1}`}
                                        className="rounded-lg object-cover h-32 w-full"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </InfoCard>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard icon={FaUser} title="Thông tin khách hàng">
                        <div className="space-y-3">
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold text-gray-800 dark:text-white">Tên:</span> {booking.account.name}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold text-gray-800 dark:text-white">Email:</span> {booking.account.email}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold text-gray-800 dark:text-white">Số điện thoại:</span> {booking.account.phone}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold text-gray-800 dark:text-white">Địa chỉ:</span> {booking.account.address}
                            </p>
                        </div>
                    </InfoCard>

                    {/* Payment Information */}
                    <InfoCard icon={FaMoneyBillWave} title="Thông tin thanh toán">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                <span>Tổng tiền thuê:</span>
                                <span className="font-semibold text-gray-800 dark:text-white">{formatPrice(booking.total)}</span>
                            </div>
                            {/* <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                <span>Tổng tiền dịch vụ:</span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                    {formatPrice(booking.bookingServices.reduce((acc, service) => acc + service.total, 0))}
                                </span>
                            </div> */}
                            {(booking?.paymentServiceStatus === 2 && booking?.paymentStatus === 0) && (
                                <>
                                    <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                        <span>Tiền đặt cọc:</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(booking.bookingDeposit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                        <span>Số tiền còn lại:</span>
                                        <span className="font-semibold text-red-600 dark:text-red-400">{formatPrice(booking.remainingBalance)}</span>
                                    </div>
                                </>
                            )}
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                                    <span>Trạng thái thanh toán:</span>
                                    <StatusBadge status={booking.paymentStatus} config={paymentStatusConfig} />
                                </div>
                            </div>
                        </div>
                    </InfoCard>
                </div>

                {/* Room Details */}
                <InfoCard icon={FaBed} title="Chi tiết phòng">
                    {booking.bookingDetails.map((detail, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 last:mb-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    {!detail?.rooms?.roomNumber ? (
                                        <>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold text-gray-800 dark:text-white">Loại thuê: nguyên căn</span>
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold text-gray-800 dark:text-white">Loại thuê: theo phòng</span>
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold text-gray-800 dark:text-white">Số phòng:</span> {detail?.rooms?.roomNumber}
                                            </p>
                                        </>
                                    )}

                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold text-gray-800 dark:text-white">Ngày nhận phòng:</span> {formatDate(detail.checkInDate)}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold text-gray-800 dark:text-white">Ngày trả phòng:</span> {formatDate(detail.checkOutDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold text-gray-800 dark:text-white">Giá thuê:</span> {formatPrice(detail.rentPrice)}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold text-gray-800 dark:text-white">Tổng tiền:</span> {formatPrice(detail.totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </InfoCard>

                {/* Services */}
                {booking.bookingServices.length > 0 && (
                    <InfoCard icon={FaReceipt} title="Dịch vụ đi kèm">
                        {booking.bookingServices.map((service, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 last:mb-0">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Dịch vụ #{service.bookingServicesID}</h4>
                                        <StatusBadge status={service.paymentServiceStatus} config={paymentStatusConfig} />
                                    </div>

                                    {service.bookingServicesDetails.map((detail, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-700/50 rounded p-3">
                                            <p className="font-medium text-gray-800 dark:text-white">{detail.services.servicesName}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                <p>Số lượng: {detail.quantity}</p>
                                                <p>Đơn giá: {formatPrice(detail.unitPrice)}</p>
                                                <p>Tổng tiền: {formatPrice(detail.totalAmount)}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                            <span>Tổng tiền dịch vụ:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{formatPrice(service.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </InfoCard>
                )}
            </motion.div>
        </div>
    );
};

