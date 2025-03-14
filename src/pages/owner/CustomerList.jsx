import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

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
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Move FilterBar outside to prevent re-renders
const FilterBar = ({ searchTerm, setSearchTerm, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
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
        <div className="mb-8">
            <div className="relative group flex">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
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
        </div>
    );
};

const CustomerList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const itemsPerPage = 10;

    // Mock data
    const [customers] = useState([
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            phone: "0123456789",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            totalBookings: 5,
            avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random"
        },
        {
            id: 2,
            name: "Trần Thị B",
            email: "tranthib@example.com",
            phone: "0987654321",
            address: "456 Đường XYZ, Quận 2, TP.HCM",
            totalBookings: 3,
            avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=random"
        }
    ]);

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const filteredCustomers = useMemo(() => {
        let filtered = customers.filter(customer => {
            const searchLower = actualSearchTerm.toLowerCase();
            return customer.name.toLowerCase().includes(searchLower) ||
                customer.email.toLowerCase().includes(searchLower) ||
                customer.phone.includes(actualSearchTerm);
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [customers, actualSearchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

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
                    <div className={`transition-colors ${isSorted ? 'text-primary' : 'text-gray-400 dark:text-gray-600'
                        }`}>
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

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Quản lý khách hàng
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Xem thông tin chi tiết của tất cả khách hàng
                </p>
            </motion.div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-6 mb-8">
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
                            <p className="text-white/80 text-sm">Tổng số khách hàng</p>
                            <p className="text-white text-2xl font-bold">{customers.length}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 
                        dark:from-green-600 dark:to-green-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng lượt đặt phòng</p>
                            <p className="text-white text-2xl font-bold">
                                {customers.reduce((acc, curr) => acc + curr.totalBookings, 0)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                setActualSearchTerm={setActualSearchTerm}
                actualSearchTerm={actualSearchTerm}
            />

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden 
                border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <TableHeader label="Khách hàng" sortKey="name" />
                                <TableHeader label="Email" sortKey="email" />
                                <TableHeader label="Số điện thoại" sortKey="phone" />
                                <TableHeader label="Địa chỉ" sortKey="address" />
                                <TableHeader label="Lượt đặt" sortKey="totalBookings" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {paginatedCustomers.map((customer, index) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 
                                            transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={customer.avatar}
                                                    alt={customer.name}
                                                    className="w-10 h-10 rounded-full object-cover 
                                                        ring-2 ring-gray-200 dark:ring-gray-700"
                                                />
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {customer.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaEnvelope className="text-primary w-4 h-4" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {customer.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-primary w-4 h-4" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {customer.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-primary w-4 h-4 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 
                                                    truncate max-w-xs">
                                                    {customer.address}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {customer.totalBookings}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredCustomers.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <FaUser className="mx-auto w-12 h-12 text-gray-400 
                                dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 
                                dark:text-white mb-2">
                                Không tìm thấy khách hàng
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Thử tìm kiếm với từ khóa khác
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${currentPage === 1
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`w-10 h-10 rounded-lg ${number === currentPage
                                ? 'bg-primary text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${currentPage === totalPages
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default CustomerList; 