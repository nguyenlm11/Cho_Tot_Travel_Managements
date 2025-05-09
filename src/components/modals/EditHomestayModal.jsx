import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import homestayAPI from "../../services/api/homestayAPI";
import axiosInstance from "../../services/config";

// hàm cập nhật thay đổi
export const EditHomestayModal = ({ isOpen, onClose, homestay, fetchHomestays }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        longitude: '',
        latitude: '',
        rentalType: 1,
        area: ''
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [errors, setErrors] = useState({});
    const searchTimeout = useRef(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [originalCoords, setOriginalCoords] = useState({ longitude: 0, latitude: 0 });
    const [addressSelectedFromSuggestion, setAddressSelectedFromSuggestion] = useState(false);

    const API_KEY = "MdlDIjhDKvUnozmB9NJjiW4L5Pu5ogxX";
    const BASE_URL = "https://mapapis.openmap.vn/v1/autocomplete";
    const PLACE_DETAIL_URL = "https://mapapis.openmap.vn/v1/place";
    useEffect(() => {
        if (homestay) {
            console.log("Loading homestay with coordinates:", {
                longitude: homestay.longitude,
                latitude: homestay.latitude
            });

            // Đảm bảo lưu giữ tọa độ gốc dưới dạng số
            let longitude = homestay.longitude;
            let latitude = homestay.latitude;

            // Chỉ chuyển đổi kiểu dữ liệu, không đặt giá trị mặc định 0
            if (longitude !== undefined && longitude !== null) {
                longitude = typeof longitude === 'number' ? longitude : parseFloat(longitude);
                if (isNaN(longitude)) longitude = 0;
            }

            if (latitude !== undefined && latitude !== null) {
                latitude = typeof latitude === 'number' ? latitude : parseFloat(latitude);
                if (isNaN(latitude)) latitude = 0;
            }

            // Lưu trữ tọa độ ban đầu
            setOriginalCoords({ longitude, latitude });

            console.log({ homestay });

            setFormData({
                homeStayID: homestay.homeStayID,
                name: homestay.name || '',
                description: homestay.description || '',
                address: homestay.address || '',
                longitude: longitude,
                latitude: latitude,
                rentalType: 1,
                area: homestay.area || ''
            });

            console.log("Set form data with coordinates:", { longitude, latitude });
            setFormErrors({});
        }
    }, [homestay]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Xóa lỗi khi người dùng chỉnh sửa
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        // Kiểm tra tên homestay
        if (!formData.name || !formData.name.trim()) {
            errors.name = 'Tên homestay không được để trống hoặc chỉ chứa khoảng trắng';
        }

        // Kiểm tra địa chỉ
        if (!formData.address || !formData.address.trim()) {
            errors.address = 'Địa chỉ không được để trống hoặc chỉ chứa khoảng trắng';
        }

        // Kiểm tra khu vực
        if (!formData.area || !formData.area.trim()) {
            errors.area = 'Khu vực không được để trống hoặc chỉ chứa khoảng trắng';
        }

        // Kiểm tra mô tả
        if (!formData.description || !formData.description.trim()) {
            errors.description = 'Mô tả không được để trống hoặc chỉ chứa khoảng trắng';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const inputGroupVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Nếu thay đổi địa chỉ NHƯNG không phải từ gợi ý, giữ tọa độ ban đầu
        if (name === 'address') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Giữ tọa độ ban đầu nếu người dùng đang chỉnh sửa địa chỉ
                // (tọa độ sẽ được cập nhật trong handleSelectAddress nếu chọn từ gợi ý)
            }));
            searchAddress(value);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Xóa thông báo lỗi khi người dùng nhập lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const handleSelectAddress = async (result) => {
        const { id } = result.properties;
        try {
            const detailResponse = await axiosInstance.get(PLACE_DETAIL_URL, {
                params: {
                    format: 'osm',
                    ids: id,
                    apikey: API_KEY
                }
            });
            const detail = detailResponse.data?.features?.[0];
            if (!detail) {
                console.error('No detail found for selected address.');
                return;
            }
            const label = detail.properties.label;
            const [lng, lat] = detail.geometry.coordinates;
            setFormData(prev => ({
                ...prev,
                address: label,
                longitude: lng,
                latitude: lat,
            }));
            setAddressSelectedFromSuggestion(true); // Đánh dấu đã chọn từ gợi ý
            setShowSuggestions(false);

            // Xóa lỗi địa chỉ nếu có
            if (errors.address) {
                setErrors(prev => ({ ...prev, address: null }));
            }

            console.log("Selected new coordinates:", { longitude: lng, latitude: lat });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết thông tin địa chỉ:", error);
        }
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
                const response = await axiosInstance.get(BASE_URL, {
                    params: { text: query, apikey: API_KEY, size: 6 }
                });
                setSearchResults(response.data.features || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error searching address:', error);
            }
        }, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setShowConfirmation(true);
        } else {
            // Hiển thị thông báo tổng hợp lỗi
            const errorMessage = Object.values(formErrors).join('. ');
            toast.error(errorMessage || 'Vui lòng điền đầy đủ thông tin. Không được chỉ nhập khoảng trắng.');
        }
    };

    const handleConfirm = () => {
        // Kiểm tra lại một lần nữa trước khi gửi
        if (!validateForm()) {
            setShowConfirmation(false);
            toast.error('Thông tin không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        // Chuẩn hóa dữ liệu trước khi gửi
        // ĐẢM BẢO GIỮ NGUYÊN CÁC GIÁ TRỊ TỌA ĐỘ BAN ĐẦU
        const sanitizedData = {
            ...formData,
            name: formData.name.trim(),
            description: formData.description.trim(),
            address: formData.address.trim(),
            area: formData.area.trim(),
            // Quan trọng: giữ nguyên các giá trị tọa độ từ formData
            longitude: formData.longitude,
            latitude: formData.latitude,
            rentalType: 1
        };

        console.log("Sending coordinates:", {
            longitude: formData.longitude,
            latitude: formData.latitude
        });

        setShowConfirmation(false);
        handleEditSubmit(sanitizedData);
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    const handleEditSubmit = async (formData) => {
        if (!homestay) return;

        await handleUpdateHomestay(formData.homeStayID, formData);
        onClose();
    };

    const handleUpdateHomestay = async (homestayId, updatedData) => {
        try {
            // Kiểm tra dữ liệu một lần nữa trước khi gửi
            if (!updatedData.name.trim()) {
                return toast.error('Tên homestay không được để trống hoặc chỉ chứa khoảng trắng.');
            }
            if (!updatedData.address.trim()) {
                return toast.error('Địa chỉ không được để trống hoặc chỉ chứa khoảng trắng.');
            }
            if (!updatedData.area.trim()) {
                return toast.error('Khu vực không được để trống hoặc chỉ chứa khoảng trắng.');
            }
            if (!updatedData.description.trim()) {
                return toast.error('Mô tả không được để trống hoặc chỉ chứa khoảng trắng.');
            }

            // setLoading(true);
            const loadingToast = toast.loading('Đang cập nhật thông tin...');

            // Kiểm tra xem địa chỉ có thay đổi không
            const addressChanged = updatedData.address !== homestay.address;

            // Nếu địa chỉ thay đổi nhưng không phải từ gợi ý, giữ tọa độ ban đầu
            let longitude, latitude;

            if (addressSelectedFromSuggestion) {
                // Nếu đã chọn địa chỉ từ gợi ý, sử dụng tọa độ mới từ formData
                longitude = updatedData.longitude;
                latitude = updatedData.latitude;
            } else if (!addressChanged) {
                // Nếu địa chỉ không thay đổi, sử dụng tọa độ ban đầu
                longitude = originalCoords.longitude;
                latitude = originalCoords.latitude;
            } else {
                // Nếu địa chỉ thay đổi bằng cách nhập thủ công (không chọn từ gợi ý)
                // Chúng ta không có tọa độ mới, sử dụng tọa độ mặc định 0
                longitude = 0;
                latitude = 0;
            }

            // Đảm bảo là số
            longitude = parseFloat(longitude) || 0;
            latitude = parseFloat(latitude) || 0;

            console.log("Final coordinates for update:", { longitude, latitude });

            // Chuẩn hóa dữ liệu
            const dataToSend = {
                name: updatedData.name.trim(),
                description: updatedData.description.trim(),
                address: updatedData.address.trim(),
                area: updatedData.area.trim(),
                longitude: longitude,
                latitude: latitude,
                rentalType: 1
            };

            // console.log("Sending data:", dataToSend);

            const response = await homestayAPI.updateHomestay(homestayId, dataToSend);

            if (response) {
                toast.dismiss(loadingToast);
                toast.success('Cập nhật homestay thành công!', {
                    duration: 3000,
                    position: 'top-center'
                });
                fetchHomestays();
            }
        } catch (error) {
            toast.dismiss();
            console.error('Error updating homestay:', error);
            toast.error('Không thể cập nhật homestay: ' + (error.response?.data?.message || error.message || 'Có lỗi xảy ra'), {
                duration: 4000
            });
        } finally {
            // setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 overflow-y-auto max-h-[80vh]"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Chỉnh sửa homestay
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tên homestay <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                                    required
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>

                            <div variants={inputGroupVariants} className="group relative mb-4">
                                <label className="text-gray-700 dark:text-gray-300 mb-2 block flex items-center text-sm font-medium">
                                    Địa chỉ <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập địa chỉ của nhà nghỉ"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary dark:focus:border-primary focus:ring-primary/20'} bg-white/50  dark:bg-gray-700 dark:border-gray-600 transition-all duration-300`}
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
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
                                                <motion.div
                                                    key={index}
                                                    whileHover={{
                                                        backgroundColor: "rgba(var(--color-primary), 0.1)",
                                                        x: 4
                                                    }}
                                                    className="px-4 py-3 cursor-pointer hover:bg-primary/5 
                                                                   dark:hover:bg-primary/20 transition-all duration-300
                                                                   flex items-center gap-3"
                                                    onClick={() => handleSelectAddress(result)}
                                                >
                                                    <FaMapMarkerAlt className="text-primary" />
                                                    <span className="text-gray-700 dark:text-gray-200">
                                                        {result.properties.label}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Khu vực <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.area ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                                    placeholder="VD: Hồ Chí Minh"
                                    required
                                />
                                {formErrors.area && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.area}</p>
                                )}
                            </div> */}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mô tả <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                                    placeholder="Mô tả về homestay của bạn..."
                                    required
                                ></textarea>
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                                )}
                            </div>

                            {/* Hidden inputs to store coordinates */}
                            <input
                                type="hidden"
                                name="longitude"
                                value={formData.longitude}
                            />
                            <input
                                type="hidden"
                                name="latitude"
                                value={formData.latitude}
                            />

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                       flex items-center gap-2"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>

                        {/* Popup xác nhận */}
                        <AnimatePresence>
                            {showConfirmation && (
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
                                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                                                Xác nhận thay đổi
                                            </h3>
                                        </div>
                                        <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">
                                            Bạn có chắc chắn muốn lưu những thay đổi này?
                                        </p>
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                onClick={handleCancel}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors
                             min-w-[100px]"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleConfirm}
                                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors
                             min-w-[100px]"
                                            >
                                                Xác nhận
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};