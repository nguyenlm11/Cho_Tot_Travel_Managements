import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { FaUsers, FaChartLine, FaMoneyBillWave, FaBed, FaCalendarCheck } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    // Mock data
    const weeklyData = {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
        datasets: [{
            label: 'Doanh thu (triệu VNĐ)',
            data: [5.2, 4.8, 6.1, 5.5, 7.2, 8.1, 7.8],
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4
        }]
    };

    const monthlyData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
            label: 'Doanh thu (triệu VNĐ)',
            data: [150, 180, 220, 190, 210, 240, 200, 230, 250, 270, 260, 280],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const serviceData = {
        labels: ['Giặt ủi', 'Đưa đón sân bay', 'Spa', 'Nhà hàng', 'Tour du lịch'],
        datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value + 'M';
                    }
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            }
        }
    };

    const statsCards = [
        {
            title: 'Tổng doanh thu',
            value: '550.000.000đ',
            icon: <FaMoneyBillWave className="w-6 h-6" />,
            color: 'bg-green-500'
        },
        {
            title: 'Tổng đặt phòng',
            value: '128',
            icon: <FaCalendarCheck className="w-6 h-6" />,
            color: 'bg-blue-500'
        },
        {
            title: 'Tổng khách hàng',
            value: '85',
            icon: <FaUsers className="w-6 h-6" />,
            color: 'bg-purple-500'
        },
        {
            title: 'Tỷ lệ lấp đầy',
            value: '75%',
            icon: <FaBed className="w-6 h-6" />,
            color: 'bg-orange-500'
        }
    ];

    const topCustomers = [
        { name: 'Nguyễn Văn A', bookings: 12, totalSpent: 15000000 },
        { name: 'Trần Thị B', bookings: 10, totalSpent: 12000000 },
        { name: 'Lê Văn C', bookings: 8, totalSpent: 10000000 },
        { name: 'Phạm Thị D', bookings: 7, totalSpent: 8500000 },
        { name: 'Hoàng Văn E', bookings: 6, totalSpent: 7000000 }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const chartVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                duration: 0.8
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 space-y-6"
        >
            {/* Stats Cards */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">{stat.title}</p>
                                <h3 className="text-2xl font-bold mt-2">
                                    {stat.title === 'Tổng doanh thu' ? (
                                        <CountUp
                                            end={550000000}
                                            duration={3}
                                            separator="."
                                            suffix="đ"
                                            decimals={0}
                                        />
                                    ) : stat.title === 'Tổng đặt phòng' ? (
                                        <CountUp
                                            end={128}
                                            duration={3}
                                        />
                                    ) : stat.title === 'Tổng khách hàng' ? (
                                        <CountUp
                                            end={85}
                                            duration={3}
                                        />
                                    ) : (
                                        <CountUp
                                            end={75}
                                            duration={3}
                                            suffix="%"
                                        />
                                    )}
                                </h3>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                className={`${stat.color} p-3 rounded-lg text-white`}
                            >
                                {stat.icon}
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Revenue Chart */}
                <motion.div
                    variants={chartVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Doanh thu theo tuần</h2>
                    <div className="h-80">
                        <Line data={weeklyData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Monthly Revenue Chart */}
                <motion.div
                    variants={chartVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Doanh thu theo tháng</h2>
                    <div className="h-80">
                        <Bar data={monthlyData} options={chartOptions} />
                    </div>
                </motion.div>
            </div>

            {/* Service Usage and Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Usage Pie Chart */}
                <motion.div
                    variants={chartVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Tỷ lệ sử dụng dịch vụ</h2>
                    <div className="h-80">
                        <Pie data={serviceData} options={pieOptions} />
                    </div>
                </motion.div>

                {/* Top Customers Table */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Khách hàng thân thiết</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-4">Tên khách hàng</th>
                                    <th className="text-left py-3 px-4">Số lần đặt</th>
                                    <th className="text-left py-3 px-4">Tổng chi tiêu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {topCustomers.map((customer, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="py-3 px-4">{customer.name}</td>
                                            <td className="py-3 px-4">
                                                <CountUp
                                                    end={customer.bookings}
                                                    duration={3}
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <CountUp
                                                    end={customer.totalSpent}
                                                    duration={3}
                                                    separator="."
                                                    suffix="đ"
                                                />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard; 