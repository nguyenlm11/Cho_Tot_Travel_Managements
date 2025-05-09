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
    getAllGetStaticBookingsByHomestayID: async (homestayId) => {
        try {
            const respone = await axiosInstance.get(`/booking-bookingservices/GetStaticBookingsForHomeStay/${homestayId}`)
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
    getCheckBookingServiceStats: async (homestayId) => {
        try {
            const respone = await axiosInstance.get(`bookingservices/GetServiceStats?homestayId=${homestayId}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getRoomTypeStats: async (homestayId) => {
        try {
            const respone = await axiosInstance.get(`booking-checkout/GetRoomTypeStats?homestayId=${homestayId}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getTotalAccount: async () => {
        try {
            const respone = await axiosInstance.get('/account/adminDashBoard/GetTotalAccount')
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getTotalBookingsAndAmount: async () => {
        try {
            const respone = await axiosInstance.get('/booking-bookingservices/adminDashBoard/GetTotalBookingsAndAmount')
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getTopLoyalOwners: async (top) => {
        try {
            const respone = await axiosInstance.get(`/homestay/adminDashBoard/GetTopLoyalOwners?top=${top}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getAllStaticBookings: async () => {
        try {
            const respone = await axiosInstance.get('/booking-bookingservices/adminDashBoard/GetStaticBookings')
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
    getTotalBookingsAndAmountForHomeStayByHomestayID: async (homeStayID) => {
        try {
            const respone = await axiosInstance.get(`/booking-bookingservices/GetTotalBookingsAndAmountForHomeStay/${homeStayID}`)
            return respone.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }

    },
}
export default dashboardAPI;