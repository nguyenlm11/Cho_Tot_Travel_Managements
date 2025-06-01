import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaBath, FaBed, FaChild, FaEdit, FaEye, FaHome, FaInfoCircle, FaMapMarkerAlt, FaPlus, FaRegCalendarAlt, FaRegClock, FaTags, FaTimes, FaTrash, FaUser, FaUsers, FaUtensils, FaWifi, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import homestayRentalAPI from '../../services/api/homestayrentalAPI';
import EditPricingModal from '../../components/modals/EditPricingModal';
import pricingAPI from '../../services/api/pricingAPI';
import axiosInstance from '../../services/config';
import AddPricingModal from '../../components/modals/AddPricingModal';
import EditRoomTypeModal from '../../components/modals/EditRoomTypeModal';
import { MdManageSearch } from 'react-icons/md';

const HomestayRentalDetail = () => {
    const { id: homestayId, rentalId } = useParams();
    const navigate = useNavigate();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [tabSelected, setTabSelected] = useState('info');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
    const [selectedPricing, setSelectedPricing] = useState(null);
    const [isAddPricingModalOpen, setIsAddPricingModalOpen] = useState(false);
    const [isEditRoomTypeModalOpen, setIsEditRoomTypeModalOpen] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };

    const fetchRentalDetails = async () => {
        setLoading(true);
        try {
            const response = await homestayRentalAPI.getHomeStayRentalDetail(rentalId);
            if (response && response.statusCode === 200) {
                setRental(response.data);
            } else {
                toast.error('Không thể tải thông tin căn thuê');
                navigate(`/owner/homestays/${homestayId}/homestay-rental`);
            }
        } catch (error) {
            console.error('Error fetching rental details:', error);
            toast.error('Có lỗi xảy ra khi tải thông tin chi tiết');
            navigate(`/owner/homestays/${homestayId}/homestay-rental`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalDetails();
    }, [rentalId]);

    // Handle delete rental
    const confirmDelete = async () => {
        if (!rental) return;

        setShowDeleteModal(false);
        const loadingToast = toast.loading('Đang xóa căn thuê...');

        try {
            if (!homestayRentalAPI.deleteHomeStayRental) {
                homestayRentalAPI.deleteHomeStayRental = async (id) => {
                    const response = await axiosInstance.delete(`/homestayrental/DeleteHomeStayRental/${id}`);
                    return response.data;
                };
            }

            const response = await homestayRentalAPI.deleteHomeStayRental(rental.homeStayRentalID);
            if (response && response.statusCode === 200) {
                toast.dismiss(loadingToast);
                toast.success('Xóa căn thuê thành công');
                navigate(`/owner/homestays/${homestayId}/homestay-rental`);
            } else {
                toast.dismiss(loadingToast);
                toast.error('Không thể xóa căn thuê');
            }
        } catch (error) {
            console.error('Error deleting rental:', error);
            toast.dismiss(loadingToast);
            toast.error('Không thể xóa căn thuê');
        }
    };

    // Room types pagination
    const totalPages = rental?.roomTypes ? Math.ceil(rental.roomTypes.length / itemsPerPage) : 0;
    const paginatedRoomTypes = rental?.roomTypes
        ? rental.roomTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    // Image navigation
    const handlePrevImage = () => {
        if (rental?.imageHomeStayRentals?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? rental.imageHomeStayRentals.length - 1 : prevIndex - 1
            );
        }
    };

    const handleNextImage = () => {
        if (rental?.imageHomeStayRentals?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === rental.imageHomeStayRentals.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    // Tab navigation - Chỉ hiển thị "Loại phòng" nếu rentWhole = false
    const tabs = [
        { id: 'info', label: 'Thông tin chung', icon: <FaInfoCircle className="mr-2" /> },
        ...(rental?.rentWhole === false ? [
            { id: 'roomTypes', label: 'Loại phòng', icon: <FaBed className="mr-2" /> }
        ] : []),
    ];

    // Thêm hàm xử lý khi click vào nút edit
    const handleEditPricing = (pricing) => {
        setSelectedPricing(pricing);
        setIsEditPricingModalOpen(true);
    };

    const handleUpdatePricing = async (updatedPricing) => {
        if (updatedPricing?.pricingID) {

            if (rental?.pricing
                ?.filter(item => item?.pricingID != updatedPricing?.pricingID)
                ?.find(item => (item?.dayType == 0 && updatedPricing?.dayType == 0) || (item?.dayType == 1 && updatedPricing?.dayType == 1))) {
                toast.error(`Gói ${updatedPricing?.dayType == 0 ? "ngày thường" : "ngày cuối tuần"} đã tồn tại`);
                return;
            }
            try {
                const res = await pricingAPI.updatePricing(updatedPricing.pricingID, updatedPricing);
                if (res.statusCode === 200) {
                    toast.success('Cập nhật giá thuê thành công!');
                    setIsEditPricingModalOpen(false);
                    setSelectedPricing(null);
                    fetchRentalDetails();
                } else {
                    toast.error('Không thể cập nhật giá thuê: ' + res.message);
                }
            } catch (error) {
                console.error('Error updating pricing:', error);
                toast.error('Không thể cập nhật giá thuê: ' + error.message);
            }
        }
    }


    const handleAddPricing = async (data) => {
        const formatData = { ...data, homeStayRentalID: rentalId }
        if (rental?.pricing?.find(item => (item?.dayType == 0 && formatData?.dayType == 0) || (item?.dayType == 1 && formatData?.dayType == 1))) {
            toast.error(`Gói ${formatData?.dayType == 0 ? "ngày thường" : "ngày cuối tuần"} đã tồn tại`);
            return;
        }

        try {
            const res = await pricingAPI.addPricing(formatData);
            if (res.statusCode === 200) {
                toast.success('Thêm giá thuê thành công!');
                setIsAddPricingModalOpen(false);
                fetchRentalDetails();
            } else {
                toast.error('Không thể thêm giá thuê: ' + res.message);
            }
        } catch (error) {
            console.error('Error updating pricing:', error);
            toast.error('Không thể thêm giá thuê: ' + error.message);
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Đang tải thông tin...</p>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestayId}/homestay-rental`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {rental?.name}
                            </h1>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaMapMarkerAlt className="mr-2" />
                                <span>{rental?.homeStayName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left column */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Image Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                                <div className="relative h-[450px]">
                                    {rental?.imageHomeStayRentals && rental.imageHomeStayRentals.length > 0 ? (
                                        <>
                                            <img
                                                src={rental.imageHomeStayRentals[currentImageIndex].image}
                                                alt={`${rental.name} - Ảnh ${currentImageIndex + 1}`}
                                                className="w-full h-full object-cover"
                                            />

                                            {rental.imageHomeStayRentals.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={handlePrevImage}
                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full
                                                        bg-black/40 text-white hover:bg-black/50 transition-colors"
                                                    >
                                                        <FaArrowLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={handleNextImage}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full
                                                        bg-black/40 text-white hover:bg-black/50 transition-colors"
                                                    >
                                                        <FaArrowLeft className="w-5 h-5 rotate-180" />
                                                    </button>
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                                                    bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                                        {currentImageIndex + 1} / {rental.imageHomeStayRentals.length}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Không có hình ảnh</span>
                                        </div>
                                    )}
                                </div>

                                {/* Image thumbnails */}
                                {rental?.imageHomeStayRentals && rental.imageHomeStayRentals.length > 1 && (
                                    <div className="p-4 flex space-x-2 overflow-x-auto">
                                        {rental.imageHomeStayRentals.map((image, index) => (
                                            <button
                                                key={image.imageHomeStayRentalsID}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden 
                                                transition-all duration-200 ${currentImageIndex === index
                                                        ? 'ring-2 ring-green-500'
                                                        : 'opacity-70 hover:opacity-100'}`}
                                            >
                                                <img
                                                    src={image.image}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex overflow-x-auto">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setTabSelected(tab.id)}
                                                className={`relative px-6 py-4 text-sm font-medium transition-colors
                                                ${tabSelected === tab.id
                                                        ? 'text-green-600 border-b-2 border-green-500'
                                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    {tab.icon}
                                                    {tab.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab content */}
                                <div className="p-6">
                                    {tabSelected === 'info' && (
                                        <div className="space-y-8">
                                            {/* Description */}
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mô tả</h2>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                        <FaRegClock className="mr-1" />
                                                        Cập nhật: {formatDate(rental?.updateAt !== "0001-01-01T00:00:00.000" ? rental?.updateAt : rental?.createAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                                    {rental?.description || "Chưa có mô tả chi tiết cho căn thuê này."}
                                                </p>
                                            </div>

                                            {/* Features */}
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                    <FaHome className="mr-2 text-green-600" />Tính năng
                                                </h2>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                            <FaBed className="text-green-600 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 dark:text-green-300">Phòng ngủ</p>
                                                            <p className="text-lg font-bold text-green-900 dark:text-green-100">{rental?.numberBedRoom}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                            <FaBath className="text-green-600 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 dark:text-green-300">Phòng tắm</p>
                                                            <p className="text-lg font-bold text-green-900 dark:text-green-100">{rental?.numberBathRoom}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                            <FaUtensils className="text-green-600 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 dark:text-green-300">Phòng bếp</p>
                                                            <p className="text-lg font-bold text-green-900 dark:text-green-100">{rental?.numberKitchen}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                            <FaWifi className="text-green-600 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 dark:text-green-300">WiFi</p>
                                                            <p className="text-lg font-bold text-green-900 dark:text-green-100">{rental?.numberWifi}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                            <FaUsers className="text-green-600 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 dark:text-green-300">Sức chứa</p>
                                                            <p className="text-lg font-bold text-green-900 dark:text-green-100">{rental?.maxPeople} người</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                                                            <FaHome className="text-green-600 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 dark:text-green-300">Loại thuê</p>
                                                            <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                                                {rental?.rentWhole ? 'Nguyên căn' : 'Theo phòng'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Guest capacity */}
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                    <FaUsers className="mr-2 text-green-600" />Sức chứa khách
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-green-500">
                                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                            <FaUser className="text-green-600 dark:text-green-400 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Người lớn</p>
                                                            <p className="text-lg font-bold text-gray-900 dark:text-white">Tối đa {rental?.maxAdults}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-green-600">
                                                        <div className="p-3 bg-green-200 dark:bg-green-800/30 rounded-lg">
                                                            <FaChild className="text-green-700 dark:text-green-300 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Trẻ em</p>
                                                            <p className="text-lg font-bold text-gray-900 dark:text-white">Tối đa {rental?.maxChildren}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-green-700">
                                                        <div className="p-3 bg-green-300 dark:bg-green-700/30 rounded-lg">
                                                            <FaUsers className="text-green-800 dark:text-green-200 w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng</p>
                                                            <p className="text-lg font-bold text-gray-900 dark:text-white">Tối đa {rental?.maxPeople}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tabSelected === 'roomTypes' && rental?.rentWhole === false && (
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                    <FaBed className="mr-2 text-green-600" />
                                                    Loại phòng
                                                </h2>
                                                {user?.role === "Owner" && (
                                                    <button
                                                        onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/room-types/create`)}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                                                    >
                                                        <FaPlus className="mr-2" /> Thêm loại phòng
                                                    </button>
                                                )}
                                            </div>

                                            {rental?.roomTypes && rental.roomTypes.length > 0 ? (
                                                <>
                                                    <div className="space-y-6">
                                                        {paginatedRoomTypes.map((roomType) => (
                                                            <div
                                                                key={roomType.roomTypesID}
                                                                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden
                                                                bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300"
                                                            >
                                                                <div className="flex flex-col md:flex-row">
                                                                    <div className="md:w-1/3 bg-green-50 dark:bg-green-900/20 p-6 flex flex-col justify-center items-center text-center">
                                                                        <div className="text-green-600 dark:text-green-400 mb-3">
                                                                            <FaBed className="w-16 h-16" />
                                                                        </div>
                                                                        <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                                                                            {roomType.name}
                                                                        </h3>
                                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium
                                                                        ${roomType.status
                                                                                ? 'bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-100'
                                                                                : 'bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-100'}`
                                                                        }>
                                                                            {roomType.status ? 'Hoạt động' : 'Tạm ngưng'}
                                                                        </div>
                                                                    </div>

                                                                    <div className="md:w-2/3 p-6">
                                                                        <div className="mb-4">
                                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                                {roomType.description || "Không có mô tả"}
                                                                            </p>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                <FaUsers className="text-green-600" />
                                                                                <span>{roomType?.maxAdults} người lớn</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                <FaUsers className="text-green-600" />
                                                                                <span>{roomType?.maxChildren} trẻ em</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                                                <FaUsers className="text-green-600" />
                                                                                <span>Giới hạn {roomType?.maxPeople} người</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                            <FaRegCalendarAlt className="mr-1" />
                                                                            <span>Ngày tạo: {formatDate(roomType?.createAt)}</span>
                                                                        </div>

                                                                        {roomType.pricings && roomType.pricings.length > 0 ? (
                                                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                                                                    <FaTags className="mr-1 text-green-600" /> Giá phòng:
                                                                                </h4>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                    {roomType.pricings.map(pricing => (
                                                                                        <div
                                                                                            key={pricing.pricingID}
                                                                                            className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"
                                                                                        >
                                                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                                                {pricing?.dayType === 0
                                                                                                    ? 'Ngày thường'
                                                                                                    : pricing?.dayType === 1
                                                                                                        ? 'Ngày cuối tuần'
                                                                                                        : pricing?.dayType === 2
                                                                                                            ? 'Ngày lễ'
                                                                                                            : ''}
                                                                                            </span>
                                                                                            <span className="font-medium text-green-600">
                                                                                                {formatPrice(pricing.rentPrice)}
                                                                                            </span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 italic">
                                                                                Chưa có thông tin giá
                                                                            </p>
                                                                        )}

                                                                        <div className="mt-4 flex justify-between items-center">
                                                                            {user?.role === "Owner" && (
                                                                                <div
                                                                                    onClick={() => {
                                                                                        setSelectedRoomType(roomType)
                                                                                        setIsEditRoomTypeModalOpen(true)
                                                                                    }}
                                                                                    className="text-green-600 hover:text-green-800 transition-colors flex items-center cursor-pointer"
                                                                                >
                                                                                    <FaEdit className="inline mr-1" /> Chỉnh sửa
                                                                                </div>
                                                                            )}
                                                                            <Link
                                                                                to={`/owner/homestays/${homestayId}/rentals/${rentalId}/room-types/${roomType.roomTypesID}/infor`}
                                                                                className="text-green-600 hover:text-green-800 transition-colors flex items-center"
                                                                            >
                                                                                <FaEye className="inline mr-1" /> Chi tiết
                                                                            </Link>
                                                                            <Link
                                                                                to={`/owner/homestays/${homestayId}/rentals/${rentalId}/room-types/${roomType.roomTypesID}/rooms`}
                                                                                className="text-green-600 hover:text-green-800 transition-colors flex items-center"
                                                                            >
                                                                                <MdManageSearch className="inline mr-1" /> Danh sách phòng
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Pagination */}
                                                    {totalPages > 1 && (
                                                        <div className="flex justify-center items-center gap-2 mt-8">
                                                            <button
                                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                                disabled={currentPage === 1}
                                                                className={`p-2 rounded-lg ${currentPage === 1
                                                                    ? 'text-gray-400 cursor-not-allowed'
                                                                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                            >
                                                                <FaArrowLeft className="w-5 h-5" />
                                                            </button>

                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                                <button
                                                                    key={number}
                                                                    onClick={() => setCurrentPage(number)}
                                                                    className={`w-10 h-10 rounded-lg ${number === currentPage
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                                >
                                                                    {number}
                                                                </button>
                                                            ))}

                                                            <button
                                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                                disabled={currentPage === totalPages}
                                                                className={`p-2 rounded-lg ${currentPage === totalPages
                                                                    ? 'text-gray-400 cursor-not-allowed'
                                                                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                            >
                                                                <FaArrowLeft className="w-5 h-5 rotate-180" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                                    <div className="mb-4">
                                                        <FaBed className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                    <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Chưa có loại phòng nào
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                                        Thêm loại phòng để phục vụ khách hàng tốt hơn
                                                    </p>
                                                    {user?.role === "Owner" && (
                                                        <button
                                                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/room-types/create`)}
                                                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center transition-colors"
                                                        >
                                                            <FaPlus className="mr-2" /> Thêm loại phòng
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Status card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
                                    <div className={`px-4 py-2 rounded-lg text-sm font-medium
                                        ${rental?.status
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`
                                    }>
                                        {rental?.status ? 'Đang hoạt động' : 'Tạm ngưng'}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <FaHome className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">Loại thuê</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-white font-semibold">
                                            {rental?.rentWhole ? 'Nguyên căn' : 'Theo phòng'}
                                        </span>
                                    </div>

                                    {rental?.rentWhole === false && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <FaBed className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Số loại phòng</span>
                                            </div>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {rental?.roomTypes?.length || 0}
                                            </span>
                                        </div>
                                    )}

                                    {rental?.rentWhole && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <FaTags className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Giá cơ bản</span>
                                            </div>
                                            <div className="text-right">
                                                {rental?.pricing?.length > 0 ? (
                                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {formatPrice(rental?.pricing[0]?.rentPrice)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                        Chưa có giá
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {user?.role === "Owner" && (
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hành động</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental.homeStayRentalID}/editHomestayRental`)}
                                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center
                                                transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                            >
                                                <FaEdit className="mr-2 w-4 h-4" /> Chỉnh sửa thông tin
                                            </button>

                                            {rental?.rentWhole === false ? (
                                                <button
                                                    onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/room-types/create`)}
                                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center
                                                    transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                                >
                                                    <FaPlus className="mr-2 w-4 h-4" /> Thêm loại phòng
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsAddPricingModalOpen(true)}
                                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center
                                                    transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                                >
                                                    <FaPlus className="mr-2 w-4 h-4" /> Thêm gói giá
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center
                                                transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                            >
                                                <FaTrash className="mr-2 w-4 h-4" /> Xóa căn thuê
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {rental?.rentWhole === false && (
                                    <button
                                        onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rental?.homeStayRentalID}/roomRental`)}
                                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center
                                                    transition-all duration-200 shadow-md hover:shadow-lg font-medium mt-3"
                                    >
                                        <FaHome className="mr-2 w-4 h-4" /> Danh sách phòng
                                    </button>
                                )}
                            </div>

                            {/* Pricing section for rentWhole */}
                            {/* {rental?.rentWhole && ( */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh sách gói giá</h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Quản lý các gói giá theo ngày</p>
                                </div>

                                <div className="p-4">
                                    <div className="space-y-4">
                                        {rental?.pricing?.map((pricing, index) => (
                                            <div
                                                key={index}
                                                className="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-green-500 shadow-lg
                                                    hover:shadow-xl transition-all duration-200"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-3 rounded-lg ${pricing?.dayType == 0
                                                            ? 'bg-green-100 dark:bg-green-900/30'
                                                            : pricing?.dayType == 1
                                                                ? 'bg-green-200 dark:bg-green-800/30'
                                                                : 'bg-green-300 dark:bg-green-700/30'
                                                            }`}>
                                                            <FaTags className={`w-5 h-5 ${pricing?.dayType == 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : pricing?.dayType == 1
                                                                    ? 'text-green-700 dark:text-green-300'
                                                                    : 'text-green-800 dark:text-green-200'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                                {pricing?.dayType == 0 ? "Ngày thường" : pricing?.dayType == 1 ? "Ngày cuối tuần" : "Ngày lễ"}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {pricing?.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {user?.role === "Owner" && (
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 
                                                                    rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                                onClick={() => handleEditPricing(pricing)}
                                                            >
                                                                <FaEdit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 
                                                                    rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Giá thuê:</span>
                                                        <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                                                            {formatPrice(pricing?.rentPrice)}
                                                        </span>
                                                    </div>

                                                    {!pricing?.isDefault && (
                                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Thời gian hiệu lực:</p>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(pricing?.startDate)}</span>
                                                                <span className="text-gray-400">→</span>
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(pricing?.endDate)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {rental?.pricing?.length === 0 && (
                                            <div className="text-center py-8">
                                                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                                    <FaTags className="w-8 h-8 text-green-600 dark:text-green-400" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400">Chưa có gói giá nào</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Thêm gói giá để bắt đầu</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* )} */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Xác nhận xóa
                            </h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Bạn có chắc chắn muốn xóa căn thuê <span className="font-semibold text-green-600">"{rental?.name}"</span>?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                                text-gray-800 dark:text-white rounded-lg transition-colors duration-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isEditPricingModalOpen && (
                <EditPricingModal
                    pricing={selectedPricing}
                    isOpen={isEditPricingModalOpen}
                    onClose={() => {
                        setIsEditPricingModalOpen(false);
                        setSelectedPricing(null);
                    }}
                    onSave={handleUpdatePricing}
                    rental={rental}
                />
            )}

            {isAddPricingModalOpen && (
                <AddPricingModal
                    isOpen={isAddPricingModalOpen}
                    onClose={() => setIsAddPricingModalOpen(false)}
                    onSave={handleAddPricing}
                    rental={rental}
                />
            )}

            {isEditRoomTypeModalOpen && (
                <EditRoomTypeModal
                    roomType={selectedRoomType}
                    isOpen={isEditRoomTypeModalOpen}
                    onClose={() => setIsEditRoomTypeModalOpen(false)}
                    fetchRoomType={fetchRentalDetails}
                />
            )}
        </>
    );
};

export default HomestayRentalDetail;