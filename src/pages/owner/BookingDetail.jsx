import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import bookingAPI from '../../services/api/bookingAPI';
import { FaUser, FaCalendar, FaClock, FaChild, FaUsers, FaMoneyBillWave, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import { formatPrice, formatDate } from '../../utils/utils';

// Thêm các cấu hình cho các loại trạng thái và phương thức thanh toán
const PaymentStatus = { Pending: 0, Deposited: 1, FullyPaid: 2, Refunded: 3 };
const paymentStatusConfig = {
    [PaymentStatus.Pending]: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-100', text: 'Chưa thanh toán' },
    [PaymentStatus.Deposited]: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'Đặt cọc' },
    [PaymentStatus.FullyPaid]: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Thanh toán đủ' },
    [PaymentStatus.Refunded]: { color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100', text: 'Đã hoàn tiền' }
};

const paymentMethodConfig = {
    'VNPay': { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100', text: 'VNPay' },
    'Cash': { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100', text: 'Tiền mặt' },
    // Thêm các phương thức thanh toán khác nếu cần
};

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
        return <div>Loading...</div>;
    }

    const {
        bookingID,
        bookingDate,
        expiredTime,
        numberOfChildren,
        numberOfAdults,
        // status,
        paymentStatus,
        totalRentPrice,
        total,
        bookingDeposit,
        remainingBalance,
        account,
        paymentMethod,
        bookingDetails,
        bookingServices,
    } = booking;

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-4xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
                    variants={itemVariants}
                >
                    <h2 className="text-3xl font-bold">Chi tiết đặt phòng #{bookingID}</h2>
                </motion.div>

                {/* Thông tin cơ bản */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                        <FaInfoCircle className="mr-2 text-blue-500" />
                        Thông tin đặt phòng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <p className='text-gray-600 dark:text-gray-400'><strong>Mã đặt phòng:</strong> {bookingID}</p>
                            <p className='text-gray-600 dark:text-gray-400'><strong>Ngày đặt:</strong> {formatDate(bookingDate)}</p>
                            <p className='text-gray-600 dark:text-gray-400'><strong>Thời gian hết hạn:</strong> {formatDate(expiredTime)}</p>
                            <p className='text-gray-600 dark:text-gray-400'><strong>Số trẻ em:</strong> {numberOfChildren}</p>
                            <p className='text-gray-600 dark:text-gray-400'><strong>Số người lớn:</strong> {numberOfAdults}</p>
                            {/* <p className='text-gray-600 dark:text-gray-400'><strong>Trạng thái:</strong> {status}</p> */}

                            <div className="flex items-center space-x-3 mb-3">
                                <span className="text-gray-700 dark:text-gray-400 font-bold min-w-[140px] flex items-center">
                                    Phương thức thanh toán:
                                </span>
                                <span className={`
                                    inline-flex items-center gap-2 px-3 py-1.5 
                                    rounded-full text-sm font-medium 
                                    transition-all duration-200 
                                    ${paymentMethodConfig[paymentMethod]?.color}
                                    shadow-sm hover:shadow-md
                                    transform hover:-translate-y-0.5
                                `}>
                                    {paymentMethod == '1' ? (
                                        <>
                                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s" alt="VNPay" className="w-4 h-4 object-contain" />
                                            <span>VNPay</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaMoneyBillWave className="w-4 h-4" />
                                            <span>Tiền mặt</span>
                                        </>
                                    )}
                                </span>
                            </div>

                            <p className='text-gray-600 dark:text-gray-400'>
                                <strong>Trạng thái thanh toán:</strong>{' '}
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[paymentStatus]?.color}`}>
                                    {paymentStatusConfig[paymentStatus]?.text}
                                </span>
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
                                <p className='text-gray-600 dark:text-gray-200 mb-3'><strong>Tổng giá thuê:</strong> {formatPrice(totalRentPrice)}</p>
                                {bookingServices.map((service, index) => (
                                    <p key={index} className='text-gray-600 dark:text-gray-200 mb-3'><strong>Tổng tiền dịch vụ:</strong> {formatPrice(service?.total)}</p>
                                ))}
                                <p className='text-gray-600 dark:text-gray-200 mb-3'><strong>Tổng cộng:</strong> {formatPrice(total)}</p>
                                <p className='text-gray-600 dark:text-gray-200 mb-3'><strong>Đặt cọc:</strong> {formatPrice(bookingDeposit)}</p>
                                <p className='text-gray-600 dark:text-gray-200 mb-3'><strong>Số dư còn lại:</strong> {formatPrice(remainingBalance)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Thông tin khách hàng */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                        <FaUser className="mr-2 text-blue-500" />
                        Thông tin khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Tên:</strong> {account.name}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Địa chỉ:</strong> {account.address}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Số điện thoại:</strong> {account.phone}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Email:</strong> {account.email}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Chi tiết thuê phòng */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                        <FaMoneyBillWave className="mr-2 text-blue-500" />
                        Chi tiết thuê phòng
                    </h3>
                    {bookingDetails.map((detail, index) => (
                        <div key={index} className="mb-4 p-4 bg-gray-50  dark:bg-gray-800 rounded-lg">
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Mã chi tiết thuê:</strong> {detail.bookingDetailID}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Giá đơn vị:</strong> {formatPrice(detail?.unitPrice)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Giá thuê:</strong> {formatPrice(detail?.rentPrice)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Ngày nhận phòng:</strong> {formatDate(detail?.checkInDate)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Ngày trả phòng:</strong> {formatDate(detail?.checkOutDate)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Tổng số tiền:</strong> {formatPrice(detail?.totalAmount)}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Dịch vụ đặt phòng */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                        <FaCreditCard className="mr-2 text-blue-500" />
                        Dịch vụ đặt phòng
                    </h3>
                    {bookingServices.map((service, index) => (
                        <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Mã dịch vụ:</strong> {service.bookingServicesID}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Ngày dịch vụ:</strong> {formatDate(service?.bookingServicesDate)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Tổng tiền dịch vụ:</strong> {formatPrice(service?.total)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Đặt cọc dịch vụ:</strong> {formatPrice(service?.bookingServiceDeposit)}</p>
                            <p className='text-gray-600 dark:text-gray-400 mb-3'><strong>Số dư dịch vụ còn lại:</strong> {formatPrice(service?.remainingBalance)}</p>

                            <p className='text-gray-600 dark:text-gray-400 mb-3'>
                                <strong>Trạng thái thanh toán dịch vụ:</strong>{' '}
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[service.paymentServiceStatus]?.color}`}>
                                    {paymentStatusConfig[service.paymentServiceStatus]?.text}
                                </span>
                            </p>

                            <div className="flex items-center space-x-3 mb-3 last:border-0">
                                <span className="text-gray-700 dark:text-gray-400 font-bold min-w-[180px] flex items-center">
                                    Phương thức thanh toán dịch vụ:
                                </span>
                                <span className={`
                                    inline-flex items-center gap-2 px-3 py-1.5 
                                    rounded-full text-sm font-medium 
                                    transition-all duration-200 
                                    ${paymentMethodConfig[service.paymentServicesMethod]?.color}
                                    shadow-sm hover:shadow-md
                                    transform hover:-translate-y-0.5
                                `}>
                                    {service.paymentServicesMethod == '1' ? (
                                        <>
                                            <img
                                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s"
                                                alt="VNPay"
                                                className="w-4 h-4 object-contain"
                                            />
                                            <span>VNPay</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaMoneyBillWave className="w-4 h-4" />
                                            <span>Tiền mặt</span>
                                        </>
                                    )}
                                </span>
                            </div>

                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

