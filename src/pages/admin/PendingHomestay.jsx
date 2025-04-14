import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaUserEdit, FaTrashAlt, FaCheck, FaTimes, FaUserPlus, FaUser, FaSort, FaArrowDown, FaArrowUp, FaUserCheck, FaUserClock, FaPlus } from 'react-icons/fa';
import { TbHomePlus } from "react-icons/tb";
import { IoClose } from 'react-icons/io5';
import { toast, Toaster } from 'react-hot-toast';
import adminAPI from '../../services/api/adminAPI';
import AddCommissionRateModal from '../../components/modals/AddCommissionRateModal';
import { BsThreeDots } from 'react-icons/bs';

const SearchBar = ({ searchTerm, setSearchTerm, handleSearch, setActualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setActualSearchTerm('');
        searchInputRef.current?.focus();
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative flex-1">
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Tìm kiếm homestay..."
                    className="w-full px-4 py-2.5 pl-12 pr-12 text-gray-700 bg-white 
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-primary/20 
                    focus:border-primary transition-colors duration-200
                    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                />
                <FaSearch
                    className="absolute left-4 top-1/2 -translate-y-1/2 
                    text-gray-400 w-4 h-4 pointer-events-none"
                />
                {searchTerm && (
                    <button
                        onClick={handleSearchClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                        text-gray-400 hover:text-gray-600 
                        dark:hover:text-gray-300 hover:bg-gray-100 
                        dark:hover:bg-gray-700 rounded-full
                        transition-all duration-200"
                    >
                        <IoClose className="w-5 h-5" />
                    </button>
                )}
            </div>
            <button
                onClick={handleSearch}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark 
                text-white font-medium rounded-xl 
                flex items-center gap-2
                transition-all duration-200
                hover:shadow-lg hover:shadow-primary/20"
            >
                <FaSearch className="w-4 h-4" />
                Tìm kiếm
            </button>
        </div>
    );
};

export default function PendingHomestay() {
    const [homeStays, setHomeStays] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHomeStay, setNewHomeStay] = useState({ name: '', address: '', status: 'pending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState(null);
    const [sortColumn, setSortColumn] = useState('name');
    const itemsPerPage = 10;
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '', // 'approve' hoặc 'reject'
        homestayId: null,
        commissionRateID: '' // Thêm trường này để lưu tỉ lệ ăn chia
    });
    const [isAddCommissionRateModalOpen, setIsAddCommissionRateModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [homestayIdSelected, setHomestayIdSelected] = useState(null);

    useEffect(() => {
        fetchHomeStays();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-menu')) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchHomeStays = async () => {
        try {
            const response = await adminAPI.getAllRegisterHomestay();
            if (response?.data) {
                setHomeStays(response.data);
                setOriginalData(response.data);
            } else {
                toast.error('Không có dữ liệu homestay');
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching homestays:", error);
            toast.error('Không thể tải danh sách homestay: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        const newDirection = sortDirection === null ? 'asc' : sortDirection === 'asc' ? 'desc' : null;
        setSortDirection(newDirection);
        setSortColumn(column);

        if (newDirection === null) {
            setHomeStays([...originalData]);
            return;
        }

        const sortedHomeStays = [...homeStays].sort((a, b) => {
            if (newDirection === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

        setHomeStays(sortedHomeStays);
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) return <FaSort className="w-5 h-5 ml-2 text-gray-400" />;
        if (sortDirection === null) return <FaSort className="w-5 h-5 ml-2 text-gray-400" />;
        if (sortDirection === 'asc') return <FaArrowDown className="w-5 h-5 ml-2 text-blue-500 animate-bounce" />;
        return <FaArrowUp className="w-5 h-5 ml-2 text-blue-500 animate-bounce" />;
    };

    const filteredHomeStays = homeStays.filter(homeStay => {
        // Chỉ lấy homestay đang chờ phê duyệt
        if (homeStay.status !== 0) return false;

        return homeStay.name.toLowerCase().includes(searchText.toLowerCase()) ||
            homeStay.address.toLowerCase().includes(searchText.toLowerCase());
    });

    // Tính toán số trang
    const totalPages = Math.ceil(filteredHomeStays.length / itemsPerPage);

    // Lấy dữ liệu cho trang hiện tại
    const currentItems = filteredHomeStays.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Xử lý chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalHomeStays = homeStays.length;
    const approvedHomeStays = homeStays.filter(homeStay => homeStay.status === 1).length;
    const pendingHomeStays = homeStays.filter(homeStay => homeStay.status === 0).length;

    const handleApproveClick = (id, commissionRateID) => {
        setConfirmModal({
            isOpen: true,
            type: 'approve',
            homestayId: id,
            commissionRateID: commissionRateID // Reset giá trị khi mở modal
        });
    };

    const handleRejectClick = (id, commissionRateID) => {
        setConfirmModal({
            isOpen: true,
            type: 'reject',
            homestayId: id,
            commissionRateID: commissionRateID
        });
    };

    const handleConfirm = async () => {

        try {
            if (confirmModal.type === 'approve') {
                // Kiểm tra xem đã có commissionRateID chưa
                if (!confirmModal.commissionRateID) {
                    toast.error('Vui lòng nhập tỉ lệ ăn chia trước khi phê duyệt');
                    return;
                }
                const response = await adminAPI.changeHomeStayStatus(
                    confirmModal.homestayId,
                    1,
                    confirmModal.commissionRateID
                );
                if (response?.status === 200 || response?.data) {
                    toast.success('Phê duyệt homestay thành công');
                    await fetchHomeStays();
                } else {
                    toast.error('Phê duyệt homestay thất bại');
                }
            } else {
                const response = await adminAPI.changeHomeStayStatus(
                    confirmModal.homestayId,
                    2,
                    confirmModal.commissionRateID
                );
                if (response?.status === 200 || response?.data) {
                    toast.success('Từ chối homestay thành công');
                    await fetchHomeStays();
                } else {
                    toast.error('Từ chối homestay thất bại');
                }
            }
        } catch (error) {
            console.error("Error in handleConfirm:", error); // Thêm log để debug
            toast.error(`Không thể ${confirmModal.type === 'approve' ? 'phê duyệt' : 'từ chối'} homestay: ${error.message}`);
        } finally {
            setConfirmModal({ isOpen: false, type: '', homestayId: null });
        }
    };

    const handleSearch = () => {
        setActualSearchTerm(searchText);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <Toaster />
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Quản lý phê duyệt HomeStay</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Xem thông tin chi tiết phê duyệt HomeStay
                    </p>
                </div>

            </div>

            {/* Hiển thị tổng số HomeStay */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 
                        dark:from-blue-600 dark:to-blue-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng số HomeStay</p>
                            <p className="text-white text-2xl font-bold">{totalHomeStays}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 
                        dark:from-green-600 dark:to-green-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaUserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng số đã phê duyệt</p>
                            <p className="text-white text-2xl font-bold">{approvedHomeStays}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 
                        dark:from-yellow-600 dark:to-yellow-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaUserClock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng số chờ phê duyệt</p>
                            <p className="text-white text-2xl font-bold">{pendingHomeStays}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 w-96">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Thêm HomeStay</h2>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <IoClose className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium ">Tên HomeStay</label>
                                <input
                                    type="text"
                                    value={newHomeStay.name}
                                    onChange={(e) => setNewHomeStay({ ...newHomeStay, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 text-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Nhập tên HomeStay..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Địa chỉ</label>
                                <input
                                    type="text"
                                    value={newHomeStay.address}
                                    onChange={(e) => setNewHomeStay({ ...newHomeStay, address: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 text-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Nhập địa chỉ..."
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-6">
                <SearchBar
                    searchTerm={searchText}
                    setSearchTerm={setSearchText}
                    handleSearch={handleSearch}
                    setActualSearchTerm={setActualSearchTerm}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white w-1/6">
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Tên Homestay
                                        {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white w-1/4">Địa chỉ</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white w-1/6">Trạng thái</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white w-1/6">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {currentItems.map((homeStay, index) => (
                                    <motion.tr
                                        key={homeStay.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-md'>{homeStay?.name}
                                                <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                    {homeStay?.name}
                                                </span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-md'>
                                                {homeStay?.address}
                                                <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                    {homeStay?.address}
                                                </span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${homeStay.status === 1 ? 'bg-green-100 text-green-800' :
                                                homeStay.status === 2 ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {homeStay.status === 1 ? 'Đã phê duyệt' :
                                                    homeStay.status === 2 ? 'Đã từ chối' :
                                                        'Chờ phê duyệt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === homeStay?.homeStayID ? null : homeStay?.homeStayID)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                    title="Thao tác"
                                                >
                                                    <BsThreeDots className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                </button>

                                                {openDropdownId === homeStay?.homeStayID && (
                                                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dropdown-menu z-50">
                                                        <div className="py-1">
                                                            {homeStay?.commissionRateID ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleApproveClick(homeStay?.homeStayID, homeStay?.commissionRateID);
                                                                            setOpenDropdownId(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                                    >
                                                                        <FaCheck className="w-4 h-4 text-green-500" />
                                                                        Phê duyệt
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            handleRejectClick(homeStay?.homeStayID, homeStay?.commissionRateID);
                                                                            setOpenDropdownId(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                                    >
                                                                        <FaTimes className="w-4 h-4 text-red-500" />
                                                                        Từ chối
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setIsAddCommissionRateModalOpen(true)
                                                                        setHomestayIdSelected(homeStay?.homeStayID)

                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                                >
                                                                    <FaPlus className="w-4 h-4 text-green-500" />
                                                                    Thêm tỉ lệ ăn chia
                                                                </button>
                                                            )}



                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {currentItems.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <FaUser className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy HomeStay
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Thử tìm kiếm với từ khóa khác
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {
                totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg ${currentPage === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className={`w-10 h-10 rounded-lg ${number === currentPage
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg ${currentPage === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )
            }

            <AnimatePresence>
                {confirmModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-xl">
                            <h3 className="text-xl font-semibold mb-4">
                                {confirmModal.type === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {confirmModal.type === 'approve'
                                    ? 'Bạn có chắc chắn muốn phê duyệt homestay này?'
                                    : 'Bạn có chắc chắn muốn từ chối homestay này?'}
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setConfirmModal({ isOpen: false, type: '', homestayId: null })}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmModal.type === 'approve'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {confirmModal.type === 'approve' ? 'Phê duyệt' : 'Từ chối'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {
                isAddCommissionRateModalOpen && (
                    <AddCommissionRateModal
                        isOpen={isAddCommissionRateModalOpen}
                        onClose={() => setIsAddCommissionRateModalOpen(false)}
                        homeStayID={homestayIdSelected}
                        fetchHomestays={fetchHomeStays}
                    />
                )
            }
        </div >
    );
}