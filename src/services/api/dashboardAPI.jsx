import axiosInstance from "../config";
const dashboardAPI = {
    getAllTopHomeStayBookingInMonth: async () => {
        try {
            const respone = await axiosInstance.get('/booking-bookingservices/adminDashBoard/GetTopHomeStayBookingInMonth')
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy danh sách homestay được đặt nhiều nhất trong tháng' };
        }

    },
    getAllGetStaticBookings: async () => {
        try {
            const respone = await axiosInstance.get('/booking-bookingservices/adminDashBoard/GetStaticBookings')
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getTotalBookingsTotalBookingsAmount: async (startDate, endDate, timeSpanType) => {
        try {
            const respone = await axiosInstance.get(`/booking-bookingservices/adminDashBoard/GetTotalBookingsTotalBookingsAmount?startDate=${startDate}&endDate=${endDate}&timeSpanType=${timeSpanType}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },

    getTotalBookingsTotalBookingsAmountForHomeStay: async (homeStayID, startDate, endDate, timeSpanType) => {
        try {
            const respone = await axiosInstance.get(`/booking-bookingservices/adminDashBoard/GetTotalBookingsTotalBookingsAmountForHomeStay?homeStayID=${homeStayID}&startDate=${startDate}&endDate=${endDate}&timeSpanType=${timeSpanType}
`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getTopLoyalCustomers: async (homeStayId, top) => {
        try {
            const respone = await axiosInstance.get(`/booking-bookingservices/adminDashBoard/GetTopLoyalCustomers?homeStayId=${homeStayId}&top=${top}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getCustomersByHomeStay: async (homeStayId) => {
        try {
            const respone = await axiosInstance.get(`booking-bookingservices/adminDashBoard/GetCustomersByHomeStay?homeStayId=${homeStayId}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getCurrentWeekRevenueForHomeStay: async (homestayId) => {
        try {
            const respone = await axiosInstance.get(`booking-bookingservices/adminDashBoard/GetCurrentWeekRevenueForHomeStay?homestayId=${homestayId}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getCheckBookingForRating: async (homeStayId, accountId) => {
        try {
            const respone = await axiosInstance.get(`booking-bookingservices/CheckBookingForRating?accountId=${accountId}&homeStayId=${homeStayId}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
}
export default dashboardAPI;