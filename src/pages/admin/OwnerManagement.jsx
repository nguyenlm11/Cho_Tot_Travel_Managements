import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserTie, FaSearch, FaSortAmountUp, FaSortAmountDown, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { API_CONFIG } from '../../services/config';
import { IoClose, IoEye, IoEyeOff } from 'react-icons/io5';
import { IoPersonAddSharp } from "react-icons/io5";
import adminAPI from '../../services/api/adminAPI';

const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

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
                    placeholder="Tìm kiếm khách hàng..."
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

const OwnerManagement = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // State để lưu trữ thông tin owner mới
    const [newOwner, setNewOwner] = useState({
        userID: '',
        userName: '',
        email: '',
        name: '',
        address: '',
        phone: '',
        taxcode: '',
        bankAccountNumber: '',
        role: 'Owner'
    });

    const itemsPerPage = 10;

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const response = await adminAPI.getAllOwnerHomestays();
            if (response.error) {
                throw new Error(response.error);
            }
            const ownerAccounts = response.filter(account =>
                account.roles.includes('Owner')
            );
            setOwners(ownerAccounts);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching owners:", error);
            toast.error('Không thể tải danh sách chủ nhà: ' + (error.message || 'Có lỗi xảy ra'));
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredOwners = owners.filter(owner =>
        owner.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
        owner.phone.includes(actualSearchTerm)
    );

    const sortedOwners = [...filteredOwners].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const totalPages = Math.ceil(sortedOwners.length / itemsPerPage);
    const paginatedOwners = sortedOwners.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const TableHeader = ({ label, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th
                onClick={() => handleSort(sortKey)}
                className="px-6 py-3 text-left cursor-pointer group hover:bg-gray-100 
                    dark:hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                    <div className={`transition-colors ${isSorted ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                        {isSorted && (
                            sortConfig.direction === 'asc'
                                ? <FaSortAmountUp className="w-4 h-4" />
                                : <FaSortAmountDown className="w-4 h-4" />
                        )}
                    </div>
                </div>
            </th>
        );
    };

    const statsData = [
        {
            label: 'Tổng số chủ nhà',
            value: owners.length,
            icon: <FaUserTie className="w-6 h-6 text-white" />,
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Chủ nhà hoạt động',
            value: owners.filter(owner => owner.isActive === true).length,
            icon: <FaUserCheck className="w-6 h-6 text-white" />,
            gradient: 'from-green-500 to-green-600'
        },
        {
            label: 'Chủ nhà không hoạt động',
            value: owners.filter(owner => owner.isActive === false).length,
            icon: <FaUserTimes className="w-6 h-6 text-white" />,
            gradient: 'from-red-500 to-red-600'
        }
    ];

    const handleCreateOwner = async () => {
        const confirmAdd = window.confirm("Bạn có chắc chắn muốn thêm chủ nhà mới?");
        if (confirmAdd) {
            // Kiểm tra các trường cần thiết
            if (!newOwner.userName || !newOwner.email || !newOwner.name || !newOwner.phone || !newOwner.address || !newOwner.bankAccountNumber) {
                toast.error('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            try {
                console.log("Dữ liệu gửi đi:", newOwner); // Thêm log để kiểm tra
                const result = await adminAPI.addOwnerHomestay(newOwner); // Gọi API để thêm owner
                if (result.error) {
                    throw new Error(result.error); // Kiểm tra nếu có lỗi từ API
                }
                toast.success('Chủ nhà mới đã được thêm thành công!');
                setIsModalOpen(false); // Đóng modal sau khi thêm
                fetchOwners(); // Cập nhật danh sách chủ nhà
            } catch (error) {
                toast.error('Không thể thêm chủ nhà: ' + (error.message || 'Có lỗi xảy ra'));
            }
        } else {
            toast.info('Thêm chủ nhà đã bị hủy.');
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"
        >
            <Toaster />

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Quản lý chủ nhà
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Xem và quản lý thông tin của tất cả chủ nhà
                </p>
            </motion.div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statsData.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-6`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-white/80 text-sm">{stat.label}</p>
                                <p className="text-white text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search Bar and Create Owner Button */}
            <motion.div variants={itemVariants} className="mb-6 items-center">
                <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleSearch={handleSearch}
                    setActualSearchTerm={setActualSearchTerm}
                />
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <TableHeader label="Tên chủ nhà" sortKey="name" />
                                <TableHeader label="Email" sortKey="email" />
                                <TableHeader label="Số điện thoại" sortKey="phone" />
                                <TableHeader label="Địa chỉ" sortKey="address" />
                                <TableHeader label="Trạng thái" sortKey="status" />
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedOwners.map((owner, index) => (
                                    <motion.tr
                                        key={owner.userID}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap relative group">

                                            <p className='overflow-hidden truncate max-w-md'>{owner.name}
                                                <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                    {owner.name}
                                                </span>
                                            </p>

                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-md'>{owner.email}
                                                <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                    {owner.email}
                                                </span>
                                            </p>
                                        </td>
                                        <td className="px-9 py-4 whitespace-nowrap relative group">
                                            <div className="flex items-center gap-2">
                                                <p className='overflow-hidden truncate max-w-md'>
                                                    {owner?.phone}
                                                    <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                        {owner?.phone}
                                                    </span>
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap relative group">
                                            <p className='overflow-hidden truncate max-w-md'>
                                                {owner.address}
                                                <span className="absolute hidden group-hover:block bg-gray-500 text-white text-sm rounded-md px-1 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-max z-50">
                                                    {owner.address}
                                                </span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 ">
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                                {owner.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg
                                                        dark:hover:bg-blue-900/20 transition-colors"
                                                    onClick={() => {/* Handle edit */ }}
                                                >
                                                    <FaEdit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg
                                                        dark:hover:bg-red-900/20 transition-colors"
                                                    onClick={() => {/* Handle delete */ }}
                                                >
                                                    <FaTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {filteredOwners.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <FaUserTie className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy chủ nhà
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Thử tìm kiếm với từ khóa khác
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FaChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default OwnerManagement; 