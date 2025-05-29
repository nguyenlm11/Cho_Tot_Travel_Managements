import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaSort, FaArrowDown, FaArrowUp, FaUser, FaFilter, FaUserCheck, FaUserTimes, FaEllipsisV, FaEye, FaBan, FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import adminAPI from '../../services/api/adminAPI';
import { toast, Toaster } from 'react-hot-toast';
import ReactDOM from 'react-dom';

const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);
    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: 'active', label: 'Đang hoạt động', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
        { value: 'inactive', label: 'Đã dừng', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
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
        if (e.key === 'Enter') {
            handleSearch();
        }
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
                        placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
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
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full
                                    transition-colors duration-200"
                            >
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
};

function ActionDropdown({ homeStay, handleViewDetail, handleToggleClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 180;
            const dropdownHeight = 100;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            let top = rect.bottom + window.scrollY;
            let left = rect.left + window.scrollX;
            let transform = '';
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                top = rect.top + window.scrollY - dropdownHeight;
                transform = 'translateY(-100%)';
            }
            if (left + dropdownWidth > window.innerWidth - 8) {
                left = window.innerWidth - dropdownWidth - 30;
            }
            setDropdownStyle({
                position: 'absolute',
                top: top,
                left: left,
                zIndex: 9999,
                minWidth: dropdownWidth,
                transform,
            });
        }
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target) &&
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                closeDropdown();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const dropdownContent = (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={dropdownStyle}
            className="rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
        >
            <div className="py-1" role="none">
                <button
                    onClick={() => { handleViewDetail(homeStay.homeStayID); closeDropdown(); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                >
                    <FaEye className="mr-3 w-4 h-4" />
                    Xem chi tiết
                </button>
                <button
                    onClick={() => { handleToggleClick(homeStay.homeStayID, homeStay.status, homeStay?.commissionRateID); closeDropdown(); }}
                    className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 ${homeStay.status === 1 ? 'text-red-600' : 'text-green-600'}`}
                    role="menuitem"
                >
                    {homeStay.status === 1
                        ? <FaBan className="mr-3 w-4 h-4" />
                        : <FaCheck className="mr-3 w-4 h-4" />
                    }
                    {homeStay.status === 1 ? 'Dừng hoạt động' : 'Kích hoạt'}
                </button>
            </div>
        </motion.div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-0"
            >
                <FaEllipsisV className="w-5 h-5" />
            </button>
            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </>
    );
}

export default function AdminHomestay() {
    const [homeStays, setHomeStays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState(null);
    const [originalData, setOriginalData] = useState([]);
    const itemsPerPage = 10;
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '', // 'activate' hoặc 'deactivate'
        homestayId: null,
        currentStatus: null,
        commissionRateID: null
    });
    const [sortColumn, setSortColumn] = useState('name');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHomeStays();
    }, []);

    const fetchHomeStays = async () => {
        try {
            const response = await adminAPI.getAllHomeStayWithOwnerName();
            setHomeStays(response?.data);
            setOriginalData(response?.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast.error('Không thể tải danh sách homestay');
            setLoading(false);
        }
    };

    // Thống kê
    const totalHomeStays = homeStays.filter(homeStay => homeStay.status === 1 || homeStay.status === 2).length;
    const activeHomeStays = homeStays.filter(homeStay => homeStay.status === 1).length;
    const inactiveHomeStays = homeStays.filter(homeStay => homeStay.status === 2).length;

    // Xử lý sắp xếp
    const handleSort = (column) => {
        const newDirection = sortDirection === null ? 'asc' :
            sortDirection === 'asc' ? 'desc' : null;
        setSortDirection(newDirection);
        setSortColumn(column);

        if (newDirection === null) {
            setHomeStays([...originalData]);
            return;
        }

        const sortedHomeStays = [...homeStays].sort((a, b) => {
            const valueA = column === 'name' ? a.name : a.ownerName;
            const valueB = column === 'name' ? b.name : b.ownerName;

            if (newDirection === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
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

    // Xử lý toggle trạng thái hoạt động
    const handleToggleClick = (id, currentStatus, commissionRateID) => {
        setConfirmModal({
            isOpen: true,
            type: currentStatus === 1 ? 'deactivate' : 'activate',
            homestayId: id,
            currentStatus: currentStatus,
            commissionRateID: commissionRateID
        });
    };

    const handleConfirm = async () => {
        try {
            const newStatus = confirmModal.currentStatus === 1 ? 2 : 1;
            // console.log(confirmModal.homestayId);
            // console.log(confirmModal.commissionRateID);
            await adminAPI.changeHomeStayStatus(confirmModal.homestayId, newStatus, confirmModal.commissionRateID);
            toast.success(`${newStatus === 1 ? 'Kích hoạt' : 'Dừng hoạt động'} homestay thành công`);
            await fetchHomeStays();
        } catch (error) {
            console.log(error);
            toast.error('Không thể cập nhật trạng thái homestay');
        } finally {
            setConfirmModal({ isOpen: false, type: '', homestayId: null, currentStatus: null, commissionRateID: null });
        }
    };

    // Cập nhật hàm lọc
    const filteredHomeStays = homeStays.filter(homeStay => {
        // Chỉ lấy những homestay đã được phê duyệt (status 1 hoặc 2)
        if (homeStay.status === 0) return false;

        const matchesSearch = homeStay.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
            homeStay.address.toLowerCase().includes(actualSearchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'active' && homeStay.status === 1) ||
            (selectedStatus === 'inactive' && homeStay.status === 2);
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredHomeStays.length / itemsPerPage);
    const currentItems = filteredHomeStays.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Thêm hàm xử lý tìm kiếm
    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    const handleViewDetail = (homestayId) => {
        navigate(`/admin/homestays/detail/${homestayId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <Toaster />
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Quản lý tất cả HomeStay
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Xem và quản lý trạng thái hoạt động của các HomeStay
                </p>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6"
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
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaUserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Đang hoạt động</p>
                            <p className="text-white text-2xl font-bold">{activeHomeStays}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaUserTimes className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Đã dừng hoạt động</p>
                            <p className="text-white text-2xl font-bold">{inactiveHomeStays}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Thay thế thanh tìm kiếm cũ bằng FilterBar mới */}
            <FilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                handleSearch={handleSearch}
                setActualSearchTerm={setActualSearchTerm}
                actualSearchTerm={actualSearchTerm}
            />

            {/* Bảng danh sách */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-white w-[22%] min-w-[120px]">
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Tên Homestay
                                        {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-white w-[18%] min-w-[100px]">
                                    <button
                                        onClick={() => handleSort('ownerName')}
                                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Chủ sở hữu
                                        {getSortIcon('ownerName')}
                                    </button>
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-white w-[38%] min-w-[180px]">
                                    Địa chỉ
                                </th>
                                <th className="py-3 px-4 text-center text-sm font-medium text-gray-900 dark:text-white w-[11%] min-w-[80px]">
                                    Trạng thái
                                </th>
                                <th className="py-3 px-2 text-center text-sm font-medium text-gray-900 dark:text-white w-[5%] min-w-[60px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currentItems.map((homeStay, index) => (
                                <motion.tr
                                    key={homeStay.homeStayID}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <td className="px-4 py-3 whitespace-nowrap relative group">
                                        <p className='overflow-hidden truncate max-w-md'>{homeStay?.name}
                                            <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                {homeStay?.name}
                                            </span>
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap relative group">
                                        <p className='overflow-hidden truncate max-w-md'>{homeStay?.ownerName}
                                            <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                {homeStay?.ownerName}
                                            </span>
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap relative group">
                                        <p className='overflow-hidden truncate max-w-lg'>
                                            {homeStay?.address}
                                            <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                {homeStay?.address}
                                            </span>
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${homeStay.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {homeStay.status === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 text-center">
                                        <ActionDropdown
                                            homeStay={homeStay}
                                            handleViewDetail={handleViewDetail}
                                            handleToggleClick={handleToggleClick}
                                        />
                                    </td>
                                </motion.tr>
                            ))}
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

            {/* Phân trang */}
            {totalPages > 1 && (
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
            )}

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
                                {confirmModal.type === 'activate' ? 'Xác nhận kích hoạt' : 'Xác nhận dừng hoạt động'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {confirmModal.type === 'activate'
                                    ? 'Bạn có chắc chắn muốn kích hoạt homestay này?'
                                    : 'Bạn có chắc chắn muốn dừng hoạt động homestay này?'}
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setConfirmModal({ isOpen: false, type: '', homestayId: null, currentStatus: null, commissionRateID: null })}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmModal.type === 'activate'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {confirmModal.type === 'activate' ? 'Kích hoạt' : 'Dừng hoạt động'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 