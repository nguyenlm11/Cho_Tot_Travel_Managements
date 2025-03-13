import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaSearch, FaUserEdit, FaTrashAlt, FaUserPlus, FaEye, FaLock, FaUnlock } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const mockData = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    fullName: `Khách hàng ${index + 1}`,
    email: `customer${index + 1}@example.com`,
    phone: `098${String(index + 1).padStart(7, '0')}`,
    status: index % 3 === 0 ? 'inactive' : 'active'
}));

export default function CustomerManagement() {
    const [customers, setCustomers] = useState(mockData);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredCustomers = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone.includes(searchText)
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = (id) => {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
    };

    const handleStatusChange = (id) => {
        setCustomers(prev =>
            prev.map(customer =>
                customer.id === id
                    ? { ...customer, status: customer.status === 'active' ? 'inactive' : 'active' }
                    : customer
            )
        );
    };

    return (
        <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 p-6"
        >
            <div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Quản lý khách hàng
                    </h1>
                    <p className="text-gray-600">
                        Xem thông tin chi tiết của tất cả khách hàng
                    </p>
                </div>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    Thêm người dùng
                </button>
            </div>

            <div className="mb-4">
                <div className="relative max-w-xs">
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

            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-100">
                            <tr>
                                <th className="py-3 px-6 text-left text-sm font-medium text-blue-800">Họ và tên</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-blue-800">Email</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-blue-800">Số điện thoại</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-blue-800">Trạng thái</th>
                                <th className="py-3 px-6 text-left text-sm font-medium text-blue-800">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <AnimatePresence>
                                {paginatedCustomers.map(customer => (
                                    <tr
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: 0.1 }}
                                        className="hover:bg-blue-50 transition-colors"
                                    >
                                        <td className="py-3 px-6 text-sm text-gray-700">{customer.fullName}</td>
                                        <td className="py-3 px-6 text-sm text-gray-700">{customer.email}</td>
                                        <td className="py-3 px-6 text-sm text-gray-700">{customer.phone}</td>
                                        <td className="py-3 px-6 text-sm text-gray-700">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {customer.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-700">
                                            <div className="flex items-center space-x-4">
                                                <button className="text-blue-500 hover:text-blue-700">
                                                    <FaEye />
                                                </button>
                                                <button className="text-yellow-500 hover:text-yellow-700">
                                                    <FaUserEdit />
                                                </button>
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(customer.id)}
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                                <button
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={() => handleStatusChange(customer.id)}
                                                >
                                                    {customer.status === 'active' ? <FaLock /> : <FaUnlock />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100'
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
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
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
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
} 