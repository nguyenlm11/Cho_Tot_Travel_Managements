import axiosInstance from "../config";

const roomTypeAPI = {
    getAllRoomTypesByRentalId: async (rentalId) => {
        try {
            const response = await axiosInstance.get(`/roomtype/GetAllRoomTypesByRentalId/${rentalId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getRoomTypeDetail: async (roomTypeId) => {
        try {
            const response = await axiosInstance.get(`/RoomType/GetRoomTypeDetail/${roomTypeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    createRoomType: async (roomTypeData) => {
        try {
            const formData = new FormData();

            formData.append('Name', roomTypeData.Name);
            formData.append('Description', roomTypeData.Description);
            formData.append('numberBed', roomTypeData.numberBed);
            formData.append('numberBathRoom', roomTypeData.numberBathRoom);
            formData.append('numberWifi', roomTypeData.numberWifi);
            formData.append('Status', roomTypeData.Status);
            formData.append('MaxAdults', roomTypeData.MaxAdults);
            formData.append('MaxChildren', roomTypeData.MaxChildren);
            formData.append('MaxPeople', roomTypeData.MaxPeople);
            formData.append('Pricing', JSON.stringify(roomTypeData.Pricing));
            formData.append('PricingJson', roomTypeData.PricingJson || "");

            if (roomTypeData.Images && roomTypeData.Images.length > 0) {
                roomTypeData.Images.forEach(image => {
                    formData.append('Images', image);
                });
            }

            const response = await axiosInstance.post(
                `/RoomType/CreateRoomType?homeStayRentalId=${roomTypeData.homeStayRentalId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateRoomType: async (roomTypeId, roomTypeData) => {
        try {
            const response = await axiosInstance.put(`/RoomType/UpdateRoomType?roomID=${roomTypeId}`, roomTypeData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteRoomType: async (roomTypeId) => {
        try {
            const response = await axiosInstance.delete(`/RoomType/DeleteRoomType/${roomTypeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getRoomsByHomestayRentalID: async (homestayRentalID, startDate = null, endDate = null) => {
        try {
            const response = await axiosInstance.get(`/rooms/FilterAllRoomsByHomeStayRental?homeStayRentalID=${homestayRentalID}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate} ` : ''}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
};

export default roomTypeAPI; 