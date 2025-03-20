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

            // Thêm các files hình ảnh
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
    }
};

export default homestayAPI; 