import axiosInstance from "../config";

const staffAPI = {
    getAllStaffsByOwner: async (accountID) => {
        try {
            const response = await axiosInstance.get(`/Manage-Staff/GetAllStaffsByOwner/${accountID}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getStaffsByID: async (accountID) => {
        try {
            const response = await axiosInstance.get(`/Manage-Staff/GetStaffsByID/${accountID}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    createStaffAccount: async (data) => {
        try {
            const response = await axiosInstance.post("/Manage-Staff/CreateStaffAccount", data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateStaffAccount: async (userID, data) => {
        try {
            const response = await axiosInstance.put(`/Manage-Staff/UpdateStaffAccount/${userID}`, data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default staffAPI;