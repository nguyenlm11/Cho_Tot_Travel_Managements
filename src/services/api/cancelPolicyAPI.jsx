import axiosInstance from "../config";

const cancelPolicyAPI = {
    addCancelPolicy: async (data) => {
        try {
            const response = await axiosInstance.post("/CancellationPolicy/Create", data);
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

export default cancelPolicyAPI;