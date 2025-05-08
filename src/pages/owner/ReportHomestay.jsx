import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMoneyBillWave, FaFileInvoiceDollar, FaSort, FaArrowDown, FaArrowUp, FaFilter, FaSync, FaSortAmountDown, FaSortAmountUp, FaChevronDown } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import reportHomestayApi from '../../services/api/reportHomestayAPI';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import CountUp from 'react-countup';

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
    }
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);
    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', icon: <FaFilter className="text-gray-400" /> },
        { value: '00', label: 'Thành công', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
        { value: '01', label: 'Đang xử lý', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> }
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
                        placeholder="Tìm kiếm theo mã giao dịch, tên người dùng..."
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

const TableHeader = ({ label, sortKey, sortConfig, onSort }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
        <th
            onClick={() => onSort(sortKey)}
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

const ReportHomestay = () => {
    const { id } = useParams();
    const [transactions, setTransactions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'payDate', direction: 'desc' });
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const itemsPerPage = 10;
    const [actualSearchTerm, setActualSearchTerm] = useState('');

    useEffect(() => {
        fetchReportHomestay();
    }, []);

    const fetchReportHomestay = async () => {
        try {
            setLoading(true);
            const response = await reportHomestayApi.getReportHomestayByHomestayId(id);
            if (response.statusCode === 200) {
                const sortedData = response.data.sort((a, b) => {
                    const dateA = new Date(a.payDate);
                    const dateB = new Date(b.payDate);
                    return dateB - dateA;
                });
                setTransactions(sortedData);
            } else {
                toast.error('Không thể tải dữ liệu báo cáo');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, transaction) => {
        const amount = transaction.amount / 100;
        if (transaction.transactionKind === 2) {
            return sum - amount; // Trừ đi số tiền hoàn
        }
        return sum + amount; // Cộng thêm số tiền đặt cọc và thanh toán đủ
    }, 0);
    const successfulTransactions = transactions.filter(transaction => transaction.transactionStatus === '00').length;
    const pendingTransactions = transactions.filter(transaction => transaction.transactionStatus === '01').length;

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        if (actualSearchTerm) {
            const searchLower = actualSearchTerm.toLowerCase();
            filtered = filtered.filter(transaction =>
                transaction.tmnCode?.toLowerCase().includes(searchLower) ||
                transaction.account?.name?.toLowerCase().includes(searchLower) ||
                transaction.homeStay?.name?.toLowerCase().includes(searchLower)
            );
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(transaction => transaction.transactionStatus === selectedStatus);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'payDate') {
                    const dateA = new Date(a.payDate);
                    const dateB = new Date(b.payDate);
                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }
                if (sortConfig.key === 'amount') {
                    return sortConfig.direction === 'asc' 
                        ? (a.amount / 100) - (b.amount / 100)
                        : (b.amount / 100) - (a.amount / 100);
                }
                return 0;
            });
        }

        return filtered;
    }, [transactions, actualSearchTerm, selectedStatus, sortConfig]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case '00':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case '01':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case '00':
                return 'Thành công';
            case '01':
                return 'Đang xử lý';
            default:
                return 'Không xác định';
        }
    };

    const getTransactionKindText = (kind) => {
        switch (kind) {
            case 0:
                return 'Đặt cọc';
            case 1:
                return 'Thanh toán đủ';
            case 2:
                return 'Hoàn tiền';
            default:
                return 'Không xác định';
        }
    };

    const getTransactionKindColor = (kind) => {
        switch (kind) {
            case 0:
            case 1:
                return 'text-green-600 dark:text-green-400';
            case 2:
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const formatAmount = (amount, kind) => {
        const formattedAmount = formatCurrency(amount / 100);
        return kind === 2 ? `-${formattedAmount}` : formattedAmount;
    };

    const handleSearch = () => {
        setActualSearchTerm(searchText);
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        fetchReportHomestay();
        setSearchText('');
        setActualSearchTerm('');
        setCurrentPage(1);
        setSortConfig({ key: 'payDate', direction: 'desc' });
        setSelectedStatus('all');
        toast.success('Đã làm mới danh sách giao dịch', {
            id: 'refresh-success',
            style: {
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #6EE7B7'
            },
        });
    };

    const statsData = useMemo(() => [
        { label: 'Tổng số giao dịch', value: totalTransactions, color: 'bg-blue-500', icon: <FaFileInvoiceDollar className="w-6 h-6" /> },
        { label: 'Tổng giá trị', value: totalAmount, color: 'bg-green-500', icon: <FaMoneyBillWave className="w-6 h-6" /> },
        { label: 'Giao dịch thành công', value: successfulTransactions, color: 'bg-indigo-500', icon: <FaFileInvoiceDollar className="w-6 h-6" /> },
        { label: 'Đang xử lý', value: pendingTransactions, color: 'bg-yellow-500', icon: <FaFileInvoiceDollar className="w-6 h-6" /> }
    ], [totalTransactions, totalAmount, successfulTransactions, pendingTransactions]);

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"
        >
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            Báo cáo giao dịch Homestay
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Xem và quản lý tất cả các giao dịch liên quan đến Homestay
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                        font-medium rounded-lg transition-colors shadow-sm hover:shadow-lg"
                    >
                        <FaSync className="w-4 h-4" /> Làm mới
                    </button>
                </div>

                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                    }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                                            {stat.label === 'Tổng giá trị' ? (
                                                formatCurrency(stat.value)
                                            ) : (
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
                                            )}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </motion.div>

            <FilterBar
                searchTerm={searchText}
                setSearchTerm={setSearchText}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                handleSearch={handleSearch}
                setActualSearchTerm={setActualSearchTerm}
                actualSearchTerm={actualSearchTerm}
            />

            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <TableHeader label="Ngày thanh toán" sortKey="payDate" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHeader label="Mã giao dịch" sortKey="tmnCode" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHeader label="Người thanh toán" sortKey="payerName" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHeader label="Loại giao dịch" sortKey="transactionKind" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHeader label="Số tiền" sortKey="amount" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedTransactions.map((transaction) => (
                                    <motion.tr
                                        key={transaction.tmnCode}
                                        variants={cardVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit={{ opacity: 0, y: -20 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatDate(transaction.payDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {transaction.tmnCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {transaction.account?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionKindColor(transaction.transactionKind)}`}>
                                                {getTransactionKindText(transaction.transactionKind)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className={getTransactionKindColor(transaction.transactionKind)}>
                                                {formatAmount(transaction.amount, transaction.transactionKind)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.transactionStatus)}`}>
                                                {getStatusText(transaction.transactionStatus)}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {paginatedTransactions.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-16"
                            >
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <FaSearch className="mx-auto w-16 h-16" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Không tìm thấy giao dịch
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {actualSearchTerm || selectedStatus !== 'all'
                                        ? 'Không có giao dịch nào phù hợp với bộ lọc của bạn'
                                        : 'Chưa có giao dịch nào được tạo cho homestay này'}
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>

            {!loading && totalPages > 1 && (
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

export default ReportHomestay;