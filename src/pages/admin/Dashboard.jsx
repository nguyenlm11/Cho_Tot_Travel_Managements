import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { FaMoneyBillWave, FaCalendarCheck, FaUsers, FaHome } from 'react-icons/fa';
import WeekSelectorModal from '../../components/modals/WeekSelectorModal';
// import { formatDate } from '../../utils/utils';
import YearSelectorModal from '../../components/modals/YearSelectorModal';
import dashboardAPI from '../../services/api/dashboardAPI';
import { getWeekdaysFromRange } from '../../utils/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
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
            grid: { display: false, drawBorder: false },
            ticks: { font: { size: 12 } }
        },
        y: {
            position: 'left',
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
            ticks: {
                callback: (value) => formatCurrency(value),
                font: { size: 12 }
            },
            title: {
                display: true,
                text: 'Doanh thu (triệu VNĐ)',
                color: 'rgba(54, 162, 235, 1)',
                font: { size: 13, weight: 'bold' }
            }
        },
        y1: {
            position: 'right',
            grid: { display: false },
            ticks: { font: { size: 12 } },
            title: {
                display: true,
                text: 'Lượt đặt phòng',
                color: 'rgba(75, 192, 192, 1)',
                font: { size: 13, weight: 'bold' }
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
                font: { size: 12 }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000',
            titleFont: { size: 13 },
            bodyColor: '#000',
            bodyFont: { size: 13 },
            padding: 12,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
                label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y;
                    return `${label}: ${context.dataset.yAxisID === 'y' ? formatCurrency(value) : value + ' lượt'}`;
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

const Dashboard = () => {


    // const weeklyData = useMemo(() => ({
    //     labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
    //     datasets: [{
    //         label: 'Doanh thu (triệu VNĐ)',
    //         data: [15, 18, 22, 25, 30, 35, 28],
    //         backgroundColor: 'rgba(54, 162, 235, 0.8)',
    //         borderColor: 'rgba(54, 162, 235, 1)',
    //         borderWidth: 2,
    //         tension: 0.4,
    //         fill: true
    //     }]
    // }), []);

    const [loyalOwnersData, setLoyalOwnersData] = useState({
        labels: [],
        datasets: [{
            label: 'Số homestay sở hữu',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 60
        }]
    })

    useEffect(() => {
        fetchLoyalOwner();
    }, [])

    const fetchLoyalOwner = async () => {
        try {
            const response = await dashboardAPI.getTopLoyalOwners("5")
            if (response?.statusCode === 200) {
                const formatData = {
                    labels: response?.data?.map(item => item?.ownerName),
                    datasets: [{
                        label: 'Số homestay sở hữu',
                        data: response?.data?.map(item => item?.totalHomeStays),
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                        barThickness: 50
                    }]
                }
                console.log(formatData)
                setLoyalOwnersData(formatData)
            }
        } catch (error) {
            console.log(error);
        }
    }


    const [statsCards, setStatsCards] = useState([
        {
            title: 'Tổng doanh thu',
            value: [],
            suffix: 'đ',
            icon: <FaMoneyBillWave className="w-6 h-6" />,
            color: 'from-green-400 to-green-600'
        },
        {
            title: 'Tổng đặt phòng',
            value: [],
            icon: <FaCalendarCheck className="w-6 h-6" />,
            color: 'from-blue-400 to-blue-600'
        },
        {
            title: 'Tổng chủ homestay',
            value: [],
            icon: <FaUsers className="w-6 h-6" />,
            color: 'from-purple-400 to-purple-600'
        },
        {
            title: 'Tổng khách hàng',
            value: [],
            icon: <FaHome className="w-6 h-6" />,
            color: 'from-orange-400 to-orange-600'
        }
    ])
    useEffect(() => {
        fetchDashboardTitle();
    }, [])
    const fetchDashboardTitle = async () => {
        try {
            const responeBookings = await dashboardAPI.getAllStaticBookings()
            const responseRevenue = await dashboardAPI.getTotalBookingsAndAmount()
            const response = await dashboardAPI.getTotalAccount();
            if (response?.statusCode === 200 && responseRevenue?.statusCode === 200 && responeBookings?.statusCode === 200) {
                const formatData = [
                    {
                        title: 'Tổng doanh thu',
                        value: responseRevenue?.data?.totalBookingsAmount,
                        suffix: 'đ',
                        icon: <FaMoneyBillWave className="w-6 h-6" />,
                        color: 'from-green-400 to-green-600'
                    },
                    {
                        title: 'Tổng đặt phòng',
                        value: responeBookings?.data?.bookings,
                        icon: <FaCalendarCheck className="w-6 h-6" />,
                        color: 'from-blue-400 to-blue-600'
                    },
                    {
                        title: 'Tổng chủ homestay',
                        value: response?.data?.ownersAccount,
                        icon: <FaUsers className="w-6 h-6" />,
                        color: 'from-purple-400 to-purple-600'
                    },
                    {
                        title: 'Tổng khách hàng',
                        value: response?.data?.customersAccount,
                        icon: <FaUsers className="w-6 h-6" />,
                        color: 'from-orange-400 to-orange-600'
                    }
                ]
                setStatsCards(formatData);
            }
        } catch (error) {
            console.log(error);
        }
    }
    // const statsCards = useMemo(() => [
    //     {
    //         title: 'Tổng doanh thu',
    //         value: 120000000,
    //         suffix: 'đ',
    //         icon: <FaMoneyBillWave className="w-6 h-6" />,
    //         color: 'from-green-400 to-green-600'
    //     },
    //     {
    //         title: 'Tổng đặt phòng',
    //         value: 1500,
    //         icon: <FaCalendarCheck className="w-6 h-6" />,
    //         color: 'from-blue-400 to-blue-600'
    //     },
    //     {
    //         title: 'Tổng khách hàng',
    //         value: 1500,
    //         icon: <FaUsers className="w-6 h-6" />,
    //         color: 'from-purple-400 to-purple-600'
    //     },
    //     {
    //         title: 'Tổng homestay',
    //         value: 500,
    //         icon: <FaHome className="w-6 h-6" />,
    //         color: 'from-orange-400 to-orange-600'
    //     }
    // ], []);







    const [dashboardForWeek, setDashboardForWeek] = useState({
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        datasets: [{
            label: 'Doanh thu (triệu VNĐ)',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    })
    const [selectedWeekData, setSelectedWeekData] = useState(null);
    const handleWeekChange = (weekData) => {
        setSelectedWeekData(weekData);
        console.log('Week selected:', weekData); // Xử lý dữ liệu tuần (gọi API, v.v.)
    };
    useEffect(() => {
        if (selectedWeekData !== null) {
            fetchDataByWeek()
        }
    }, [selectedWeekData])

    const fetchDataByWeek = async () => {
        try {
            const weekdaysFromRange = getWeekdaysFromRange(selectedWeekData?.startDate, selectedWeekData?.endDate);
            const response = await dashboardAPI.getTotalBookingsTotalBookingsAmount(selectedWeekData?.startDate, selectedWeekData?.endDate, "day")
            if (response?.statusCode === 200) {
                const formatData = {
                    labels: weekdaysFromRange,
                    datasets: [{
                        label: 'Doanh thu (triệu VNĐ)',
                        data: response?.data?.map(item => item?.totalBookingsAmount),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                }
                // console.log(formatData)
                setDashboardForWeek(formatData);
            }
        } catch (error) {
            console.log(error);
        }
    }




    // Giả lập gọi API khi thay đổi năm
    const [monthlyData, setMonthlyData] = useState({
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
            {
                label: 'Doanh thu (triệu VNĐ)',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y'
            },
            {
                label: 'Lượt đặt phòng',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y1'
            }
        ]
    });
    const [selectedMonthData, setSelectedMonthData] = useState(null);
    const handleMonthChange = (monthData) => {
        setSelectedMonthData(monthData);
        // console.log(monthData);

        // console.log('Week selected:', weekData); // Xử lý dữ liệu tuần (gọi API, v.v.)
    };
    useEffect(() => {
        if (selectedMonthData !== null) {
            fetchDataByYear();
        }
    }, [selectedMonthData]);

    const fetchDataByYear = async () => {
        try {
            const respone = await dashboardAPI.getTotalBookingsTotalBookingsAmount(selectedMonthData?.startDate, selectedMonthData?.endDate, "month")
            // Giả lập dữ liệu theo năm
            const formatData = {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [
                    {
                        label: 'Doanh thu (triệu VNĐ)',
                        data: respone?.data?.map(item => item?.totalBookingsAmount),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Lượt đặt phòng',
                        data: respone?.data?.map(item => item?.totalBookings),
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        yAxisID: 'y1'
                    }
                ]
            };
            setMonthlyData(formatData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-gray-50 dark:bg-gray-900 p-6"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Trang quản lý hệ thống
                    </h1>
                </div>

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
                                            formatter={(value) => stat.suffix === 'đ' ? formatCurrency(value) : value}
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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Doanh thu tuần này
                        </h2>
                        <div className="flex gap-2">
                            <WeekSelectorModal
                                // defaultYear={2025}
                                // defaultMonth={5}
                                // years={[2023, 2024, 2025, 2026]} // Có thể tùy chỉnh danh sách năm
                                onWeekChange={handleWeekChange}
                            />

                        </div>
                    </div>

                    <div className="h-[300px]">
                        <Line
                            data={dashboardForWeek}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { callback: (value) => formatCurrency(value) }
                                    }
                                }
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                >
                    <div className='flex justify-between items-center'>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Thống kê doanh thu và lượt đặt phòng theo tháng
                        </h2>
                        <div className="flex gap-2">
                            <YearSelectorModal
                                // defaultYear={2025}
                                // defaultMonth={5}
                                // years={[2023, 2024, 2025, 2026]} // Có thể tùy chỉnh danh sách năm
                                onWeekChange={handleMonthChange}
                            />

                        </div>
                    </div>

                    <div className="h-[400px]">
                        <Bar data={monthlyData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
                >
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Top chủ sở hữu homestay
                    </h2>
                    <div className="h-[300px]">
                        <Bar
                            data={loyalOwnersData}
                            options={{
                                indexAxis: 'y',
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;