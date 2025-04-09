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
    },

    // VNPay Refund Related APIs
    processVnPayRefund: async (bookingId) => {
        try {
            // Lưu thông tin cho việc quay lại sau khi thanh toán
            const currentHomestayId = window.location.pathname.split('/')[3];
            localStorage.setItem('currentBookingInfo', JSON.stringify({
                bookingId,
                homestayId: currentHomestayId,
                timestamp: new Date().getTime()
            }));
            
            // Tạo URL đầy đủ để backend chuyển hướng về sau khi thanh toán
            const returnUrl = `${window.location.origin}/paymentsuccess`;
            
            const response = await axiosInstance.post(
                `/booking-checkout/BookingPayment-Refund?bookingID=${bookingId}&returnUrl=${encodeURIComponent(returnUrl)}`
            );
            console.log('VNPay Refund URL:', response);
            return response.data;
        } catch (error) {
            console.error('Error processing VNPay refund:', error);
            throw error;
        }
    },

    confirmVnPayRefund: async (vnpayParams) => {
        try {
            const response = await axiosInstance.get('/booking-checkout/confirm-vnpay-refund', {
                params: vnpayParams
            });
            return response.data;
        } catch (error) {
            console.error('Error confirming VNPay refund:', error);
            throw error;
        }
    }
};

export default bookingAPI; 