import axiosInstance from "../config";

const adminAPI = {
    // Quản lý tài khoản người dùng
    getAllHomeStayWithOwnerName: async () => {
        try {
            const response = await axiosInstance.get('/homestay/GetAllHomeStayWithOwnerName');
            return response.data;
        } catch (error) {
            console.error('Error fetching homestays:', error);
            return { error: 'Không thể lấy danh sách homestay' };
        }
    },
    // Quản lý tất cả Homestay đăng kí
    getAllRegisterHomestay: async () => {
        try {
            const response = await axiosInstance.get('/homestay/GetAllRegisterHomeStay');
            return response.data;
        } catch (error) {
            console.error('Error fetching registered homestays:', error);
            return { error: 'Không thể lấy danh sách homestay đăng ký' };
        }
    },
    // Thay đổi trạng thái của homestay
    changeHomeStayStatus: async (homestayId, status, commissionRateID) => {
        try {
            console.log("Calling API with:", { homestayId, status });
            const response = await axiosInstance.put(`/homestay/ChangeHomeStayStatus?homestayId=${homestayId}&status=${status}${commissionRateID ? `&commissionRateID=${commissionRateID}` : ''}`);
            console.log("API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    // Quản lý tài khoản chủ homeStay
    getAllOwnerHomestays: async () => {
        try {
            const response = await axiosInstance.get('/account/Get-all-accounts');
            return response.data;
        } catch (error) {
            console.error('Error fetching owners homestays:', error);
            return { error: 'Không thể lấy danh sách chủ homestay' };
        }
    },

    addOwnerHomestay: async (ownerData) => {
        try {
            const response = await axiosInstance.post('/account/create account', ownerData);
            return response.data;
        } catch (error) {
            console.error('Error adding owner:', error);
            return { error: 'Không thể thêm mới chủ homestay' };
        }
    },
    getAllTransactions: async () => {
        try {
            const response = await axiosInstance.get('/Transaction/GetAllTransactions');
            return response.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy danh sách' };
        }
    },

    // Quản lý khách hàng
    getAllAccount: async () => {
        try {
            const response = await axiosInstance.get('/account/Get-all-accounts');
            return response.data;
        } catch (error) {
            console.log(error);
            return { error: 'Không thể lấy danh sách' };
        }
    },

    getReports: async () => {
        try {
            const response = await axiosInstance.get('/admin/reports');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    handleReport: async (reportId, action) => {
        try {
            const response = await axiosInstance.put(`/admin/reports/${reportId}`, { action });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default adminAPI;
