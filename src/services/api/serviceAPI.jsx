import axiosInstance from "../config";

const serviceAPI = {
    createService: async (serviceData) => {
        try {
            const formData = new FormData();

            formData.append('servicesName', serviceData.servicesName);
            formData.append('description', serviceData.description);
            // formData.append('unitPrice', serviceData.unitPrice);
            formData.append('servicesPrice', serviceData.servicesPrice);
            formData.append('status', true);
            formData.append('homeStayID', serviceData.homeStayID);
            formData.append('ServiceType', serviceData.serviceType);
            formData.append('Quantity', serviceData.quantity);

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
            console.log(error);
            throw error;
        }
    },

    updateService: async (serviceId, serviceData) => {
        try {
            const formData = new FormData();

            formData.append('servicesName', serviceData.servicesName);
            formData.append('Description', serviceData.description);
            formData.append('UnitPrice', serviceData.unitPrice);
            formData.append('servicesPrice', serviceData.servicesPrice);
            formData.append('Status', serviceData.status);
            formData.append('ServiceType', serviceData.serviceType);
            formData.append('Quantity', serviceData.quantity);
            formData.append('HomeStayID', serviceData.homeStayID);

            const response = await axiosInstance.put(`/Service/UpdateService/${serviceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getAllServices: async (homestayId) => {
        try {
            const response = await axiosInstance.get(`/Service/GetAllServices/${homestayId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
};

export default serviceAPI; 