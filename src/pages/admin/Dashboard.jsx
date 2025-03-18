import React from 'react';
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from "chart.js";
import { FaUsers, FaHome, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const labels = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Biểu đồ thống kê doanh thu và số lượng đơn toàn hệ thống",
                font: {
                    size: 30,
                    weight: "bold",
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Số lượng đơn',
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                    },
                    color: 'rgb(255, 99, 132)'
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#666',
                    padding: 10
                },
                border: {
                    color: '#e0e0e0'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Doanh thu (triệu VNĐ)',
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                    },
                    color: 'rgb(53, 162, 235)'
                },
                grid: {
                    drawOnChartArea: false
                },
            },
            x: {
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#666'
                }
            }
        },
        barPercentage: 0.8,
        categoryPercentage: 0.9
    };

    const combinedData = {
        labels,
        datasets: [
            {
                label: "Số lượng đơn đặt phòng",
                data: [150, 180, 200, 220, 250, 280, 300, 320, 350, 380, 400, 420],
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                yAxisID: 'y',
            },
            {
                label: "Doanh thu (triệu VNĐ)",
                data: [45, 52, 58, 65, 72, 78, 85, 92, 98, 105, 112, 120],
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
                yAxisID: 'y1',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Trang quản lý doanh thu
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Xem thông tin chi tiết của tất cả doanh thu
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Tổng số khách hàng */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-opacity-80 text-sm font-medium mb-1">Tổng số khách hàng</p>
                            <p className="text-white text-2xl font-bold">1,500</p>
                        </div>
                        <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                            <FaUsers className="text-white text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Tổng số chủ nhà */}
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-opacity-80 text-sm font-medium mb-1">Tổng số chủ sở hữu homestay</p>
                            <p className="text-white text-2xl font-bold">200</p>
                        </div>
                        <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                            <FaUserTie className="text-white text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Tổng số homestay */}
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-opacity-80 text-sm font-medium mb-1">Tổng số homestay</p>
                            <p className="text-white text-2xl font-bold">500</p>
                        </div>
                        <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                            <FaHome className="text-white text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Doanh thu tháng */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-opacity-80 text-sm font-medium mb-1">Doanh thu tháng</p>
                            <p className="text-white text-2xl font-bold">120.000.000 VNĐ</p>
                        </div>
                        <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                            <FaMoneyBillWave className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <Bar options={options} data={combinedData} />
                </div>
            </div>
        </div>
    );
} 