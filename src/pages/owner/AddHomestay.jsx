import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaCloudUploadAlt, FaTrash, FaArrowLeft, FaCheck, FaBed, FaBath, FaUtensils, FaInfoCircle, FaUser, FaChild, FaUsers, FaTag, FaMoneyBillWave, FaDollarSign, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import homestayAPI from '../../services/api/homestayAPI';
// import homestayRentalAPI from '../../services/api/homestayrentalAPI';
import { FaWifi } from 'react-icons/fa6';
import axiosInstance from '../../services/config';
import cancelPolicyAPI from '../../services/api/cancelPolicyAPI';

const API_KEY = "MdlDIjhDKvUnozmB9NJjiW4L5Pu5ogxX";
const BASE_URL = "https://mapapis.openmap.vn/v1/autocomplete";
const PLACE_DETAIL_URL = "https://mapapis.openmap.vn/v1/place";

const AddHomestay = () => {
  // const [homestayId, setHomestayId] = useState(null);
  // const [rentalId, setRentalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewImagesStep2, setPreviewImagesStep2] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeout = useRef(null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user?.role === 'Staff') {
      navigate(`/owner/homestays/${user?.homeStayID}/dashboard`, { replace: true });
    }
  }, [location, navigate]);

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

  const [rentalData, setRentalData] = useState({
    Name: '',
    Description: '',
    HomeStayID: null,
    numberBedRoom: 1,
    numberBathRoom: 1,
    numberKitchen: 1,
    numberWifi: 1,
    Status: true,
    RentWhole: true,
    MaxAdults: 2,
    MaxChildren: 0,
    MaxPeople: 2,
    Images: [],
    pricingEntries: [{
      // unitPrice: 0,
      rentPrice: 0,
      startDate: "",
      endDate: "",
      isDefault: true,
      isActive: true,
      dayType: 0,
      description: "",
    }],
  });

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };


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
  const handleInputChangeStep2 = (e) => {
    let { name, value } = e.target;

    if (name === 'RentWhole') {
      value = value === "true" ? true : false;
    }

    setRentalData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
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

  const handleImageChangeStep2 = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Chỉ được tải lên tối đa 5 ảnh');
      return;
    }
    if (files.length > 0) {
      setErrors(prev => ({ ...prev, images: null }));
    }
    setRentalData(prev => ({ ...prev, Images: [...prev.Images, ...files] }));

    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviewImagesStep2(prev => [...prev, ...newPreviews]);
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

  const removeImagesStep2 = (index) => {
    const newPreviews = [...previewImagesStep2];
    newPreviews.splice(index, 1);
    setPreviewImagesStep2(newPreviews);
    const newImages = [...rentalData.Images];
    newImages.splice(index, 1);
    setRentalData(prev => ({
      ...prev,
      Images: newImages
    }));
    if (newImages.length === 0) {
      setErrors(prev => ({ ...prev, Images: 'Vui lòng tải lên ít nhất một hình ảnh' }));
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
    if (step === 1) {
      if (!validateForm()) {
        toast.error('Vui lòng điền đầy đủ thông tin và không để trống');
        return;
      }
      // setIsModalOpen(true);
      setStep(2);
    } else if (step === 2) {
      if (!validateRentalForm()) { // Thêm hàm validate cho form rental
        toast.error('Vui lòng điền đầy đủ thông tin phòng');
        return;
      }
      // Nếu chọn thuê nguyên căn thì chuyển sang step 3, nếu không thì submit luôn
      // if (rentalData.RentWhole) {
      setStep(3);
      // } else {
      // setIsModalOpen(true);
      // }
    } else if (step === 3) {
      if (!validatePricingForm()) { // Thêm hàm validate cho form pricing
        toast.error('Vui lòng điền đầy đủ thông tin giá');
        return;
      }
      setIsModalOpen(true);
    }
  };

  // const confirmSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     const sanitizedData = {
  //       ...formData,
  //       name: formData.name.trim(),
  //       description: formData.description.trim(),
  //       address: formData.address.trim(),
  //     };

  //     await homestayAPI.createHomestay(sanitizedData);
  //     toast.success('Tạo homestay thành công!');
  //     navigate('/owner/homestays');
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo homestay');
  //   } finally {
  //     setLoading(false);
  //     setIsModalOpen(false);
  //   }
  // };


  const confirmSubmit = async () => {
    setLoading(true);

    const handleFormatData = () => {
      return {
        ...rentalData,
        Name: formData.name.trim(),
        Description: formData.description.trim(),
        Address: formData.address.trim(),
        Images: formData.images,
        AccountID: formData.accountId,
        Longitude: formData.longitude,
        Latitude: formData.latitude,
        RentalType: formData.rentalType,
        Area: formData.area,
        RentalName: rentalData.Name,
        RentalDescription: rentalData.Description,
        RentalImages: rentalData.Images,
        // ...(rentalData.RentWhole && {
        Pricing: rentalData.pricingEntries[0],
        PricingJson: JSON.stringify(
          rentalData.pricingEntries.map(entry => ({
            // unitPrice: entry.unitPrice,
            rentPrice: entry.rentPrice,
            isDefault: entry.isDefault,
            isActive: entry.isActive,
            dayType: entry.dayType,
            description: entry.description || ""
          }))
        )
        // }
        // )
      }
    }
    try {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {

        setStep(3);

        const formatData = handleFormatData();
        // console.log(formatData);
        // const response = await homestayAPI.createHomestayWithRentalAndPricing(formatData);
        // if (response.statusCode === 201) {
        //   const dataPolicy = {
        //     dayBeforeCancel: 7,
        //     refundPercentage: 1,
        //     homeStayID: response?.data?.homeStay?.homeStayID
        //   }
        //   const responsePolicy = await cancelPolicyAPI.addCancelPolicy(dataPolicy);
        //   if (responsePolicy.statusCode === 201) {
        //     toast.success('Tạo homestay thành công!');
        //     navigate('/owner/homestays');
        //   }
        // }

      } else if (step === 3) {
        const formatData = handleFormatData();
        // console.log(formatData);
        const response = await homestayAPI.createHomestayWithRentalAndPricing(formatData);
        if (response.statusCode === 201) {
          const dataPolicy = {
            dayBeforeCancel: 7,
            refundPercentage: 1,
            homeStayID: response?.data?.homeStay?.homeStayID
          }
          const responsePolicy = await cancelPolicyAPI.addCancelPolicy(dataPolicy);
          if (responsePolicy.statusCode === 201) {
            toast.success('Tạo homestay thành công!');
            navigate('/owner/homestays');
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
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

  const handleSelectAddress = async (result) => {
    const { id } = result.properties;
    try {
      const detailResponse = await axiosInstance.get(PLACE_DETAIL_URL, {
        params: {
          format: 'osm',
          ids: id,
          apikey: API_KEY,
        }
      });
      const detail = detailResponse.data?.features?.[0];
      if (!detail) {
        console.error("Không tìm thấy thông tin chi tiết cho địa chỉ đã chọn.");
        return;
      }
      const { label, region } = detail.properties;
      const [lng, lat] = detail.geometry.coordinates;
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
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết địa chỉ:", error);
    }
  };

  const addPricingEntry = () => {
    setRentalData(prev => ({
      ...prev,
      pricingEntries: [
        ...prev.pricingEntries,
        { unitPrice: 0, rentPrice: 0, startDate: "", endDate: "", isDefault: true, isActive: true, dayType: 0, description: "" }
      ]
    }));
    toast.success('Đã thêm gói giá mới!');
  };

  const handlePricingChange = (index, field, value) => {
    setRentalData(prev => {
      const updatedPricingEntries = [...prev.pricingEntries];
      updatedPricingEntries[index] = {
        ...updatedPricingEntries[index],
        [field]: field === "rentPrice" || field === "dayType" ? Number(value) : value
        // [field]: field === "unitPrice" || field === "rentPrice" || field === "dayType" ? Number(value) : value
      };
      return { ...prev, pricingEntries: updatedPricingEntries };
    });
  };
  const removePricingEntry = (index) => {
    if (rentalData.pricingEntries.length === 1) {
      toast.error('Phải có ít nhất một mục giá.');
      return;
    }
    setRentalData(prev => ({
      ...prev,
      pricingEntries: prev.pricingEntries.filter((_, i) => i !== index)
    }));
    toast.success('Đã xóa gói giá!');
  };

  // Thêm các hàm validate cho từng form
  const validateRentalForm = () => {
    const newErrors = {};
    if (!rentalData.Name?.trim()) {
      newErrors.Name = 'Tên phòng không được để trống';
    }
    if (!rentalData.Description?.trim()) {
      newErrors.Description = 'Mô tả không được để trống';
    }
    // Thêm các validation khác cho rental form
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePricingForm = () => {
    const newErrors = {};
    rentalData.pricingEntries.forEach((entry, index) => {
      // if (entry.unitPrice <= 0) {
      //   newErrors[`unitPrice_${index}`] = 'Đơn giá phải lớn hơn 0';
      // }
      if (entry.rentPrice <= 0) {
        newErrors[`rentPrice_${index}`] = 'Giá thuê phải lớn hơn 0';
      }
      // Thêm các validation khác cho pricing form
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          {/* Progress bar */}
          <div className="hidden sm:flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
            <span className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
            <span>Thông tin Homestay</span>
            <span className="w-5 h-px bg-gray-300 dark:bg-gray-600"></span>
            <span className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
            <span>Thông tin căn thuê</span>
            <span className="w-5 h-px bg-gray-300 dark:bg-gray-600"></span>
            <span className={`w-3 h-3 rounded-full ${step === 3 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
            <span>Thông tin gói thuê</span>
          </div>

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
        {step === 1 && (
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
                        Địa chỉ <span className="text-red-500 ml-1">*</span>
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

                  <div className='text-red-500 text-sm  italic'>
                    Mặc định chính sách hoàn trả khi tạo homestay là 100% trong vòng 7 ngày
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              {/* <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
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
              </div> */}
            </form>
          </div>
        )}

        {step === 2 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Thông tin cơ bản
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên căn thuê <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="Name"
                    value={rentalData.Name}
                    onChange={handleInputChangeStep2}
                    placeholder="Nhập tên phòng thuê"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                {errors.Name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FaInfoCircle className="mr-1" /> {errors.Name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="Description"
                  value={rentalData.Description}
                  onChange={handleInputChangeStep2}
                  rows="3"
                  placeholder="Mô tả chi tiết về phòng thuê này..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {errors.Description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FaInfoCircle className="mr-1" /> {errors.Description}
                  </p>
                )}
              </div>

              {/* RentWhole Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại thuê <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <div className={`flex items-center p-3 rounded-lg border ${rentalData.RentWhole ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <input
                      type="radio"
                      id="rentWhole"
                      name="RentWhole"
                      value={true}
                      checked={rentalData.RentWhole === true}
                      onChange={handleInputChangeStep2}
                      className="mr-2"
                    />
                    <label htmlFor="rentWhole" className="cursor-pointer">
                      <span className="font-medium">Thuê nguyên căn</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Khách thuê toàn bộ không gian</p>
                    </label>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg border ${!rentalData.RentWhole ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <input
                      type="radio"
                      id="rentRoom"
                      name="RentWhole"
                      value={false}
                      checked={rentalData.RentWhole === false}
                      onChange={handleInputChangeStep2}
                      className="mr-2"
                    />
                    <label htmlFor="rentRoom" className="cursor-pointer">
                      <span className="font-medium">Thuê từng phòng</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Khách thuê từng phòng riêng biệt</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Facilities */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Tiện nghi riêng của căn
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaBed className="mr-1 text-gray-400" />
                    Phòng ngủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberBedRoom"
                    value={rentalData.numberBedRoom}
                    onChange={handleInputChangeStep2}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.numberBedRoom && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.numberBedRoom}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaBath className="mr-1 text-gray-400" />
                    Phòng tắm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberBathRoom"
                    value={rentalData.numberBathRoom}
                    onChange={handleInputChangeStep2}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.numberBathRoom && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.numberBathRoom}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaUtensils className="mr-1 text-gray-400" />
                    Phòng bếp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberKitchen"
                    value={rentalData.numberKitchen}
                    onChange={handleInputChangeStep2}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.numberKitchen && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.numberKitchen}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaWifi className="mr-1 text-gray-400" />
                    Wifi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberWifi"
                    value={rentalData.numberWifi}
                    onChange={handleInputChangeStep2}
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.numberWifi && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.numberWifi}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guest Capacity */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Sức chứa
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaUser className="mr-1 text-gray-400" />
                    Người lớn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="MaxAdults"
                    value={rentalData.MaxAdults}
                    onChange={handleInputChangeStep2}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.MaxAdults && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.MaxAdults}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaChild className="mr-1 text-gray-400" />
                    Trẻ em <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="MaxChildren"
                    value={rentalData.MaxChildren}
                    onChange={handleInputChangeStep2}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.MaxChildren && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.MaxChildren}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FaUsers className="mr-1 text-gray-400" />
                    Tổng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="MaxPeople"
                    value={rentalData.MaxPeople}
                    onChange={handleInputChangeStep2}
                    min="1"
                    max="20"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.MaxPeople && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaInfoCircle className="mr-1" /> {errors.MaxPeople}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Hình ảnh
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hình ảnh phòng thuê <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChangeStep2}
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
                {errors.Images && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FaInfoCircle className="mr-1" /> {errors.Images}
                  </p>
                )}
              </div>

              {/* Preview Images */}
              {previewImagesStep2.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Xem trước ({previewImagesStep2.length} ảnh)
                    </h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                      {previewImagesStep2.length}/5 ảnh
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewImagesStep2.map((img, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden h-32">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImagesStep2(index)}
                            className="p-1 bg-red-500 rounded-full text-white"
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
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {rentalData.pricingEntries.map((entry, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-6"
              >
                {/* Header with pricing name and delete button */}
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                    <FaTag className="text-primary inline mr-2" />
                    Gói giá {entry.dayType === 0 ? "ngày thường" : entry.dayType === 1 ? "ngày lễ" : "ngày cuối tuần"}
                  </h3>
                  {/* <button
                    type="button"
                    onClick={() => removePricingEntry(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button> */}
                </div>

                {/* Content with price settings */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit Price */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                        Đơn giá <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={entry.unitPrice}
                          onChange={(e) => handlePricingChange(index, "unitPrice", e.target.value)}
                          min="0"
                          className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                          placeholder="0"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FaDollarSign />
                        </span>
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          VNĐ
                        </span>
                      </div>
                      {errors[`unitPrice_${index}`] && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaInfoCircle className="mr-1" /> {errors[`unitPrice_${index}`]}
                        </p>
                      )}
                    </div> */}

                    {/* Rent Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FaMoneyBillWave className="inline mr-1 text-gray-400" />
                        Giá thuê <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={entry.rentPrice}
                          onChange={(e) => handlePricingChange(index, "rentPrice", e.target.value)}
                          min="0"
                          className="w-full pl-8 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                          placeholder="0"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FaDollarSign />
                        </span>
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          VNĐ
                        </span>
                      </div>
                      {errors[`rentPrice_${index}`] && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaInfoCircle className="mr-1" /> {errors[`rentPrice_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Day Type */}
                    {/* <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FaCalendarAlt className="inline mr-1 text-gray-400" />
                        Áp dụng cho loại ngày <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={entry.dayType}
                          onChange={(e) => handlePricingChange(index, "dayType", e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 appearance-none"
                        >
                          <option value="0">Ngày thường</option>
                          <option value="1">Ngày cuối tuần (Thứ 6, Thứ 7, Chủ nhật)</option>
                          <option value="2">Ngày đặc biệt (ngày lễ, sự kiện)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <FaCalendarAlt className="h-4 w-4" />
                        </div>
                      </div>
                    </div> */}

                    {/* Special day date range */}
                    {parseInt(entry.dayType) === 2 && (
                      <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Khoảng thời gian áp dụng
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={entry.startDate}
                              onChange={(e) => handlePricingChange(index, "startDate", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                            />
                            {errors[`startDate_${index}`] && (
                              <p className="mt-1 text-xs text-red-500 flex items-center">
                                <FaInfoCircle className="mr-1" /> {errors[`startDate_${index}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={entry.endDate}
                              onChange={(e) => handlePricingChange(index, "endDate", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50"
                            />
                            {errors[`endDate_${index}`] && (
                              <p className="mt-1 text-xs text-red-500 flex items-center">
                                <FaInfoCircle className="mr-1" /> {errors[`endDate_${index}`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FaTag className="inline mr-1 text-gray-400" />
                        Mô tả gói giá <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={entry.description}
                        onChange={(e) => handlePricingChange(index, "description", e.target.value)}
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Mô tả thêm về gói giá thuê này..."
                      />
                      {errors[`description_${index}`] && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaInfoCircle className="mr-1" /> {errors[`description_${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new price button */}
            {/* <div className="flex justify-center">
              <button
                type="button"
                onClick={addPricingEntry}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark flex items-center"
              >
                <FaPlus className="mr-2" /> Thêm gói giá mới
              </button>
            </div> */}
          </motion.div>
        )}


        {/* Navigation buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-end gap-4">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              <span>Quay lại</span>
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              <span>Quay lại</span>
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <>
                {step === 1 || step === 2 ? "Tiếp tục" : (
                  <>
                    <FaCheck className="mr-2" />
                    <span>Hoàn tất</span>
                  </>
                )}
              </>
            )}
          </button>
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