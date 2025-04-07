import axiosInstance from "../config";

const homestayAPI = {
    createHomestay: async (homestayData) => {
        try {
            const formData = new FormData();

            formData.append('name', homestayData.name);
            formData.append('description', homestayData.description);
            formData.append('address', homestayData.address);
            formData.append('longtitude', homestayData.longitude);
            formData.append('latitude', homestayData.latitude);
            formData.append('rentalType', homestayData.rentalType);
            formData.append('area', homestayData.area);
            formData.append('accountId', homestayData.accountId);

            if (homestayData.images && homestayData.images.length > 0) {
                homestayData.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await axiosInstance.post('/homestay/CreateHomeStay', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHomestaysByOwner: async (accountId) => {
        try {
            const response = await axiosInstance.get(`/homestay/GetSimpleByAccount/${accountId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHomestaysById: async (id) => {
        try {
            const response = await axiosInstance.get(`/homestay/GetHomeStayDetail/${id}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    deleteHomestay: async (homestayId) => {
        try {
            const response = await axiosInstance.delete(`/homestay/DeleteHomeStay/${homestayId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateHomestay: async (homestayId, updatedData) => {
        try {
            const response = await axiosInstance.put(`/homestay/UpdateHomeStay/${homestayId}`, updatedData);
            return response.data;
        } catch (error) {
            console.error("Error updating homestay:", error);
            throw error;
        }
    },
    updateHomestayStatus: async (homestayId, status) => {
        try {
            const response = await axiosInstance.put(`/homestay/UpdateHomeStayStatus/${homestayId}`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};


export default homestayAPI;