import axiosInstance from "../config";

const reportHomestayAPI = {
    getReportHomestayByHomestayId: async (homestayId) => {
        try {
            const response = await axiosInstance.get(`/Transaction/GetTransactionByHomeStay/${homestayId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default reportHomestayAPI;
