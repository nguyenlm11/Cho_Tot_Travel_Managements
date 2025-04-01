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
    changeHomeStayStatus: async (homestayId, status) => {
        try {
            console.log("Calling API with:", { homestayId, status });
            const response = await axiosInstance.put(`/homestay/ChangeHomeStayStatus?homestayId=${homestayId}&status=${status}`);
            console.log("API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    // Quản lý homestay
    getAllHomestays: async () => {
        try {
            const response = await axiosInstance.get('/admin/homestays');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    approveHomestay: async (homestayId) => {
        try {
            const response = await axiosInstance.put(`/admin/homestays/${homestayId}/approve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Quản lý báo cáo và thống kê
    getStatistics: async (startDate, endDate) => {
        try {
            const response = await axiosInstance.get('/admin/statistics', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
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
