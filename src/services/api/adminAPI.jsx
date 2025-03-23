import axiosInstance from "../config";

const adminAPI = {
    // Quản lý tài khoản người dùng
    getAllHomeStayWithOwnerName: async () => {
        try {
            const response = await axiosInstance.get('/homestay/GetAllHomeStayWithOwnerName');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Quản lý tất cả Homestay đăng kí
    getAllRegisterHomestay: async () => {
        try {
            const response = await axiosInstance.get('/homestay/GetAllRegisterHomeStay');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUserStatus: async (userId, status) => {
        try {
            const response = await axiosInstance.put(`/admin/users/${userId}/status`, { status });
            return response.data;
        } catch (error) {
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
