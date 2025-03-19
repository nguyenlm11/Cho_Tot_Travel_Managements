import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaUserEdit, FaTrashAlt, FaUserPlus, FaEye, FaLock, FaUnlock, FaUser, FaEnvelope, FaPhone, FaSort, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const mockData = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    fullName: `Chủ nhà ${index + 1}`,
    email: `owner${index + 1}@example.com`,
    phone: `098${String(index + 1).padStart(7, '0')}`,
    status: index % 3 === 0 ? 'inactive' : 'active'
}));

export default function OwnerManagement() {
    const [owners, setOwners] = useState(mockData);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState(null); // null, 'asc', or 'desc'
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOwner, setNewOwner] = useState({
        fullName: '',
        email: '',
        phone: '',
        status: 'active'
    });

    // Tính toán số lượng chủ nhà
    const totalOwners = owners.length;
    const activeOwners = owners.filter(owner => owner.status === 'active').length;
    const inactiveOwners = owners.filter(owner => owner.status === 'inactive').length;

    const handleSort = () => {
        const newDirection = sortDirection === null ? 'asc' : sortDirection === 'asc' ? 'desc' : null;
        setSortDirection(newDirection);

        if (newDirection === null) {
            setOwners(mockData); // Reset to original order
            return;
        }

        const sortedOwners = [...owners].sort((a, b) => {
            const numA = parseInt(a.fullName.match(/\d+/)[0]);
            const numB = parseInt(b.fullName.match(/\d+/)[0]);

            if (newDirection === 'asc') {
                return numA - numB;
            } else {
                return numB - numA;
            }
        });

        setOwners(sortedOwners);
    };

    const getSortIcon = () => {
        if (sortDirection === null) return <FaSort className="w-5 h-5 ml-2 text-gray-400" />;
        if (sortDirection === 'asc') return <FaArrowDown className="w-5 h-5 ml-2 text-blue-500 animate-bounce" />;
        return <FaArrowUp className="w-5 h-5 ml-2 text-blue-500 animate-bounce" />;
    };

    const filteredOwners = owners.filter(owner =>
        owner.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchText.toLowerCase()) ||
        owner.phone.includes(searchText)
    );

    const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
    const paginatedOwners = filteredOwners.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = (id) => {
        setOwners(prev => prev.filter(owner => owner.id !== id));
    };

    const handleStatusChange = (id) => {
        setOwners(prev =>
            prev.map(owner =>
                owner.id === id
                    ? { ...owner, status: owner.status === 'active' ? 'inactive' : 'active' }
                    : owner
            )
        );
    };

    const handleAddOwner = () => {
        if (newOwner.fullName && newOwner.email && newOwner.phone) {
            setOwners(prev => [
                ...prev,
                { id: owners.length + 1, ...newOwner }
            ]);
            setNewOwner({ fullName: '', email: '', phone: '', status: 'active' });
            setIsModalOpen(false);
        } else {
            alert("Vui lòng điền đầy đủ thông tin!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Quản lý chủ nhà
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Xem thông tin chi tiết của tất cả chủ nhà
                    </p>
                </div>
            </div>

            {/* Hiển thị tổng số chủ nhà */}
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
                            <p className="text-white/80 text-sm">Tổng số chủ nhà</p>
                            <p className="text-white text-2xl font-bold">{totalOwners}</p>
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
                            <FaUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng số chủ nhà hoạt động</p>
                            <p className="text-white text-2xl font-bold">{activeOwners}</p>
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
                            <FaUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Tổng số chủ nhà không hoạt động</p>
                            <p className="text-white text-2xl font-bold">{inactiveOwners}</p>
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
                                <h2 className="text-2xl font-bold">Thêm chủ nhà</h2>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <IoClose className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white">Họ và tên</label>
                                <input
                                    type="text"
                                    value={newOwner.fullName}
                                    onChange={(e) => setNewOwner({ ...newOwner, fullName: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 text-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white">Email</label>
                                <input
                                    type="email"
                                    value={newOwner.email}
                                    onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Nhập email"
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-white">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={newOwner.phone}
                                    onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddOwner}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-4 flex justify-between items-center">
                <div className="relative w-2/6">
                    <input
                        type="text"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                        placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <IoClose className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        <div className="flex justify-center items-center">
                            <FaUserPlus className="mr-2" />
                            <p>Thêm chủ nhà</p>
                        </div>
                    </button>
                </div>
            </div>

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
                                        Họ và tên
                                        {getSortIcon()}
                                    </button>
                                </th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Email</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Số điện thoại</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Trạng thái</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-white">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {paginatedOwners.map((owner, index) => (
                                    <motion.tr
                                        key={owner.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {owner.fullName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaEnvelope className="text-primary w-4 h-4" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {owner.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-primary w-4 h-4" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {owner.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${owner.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {owner.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                                    <FaEye className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                                    <FaUserEdit className="w-4 h-4 text-yellow-500 hover:text-yellow-600" />
                                                </button>
                                                <button
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                    onClick={() => handleDelete(owner.id)}
                                                >
                                                    <FaTrashAlt className="w-4 h-4 text-red-500 hover:text-red-600" />
                                                </button>
                                                <button
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                    onClick={() => handleStatusChange(owner.id)}
                                                >
                                                    {owner.status === 'active'
                                                        ? <FaLock className="w-4 h-4 text-gray-500 hover:text-gray-600" />
                                                        : <FaUnlock className="w-4 h-4 text-gray-500 hover:text-gray-600" />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {paginatedOwners.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <FaUser className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy chủ nhà
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Thử tìm kiếm với từ khóa khác
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

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