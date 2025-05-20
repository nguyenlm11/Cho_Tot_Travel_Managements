import axiosInstance from "../config";

const roomAPI = {
    getAllRoomsByRoomType: async (roomTypeId) => {
        try {
            const response = await axiosInstance.get(`/rooms/GetAllRoomByRoomType?roomTypeId=${roomTypeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createRoom: async (dataToSubmit) => {
        try {
            const formData = new FormData();
            formData.append('roomNumber', dataToSubmit.roomNumber);
            formData.append('isUsed', dataToSubmit.isUsed);
            formData.append('isActive', dataToSubmit.isActive);
            formData.append('RoomTypesID', dataToSubmit.RoomTypesID);
            if (dataToSubmit.Images && dataToSubmit.Images.length > 0) {
                dataToSubmit.Images.forEach(image => {
                    formData.append('Images', image);
                });
            }

            // console.log(formData.getAll());
            const response = await axiosInstance.post('/rooms/CreateRoom', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error creating room:", error);
            return error;
        }
    },
    getRoomsByRoomId: async (roomId) => {
        try {
            const response = await axiosInstance.get(`/rooms/GetRoom/${roomId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getRoomsByHomestayID: async (homeStayID, startDate = null, endDate = null) => {
        try {
            const response = await axiosInstance.get(`/rooms/FilterAllRoomsByHomeStayID?homeStayID=${homeStayID}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate} ` : ''}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateRoomsByRoomId: async (roomId, data) => {
        try {
            const response = await axiosInstance.put(`rooms/UpdateRoom?roomID=${roomId}`, data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getBookingsByRoomID: async (roomId, startDate = null, endDate = null) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/GetBookingByRoomID/${roomId}${startDate ? `?startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate} ` : ''}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
};

export default roomAPI; 