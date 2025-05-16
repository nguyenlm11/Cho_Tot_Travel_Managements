import axiosInstance from "../config";

const commissionRateAPI = {
    addCommissionRate: async (data) => {
        try {
            const response = await axiosInstance.post("/CommissionRate/Create", data);
            return response.data;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    updateCommissionRateWantedForOwner: async (data) => {
        try {
            const response = await axiosInstance.put("/CommissionRate/UpdateWantedForOwner", data);
            return response.data;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    getCommissionRateByHomestayId: async (homeStayID) => {
        try {
            const response = await axiosInstance.get(`/CommissionRate/GetByHomeStay/${homeStayID}`);
            return response.data;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    updateCommissionRateByAdmin: async (data) => {
        try {
            const response = await axiosInstance.put("/CommissionRate/Update", data);
            return response.data;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
}

export default commissionRateAPI;