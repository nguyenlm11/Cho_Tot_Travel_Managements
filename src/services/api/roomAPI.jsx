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

    createRoom: async (roomData) => {
        try {
            const response = await axiosInstance.post('/rooms/CreateRoom', roomData);
            return response.data;
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    }
};

export default roomAPI; 