import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import staffAPI from '../../services/api/staffAPI';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export const EditStaffAccountModal = ({ fetchStaffs, isOpen, onClose, staffIdAccount }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [newStaff, setNewStaff] = useState({
        userName: '',
        email: '',
        name: '',
        address: '',
        phone: '',
        password: '',
        accountID: '',
        homeStayID: '',
    });

    useEffect(() => {
        fetchStaffByID();
    }, [staffIdAccount])

    const handleEditStaff = () => {
        if (!validateForm()) {
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmEdit = async () => {
        try {
            const formatData = {
                email: newStaff.email.trim(),
                name: newStaff.name.trim(),
                phone: newStaff.phone.trim(),
                address: newStaff.address.trim(),
            }
            const response = await staffAPI.updateStaffAccount(staffIdAccount, formatData);
            if (response.statusCode === 200) {
                toast.success('Nhân viên đã được cập nhật thành công!');
                setShowConfirmModal(false);
                onClose();
                fetchStaffs();
            } else if (response.statusCode === 409) {
                toast.error('Không tìm thấy hồ sơ nhân viên!');
            }
        } catch (error) {
            toast.error('Không thể cập nhật nhân viên: ' + (error.message || 'Có lỗi xảy ra'));
        }
    };

    const validateForm = () => {
        if (!newStaff.email) {
            toast.error('Email không được để trống hoặc chỉ chứa khoảng trắng!');
            return false;
        }
        if (!newStaff.name) {
            toast.error('Họ và tên không được để trống hoặc chỉ chứa khoảng trắng!');
            return false;
        }
        if (!newStaff.phone) {
            toast.error('Số điện thoại không được để trống hoặc chỉ chứa khoảng trắng!');
            return false;
        }
        if (!newStaff.address) {
            toast.error('Địa chỉ không được để trống hoặc chỉ chứa khoảng trắng!');
            return false;
        }
        return true;
    };

    const fetchStaffByID = async () => {
        try {
            const response = await staffAPI.getStaffsByID(staffIdAccount);
            setNewStaff({
                email: response.data.email,
                name: response.data.staffName,
                phone: response.data.phone,
                address: response.data.address,
                homeStayID: response.data.homeStayID,
            })
        } catch (error) {
            console.log(error);
        }
    }

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
                            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa thông tin nhân viên</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Họ và tên</label>
                                <input
                                    type="text"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập họ và tên..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập email..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập số điện thoại..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Địa chỉ</label>
                                <input
                                    type="text"
                                    value={newStaff.address}
                                    onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập địa chỉ..."
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleEditStaff}
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
                                    onClick={handleConfirmEdit}
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
