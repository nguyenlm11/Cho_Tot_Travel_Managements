import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import staffAPI from '../../services/api/staffAPI';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import homestayAPI from '../../services/api/homestayAPI';
import { useNavigate } from 'react-router-dom';



export const AddStaffAccountModal = ({ fetchStaffs, isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [homestays, setHomestays] = useState([]);
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

  const handleCreateStaff = async () => {
    if (!validateForm()) {
      return;
    }
    // Hiển thị popup xác nhận thay vì window.confirm
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const formData = {
      ...newStaff,
      accountID: userInfo.AccountID,
      homeStayID: newStaff.homeStayID,
    }
    try {
      const response = await staffAPI.createStaffAccount(formData);
      if (response.statusCode === 200) {
        toast.success('Nhân viên mới đã được thêm thành công!');
        setShowConfirmModal(false);
        onClose();
        fetchStaffs();
      } else if (response.statusCode === 409) {
        toast.error('Tài khoản đã tồn tại ở homestay đã chọn!');
      }
    } catch (error) {
      toast.error('Không thể thêm nhân viên: ' + (error.message || 'Có lỗi xảy ra'));
    }
  };

  const validateForm = () => {
    // Hàm kiểm tra chuỗi chỉ chứa khoảng trắng
    const isOnlyWhitespace = (str) => {
      return str.trim().length === 0;
    };

    // Kiểm tra email
    if (!newStaff.email || isOnlyWhitespace(newStaff.email)) {
      toast.error('Email không được để trống hoặc chỉ chứa khoảng trắng!');
      return false;
    }
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaff.email)) {
      toast.error('Email không đúng định dạng!');
      return false;
    }

    // Kiểm tra username
    if (!newStaff.userName || isOnlyWhitespace(newStaff.userName)) {
      toast.error('Tên tài khoản không được để trống hoặc chỉ chứa khoảng trắng!');
      return false;
    }

    // Kiểm tra password
    if (!newStaff.password || isOnlyWhitespace(newStaff.password)) {
      toast.error('Mật khẩu không được để trống hoặc chỉ chứa khoảng trắng!');
      return false;
    }
    // Kiểm tra độ dài mật khẩu
    if (newStaff.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return false;
    }

    // Kiểm tra họ tên
    if (!newStaff.name || isOnlyWhitespace(newStaff.name)) {
      toast.error('Họ và tên không được để trống hoặc chỉ chứa khoảng trắng!');
      return false;
    }

    // Kiểm tra số điện thoại
    if (!newStaff.phone || isOnlyWhitespace(newStaff.phone)) {
      toast.error('Số điện thoại không được để trống hoặc chỉ chứa khoảng trắng!');
      return false;
    }
    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(newStaff.phone)) {
      toast.error('Số điện thoại không đúng định dạng! (VD: 0912345678 hoặc +84912345678)');
      return false;
    }

    // Kiểm tra địa chỉ
    if (!newStaff.address || isOnlyWhitespace(newStaff.address)) {
      toast.error('Địa chỉ không được để trống hoặc chỉ chứa khoảng trắng!');
      return false;
    }

    // Kiểm tra homestay
    if (!newStaff.homeStayID) {
      toast.error('Vui lòng chọn Homestay!');
      return false;
    }

    return true;
  };



  useEffect(() => {
    fetchOwnerHomestays();
  }, []);


  const navigate = useNavigate();
  const fetchOwnerHomestays = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo?.AccountID) {
        navigate('/login');
        return;
      }
      const response = await homestayAPI.getHomestaysByOwner(userInfo.AccountID);
      console.log(response.data);
      setHomestays(response.data);
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Thêm nhân viên mới</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium">Homestay</label>
                <select
                  value={newStaff.homeStayID}
                  onChange={(e) => setNewStaff({ ...newStaff, homeStayID: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Chọn Homestay</option>
                  {homestays?.map((homestay) => (
                    <option key={homestay.homeStayID} value={homestay.homeStayID}>
                      {homestay.name}
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="block text-sm font-medium">Địa chỉ</label>
                <input
                  type="text"
                  value={newStaff.address}
                  onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2  dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập địa chỉ..."
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

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateStaff}
                  className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Thêm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-6 w-6 text-yellow-600"
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
                Xác nhận thêm nhân viên
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bạn có chắc chắn muốn thêm nhân viên mới này?
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
                onClick={handleConfirmCreate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <span>Xác nhận</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </>

  )

}
