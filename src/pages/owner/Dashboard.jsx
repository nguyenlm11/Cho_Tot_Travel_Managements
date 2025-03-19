import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FaUsers, FaMoneyBillWave, FaBed, FaCalendarCheck } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    const monthlyData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
            {
                label: 'Doanh thu (triệu VNĐ)',
                data: [150, 180, 220, 190, 210, 240, 200, 230, 250, 270, 260, 280],
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y'
            },
            {
                label: 'Lượt đặt phòng',
                data: [45, 52, 65, 48, 56, 70, 58, 63, 72, 75, 68, 80],
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y1'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                position: 'left',
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    callback: (value) => `${value}M`,
                    font: {
                        size: 12
                    }
                },
                title: {
                    display: true,
                    text: 'Doanh thu (triệu VNĐ)',
                    color: 'rgba(54, 162, 235, 1)',
                    font: {
                        size: 13,
                        weight: 'bold'
                    }
                }
            },
            y1: {
                position: 'right',
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12
                    }
                },
                title: {
                    display: true,
                    text: 'Lượt đặt phòng',
                    color: 'rgba(75, 192, 192, 1)',
                    font: {
                        size: 13,
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 8,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#000',
                titleFont: {
                    size: 13
                },
                bodyColor: '#000',
                bodyFont: {
                    size: 13
                },
                padding: 12,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value}${context.dataset.yAxisID === 'y' ? 'M' : ' lượt'}`;
                    }
                }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart',
            delay: (context) => context.dataIndex * 100
        }
    };

    const statsCards = [
        {
            title: 'Tổng doanh thu',
            value: 550000000,
            suffix: 'đ',
            icon: <FaMoneyBillWave className="w-6 h-6" />,
            color: 'from-green-400 to-green-600'
        },
        {
            title: 'Tổng đặt phòng',
            value: 128,
            icon: <FaCalendarCheck className="w-6 h-6" />,
            color: 'from-blue-400 to-blue-600'
        },
        {
            title: 'Tổng khách hàng',
            value: 85,
            icon: <FaUsers className="w-6 h-6" />,
            color: 'from-purple-400 to-purple-600'
        },
        {
            title: 'Tỷ lệ lấp đầy',
            value: 75,
            suffix: '%',
            icon: <FaBed className="w-6 h-6" />,
            color: 'from-orange-400 to-orange-600'
        }
    ];

    // Chart data cho doanh thu tuần
    const weeklyRevenueData = {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        datasets: [{
            label: 'Doanh thu (triệu VNĐ)',
            data: [15, 18, 22, 25, 30, 35, 28],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };

    // Chart data cho thống kê dịch vụ
    const serviceUsageData = {
        labels: ['Giặt ủi', 'Đưa đón', 'Spa', 'Ăn uống', 'Dọn phòng'],
        datasets: [{
            data: [300, 250, 180, 400, 280],
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    // Chart data cho loại phòng
    const roomTypeData = {
        labels: ['Phòng đơn', 'Phòng đôi', 'Phòng VIP', 'Phòng gia đình'],
        datasets: [{
            data: [35, 25, 20, 20],
            backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    // Chart data cho khách hàng thân thiết
    const loyalCustomersData = {
        labels: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'],
        datasets: [{
            label: 'Số lần đặt phòng',
            data: [15, 12, 10, 8, 7],
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            borderRadius: 5
        }]
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-gray-50 dark:bg-gray-900"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-4`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white text-opacity-80 text-sm font-medium">
                                        {stat.title}
                                    </p>
                                    <h3 className="text-2xl font-bold text-white mt-2">
                                        <CountUp
                                            end={stat.value}
                                            duration={2.5}
                                            separator="."
                                            suffix={stat.suffix || ''}
                                            decimals={0}
                                        />
                                    </h3>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Weekly Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                >
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Doanh thu tuần này
                    </h2>
                    <div className="h-[300px]">
                        <Line data={weeklyRevenueData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { callback: value => `${value}M` }
                                }
                            }
                        }} />
                    </div>
                </motion.div>

                {/* Monthly Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                >
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Thống kê doanh thu và lượt đặt phòng theo tháng
                    </h2>
                    <div className="h-[400px]">
                        <Bar data={monthlyData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Service Usage and Room Types */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Service Usage Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Thống kê sử dụng dịch vụ
                        </h2>
                        <div className="h-[300px]">
                            <Pie data={serviceUsageData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            font: { size: 11 },
                                            boxWidth: 10,
                                            padding: 8
                                        }
                                    }
                                }
                            }} />
                        </div>
                    </motion.div>

                    {/* Room Types Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Phân bố loại phòng được sử dụng
                        </h2>
                        <div className="h-[300px]">
                            <Pie data={roomTypeData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            font: { size: 11 },
                                            boxWidth: 10,
                                            padding: 8
                                        }
                                    }
                                }
                            }} />
                        </div>
                    </motion.div>
                </div>

                {/* Loyal Customers Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                >
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Top khách hàng thân thiết
                    </h2>
                    <div className="h-[300px]">
                        <Bar data={loyalCustomersData} options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            }
                        }} />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;