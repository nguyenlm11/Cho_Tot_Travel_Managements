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
};

export default roomAPI; 