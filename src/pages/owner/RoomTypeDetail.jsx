import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaBed, FaUsers, FaArrowLeft, FaEdit, FaTrash,
    FaDollarSign, FaWifi, FaTv, FaSnowflake, FaCheck
} from 'react-icons/fa';

const RoomTypeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data - replace with API call later
    const [roomType] = useState({
        id: 1,
        name: "Phòng Deluxe Hướng Biển",
        description: "Phòng sang trọng với view biển tuyệt đẹp, thiết kế hiện đại và đầy đủ tiện nghi cao cấp",
        capacity: 2,
        bedType: "1 giường đôi lớn",
        size: "35m²",
        price: 2500000,
        status: 'active',
        amenities: ["Smart TV", "Minibar", "Ban công riêng", "Máy lạnh", "Wifi tốc độ cao", "Bồn tắm", "Tủ lạnh", "Két sắt"],
        images: [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
        ],
        lastUpdated: "2024-03-15"
    });

    // Mock room list data
    const [rooms] = useState([
        {
            id: 1,
            number: "101",
            floor: 1,
            status: "available",
            lastCleaned: "2024-03-15",
            currentBooking: null
        },
        {
            id: 2,
            number: "102",
            floor: 1,
            status: "occupied",
            lastCleaned: "2024-03-14",
            currentBooking: {
                guestName: "Nguyễn Văn A",
                checkIn: "2024-03-14",
                checkOut: "2024-03-16"
            }
        },
        {
            id: 3,
            number: "201",
            floor: 2,
            status: "maintenance",
            lastCleaned: "2024-03-13",
            currentBooking: null
        }
    ]);

    const statusConfig = {
        available: {
            color: 'bg-green-100 text-green-800',
            text: 'Trống'
        },
        occupied: {
            color: 'bg-blue-100 text-blue-800',
            text: 'Đang thuê'
        },
        maintenance: {
            color: 'bg-red-100 text-red-800',
            text: 'Bảo trì'
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/owner/room-types')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                                transition-colors"
                    >
                        <FaArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {roomType.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Chi tiết loại phòng và danh sách phòng
                        </p>
                    </div>
                </div>

                {/* Room Type Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-video rounded-xl overflow-hidden">
                            <img
                                src={roomType.images[0]}
                                alt={roomType.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {roomType.images.slice(1).map((image, index) => (
                                <div key={index} className="aspect-video rounded-xl overflow-hidden">
                                    <img
                                        src={image}
                                        alt={`${roomType.name} ${index + 2}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {roomType.price.toLocaleString()}đ
                                    <span className="text-lg text-gray-500 dark:text-gray-400">/đêm</span>
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Cập nhật: {new Date(roomType.lastUpdated).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {/* Handle edit */ }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                                            rounded-lg transition-colors"
                                >
                                    <FaEdit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                    onClick={() => {/* Handle delete */ }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                                            rounded-lg transition-colors"
                                >
                                    <FaTrash className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 
                                    dark:bg-gray-700/50 rounded-xl">
                                <FaUsers className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Sức chứa
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {roomType.capacity} người
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 
                                    dark:bg-gray-700/50 rounded-xl">
                                <FaBed className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Giường
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {roomType.bedType}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 
                                    dark:bg-gray-700/50 rounded-xl">
                                <FaDollarSign className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Diện tích
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {roomType.size}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 
                                    dark:text-white mb-3">
                                Mô tả
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {roomType.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 
                                    dark:text-white mb-3">
                                Tiện nghi
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {roomType.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-gray-600 
                                                dark:text-gray-400"
                                    >
                                        <FaCheck className="w-4 h-4 text-green-500" />
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Danh sách phòng
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-4 px-4 text-gray-600 
                                        dark:text-gray-400">Số phòng</th>
                                <th className="text-left py-4 px-4 text-gray-600 
                                        dark:text-gray-400">Tầng</th>
                                <th className="text-left py-4 px-4 text-gray-600 
                                        dark:text-gray-400">Trạng thái</th>
                                <th className="text-left py-4 px-4 text-gray-600 
                                        dark:text-gray-400">Vệ sinh cuối</th>
                                <th className="text-left py-4 px-4 text-gray-600 
                                        dark:text-gray-400">Khách hiện tại</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr
                                    key={room.id}
                                    className="border-b border-gray-200 dark:border-gray-700 
                                            hover:bg-gray-50 dark:hover:bg-gray-700/50 
                                            transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <span className="font-medium text-gray-900 
                                                dark:text-white">
                                            {room.number}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        {room.floor}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-3 py-1 rounded-full text-sm 
                                                ${statusConfig[room.status].color}`}>
                                            {statusConfig[room.status].text}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        {new Date(room.lastCleaned).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        {room.currentBooking ? (
                                            <div>
                                                <p className="font-medium text-gray-900 
                                                        dark:text-white">
                                                    {room.currentBooking.guestName}
                                                </p>
                                                <p className="text-sm">
                                                    {new Date(room.currentBooking.checkIn).toLocaleDateString('vi-VN')}
                                                    {' - '}
                                                    {new Date(room.currentBooking.checkOut).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoomTypeDetail; 