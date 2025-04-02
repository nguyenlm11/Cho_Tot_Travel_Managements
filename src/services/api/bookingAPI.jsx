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
    }
};

export default bookingAPI; 