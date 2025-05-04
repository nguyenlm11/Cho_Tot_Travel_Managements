import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import changeRoomAPI from '../../services/api/changeRoomAPI';
import roomAPI from '../../services/api/roomAPI';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useParams } from 'react-router-dom';

export const ChangeRoomModal = ({ booking, isOpen, onClose, staffIdAccount }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { id: homestayId } = useParams();
    const [selectRoomChangeTo, setSelectRoomChangeTo] = useState('0');
    const [selectRoomChangeFrom, setSelectRoomChangeFrom] = useState('0');
    const [roomAvailableList, setRoomAvailableList] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSelectRoomChangeTo('0')
            setSelectRoomChangeFrom('0')
            setRoomAvailableList([])
        }
    }, [isOpen])

    useEffect(() => {
        if (selectRoomChangeTo != '0') {

            fetchAvailableAllRooms();
        }
    }, [selectRoomChangeTo])

    const fetchAvailableAllRooms = async () => {
        const bookingDetail = booking?.bookingDetails?.find(bd => bd?.roomID == selectRoomChangeTo);
        const response = await roomAPI.getRoomsByHomestayID(homestayId, bookingDetail?.checkInDate, bookingDetail?.checkOutDate);
        setRoomAvailableList(response?.data?.filter(room => room?.isActive && !room?.isUsed));
    }

    const handleChangeRoom = () => {
        if (selectRoomChangeTo == 0) {
            toast.error("Vui lòng chọn phòng cần đổi");
            return;
        }

        if (selectRoomChangeFrom == 0) {
            toast.error("Vui lòng chọn phòng đổi");
            return;
        }
        handleConfirmChange();
    }

    const handleConfirmChange = async () => {
        const loadingToast = toast.loading('Đang chuyển phòng...');
        const roomChange = roomAvailableList.find(room => room?.roomID == selectRoomChangeFrom);
        const bookingDetails = booking?.bookingDetails?.map(bd => {
            const bookingDetail = {
                bookingDetailID: bd?.bookingDetailID,
                homeStayTypeID: bd?.homeStayRentalID,
                roomTypeID: bd?.rooms?.roomTypesID,
                roomID: bd?.roomID,
                checkInDate: bd?.checkInDate,
                checkOutDate: bd?.checkOutDate,
            }
            if (bd?.roomID == selectRoomChangeTo) {
                return { ...bookingDetail, roomTypeID: roomChange?.roomTypesID, roomID: roomChange?.roomID }
            }
            return bookingDetail;
        });

        const data = {
            numberOfChildren: booking?.numberOfChildren,
            numberOfAdults: booking?.numberOfAdults,
            accountID: booking?.accountID,
            bookingDetails: bookingDetails
        }
        // console.log(data);
        // console.log(booking);

        const response = await changeRoomAPI.changeRoom(booking?.bookingID, data);
        if (response.statusCode === 200) {
            toast.dismiss(loadingToast);
            toast.success('Chuyển phòng thành công!');
            onClose();
        } else {
            throw new Error(response.message || "Chuyển phòng thất bại");
        }
    };
    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-2xl font-bold mb-4">Thay đổi phòng</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Phòng cần thay đổi</label>
                                <select
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => {
                                        setSelectRoomChangeTo(e.target.value);
                                    }}
                                    value={selectRoomChangeTo}
                                >
                                    <option value={'0'}>
                                        Chọn phòng cần đổi...
                                    </option>
                                    {booking?.bookingDetails?.map(bd => (<option value={bd?.rooms?.roomID} key={bd?.roomID}>
                                        {bd?.rooms?.roomNumber}
                                    </option>))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Chuyển qua phòng mới</label>
                                <select
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => {
                                        setSelectRoomChangeFrom(e.target.value);
                                    }}
                                    value={selectRoomChangeFrom}
                                >
                                    <option value={'0'}>
                                        Chọn phòng mới...
                                    </option>
                                    {roomAvailableList.map(room => (<option value={room?.roomID} key={room?.roomID}>
                                        {room?.roomNumber}
                                    </option>))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleChangeRoom}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                       flex items-center gap-2"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl"
                        >
                            <div className="text-center mb-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                    <svg
                                        className="h-6 w-6 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Xác nhận cập nhật
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Bạn có chắc chắn muốn cập nhật thông tin nhân viên này?
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmChange}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                       flex items-center gap-2"
                                >
                                    <span>Xác nhận</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
