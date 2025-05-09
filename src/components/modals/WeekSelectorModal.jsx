import React, { useState, useEffect } from 'react';

const WeekSelectorModal = ({
    defaultYear = new Date().getFullYear(),
    defaultMonth = new Date().getMonth() + 1,
    onWeekChange,
    pastYears = 10,
    futureYears = 10,
}) => {
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [weeks, setWeeks] = useState([]);

    // Hàm định dạng ngày
    const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Invalid Date';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}/${month}/${day}`;
    };

    // Hàm tính các tuần trong tháng
    const getWeeksInMonth = (year, month) => {
        const weeks = [];
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        let currentDay = firstDay;

        let weekNumber = 1;
        while (currentDay <= lastDay) {
            const weekStart = new Date(currentDay);
            const weekEnd = new Date(currentDay);
            // Tính ngày kết thúc của tuần, không vượt quá ngày cuối tháng
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (weekEnd > lastDay) {
                weekEnd.setTime(lastDay.getTime());
            }

            weeks.push({
                weekNumber,
                start: formatDate(weekStart),
                end: formatDate(weekEnd),
            });

            currentDay.setDate(currentDay.getDate() + 7);
            weekNumber++;
        }

        return weeks;
    };

    // Tạo danh sách năm động
    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - pastYears;
        const endYear = currentYear + futureYears;
        const years = [];
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return years;
    };

    // Cập nhật danh sách tuần khi thay đổi tháng hoặc năm
    useEffect(() => {
        const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth);
        setWeeks(weeksInMonth);
        setSelectedWeek(1);
        if (onWeekChange && weeksInMonth.length > 0) {
            const selectedWeekData = weeksInMonth[0]; // Tuần 1
            onWeekChange({
                year: selectedYear,
                month: selectedMonth,
                weekNumber: 1,
                startDate: selectedWeekData.start,
                endDate: selectedWeekData.end,
            });
        }
    }, [selectedYear, selectedMonth]);

    // Gửi thông tin tuần được chọn khi thay đổi tuần
    useEffect(() => {
        if (onWeekChange && weeks.length > 0) {
            const selectedWeekData = weeks.find((week) => week.weekNumber === selectedWeek);
            if (selectedWeekData) {
                onWeekChange({
                    year: selectedYear,
                    month: selectedMonth,
                    weekNumber: selectedWeek,
                    startDate: selectedWeekData.start,
                    endDate: selectedWeekData.end,
                });
            }
        }
    }, [selectedWeek]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4">
            {/* Dropdown chọn năm */}
            <div className="flex flex-col">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                >
                    {generateYears().map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dropdown chọn tháng */}
            <div className="flex flex-col">
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                            Tháng {month}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dropdown chọn tuần */}
            <div className="flex flex-col">
                <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                >
                    {weeks.map((week) => (
                        <option key={week.weekNumber} value={week.weekNumber}>
                            Tuần {week.weekNumber} ({week.start} - {week.end})
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default WeekSelectorModal;