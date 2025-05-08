import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import bookingAPI from '../../services/api/bookingAPI';
import { FaUser, FaMoneyBillWave, FaInfoCircle, FaHotel, FaBed, FaReceipt, FaMapMarkerAlt } from 'react-icons/fa';
import { formatPrice, formatDate } from '../../utils/utils';
import { FaHouse } from 'react-icons/fa6';
import roomAPI from '../../services/api/roomAPI';
import { FaCalendarAlt } from 'react-icons/fa';


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

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await roomAPI.getBookingsByRoomID(roomID);
        const formatData = [];
        response.data.forEach(booking => {
          let data = { account: booking?.account, bookingID: booking?.bookingID };
          booking?.bookingDetails?.forEach(bd => {
            data = { ...data, ...bd };
          })
          formatData.push(data);
        })
        // console.log(formatData);

        setBooking(formatData);

      } catch (error) {
        console.error('Error fetching room booking:', error);
      }
    };

    fetchBooking();
  }, [roomID]);

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
          <div className="flex justify-center items-center" >
            <div>
              <h2 className="text-3xl font-bold text-white">
                Đơn đặt phòng
              </h2>
            </div>
            {/* <StatusBadge status={booking.status} config={statusConfig} /> */}
          </div>
        </motion.div>

        {/* HomeStay Information */}
        {/* <InfoCard icon={FaHotel} title="Thông tin HomeStay">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white flex items-center">
                <p>
                  <FaHouse className="mr-2" color='green' />
                </p>
                <p> */}
        {/* {booking.homeStay.name} */}
        {/* </p>
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <div className='flex items-center gap-2'>
                  <span>
                    <FaMapMarkerAlt color='green' />
                  </span>
                  <span> */}
        {/* {booking.homeStay.address} */}
        {/* </span>
                </div>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                <span>
                  <FaInfoCircle color='green' />
                </span>
                <span> */}
        {/* {booking.homeStay.description} */}
        {/* </span>
              </p>
            </div>
          </div>
        </InfoCard> */}

        {/* Customer Information */}

        {booking.map((infor, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={index}>
            <InfoCard icon={FaUser} title="Thông tin khách hàng">
              <div className="space-y-3" >
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Tên: </span>
                  {infor.account.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Email: </span>
                  {infor.account.email}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Số điện thoại: </span>
                  {infor.account.phone}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Địa chỉ: </span>
                  {infor.account.address}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Ngày check-in: </span>
                  {formatDate(infor.checkInDate)}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Ngày check-out: </span>
                  {formatDate(infor.checkOutDate)}
                </p>
              </div>
            </InfoCard>




            {/* Payment Information */}
            {/* {booking.map((infor, index) => ( */}
            <InfoCard icon={FaMoneyBillWave} title={`Đơn phòng số ${infor.bookingID}`} >

              <div className="space-y-3" key={index}>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Tên homestay: </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {infor?.homeStayRentals?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Loại thuê:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{infor?.homeStayRentals?.rentWhole == false ? "Theo phòng" : "Nguyên căn"}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>
                    Số Phòng:
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{infor?.rooms?.roomNumber}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <span>Giá thuê: </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {formatPrice(infor?.rentPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </InfoCard>
            {/* ))} */}
          </div>
        ))}


        {/* Room Details */}
        {/* <InfoCard icon={FaBed} title="Chi tiết phòng">
          {booking?.bookingDetails.map((detail, index) => (
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
                </div>
              </div>
            </div>
          ))}
        </InfoCard> */}
      </motion.div>
    </div>
  );
}
