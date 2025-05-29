import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaStar, FaHome, FaCheck, FaTimes, FaClock, FaImage, FaServicestack, FaPercent, FaUndoAlt, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import { IoPricetag } from 'react-icons/io5';
import { toast, Toaster } from 'react-hot-toast';
import homestayAPI from '../../services/api/homestayAPI';

const HomestayDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [homestay, setHomestay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Chờ phê duyệt';
            case 1: return 'Đang hoạt động';
            case 2: return 'Đã dừng hoạt động';
            default: return 'Không xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            case 2: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
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
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-400 
                        hover:text-primary transition-colors mb-4"
                >
                    <FaArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Quay lại</span>
                </button>

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
                                    Hình ảnh homestay
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
                            {/* Description Section */}
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

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Area */}
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

                                {/* Price */}
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

                                {/* Rating */}
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
                                                            {(homestay.sumRate / homestay.totalRatings).toFixed(1)}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-primary text-sm font-medium">/5</span>
                                                            <div className="flex items-center gap-0.5 ml-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FaStar
                                                                        key={i}
                                                                        className={`w-3 h-3 ${i < Math.round(homestay.sumRate / homestay.totalRatings)
                                                                            ? 'text-primary'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
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

                            {/* Timeline Section */}
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

                    {homestay.services && homestay.services.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaServicestack className="w-5 h-5" />
                                    Dịch vụ ({homestay.services.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {homestay.services.map((service, index) => (
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
                </div>

                <div className="space-y-6">
                    {homestay.commissionRate && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaPercent className="w-5 h-5" />
                                    Tỉ lệ hoa hồng
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chủ nhà</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {(homestay.commissionRate.hostShare * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nền tảng</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {(homestay.commissionRate.platformShare * 100).toFixed(0)}%
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
                                        <span className="text-gray-600 dark:text-gray-400">Trạng thái chủ nhà:</span>
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
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaUsers className="w-5 h-5" />
                                Thông tin chủ sở hữu
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số đánh giá</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                                        {homestay.totalRatings}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomestayDetail;