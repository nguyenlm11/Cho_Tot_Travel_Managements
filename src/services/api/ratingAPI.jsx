import axiosInstance from "../config";

const ratingAPI = {
    getRatingByHomestay: async (homestayId) => {
        try {
            const response = await axiosInstance.get(`/rating/GetByHomeStay/${homestayId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    updateCancelPolicy: async (data) => {
        try {
            const response = await axiosInstance.put("/CancellationPolicy/Update", data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default ratingAPI;