import axiosInstance from "../config";

const pricingAPI = {
    updatePricing: async (pricingID, updatedData) => {
        try {
            const response = await axiosInstance.put(`/homestay/UpdatePricing?pricingID=${pricingID}`, updatedData);
            return response.data;
        } catch (error) {
            console.error("Error updating pricing:", error);
            throw error;
        }
    },
    addPricing: async (data) => {
        try {
            const response = await axiosInstance.post(`/homestay/CreatePricing`, data);
            return response.data;
        } catch (error) {
            console.error("Error adding pricing:", error);
            throw error;
        }
    },
    getPricingByID: async (pricingID) => {
        try {
            const response = await axiosInstance.get(`/homestay/GetPricingByID/${pricingID}`);
            return response.data;
        } catch (error) {
            console.error("Error getting pricing by ID:", error);
            throw error;

        };
    }

}
export default pricingAPI;