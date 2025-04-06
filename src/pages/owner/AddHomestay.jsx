import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaCloudUploadAlt, FaTrash, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import homestayAPI from '../../services/api/homestayAPI';

const API_KEY = "MdlDIjhDKvUnozmB9NJjiW4L5Pu5ogxX";
const BASE_URL = "https://mapapis.openmap.vn/v1/autocomplete";

const AddHomestay = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    longitude: 0,
    latitude: 0,
    rentalType: 1,
    area: '',
    accountId: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeout = useRef(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.AccountID) {
      setFormData(prev => ({
        ...prev,
        accountId: userInfo.AccountID
      }));
    } else {
      toast.error('Không tìm thấy thông tin tài khoản');
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (name === 'address') {
      searchAddress(value);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Chỉ được tải lên tối đa 5 ảnh');
      return;
    }
    if (files.length > 0) {
      setErrors(prev => ({ ...prev, images: null }));
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviewImages(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    if (newImages.length === 0) {
      setErrors(prev => ({ ...prev, images: 'Vui lòng tải lên ít nhất một hình ảnh' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Tên homestay không được để trống';
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }
    if (!formData.address || !formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }
    if (formData.images.length === 0) {
      newErrors.images = 'Vui lòng tải lên ít nhất một hình ảnh';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin và không để trống');
      return;
    }
    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const sanitizedData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
      };

      await homestayAPI.createHomestay(sanitizedData);
      toast.success('Tạo homestay thành công!');
      navigate('/owner/homestays');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo homestay');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const cancelSubmit = () => {
    setIsModalOpen(false);
  };

  const searchAddress = async (query) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: { text: query, apikey: API_KEY, size: 6 }
        });
        setSearchResults(response.data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching address:', error);
      }
    }, 300);
  };

  const handleSelectAddress = (result) => {
    const { label } = result.properties;
    const { region } = result.properties;
    const [lng, lat] = result.geometry.coordinates;
    setFormData(prev => ({
      ...prev,
      address: label,
      area: region,
      longitude: lng,
      latitude: lat,
    }));
    setShowSuggestions(false);
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: null }));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {/* Back button and title section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/owner/homestays')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors py-2 px-4"
          >
            <FaArrowLeft className="mr-2" />
            <span>Quay lại danh sách homestay</span>
          </button>
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thêm homestay mới
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Điền thông tin để tạo homestay mới cho hệ thống của bạn
          </p>
        </div>
      </div>

      {/* Main form */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-primary/10 dark:bg-primary/5 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
              <FaHome className="text-primary mr-2" />
              Thông tin homestay
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Thông tin cơ bản
                  </h3>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên homestay <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên homestay"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Mô tả chi tiết về homestay này..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Location Information */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Thông tin vị trí
                  </h3>

                  {/* Address */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-gray-400" />
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ của homestay"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}

                    {/* Address suggestions */}
                    <AnimatePresence>
                      {showSuggestions && searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto"
                        >
                          {searchResults.map((result, index) => (
                            <div
                              key={index}
                              className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors"
                              onClick={() => handleSelectAddress(result)}
                            >
                              <FaMapMarkerAlt className="text-primary" />
                              <span className="text-gray-700 dark:text-gray-200 truncate">
                                {result.properties.label}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Images */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Hình ảnh
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hình ảnh homestay <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <FaCloudUploadAlt className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Kéo thả hoặc click để tải ảnh lên
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Hỗ trợ JPG, PNG, WEBP (Tối đa 5 ảnh)
                      </p>
                    </div>
                    {errors.images && (
                      <p className="mt-1 text-sm text-red-500">{errors.images}</p>
                    )}
                  </div>

                  {/* Preview Images */}
                  {previewImages.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Xem trước ({previewImages.length} ảnh)
                        </h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                          {previewImages.length}/5 ảnh
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {previewImages.map((img, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden h-32 border border-gray-200 dark:border-gray-700">
                            <img
                              src={img}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1.5 bg-red-500 rounded-full text-white"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/owner/homestays')}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    <span>Thêm homestay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl"
            >
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-200 text-green-600 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Xác nhận thêm mới
                </h3>
              </div>
              <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">
                Bạn có chắc chắn muốn thêm homestay mới?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors min-w-[100px]"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors min-w-[100px] flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddHomestay;