import axiosInstance from "../config";

const homestayRentalAPI = {
    getHomeStayRentalsByHomeStay: async (homestayId) => {
        try {
            const response = await axiosInstance.get(`/homestayrental/GetAllHomeStayRentals/${homestayId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHomeStayRentalDetail: async (rentalId) => {
        try {
            const response = await axiosInstance.get(`/homestayrental/GetHomeStayRentalDetail/${rentalId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createHomestayRental: async (rentalData) => {
        try {
            const formData = new FormData();

            formData.append('Name', rentalData.Name);
            formData.append('Description', rentalData.Description);
            formData.append('HomeStayID', rentalData.HomeStayID);
            formData.append('numberBedRoom', rentalData.numberBedRoom);
            formData.append('numberBathRoom', rentalData.numberBathRoom);
            formData.append('numberKitchen', rentalData.numberKitchen);
            formData.append('numberWifi', rentalData.numberWifi);
            formData.append('Status', rentalData.Status);
            formData.append('RentWhole', rentalData.RentWhole);
            formData.append('MaxAdults', rentalData.MaxAdults);
            formData.append('MaxChildren', rentalData.MaxChildren);
            formData.append('MaxPeople', rentalData.MaxPeople);
            formData.append('Pricing', JSON.stringify(rentalData.Pricing));
            formData.append('PricingJson', rentalData.PricingJson || "");

            // Thêm hình ảnh vào FormData
            if (rentalData.Images && rentalData.Images.length > 0) {
                rentalData.Images.forEach(image => {
                    formData.append('Images', image);
                });
            }

            // Gửi yêu cầu API
            const response = await axiosInstance.post('/homestayrental/CreateHomeStayRental', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default homestayRentalAPI;
