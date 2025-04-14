import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import staffAPI from '../../services/api/staffAPI';
import { IoEye, IoEyeOff } from 'react-icons/io5';



export const AddStaffAccountModal = ({fetchStaffs, isOpen, onClose}) => {
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

  const handleCreateStaff = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);

    const formData = {
      ...newStaff,
      accountID: userInfo.AccountID,
      // homeStayID: .homeStayID,
    }
    console.log(formData);
    

    const confirmAdd = window.confirm("Bạn có chắc chắn muốn thêm nhân viên mới?");
    if (confirmAdd) {
      if (!newStaff.userName || !newStaff.email || !newStaff.name || !newStaff.phone || !newStaff.address) {
        toast.error('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      // try {
      //   // Thay thế bằng API call thực tế của bạn
      //   const response = await staffAPI.createStaffAccount(formData);
      //   if (response.statusCode === 201) {
      //     toast.success('Nhân viên mới đã được thêm thành công!');
      //     onClose();
      //     fetchStaffs();
      //   } else if (response.statusCode === 409) {
      //     toast.error('Tài khoản đã tồn tại!');
      //   }
      // } catch (error) {
      //   toast.error('Không thể thêm nhân viên: ' + (error.message || 'Có lỗi xảy ra'));
      // }
    }
  };



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
                <label className="block text-sm font-medium">Tên tài khoản</label>
                <input
                  type="text"
                  value={newStaff.userName}
                  onChange={(e) => setNewStaff({ ...newStaff, userName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập tên tài khoản..."
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
                <label className="block text-sm font-medium">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập mật khẩu..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <IoEyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <IoEye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
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
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateStaff}
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
