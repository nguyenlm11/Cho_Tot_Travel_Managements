import axios from 'axios';
import { API_CONFIG } from '../config';

const authService = {
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/account/login`, {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
                withCredentials: true
            });

            if (response.data) {
                const { token, refreshToken, userID, userName, email, name, roles } = response.data;
                
                // Lưu thông tin vào localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userInfo', JSON.stringify({
                    userID,
                    userName,
                    email,
                    name,
                    roles
                }));
                localStorage.setItem('isAuthenticated', 'true');
                
                return response.data;
            }
        } catch (error) {
            localStorage.clear(); // Đảm bảo xóa hết data nếu có lỗi
            throw error?.response?.data || error.message;
        }
    },

    logout: () => {
        localStorage.clear();
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/account/register-Owner`, {
                userName: userData.username,
                email: userData.email,
                password: userData.password,
                name: userData.fullName,
                address: userData.address,
                phone: userData.phone,
                taxcode: "string",
                bankAccountNumber: "string"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                }
            });
            return response.data;
        } catch (error) {
            throw error?.response?.data || error.message;
        }
    },

    verifyOTP: async (email, otp) => {
        try {
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/account/confirmation/${email}/${otp}`,
                '', // empty body
                {
                    headers: {
                        'Accept': '*/*',
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error?.response?.data || error.message;
        }
    }
};

export default authService;