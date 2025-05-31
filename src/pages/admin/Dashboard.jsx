import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FaMoneyBillWave, FaCalendarCheck, FaUsers } from 'react-icons/fa';
import WeekSelectorModal from '../../components/modals/WeekSelectorModal';
import YearSelectorModal from '../../components/modals/YearSelectorModal';
import dashboardAPI from '../../services/api/dashboardAPI';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}/${month}/${day}`;
    };

    return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek)
    };
};

const getCurrentYearDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`
    };
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
    const [isLoading, setIsLoading] = useState({
        stats: true,
        weekly: true,
        monthly: true,
        loyalOwners: true
    });

    const [statsCards, setStatsCards] = useState([
        {
            title: 'Tổng doanh thu',
            value: 0,
            suffix: 'đ',
            icon: <FaMoneyBillWave className="w-6 h-6" />,
            color: 'from-green-400 to-green-600'
        },
        {
            title: 'Tổng đặt phòng',
            value: 0,
            icon: <FaCalendarCheck className="w-6 h-6" />,
            color: 'from-blue-400 to-blue-600'
        },
        {
            title: 'Tổng chủ homestay',
            value: 0,
            icon: <FaUsers className="w-6 h-6" />,
            color: 'from-purple-400 to-purple-600'
        },
        {
            title: 'Tổng khách hàng',
            value: 0,
            icon: <FaUsers className="w-6 h-6" />,
            color: 'from-orange-400 to-orange-600'
        }
    ]);

    const [dashboardForWeek, setDashboardForWeek] = useState({
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        datasets: [{
            label: 'Doanh thu (triệu VNĐ)',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 3,
            tension: 0,
            fill: true,
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
        }]
    });

    const [monthlyData, setMonthlyData] = useState({
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
            {
                label: 'Doanh thu (triệu VNĐ)',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y'
            },
            {
                label: 'Lượt đặt phòng',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y1'
            }
        ]
    });

    const [loyalOwnersData, setLoyalOwnersData] = useState({
        labels: [],
        datasets: [{
            label: 'Số homestay sở hữu',
            data: [],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(14, 165, 233, 0.8)',
            ],
            borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(251, 146, 60, 1)',
                'rgba(14, 165, 233, 1)',
            ],
            borderWidth: 2,
            borderRadius: 6,
            barThickness: 50
        }]
    });

    const [selectedWeekData, setSelectedWeekData] = useState(getCurrentWeekDates());
    const [selectedMonthData, setSelectedMonthData] = useState(getCurrentYearDates());

    const fetchStatsData = useCallback(async () => {
        try {
            setIsLoading(prev => ({ ...prev, stats: true }));

            const [bookingsResponse, revenueResponse, accountResponse] = await Promise.all([
                dashboardAPI.getAllStaticBookings(),
                dashboardAPI.getTotalBookingsAndAmount(),
                dashboardAPI.getTotalAccount()
            ]);

            if (bookingsResponse?.statusCode === 200 &&
                revenueResponse?.statusCode === 200 &&
                accountResponse?.statusCode === 200) {

                const newStatsCards = [
                    {
                        title: 'Tổng doanh thu',
                        value: revenueResponse.data?.totalBookingsAmount || 0,
                        suffix: 'đ',
                        icon: <FaMoneyBillWave className="w-6 h-6" />,
                        color: 'from-green-400 to-green-600'
                    },
                    {
                        title: 'Tổng đặt phòng',
                        value: bookingsResponse.data?.bookings || 0,
                        icon: <FaCalendarCheck className="w-6 h-6" />,
                        color: 'from-blue-400 to-blue-600'
                    },
                    {
                        title: 'Tổng chủ homestay',
                        value: accountResponse.data?.ownersAccount || 0,
                        icon: <FaUsers className="w-6 h-6" />,
                        color: 'from-purple-400 to-purple-600'
                    },
                    {
                        title: 'Tổng khách hàng',
                        value: accountResponse.data?.customersAccount || 0,
                        icon: <FaUsers className="w-6 h-6" />,
                        color: 'from-orange-400 to-orange-600'
                    }
                ];
                setStatsCards(newStatsCards);
            }
        } catch (error) {
            console.error('Error fetching stats data:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, stats: false }));
        }
    }, []);

    const fetchWeeklyData = useCallback(async (weekData) => {
        if (!weekData?.startDate || !weekData?.endDate) return;

        try {
            setIsLoading(prev => ({ ...prev, weekly: true }));

            const startDate = new Date(weekData.startDate.replace(/\//g, '-'));
            const endDate = new Date(weekData.endDate.replace(/\//g, '-'));

            const dateToWeekIndexMap = {};
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const dayOfWeek = currentDate.getDay();
                const weekIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

                const dateStr = currentDate.toISOString().split('T')[0];
                const formatDateStr = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}`;

                dateToWeekIndexMap[dateStr] = weekIndex;
                dateToWeekIndexMap[formatDateStr] = weekIndex;

                currentDate.setDate(currentDate.getDate() + 1);
            }

            const response = await dashboardAPI.getTotalBookingsTotalBookingsAmount(
                weekData.startDate,
                weekData.endDate,
                "day"
            );

            if (response?.statusCode === 200) {
                const weeklyData = Array(7).fill(0);

                if (response.data && response.data.length > 0) {
                    response.data.forEach((item, index) => {
                        if (item?.totalBookingsAmount !== undefined) {
                            let weekIndex = -1;

                            if (item.date && dateToWeekIndexMap[item.date] !== undefined) {
                                weekIndex = dateToWeekIndexMap[item.date];
                            } else {
                                const calculatedDate = new Date(startDate);
                                calculatedDate.setDate(startDate.getDate() + index);

                                if (calculatedDate <= endDate) {
                                    const calcDateStr = calculatedDate.toISOString().split('T')[0];
                                    if (dateToWeekIndexMap[calcDateStr] !== undefined) {
                                        weekIndex = dateToWeekIndexMap[calcDateStr];
                                    }
                                }
                            }

                            if (weekIndex >= 0 && weekIndex < 7) {
                                weeklyData[weekIndex] = item.totalBookingsAmount;
                            }
                        }
                    });
                }

                const formatData = {
                    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
                    datasets: [{
                        label: 'Doanh thu (triệu VNĐ)',
                        data: weeklyData,
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 3,
                        tension: 0,
                        fill: true,
                        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: 'rgba(34, 197, 94, 1)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 3,
                    }]
                };
                setDashboardForWeek(formatData);
            }
        } catch (error) {
            console.error('Error fetching weekly data:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, weekly: false }));
        }
    }, []);

    const fetchMonthlyData = useCallback(async (monthData) => {
        if (!monthData?.startDate || !monthData?.endDate) return;

        try {
            setIsLoading(prev => ({ ...prev, monthly: true }));

            const response = await dashboardAPI.getTotalBookingsTotalBookingsAmount(
                monthData.startDate,
                monthData.endDate,
                "month"
            );

            if (response?.statusCode === 200) {
                const formatData = {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                    datasets: [
                        {
                            label: 'Doanh thu (triệu VNĐ)',
                            data: response.data?.map(item => item?.totalBookingsAmount || 0) || Array(12).fill(0),
                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Lượt đặt phòng',
                            data: response.data?.map(item => item?.totalBookings || 0) || Array(12).fill(0),
                            backgroundColor: 'rgba(75, 192, 192, 0.8)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            borderRadius: 6,
                            yAxisID: 'y1'
                        }
                    ]
                };
                setMonthlyData(formatData);
            }
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, monthly: false }));
        }
    }, []);

    const fetchLoyalOwnersData = useCallback(async () => {
        try {
            setIsLoading(prev => ({ ...prev, loyalOwners: true }));

            const response = await dashboardAPI.getTopLoyalOwners("5");

            if (response?.statusCode === 200) {
                const formatData = {
                    labels: response.data?.map(item => item?.ownerName) || [],
                    datasets: [{
                        label: 'Số homestay sở hữu',
                        data: response.data?.map(item => item?.totalHomeStays) || [],
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(251, 146, 60, 0.8)',
                            'rgba(14, 165, 233, 0.8)',
                        ],
                        borderColor: [
                            'rgba(34, 197, 94, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(168, 85, 247, 1)',
                            'rgba(251, 146, 60, 1)',
                            'rgba(14, 165, 233, 1)',
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                        barThickness: 50
                    }]
                };
                setLoyalOwnersData(formatData);
            }
        } catch (error) {
            console.error('Error fetching loyal owners data:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, loyalOwners: false }));
        }
    }, []);

    const handleWeekChange = useCallback((weekData) => {
        setSelectedWeekData(weekData);
    }, []);

    const handleMonthChange = useCallback((monthData) => {
        setSelectedMonthData(monthData);
    }, []);

    useEffect(() => {
        Promise.all([
            fetchStatsData(),
            fetchLoyalOwnersData()
        ]);
    }, [fetchStatsData, fetchLoyalOwnersData]);

    useEffect(() => {
        if (selectedWeekData) {
            fetchWeeklyData(selectedWeekData);
        }
    }, [selectedWeekData, fetchWeeklyData]);

    useEffect(() => {
        if (selectedMonthData) {
            fetchMonthlyData(selectedMonthData);
        }
    }, [selectedMonthData, fetchMonthlyData]);

    const LoadingChart = () => (
        <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
    );

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
                                        {isLoading.stats ? (
                                            <div className="animate-pulse bg-white/20 h-8 w-24 rounded"></div>
                                        ) : (
                                            <CountUp
                                                end={stat.value}
                                                duration={2.5}
                                                separator="."
                                                suffix={stat.suffix || ''}
                                                decimals={0}
                                                formatter={(value) => stat.suffix === 'đ' ? formatCurrency(value) : value}
                                            />
                                        )}
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
                            <WeekSelectorModal onWeekChange={handleWeekChange} />
                        </div>
                    </div>

                    <div className="h-[300px]">
                        {isLoading.weekly ? (
                            <LoadingChart />
                        ) : (
                            <Line
                                data={dashboardForWeek}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            titleColor: '#374151',
                                            titleFont: { size: 14, weight: 'bold' },
                                            bodyColor: '#6B7280',
                                            bodyFont: { size: 13 },
                                            padding: 12,
                                            borderColor: 'rgba(34, 197, 94, 1)',
                                            borderWidth: 2,
                                            cornerRadius: 8,
                                            displayColors: false,
                                            callbacks: {
                                                label: (context) => {
                                                    return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            grid: { display: false },
                                            border: { display: false },
                                            ticks: {
                                                font: { size: 12, weight: '600' },
                                                color: '#6B7280'
                                            }
                                        },
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                drawBorder: false
                                            },
                                            border: { display: false },
                                            ticks: {
                                                callback: (value) => formatCurrency(value),
                                                font: { size: 11 },
                                                color: '#9CA3AF'
                                            }
                                        }
                                    },
                                    interaction: {
                                        intersect: false,
                                        mode: 'index'
                                    },
                                    animation: {
                                        duration: 800,
                                        easing: 'easeOutQuart'
                                    },
                                    elements: {
                                        line: {
                                            tension: 0
                                        }
                                    }
                                }}
                            />
                        )}
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
                            <YearSelectorModal onWeekChange={handleMonthChange} />
                        </div>
                    </div>

                    <div className="h-[400px]">
                        {isLoading.monthly ? (
                            <LoadingChart />
                        ) : (
                            <Bar data={monthlyData} options={chartOptions} />
                        )}
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
                        {isLoading.loyalOwners ? (
                            <LoadingChart />
                        ) : (
                            <Bar
                                data={loyalOwnersData}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            titleColor: '#374151',
                                            titleFont: { size: 14, weight: 'bold' },
                                            bodyColor: '#6B7280',
                                            bodyFont: { size: 13 },
                                            padding: 12,
                                            borderColor: 'rgba(229, 231, 235, 1)',
                                            borderWidth: 1,
                                            cornerRadius: 8,
                                            displayColors: false,
                                            callbacks: {
                                                label: (context) => {
                                                    return `Số homestay: ${context.parsed.x} căn`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            grid: {
                                                drawBorder: false
                                            },
                                            border: { display: false },
                                            ticks: {
                                                font: { size: 11 },
                                                color: '#9CA3AF'
                                            }
                                        },
                                        y: {
                                            grid: { display: false },
                                            border: { display: false },
                                            ticks: {
                                                font: { size: 12, weight: '600' },
                                                color: '#6B7280'
                                            }
                                        }
                                    },
                                    animation: {
                                        duration: 1000,
                                        easing: 'easeOutQuart'
                                    }
                                }}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;