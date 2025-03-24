import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaMoneyBillWave, FaFileInvoiceDollar, FaSort, FaArrowDown, FaArrowUp, FaEye } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const mockData = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    transactionId: `TRX${String(index + 1).padStart(6, '0')}`,
    ownerName: `Chủ nhà ${index + 1}`,
    amount: Math.floor(Math.random() * 10000000) + 500000,
    type: index % 2 === 0 ? 'deposit' : 'withdrawal',
    status: index % 4 === 0 ? 'pending' : index % 4 === 1 ? 'completed' : index % 4 === 2 ? 'failed' : 'refunded',
    date: new Date(2024, 0, index + 1).toISOString()
}));

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
                    placeholder="Tìm kiếm theo mã giao dịch, tên chủ nhà..."
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

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState(mockData);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState(null);
    const itemsPerPage = 10;
    const [actualSearchTerm, setActualSearchTerm] = useState('');

    // Tính toán thống kê giao dịch
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const successfulTransactions = transactions.filter(transaction => transaction.status === 'completed').length;
    const pendingTransactions = transactions.filter(transaction => transaction.status === 'pending').length;

    const handleSort = () => {
        const newDirection = sortDirection === null ? 'asc' : sortDirection === 'asc' ? 'desc' : null;
        setSortDirection(newDirection);

        if (newDirection === null) {
            setTransactions(mockData);
            return;
        }

        const sortedTransactions = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (newDirection === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        setTransactions(sortedTransactions);
    };

    const getSortIcon = () => {
        if (sortDirection === null) return <FaSort className="w-5 h-5 ml-2 text-gray-400" />;
        if (sortDirection === 'asc') return <FaArrowDown className="w-5 h-5 ml-2 text-blue-500 animate-bounce" />;
        return <FaArrowUp className="w-5 h-5 ml-2 text-blue-500 animate-bounce" />;
    };

    const filteredTransactions = transactions.filter(transaction =>
        transaction.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.ownerName.toLowerCase().includes(searchText.toLowerCase())
    );

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'refunded':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'pending':
                return 'Đang xử lý';
            case 'failed':
                return 'Thất bại';
            case 'refunded':
                return 'Hoàn tiền';
            default:
                return status;
        }
    };

    const getTypeText = (type) => {
        return type === 'deposit' ? 'Nạp tiền' : 'Rút tiền';
    };

    const handleSearch = () => {
        setActualSearchTerm(searchText);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Lịch sử giao dịch
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Xem và quản lý tất cả các giao dịch trong hệ thống
                </p>
            </div>

            {/* Thống kê giao dịch */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 
                        dark:from-blue-600 dark:to-blue-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaFileInvoiceDollar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng số giao dịch</p>
                            <p className="text-white text-2xl font-bold">{totalTransactions}</p>
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
                            <FaMoneyBillWave className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng giá trị giao dịch</p>
                            <p className="text-white text-2xl font-bold">{formatCurrency(totalAmount)}</p>
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
                            <FaFileInvoiceDollar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Giao dịch thành công</p>
                            <p className="text-white text-2xl font-bold">{successfulTransactions}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 
                        dark:from-orange-600 dark:to-orange-700 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <FaFileInvoiceDollar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Giao dịch đang xử lý</p>
                            <p className="text-white text-2xl font-bold">{pendingTransactions}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="mb-6">
                <SearchBar
                    searchTerm={searchText}
                    setSearchTerm={setSearchText}
                    handleSearch={handleSearch}
                    setActualSearchTerm={setActualSearchTerm}
                />
            </div>

            {/* Bảng giao dịch */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">
                                    <button
                                        onClick={handleSort}
                                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                                    >
                                        Ngày giao dịch
                                        {getSortIcon()}
                                    </button>
                                </th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Mã giao dịch</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Chủ nhà</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Loại</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Số tiền</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Trạng thái</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {paginatedTransactions.map((transaction, index) => (
                                    <motion.tr
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {new Date(transaction.date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {transaction.transactionId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {transaction.ownerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {getTypeText(transaction.type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                                {getStatusText(transaction.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                                <FaEye className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {paginatedTransactions.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <FaFileInvoiceDollar className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy giao dịch nào
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
        </div>
    );
} 