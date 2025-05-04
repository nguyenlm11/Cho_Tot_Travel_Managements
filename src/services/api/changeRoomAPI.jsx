import axiosInstance from '../config';
const changeRoomAPI = {
    changeRoom : async (bookingID, data) => {
        try {
            const response = await axiosInstance.put(`/booking-checkout/ChangingRoom?bookingID=${bookingID}`, data);
            return response.data;
        } catch (error) {
            console.log(error); 
        }
    }
}
export default changeRoomAPI;