import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBed, FaUsers, FaArrowLeft, FaEdit, FaTrash, FaDollarSign, FaPlus, FaUser, FaChild } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import roomTypeAPI from '../../services/api/roomTypeAPI';
import pricingAPI from '../../services/api/pricingAPI';
import EditRoomTypeModal from '../../components/modals/EditRoomTypeModal';
import AddPricingRoomTypeModal from '../../components/modals/AddPricingRoomTypeModal';
import EditPricingRoomTypeModal from '../../components/modals/EditPricingRoomTypeModal';

const RoomTypeDetail = () => {
    const { homestayId, rentalId, roomTypeId } = useParams();
    const navigate = useNavigate();
    const [roomTypeDetailData, setRoomTypeDetailData] = useState(null);
    const [selectedPricing, setSelectedPricing] = useState(null);
    const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
    const [isAddPricingModalOpen, setIsAddPricingModalOpen] = useState(false);
    const [isEditRoomTypeModalOpen, setIsEditRoomTypeModalOpen] = useState(false);
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

    const handleEditPricing = (pricing) => {
        setSelectedPricing(pricing);
        setIsEditPricingModalOpen(true);
    };

    const handleUpdatePricing = async (updatedPricing) => {
        const formatData = { ...updatedPricing, roomTypesID: +roomTypeId, homeStayRentalID: +rentalId }
        if (updatedPricing?.pricingID) {
            if (roomTypeDetailData?.pricings
                ?.filter(item => item?.pricingID != updatedPricing?.pricingID)
                ?.find(item => (item?.dayType == 0 && updatedPricing?.dayType == 0) || (item?.dayType == 1 && updatedPricing?.dayType == 1))) {
                toast.error(`Gói ${updatedPricing?.dayType == 0 ? "ngày thường" : "ngày cuối tuần"} đã tồn tại`);
                return;
            }
            try {
                const res = await pricingAPI.updatePricing(formatData.pricingID, formatData);
                if (res.statusCode === 200) {
                    toast.success('Cập nhật giá thuê thành công!');
                    setIsEditPricingModalOpen(false);
                    setSelectedPricing(null);
                    fetchRoomTypeDetail();
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
        const formatData = { ...data, roomTypesID: +roomTypeId, homeStayRentalID: +rentalId }
        if (roomTypeDetailData?.pricings?.find(item => (item?.dayType == 0 && formatData?.dayType == 0) || (item?.dayType == 1 && formatData?.dayType == 1))) {
            toast.error(`Gói ${formatData?.dayType == 0 ? "ngày thường" : "ngày cuối tuần"} đã tồn tại`);
            return;
        }

        try {
            const res = await pricingAPI.addPricing(formatData);
            if (res.statusCode === 200) {
                toast.success('Thêm giá thuê thành công!');
                setIsAddPricingModalOpen(false);
                fetchRoomTypeDetail();
            } else {
                toast.error('Không thể thêm giá thuê: ' + res.message);
            }
        } catch (error) {
            console.error('Error updating pricing:', error);
            toast.error('Không thể thêm giá thuê: ' + error.message);
        }
    }

    useEffect(() => {
        fetchRoomTypeDetail();
    }, [roomTypeId]);

    const fetchRoomTypeDetail = async () => {
        try {
            const response = await roomTypeAPI.getRoomTypeDetail(roomTypeId);
            if (response?.statusCode === 200) {
                setRoomTypeDetailData(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {roomTypeDetailData?.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Chi tiết loại phòng
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            {/* Static Image */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                                <div className="relative h-[450px]">
                                    <img
                                        src="https://amdmodular.com/wp-content/uploads/2021/09/thiet-ke-phong-ngu-homestay-7-scaled.jpg"
                                        alt={`${roomTypeDetailData?.name} - Hình ảnh phòng`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 border border-gray-200 dark:border-gray-700 rounded-xl px-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center mb-6">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                                            <FaEdit className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                Mô tả chi tiết
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Thông tin về loại phòng</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border-l-4 border-green-500">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {roomTypeDetailData?.description || "Chưa có mô tả cho loại phòng này."}
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center mt-8">
                                            <FaUsers className="mr-3 text-gray-600 dark:text-gray-400" />Sức chứa khách
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                                                    <FaUser className="text-green-600 dark:text-green-400 w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Người lớn</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Tối đa {roomTypeDetailData?.maxAdults}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-600">
                                                <div className="p-3 bg-green-200 dark:bg-green-800/30 rounded-lg mr-4">
                                                    <FaChild className="text-green-700 dark:text-green-300 w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trẻ em</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Tối đa {roomTypeDetailData?.maxChildren}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-700">
                                                <div className="p-3 bg-green-300 dark:bg-green-700/30 rounded-lg mr-4">
                                                    <FaUsers className="text-green-800 dark:text-green-200 w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng cộng</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Tối đa {roomTypeDetailData?.maxPeople} người</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
                                    <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${roomTypeDetailData?.status
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`
                                    }
                                    >
                                        {roomTypeDetailData?.status ? 'Đang hoạt động' : 'Tạm ngưng'}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <FaBed className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">Loại phòng</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-white font-semibold">
                                            {roomTypeDetailData?.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <FaDollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">Giá cơ bản</span>
                                        </div>
                                        <div className="text-right">
                                            {roomTypeDetailData?.pricings?.length > 0 ? (
                                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    {formatPrice(roomTypeDetailData?.pricings[0]?.rentPrice)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                    Chưa có giá
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {user?.role === "Owner" && (
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hành động</h3>
                                        <div className="space-y-3">
                                            <>
                                                <button
                                                    onClick={() => setIsEditRoomTypeModalOpen(true)}
                                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center
                                                    transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                                >
                                                    <FaEdit className="mr-2 w-4 h-4" /> Chỉnh sửa loại phòng
                                                </button>

                                                <button
                                                    onClick={() => setIsAddPricingModalOpen(true)}
                                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center
                                                    transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                                >
                                                    <FaPlus className="mr-2 w-4 h-4" /> Thêm gói giá
                                                </button>
                                            </>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh sách gói giá</h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Quản lý các gói giá theo ngày</p>
                                </div>

                                <div className="p-4">
                                    <div className="space-y-4">
                                        {roomTypeDetailData?.pricings?.map((pricing, index) => (
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
                                                            <FaDollarSign className={`w-5 h-5 ${pricing?.dayType == 0
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
                                                                Gói {index + 1}
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

                                        {roomTypeDetailData?.pricings?.length === 0 && (
                                            <div className="text-center py-8">
                                                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                                    <FaDollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400">Chưa có gói giá nào</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Thêm gói giá để bắt đầu</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditPricingModalOpen && (
                <EditPricingRoomTypeModal
                    pricing={selectedPricing}
                    isOpen={isEditPricingModalOpen}
                    onClose={() => {
                        setIsEditPricingModalOpen(false);
                        setSelectedPricing(null);
                    }}
                    onSave={handleUpdatePricing}
                    roomType={roomTypeDetailData}
                />
            )}

            {isAddPricingModalOpen && (
                <AddPricingRoomTypeModal
                    isOpen={isAddPricingModalOpen}
                    onClose={() => setIsAddPricingModalOpen(false)}
                    onSave={handleAddPricing}
                    roomType={roomTypeDetailData}
                />
            )}

            {isEditRoomTypeModalOpen && (
                <EditRoomTypeModal
                    roomType={roomTypeDetailData}
                    isOpen={isEditRoomTypeModalOpen}
                    onClose={() => setIsEditRoomTypeModalOpen(false)}
                    fetchRoomType={fetchRoomTypeDetail}
                />
            )}
        </>

    );
};

export default RoomTypeDetail; 