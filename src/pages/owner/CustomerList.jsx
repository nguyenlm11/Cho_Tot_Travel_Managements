import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSortAmountDown, FaSortAmountUp, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import CountUp from 'react-countup';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import homestayAPI from '../../services/api/homestayAPI';

const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hover: {
        y: -5,
        transition: {
            type: "spring", stiffness: 400, damping: 10
        }
    }
};

const FilterBar = ({ searchTerm, setSearchTerm, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') { handleSearch(); }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setActualSearchTerm('');
        searchInputRef.current?.focus();
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
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
            </div>
            {actualSearchTerm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                >
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
                </motion.div>
            )}
        </div>
    );
};

const CustomerList = () => {
    const { id: homestayId } = useParams();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const itemsPerPage = 10; // Match HomestayList pagination

    useEffect(() => {
        fetchCustomers();
    }, [homestayId]);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const response = await homestayAPI.getCustomersByHomeStay(homestayId);
            if (response.statusCode === 200) {
                setCustomers(response.data || []);
            } else {
                toast.error('Không thể tải danh sách khách hàng');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Không thể tải danh sách khách hàng');
        } finally {
            setIsLoading(false);
        }
    };

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
    }, [actualSearchTerm]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const statsData = [
        {
            label: 'Tổng số khách hàng',
            value: customers.length,
            color: 'bg-blue-500',
            icon: <FaUsers className="w-6 h-6" />
        },
        {
            label: 'Tổng lượt đặt phòng',
            value: customers.reduce((acc, curr) => acc + (curr.totalBooking || 0), 0),
            color: 'bg-green-500',
            icon: <FaCalendarAlt className="w-6 h-6" />
        }
    ];

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            Danh sách khách hàng
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý tất cả các khách hàng của bạn tại đây
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                    }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {statsData.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={{
                                    hidden: { opacity: 0, y: 50, scale: 0.8, rotate: -5 },
                                    visible: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 150, damping: 10 } }
                                }}
                                className={`${stat.color} rounded-xl p-6 text-white shadow-lg`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className="p-3 bg-white/10 rounded-lg"
                                        initial={{ rotate: -15, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                    <div>
                                        <p className="text-white/80 text-sm">{stat.label}</p>
                                        <h3 className="text-2xl font-bold">
                                            <CountUp end={stat.value} duration={2.5} separator="," delay={0.1} enableScrollSpy scrollSpyOnce>
                                                {({ countUpRef }) => (
                                                    <motion.span
                                                        ref={countUpRef}
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ type: "spring", stiffness: 150, damping: 8, delay: index * 0.2 }}
                                                    />
                                                )}
                                            </CountUp>
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </motion.div>

            {/* Filter Bar */}
            <FilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                setActualSearchTerm={setActualSearchTerm}
                actualSearchTerm={actualSearchTerm}
            />

            {/* Table Layout */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <TableHeader label="Khách hàng" sortKey="name" />
                                <TableHeader label="Email" sortKey="email" />
                                <TableHeader label="Số điện thoại" sortKey="phone" />
                                <TableHeader label="Địa chỉ" sortKey="address" />
                                <TableHeader label="Lượt đặt" sortKey="totalBooking" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {paginatedCustomers.map((customer) => (
                                    <motion.tr
                                        key={customer.accountID}
                                        variants={cardVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit={{ opacity: 0, y: -20 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {customer.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 dark:text-gray-400">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 dark:text-gray-400 truncate max-w-xs">{customer.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600 dark:text-gray-400">{customer.totalBooking}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {/* Empty State */}
                    <AnimatePresence>
                        {filteredCustomers.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mt-6"
                            >
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <FaSearch className="mx-auto w-16 h-16" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Không tìm thấy khách hàng
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Thử tìm kiếm với từ khóa khác
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
                                ? 'bg-primary text-white'
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default CustomerList;