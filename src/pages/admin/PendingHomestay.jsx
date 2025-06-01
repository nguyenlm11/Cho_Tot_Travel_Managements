import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaCheck, FaTimes, FaUser, FaUserCheck, FaUserClock, FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { toast, Toaster } from 'react-hot-toast';
import adminAPI from '../../services/api/adminAPI';
import AddCommissionRateModal from '../../components/modals/AddCommissionRateModal';
import { BsThreeDots } from 'react-icons/bs';
import EditCommissionRateByAdminModal from '../../components/modals/EditCommissionRateByAdminModal';
import ReactDOM from 'react-dom';

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

function ActionDropdown({ homeStay, onApprove, onReject, onAddCommission, onEditCommission, onViewDetail }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 180;
            const dropdownHeight = 120;
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
                    onClick={() => { onViewDetail(homeStay?.homeStayID); closeDropdown(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                >
                    <FaEye className="w-4 h-4 text-green-500" />
                    Xem chi tiết
                </button>

                {/* Chỉ hiển thị các action khác nếu homestay chưa bị từ chối (status !== 2) */}
                {homeStay?.status !== 2 && (
                    <>
                        {(homeStay?.commissionRate?.isAccepted == true && homeStay?.commissionRate?.ownerAccepted == true) ? (
                            <>
                                <button
                                    onClick={() => { console.log('onApprove', homeStay?.homeStayID, homeStay?.commissionRateID); onApprove(homeStay?.homeStayID, homeStay?.commissionRateID); closeDropdown(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                                >
                                    <FaCheck className="w-4 h-4 text-green-500" />
                                    Phê duyệt
                                </button>
                                <button
                                    onClick={() => { console.log('onReject', homeStay?.homeStayID, homeStay?.commissionRateID); onReject(homeStay?.homeStayID, homeStay?.commissionRateID); closeDropdown(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                                >
                                    <FaTimes className="w-4 h-4 text-red-500" />
                                    Từ chối
                                </button>
                            </>
                        ) : (
                            <>
                                {((homeStay?.commissionRate?.hostShare === 0 && homeStay?.commissionRate?.platformShare === 0) || (homeStay?.commissionRate == null)) && (
                                    <>
                                        <button
                                            onClick={() => { console.log('onAddCommission', homeStay?.homeStayID); onAddCommission(homeStay?.homeStayID); closeDropdown(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                                        >
                                            <FaPlus className="w-4 h-4 text-green-500" />
                                            Thêm tỉ lệ hoa hồng
                                        </button>
                                        <button
                                            onClick={() => { console.log('onReject', homeStay?.homeStayID, homeStay?.commissionRateID); onReject(homeStay?.homeStayID, homeStay?.commissionRateID); closeDropdown(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                                        >
                                            <FaTimes className="w-4 h-4 text-red-500" />
                                            Từ chối
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        {((homeStay?.commissionRate?.ownerAccepted == null || homeStay?.commissionRate?.ownerAccepted == false) && (homeStay?.commissionRate?.isAccepted == true || homeStay?.commissionRate?.isAccepted == false)) && (
                            <>
                                <button
                                    onClick={() => { console.log('onEditCommission', homeStay?.homeStayID); onEditCommission(homeStay?.homeStayID); closeDropdown(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                                >
                                    <FaEdit className="w-4 h-4 text-green-500" />
                                    Cập nhật tỉ lệ
                                </button>
                                <button
                                    onClick={() => { console.log('onReject', homeStay?.homeStayID, homeStay?.commissionRateID); onReject(homeStay?.homeStayID, homeStay?.commissionRateID); closeDropdown(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 light:text-gray-200 hover:text-gray-20 flex items-center gap-2"
                                >
                                    <FaTimes className="w-4 h-4 text-red-500" />
                                    Từ chối
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center"
            >
                <BsThreeDots className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </>
    );
}

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
        type: '',
        homestayId: null,
        commissionRateID: ''
    });
    const [isAddCommissionRateModalOpen, setIsAddCommissionRateModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [homestayIdSelected, setHomestayIdSelected] = useState(null);
    const [isEditCommissionRateModalOpen, setIsEditCommissionRateModalOpen] = useState(false)
    const navigate = useNavigate();

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
                const sortedData = response.data.sort((a, b) => b.homeStayID - a.homeStayID);
                setHomeStays(sortedData);
                setOriginalData(sortedData);
                setCurrentPage(1);
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

    const filteredHomeStays = homeStays.filter(homeStay => {
        if (homeStay.status !== 0 && homeStay.status !== 2) return false;
        return homeStay.name.toLowerCase().includes(searchText.toLowerCase()) ||
            homeStay.address.toLowerCase().includes(searchText.toLowerCase());
    });

    const totalPages = Math.ceil(filteredHomeStays.length / itemsPerPage);
    const currentItems = filteredHomeStays.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const approvedHomeStays = homeStays.filter(homeStay => homeStay.status === 1).length;
    const pendingHomeStays = homeStays.filter(homeStay => homeStay.status === 0).length;
    const rejectedHomeStays = homeStays.filter(homeStay => homeStay.status === 2).length;

    const handleApproveClick = (id, commissionRateID) => {
        setConfirmModal({
            isOpen: true,
            type: 'approve',
            homestayId: id,
            commissionRateID: commissionRateID
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
            console.error("Error in handleConfirm:", error);
            toast.error(`Không thể ${confirmModal.type === 'approve' ? 'phê duyệt' : 'từ chối'} homestay: ${error.message}`);
        } finally {
            setConfirmModal({ isOpen: false, type: '', homestayId: null });
        }
    };

    const handleSearch = () => {
        setActualSearchTerm(searchText);
        setCurrentPage(1);
    };

    const handleViewDetail = (homestayId) => {
        // Tìm homestay để lấy tên chủ nhà
        const homestay = homeStays.find(hs => hs.homeStayID === homestayId);
        const ownerName = homestay?.account?.name;

        navigate(`/admin/homestays/detail/${homestayId}`, {
            state: { ownerName }
        });
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

            <div className="grid grid-cols-3 gap-4 mb-8">
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
                            <p className="text-white/80 text-sm">Chờ phê duyệt</p>
                            <p className="text-white text-2xl font-bold">{pendingHomeStays}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500 to-red-600 
                        dark:from-red-600 dark:to-red-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaTimes className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Đã từ chối</p>
                            <p className="text-white text-2xl font-bold">{rejectedHomeStays}</p>
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
                            <p className="text-white/80 text-sm">Đã phê duyệt</p>
                            <p className="text-white text-2xl font-bold">{approvedHomeStays}</p>
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
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-white w-[18%] min-w-[100px]">Tên Homestay</th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-white w-[18%] min-w-[100px]">Chủ nhà</th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-white w-[34%] min-w-[160px]">Địa chỉ</th>
                                <th className="py-3 px-4 text-center text-sm font-medium text-gray-900 dark:text-white w-[10%] min-w-[80px]">Trạng thái</th>
                                <th className="py-3 px-4 text-center text-sm font-medium text-gray-900 dark:text-white w-[10%] min-w-[80px]">Ngày đăng ký</th>
                                <th className="py-3 px-2 text-center text-sm font-medium text-gray-900 dark:text-white w-[5%] min-w-[60px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {currentItems.map((homeStay, index) => (
                                    <motion.tr
                                        key={homeStay.homeStayID}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-md'>{homeStay?.name}</p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-md'>{homeStay?.account?.name}</p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-lg'>{homeStay?.address}</p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${homeStay.status === 1 ? 'bg-green-100 text-green-800' :
                                                homeStay.status === 2 ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {homeStay.status === 1 ? 'Đã phê duyệt' :
                                                    homeStay.status === 2 ? 'Đã từ chối' :
                                                        'Chờ phê duyệt'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {new Date(homeStay.createAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <ActionDropdown
                                                homeStay={homeStay}
                                                onApprove={handleApproveClick}
                                                onReject={handleRejectClick}
                                                onAddCommission={(id) => { setIsAddCommissionRateModalOpen(true); setHomestayIdSelected(id); }}
                                                onEditCommission={(id) => { setIsEditCommissionRateModalOpen(true); setHomestayIdSelected(id); }}
                                                onViewDetail={handleViewDetail}
                                            />
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
            {
                isEditCommissionRateModalOpen && (
                    <EditCommissionRateByAdminModal
                        isOpen={isEditCommissionRateModalOpen}
                        onClose={() => setIsEditCommissionRateModalOpen(false)}
                        commissionRateID={currentItems?.commissionRateID}
                        homeStayID={homestayIdSelected}
                        fetchHomestays={fetchHomeStays}
                    />
                )
            }
        </div >
    );
}