import axiosInstance from "../config";

const serviceAPI = {
    createService: async (serviceData) => {
        try {
            const formData = new FormData();
            
            formData.append('servicesName', serviceData.servicesName);
            formData.append('description', serviceData.description);
            formData.append('unitPrice', serviceData.unitPrice);
            formData.append('servicesPrice', serviceData.servicesPrice);
            formData.append('status', true);
            formData.append('homeStayID', serviceData.homeStayID);

            // Thêm các files hình ảnh
            if (serviceData.images && serviceData.images.length > 0) {
                serviceData.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await axiosInstance.post('/Service/CreateService', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Thêm các methods khác cho service nếu cần
    getServices: async (homestayId) => {
        try {
            const response = await axiosInstance.get(`/Service/GetByHomeStay/${homestayId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteService: async (serviceId) => {
        try {
            const response = await axiosInstance.delete(`/Service/DeleteService/${serviceId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateService: async (serviceId, serviceData) => {
        try {
            const formData = new FormData();
            
            formData.append('servicesName', serviceData.servicesName);
            formData.append('description', serviceData.description);
            formData.append('unitPrice', serviceData.unitPrice);
            formData.append('servicesPrice', serviceData.servicesPrice);
            formData.append('status', serviceData.status);
            formData.append('homeStayID', serviceData.homeStayID);

            if (serviceData.images && serviceData.images.length > 0) {
                serviceData.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await axiosInstance.put(`/Service/UpdateService/${serviceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default serviceAPI; 