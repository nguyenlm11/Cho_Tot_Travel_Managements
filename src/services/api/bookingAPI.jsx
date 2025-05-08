import axiosInstance from '../config';

const bookingAPI = {
    getBookingsByHomeStay: async (homeStayId) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/GetBookingByHomeStay/${homeStayId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },
    getBookingsByAccountID: async (accountId) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/GetBookingByHomeStay/${accountId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },
    getBookingsByID: async (bookingId) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/GetBookingByID/${bookingId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    getBookingServicesByHomeStayID: async (homeStayId) => {
        try {
            const response = await axiosInstance.get(`/bookingservices/GetBookingServicesByHomeStayID/${homeStayId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching booking services:', error);
            throw error;
        }
    },

    updateBookingStatus: async (bookingId, status, paymentStatus) => {
        try {
            const response = await axiosInstance.put(
                `/booking-checkout/ChangeBookingStatus?bookingId=${bookingId}&status=${status}&paymentStatus=${paymentStatus}`
            );
            return response.data;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    },

    processVnPayRefund: async (bookingId, homestayId, accountID) => {
        try {
            localStorage.setItem('currentBookingInfo', JSON.stringify({
                bookingId,
                homestayId,
                timestamp: new Date().getTime()
            }));
            const response = await axiosInstance.post(
                `/booking-checkout/BookingPayment-Refund?bookingID=${bookingId}&accountId=${accountID}`
            );
            console.log('VNPay Refund URL:', response);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    processServiceRefund: async (bookingServiceId, accountID) => {
        try {
            const response = await axiosInstance.post(
                `/booking-checkout/BookingPaymentService-Refund?bookingServiceID=${bookingServiceId}&accountId=${accountID}`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default bookingAPI; 