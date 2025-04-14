import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import staffAPI from '../../services/api/staffAPI';
import { IoEye, IoEyeOff } from 'react-icons/io5';



export const EditStaffAccountModal = ({ fetchStaffs, isOpen, onClose, staffIdAccount }) => {
    // const [isOpen, setIsOpenClose] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


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
        // console.log(staffIdAccount);
        fetchStaffByID();
    }, [staffIdAccount])


    const handleEditStaff = async () => {
        if (!validateForm()) {
            return;
        }
        const confirmAdd = window.confirm("Bạn có chắc chắn muốn chỉnh sửa nhân viên mới?");
        if (confirmAdd) {
            try {
                // Thay thế bằng API call thực tế của bạn
                const formatData = {
                    email: newStaff.email.trim(),
                    name: newStaff.name.trim(),
                    phone: newStaff.phone.trim(),
                    address: newStaff.address.trim(),
                }
                const response = await staffAPI.updateStaffAccount(staffIdAccount, formatData);
                if (response.statusCode === 200) {
                    toast.success('Nhân viên mới đã được chỉnh sửa thành công!');
                    onClose();
                    fetchStaffs();
                } else if (response.statusCode === 409) {
                    toast.error('Không tìm thấy hồ sơ nhân viên!');
                }
            } catch (error) {
                toast.error('Không thể chỉnh sửa nhân viên: ' + (error.message || 'Có lỗi xảy ra'));
            }
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
            {/* Modal for Creating Staff */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-2xl font-bold mb-4">Thêm nhân viên mới</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Họ và tên</label>
                                <input
                                    type="text"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập họ và tên..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập email..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập số điện thoại..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Địa chỉ</label>
                                <input
                                    type="text"
                                    value={newStaff.address}
                                    onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập địa chỉ..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => onClose()}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleEditStaff}
                                    className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </>

    )

}
