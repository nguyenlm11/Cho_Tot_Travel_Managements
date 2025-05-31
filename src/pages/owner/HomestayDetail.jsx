import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaStar, FaHome, FaCheck, FaTimes, FaClock, FaImage, FaServicestack, FaPercent, FaUndoAlt, FaExclamationTriangle, FaEdit, FaCalendarAlt, FaChartLine, FaTag, FaGlobe } from 'react-icons/fa';
import { IoPricetag } from 'react-icons/io5';
import { toast, Toaster } from 'react-hot-toast';
import homestayAPI from '../../services/api/homestayAPI';
import adminAPI from '../../services/api/adminAPI';
import { EditHomestayModal } from '../../components/modals/EditHomestayModal';
import { formatDate } from '../../utils/utils';
import AddpolicyModal from '../../components/modals/AddPolicyModal';
import EditPolicyModal from '../../components/modals/EditPolicyModal';
import AcceptCommissionRateByOwnerModal from '../../components/modals/AcceptCommissionRateByOwnerModal';

const HomestayDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [homestay, setHomestay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingHomestay, setEditingHomestay] = useState(null);
    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [isEditPolicyModalOpen, setIsEditPolicyModalOpen] = useState(false);
    const [isAcceptCommissionRateModalOpen, setIsAcceptCommissionRateModalOpen] = useState(false);
    const [isReapprovalConfirmModalOpen, setIsReapprovalConfirmModalOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchHomestayDetail();
    }, [id]);

    const fetchHomestayDetail = async () => {
        try {
            setLoading(true);
            const response = await homestayAPI.getHomestaysById(id);
            if (response?.data) {
                setHomestay(response.data);
            } else {
                toast.error('Không thể tải thông tin homestay');
            }
        } catch (error) {
            console.error('Error fetching homestay detail:', error);
            toast.error('Có lỗi xảy ra khi tải thông tin homestay');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Chờ phê duyệt';
            case 1: return 'Đang hoạt động';
            case 2: return 'Đã bị từ chối';
            case 3: return 'Đã dừng hoạt động';
            default: return 'Không xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            case 2: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            case 3: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
        }
    };

    const openEditModal = (homestay) => {
        setEditingHomestay(homestay);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingHomestay(null);
    };

    const handleApproveHomestay = async (homeStayID) => {
        setIsReapprovalConfirmModalOpen(true);
    };

    const confirmReapproval = async () => {
        try {
            const response = await adminAPI.changeHomeStayStatus(homestay.homeStayID, 0);
            if (response?.status === 200 || response?.data) {
                toast.success('Đã gửi yêu cầu phê duyệt thành công. Homestay của bạn đã chuyển về trạng thái chờ phê duyệt.');
                await fetchHomestayDetail();
            } else {
                toast.error('Không thể gửi yêu cầu phê duyệt. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error requesting approval:', error);
            toast.error(`Có lỗi xảy ra khi gửi yêu cầu phê duyệt: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsReapprovalConfirmModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!homestay) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <FaExclamationTriangle className="mx-auto w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Không tìm thấy homestay
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <Toaster />
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            {homestay.name}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaMapMarkerAlt className="w-4 h-4" />
                            <span>{homestay.address}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(homestay.status)}`}>
                            {getStatusText(homestay.status)}
                        </span>
                        {homestay.status === 2 && (
                            <button
                                onClick={() => handleApproveHomestay(homestay.homeStayID)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                                text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl 
                                transform hover:scale-105 transition-all duration-200 border border-green-400"
                            >
                                <FaUndoAlt className="w-4 h-4" />
                                Gửi yêu cầu phê duyệt lại
                            </button>
                        )}
                        {user?.role === "Owner" && (
                            <button
                                onClick={() => openEditModal(homestay)}
                                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2
                                    hover:bg-primary-dark transition-colors"
                            >
                                <FaEdit />
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {homestay.status === 2 && (
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-300" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                                    Homestay đã bị từ chối
                                </h3>
                                <p className="text-red-700 dark:text-red-300 mb-4 leading-relaxed">
                                    Homestay của bạn đã bị từ chối phê duyệt. Bạn có thể gửi yêu cầu phê duyệt lại sau khi đã kiểm tra và hoàn thiện thông tin homestay.
                                </p>
                                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-red-200 dark:border-red-700">
                                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Các bước tiếp theo:</h4>
                                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                        <li>• Kiểm tra và cập nhật thông tin homestay</li>
                                        <li>• Đảm bảo hình ảnh và mô tả chất lượng</li>
                                        <li>• Nhấn nút "Gửi yêu cầu phê duyệt lại" để gửi lại cho admin</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Thao tác nhanh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestay?.homeStayID}/bookings`)}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 
                            rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <FaCalendarAlt />
                            <span className="text-sm font-medium">Đặt phòng</span>
                        </button>
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestay?.homeStayID}/reports`)}
                            className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 
                            rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <FaChartLine />
                            <span className="text-sm font-medium">Báo cáo</span>
                        </button>
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestay?.homeStayID}/ratings`)}
                            className="flex items-center gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 
                            rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                        >
                            <FaStar />
                            <span className="text-sm font-medium">Đánh giá</span>
                        </button>
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestay?.homeStayID}/services`)}
                            className="flex items-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 
                            rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <FaTag />
                            <span className="text-sm font-medium">Dịch vụ</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {homestay.imageHomeStays && homestay.imageHomeStays.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaImage className="w-5 h-5" />
                                    Hình ảnh homestay ({homestay.imageHomeStays.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <img
                                        src={homestay.imageHomeStays[activeImageIndex].image}
                                        alt={homestay.name}
                                        className="w-full h-80 object-cover rounded-lg"
                                    />
                                </div>
                                {homestay.imageHomeStays.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {homestay.imageHomeStays.map((image, index) => (
                                            <button
                                                key={image.imageHomeStayID}
                                                onClick={() => setActiveImageIndex(index)}
                                                className={`relative rounded-lg overflow-hidden border-2 transition-colors
                                                    ${activeImageIndex === index
                                                        ? 'border-primary'
                                                        : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <img
                                                    src={image.image}
                                                    alt={`${homestay.name} ${index + 1}`}
                                                    className="w-full h-20 object-cover"
                                                />
                                                {activeImageIndex === index && (
                                                    <div className="absolute inset-0 bg-primary/20"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaHome className="w-5 h-5" />
                                Thông tin cơ bản
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                        <FaEdit className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <h4 className="font-medium text-gray-800 dark:text-white">Mô tả</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                    {homestay.description || 'Chưa có mô tả'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-primary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                                            <FaMapMarkerAlt className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-primary uppercase tracking-wide">Khu vực</p>
                                            <p className="text-gray-800 dark:text-white font-semibold">{homestay.area}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-gray-400">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                            <IoPricetag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Giá thấp nhất</p>
                                            <p className="text-primary font-bold text-lg">
                                                {formatCurrency(homestay.lowestPrice)}<span className="text-sm font-normal">/đêm</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border-l-4 border-primary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center shadow-sm">
                                            <FaStar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Đánh giá trung bình</p>
                                            <div className="flex items-center gap-2">
                                                {homestay.sumRate && homestay.totalRatings ? (
                                                    <>
                                                        <span className="text-2xl font-bold text-primary">
                                                            {homestay.sumRate.toFixed(1)}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                            ({homestay.totalRatings} đánh giá)
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Chưa có đánh giá</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                        <FaClock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <h4 className="font-medium text-gray-800 dark:text-white">Thời gian</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Ngày tạo</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(homestay.createAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(homestay.updateAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {homestay.cultureExperiences && homestay.cultureExperiences.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaGlobe className="w-5 h-5" />
                                    Trải nghiệm văn hóa ({homestay.cultureExperiences.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {homestay.cultureExperiences.map((culture, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-800 dark:text-white">
                                                    {culture.cultureName}
                                                </h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${culture.status
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                    }`}
                                                >
                                                    {culture.status ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                                {culture.description}
                                            </p>
                                            <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                                                {culture.cultureType}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {homestay.services && homestay.services.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                        <FaServicestack className="w-5 h-5" />
                                        Dịch vụ ({homestay.services.length})
                                    </h3>
                                    <button
                                        onClick={() => navigate(`/owner/homestays/${homestay?.homeStayID}/services`)}
                                        className="text-primary hover:text-primary-dark font-medium text-sm"
                                    >
                                        Xem tất cả →
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {homestay.services.slice(0, 4).map((service, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-800 dark:text-white">
                                                    {service.servicesName}
                                                </h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${service.status
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                    }`}
                                                >
                                                    {service.status ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                                {service.description}
                                            </p>
                                            <p className="text-primary font-semibold">
                                                {formatCurrency(service.servicesPrice)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {homestay.latestRatings && homestay.latestRatings.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                        <FaStar className="w-5 h-5 text-yellow-500" />
                                        Đánh giá gần đây
                                    </h3>
                                    <button
                                        onClick={() => navigate(`/owner/homestays/${homestay?.homeStayID}/ratings`)}
                                        className="text-primary hover:text-primary-dark font-medium text-sm"
                                    >
                                        Xem tất cả →
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {homestay.latestRatings.slice(0, 3).map((rating, index) => (
                                        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {rating.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-800 dark:text-white text-base">
                                                            {rating.username}
                                                        </span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(rating.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full">
                                                    <FaStar className="w-4 h-4 text-primary" />
                                                    <span className="font-bold text-primary text-lg">{rating.sumRate?.toFixed(1) || '0.0'}</span>
                                                    <span className="text-primary text-sm">/5</span>
                                                </div>
                                            </div>

                                            {rating.content && (
                                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-primary">
                                                    "{rating.content}"
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                                        <span className="text-gray-600 dark:text-gray-400">Vệ sinh:</span>
                                                        <span className="font-medium text-primary">{rating.cleaningRate?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                        <span className="text-gray-600 dark:text-gray-400">Dịch vụ:</span>
                                                        <span className="font-medium text-gray-600 dark:text-gray-300">{rating.serviceRate?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-primary/70 rounded-full"></span>
                                                        <span className="text-gray-600 dark:text-gray-400">Tiện nghi:</span>
                                                        <span className="font-medium text-primary/70">{rating.facilityRate?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {homestay.commissionRate && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaPercent className="w-5 h-5" />
                                    Tỷ lệ hoa hồng
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chủ nhà</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {homestay.commissionRate.hostShare * 100}%
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nền tảng</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {homestay.commissionRate.platformShare * 100}%
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Trạng thái admin:</span>
                                        <span className={`flex items-center gap-1 ${homestay.commissionRate.isAccepted
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {homestay.commissionRate.isAccepted ? <FaCheck /> : <FaTimes />}
                                            {homestay.commissionRate.isAccepted ? 'Đã chấp nhận' : 'Chưa chấp nhận'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Trạng thái của tôi:</span>
                                        <span className={`flex items-center gap-1 ${homestay.commissionRate.ownerAccepted === true
                                            ? 'text-green-600 dark:text-green-400'
                                            : homestay.commissionRate.ownerAccepted === false
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                            {homestay.commissionRate.ownerAccepted === true ? <FaCheck /> :
                                                homestay.commissionRate.ownerAccepted === false ? <FaTimes /> : <FaClock />}
                                            {homestay.commissionRate.ownerAccepted === true ? 'Đã chấp nhận' :
                                                homestay.commissionRate.ownerAccepted === false ? 'Đã từ chối' : 'Chờ phản hồi'}
                                        </span>
                                    </div>
                                </div>

                                {user?.role === "Owner" && !(homestay.commissionRate.isAccepted && homestay.commissionRate.ownerAccepted) && (
                                    <button
                                        onClick={() => setIsAcceptCommissionRateModalOpen(true)}
                                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                    >
                                        Xác nhận tỷ lệ hoa hồng
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {homestay.cancelPolicy && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaUndoAlt className="w-5 h-5" />
                                    Chính sách hủy
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hủy trước</p>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {homestay.cancelPolicy.dayBeforeCancel} ngày
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hoàn tiền</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {(homestay.cancelPolicy.refundPercentage * 100).toFixed(0)}%
                                    </p>
                                </div>

                                {user?.role === "Owner" && (
                                    <button
                                        onClick={() => setIsEditPolicyModalOpen(true)}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Cập nhật chính sách
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!homestay.cancelPolicy && user?.role === "Owner" && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaUndoAlt className="w-5 h-5" />
                                    Chính sách hủy
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Chưa thiết lập chính sách hủy cho homestay này.
                                </p>
                                <button
                                    onClick={() => setIsAddPolicyModalOpen(true)}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Thêm chính sách hủy
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaUsers className="w-5 h-5" />
                                Thông tin quản lý
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ID chủ sở hữu
                                </label>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">
                                    {homestay.ownerID}
                                </p>
                            </div>

                            {homestay.staffID && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nhân viên hỗ trợ
                                    </label>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {homestay.staffName || homestay.staffID}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaMoneyBillWave className="w-5 h-5" />
                                Thống kê
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng đánh giá</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                                        {homestay.totalRatings || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditHomestayModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                homestay={editingHomestay}
                fetchHomestays={fetchHomestayDetail}
            />

            {isAddPolicyModalOpen && (
                <AddpolicyModal
                    isOpen={isAddPolicyModalOpen}
                    onClose={() => setIsAddPolicyModalOpen(false)}
                    homeStayID={homestay?.homeStayID}
                    fetchHomestay={fetchHomestayDetail}
                />
            )}

            {isEditPolicyModalOpen && (
                <EditPolicyModal
                    isOpen={isEditPolicyModalOpen}
                    onClose={() => setIsEditPolicyModalOpen(false)}
                    cancelPolicy={homestay?.cancelPolicy}
                    fetchHomestay={fetchHomestayDetail}
                />
            )}

            {isAcceptCommissionRateModalOpen && (
                <AcceptCommissionRateByOwnerModal
                    isOpen={isAcceptCommissionRateModalOpen}
                    onClose={() => setIsAcceptCommissionRateModalOpen(false)}
                    homeStayID={homestay?.homeStayID}
                    fetchHomestays={fetchHomestayDetail}
                />
            )}

            {isReapprovalConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <FaUndoAlt className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Xác nhận gửi yêu cầu
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Yêu cầu phê duyệt lại homestay
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Bạn có chắc chắn muốn gửi yêu cầu phê duyệt lại cho homestay này?
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Homestay sẽ chuyển về trạng thái "Chờ phê duyệt" và admin sẽ xem xét lại.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsReapprovalConfirmModalOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                                dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmReapproval}
                                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 
                                hover:from-green-600 hover:to-green-700 text-white font-semibold 
                                rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                Xác nhận gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomestayDetail; 