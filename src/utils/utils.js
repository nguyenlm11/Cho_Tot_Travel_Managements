export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price || 0);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
export const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Chủ nhật) đến 6 (Thứ Bảy)

    // Tìm Thứ Hai của tuần hiện tại
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

    const weekDates = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]); // Format yyyy-mm-dd
    }

    return weekDates;
};
export const getAllMonthsInYear = () => {
    const year = new Date().getFullYear();
    const months = [];

    for (let i = 0; i < 12; i++) {
        const month = (i + 1).toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
        months.push(`${year}-${month}`);
    }

    return months;
};