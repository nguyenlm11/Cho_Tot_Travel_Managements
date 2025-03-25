import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import {
    FaArrowLeft, FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
    FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaBed, FaRegClock, FaChevronDown, FaEye
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import roomAPI from '../../services/api/roomAPI';
import RoomAddModal from '../../components/modals/RoomAddModal';

const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1, y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: 'active', label: 'Hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
        { value: 'inactive', label: 'Tạm ngưng', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
    ];

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setActualSearchTerm('');
        searchInputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') { handleSearch() }
    };

    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group flex">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm theo số phòng..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyPress}
                        className="flex-1 pl-10 pr-[140px] py-3 rounded-l-xl border border-gray-200 
                            dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                            dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                            focus:border-primary transition-all duration-200
                            hover:border-primary/50 hover:shadow-md"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleSearchClear}
                            className="absolute right-[140px] top-1/2 -translate-y-1/2 p-1.5
                                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                                transition-all duration-200"
                        >
                            <IoClose className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleSearch}
                        className="px-6 bg-primary hover:bg-primary-dark text-white font-medium 
                            rounded-r-xl flex items-center gap-2 transition-all duration-200
                            hover:shadow-lg hover:shadow-primary/20 min-w-[120px] justify-center
                            border-l-0"
                    >
                        <FaSearch className="w-4 h-4" />
                        Tìm kiếm
                    </button>
                </div>
                <div className="relative min-w-[220px]">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaFilter className="text-gray-400" />
                    </div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 
                            dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                            dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                            focus:border-primary transition-all duration-200
                            hover:border-primary/50 hover:shadow-md appearance-none cursor-pointer"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <FaChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>
            {(actualSearchTerm || selectedStatus !== 'all') && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                >
                    {actualSearchTerm && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary/10 text-primary text-sm font-medium"
                        >
                            <FaSearch className="w-3 h-3" />
                            {actualSearchTerm}
                            <button
                                onClick={handleSearchClear}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full
                                    transition-colors duration-200"
                            >
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                    {selectedStatus !== 'all' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary/10 text-primary text-sm font-medium"
                        >
                            {statusOptions.find(opt => opt.value === selectedStatus)?.icon}
                            {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                            <button
                                onClick={() => setSelectedStatus('all')}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors duration-200">
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
};

const RoomCard = ({ room, homestayId, rentalId, roomTypeId, onDelete }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden
                border border-gray-100 dark:border-gray-700 
                transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                            Phòng {room.roomNumber}
                        </h2>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium
                        ${room.isActive
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-100'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100'}`}
                    >
                        {room.isActive ? (
                            <div className="flex items-center">
                                <FaToggleOn className="mr-1" /> Hoạt động
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <FaToggleOff className="mr-1" /> Ngừng hoạt động
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <FaRegClock className="mr-1" /> Cập nhật gần đây
                    </div>

                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}/roomtypes/${roomTypeId}/rooms/${room.roomID}`)}
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FaEye className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}/roomtypes/${roomTypeId}/rooms/${room.roomID}/edit`)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                        >
                            <FaEdit className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(room)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                        >
                            <FaTrash className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const RoomList = () => {
    const { id: homestayId, rentalId: rentalId, roomTypeId } = useParams();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, [roomTypeId, rentalId]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await roomAPI.getAllRoomsByRoomType(roomTypeId);
            if (response && response.statusCode === 200) {
                setRooms(response.data || []);
            } else {
                toast.error('Không thể tải danh sách phòng');
                setRooms([]);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Đã xảy ra lỗi khi tải danh sách phòng');
            setRooms([]);
        } finally {
            setTimeout(() => setLoading(false), 1500);
        }
    };

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const filteredAndSortedRooms = React.useMemo(() => {
        let filtered = rooms.filter(room => {
            const matchesSearch = room.roomNumber.toLowerCase().includes(actualSearchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' ||
                (selectedStatus === 'active' && room.isActive) ||
                (selectedStatus === 'inactive' && !room.isActive);
            return matchesSearch && matchesStatus;
        });
        return filtered;
    }, [rooms, actualSearchTerm, selectedStatus]);

    const totalPages = Math.ceil(filteredAndSortedRooms.length / itemsPerPage);
    const currentRooms = filteredAndSortedRooms.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roomToDelete) return;

        try {
            const response = await roomAPI.deleteRoom(roomToDelete.roomID);
            if (response && response.statusCode === 200) {
                toast.success('Xóa phòng thành công');
                setRooms(prevRooms => prevRooms.filter(r => r.roomID !== roomToDelete.roomID));
            } else {
                toast.error(response.message || 'Không thể xóa phòng');
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            toast.error('Đã xảy ra lỗi khi xóa phòng');
        } finally {
            setShowDeleteModal(false);
            setRoomToDelete(null);
        }
    };

    const statsData = [
        {
            label: 'Tổng số phòng',
            value: rooms.length,
            color: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800',
            icon: <FaBed className="w-6 h-6" />
        },
        {
            label: 'Hoạt động',
            value: rooms.filter(room => room.isActive).length,
            color: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-800',
            icon: <FaToggleOn className="w-6 h-6" />
        },
        {
            label: 'Tạm ngưng',
            value: rooms.filter(room => !room.isActive).length,
            color: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-800',
            icon: <FaToggleOff className="w-6 h-6" />
        }
    ];

    return (
        <>
            <Toaster position="top-right" />
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12"
            >
                {/* Header Section - Giống với HomestayList.jsx */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => navigate(`/owner/homestays/${homestayId}/rentals/${rentalId}`)}
                                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <FaArrowLeft className="w-5 h-5" />
                                </motion.button>
                                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                                    Danh sách phòng
                                </h1>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary hover:bg-primary-dark text-white font-semibold 
                                px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300"
                        >
                            <FaPlus className="w-5 h-5" />
                            Thêm phòng mới
                        </motion.button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statsData.map((stat, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className={`bg-gradient-to-r ${stat.color} text-white rounded-xl shadow-lg p-4`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/80 text-sm">{stat.label}</p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        {stat.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Filter Bar */}
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    handleSearch={handleSearch}
                    setActualSearchTerm={setActualSearchTerm}
                    actualSearchTerm={actualSearchTerm}
                />

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {currentRooms.map((room) => (
                                <RoomCard
                                    key={room.roomID}
                                    room={room}
                                    homestayId={homestayId}
                                    roomTypeId={roomTypeId}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </motion.div>

                        {/* Empty State */}
                        {currentRooms.length === 0 && (
                            <motion.div
                                key="empty"
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center"
                            >
                                <FaBed className="mx-auto text-gray-400 dark:text-gray-600 mb-4 w-16 h-16" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Chưa có phòng nào
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    {actualSearchTerm
                                        ? `Không tìm thấy phòng nào phù hợp với "${actualSearchTerm}". Vui lòng thử tìm kiếm khác.`
                                        : 'Thêm phòng mới cho loại phòng này để khách hàng có thể đặt.'}
                                </p>
                                {!actualSearchTerm && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary-dark dark:hover:bg-primary-light text-white 
                                    rounded-lg shadow-md inline-flex items-center font-medium"
                                    >
                                        <FaPlus className="mr-2" /> Thêm phòng mới
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg ${currentPage === 1
                                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <FaChevronLeft className="w-5 h-5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
                                        className={`w-10 h-10 rounded-lg ${number === currentPage
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg ${currentPage === totalPages
                                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <FaChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                        >
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                    <FaTrash className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Xác nhận xóa phòng
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Bạn có chắc chắn muốn xóa phòng <span className="font-medium text-gray-900 dark:text-white">{roomToDelete?.roomNumber}</span>?
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 
                                        dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                                >
                                    Xác nhận xóa
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RoomAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                roomTypeId={roomTypeId}
                onSuccess={fetchRooms}
            />
        </>
    );
};

export default RoomList;