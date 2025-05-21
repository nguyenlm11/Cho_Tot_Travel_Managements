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
            return error;
        }
    },
    getTotalBookingsAndAmountForHomeStayByHomestayID: async (homeStayID) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/GetTotalBookingsAndAmountForHomeStay/${homeStayID}`);
            return response.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }
    },
    getStaticBookingsForHomeStayByHomestayID: async (homestayId) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/GetStaticBookingsForHomeStay/${homestayId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
        }
    },
    getAverageRatingForHomeStayByHomestayID: async (homeStayId) => {
        try {
            const response = await axiosInstance.get(`/rating/GetAverageRating/${homeStayId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy được danh sách' };
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
    createHomestayWithRentalAndPricing: async (homestayData) => {

        try {
            // console.log(homestayData);
            const formData = new FormData();
            formData.append('Name', homestayData.Name);
            formData.append('Description', homestayData.Description);
            formData.append('Address', homestayData.Address);
            formData.append('Longtitude', homestayData.Longitude);
            formData.append('Latitude', homestayData.Latitude);
            formData.append('RentalType', homestayData.RentalType);
            formData.append('Area', homestayData.Area);
            formData.append('AccountID', homestayData.AccountID);

            formData.append('MaxAdults', homestayData.MaxAdults);
            formData.append('MaxChildren', homestayData.MaxChildren);
            formData.append('MaxPeople', homestayData.MaxPeople);
            formData.append('RentWhole', homestayData.RentWhole);
            formData.append('RentalName', homestayData.RentalName);
            formData.append('RentalDescription', homestayData.RentalDescription);
            formData.append('numberBedRoom', homestayData.numberBedRoom);
            formData.append('numberBathRoom', homestayData.numberBathRoom);
            formData.append('numberKitchen', homestayData.numberKitchen);
            formData.append('numberWifi', homestayData.numberWifi);
            formData.append('Status', homestayData.Status);


            formData.append('Pricing', homestayData.Pricing);
            formData.append('PricingJson', homestayData.PricingJson);
            if (homestayData.RentWhole === false) {
                formData.append('RoomTypesJson', homestayData.RoomTypesJson);
                formData.append('RoomTypes', homestayData.RoomTypes);
            }


            if (homestayData.Images && homestayData.Images.length > 0) {
                homestayData.Images.forEach(image => {
                    formData.append('Images', image);
                });
            }

            if (homestayData.RentalImages && homestayData.RentalImages.length > 0) {
                homestayData.RentalImages.forEach(image => {
                    formData.append('RentalImages', image);
                });
            }

            // console.log(formData);


            const respone = await axiosInstance.post('/homestay/CreateWithRentalsAndPricing', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return respone.data;
        } catch (error) {
            console.log(error);

        }
    },
    getCustomersByHomeStay: async (homeStayId) => {
        try {
            const response = await axiosInstance.get(`/booking-bookingservices/adminDashBoard/GetCustomersByHomeStay?homeStayId=${homeStayId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },
};


export default homestayAPI;