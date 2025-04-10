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

    processVnPayRefund: async (bookingId, homestayId) => {
        try {
            localStorage.setItem('currentBookingInfo', JSON.stringify({
                bookingId,
                homestayId,
                timestamp: new Date().getTime()
            }));
            const response = await axiosInstance.post(
                `/booking-checkout/BookingPayment-Refund?bookingID=${bookingId}`
            );
            console.log('VNPay Refund URL:', response);
            return response.data;
        } catch (error) {
            console.error('Error processing VNPay refund:', error);
            throw error;
        }
    },
};

export default bookingAPI; 