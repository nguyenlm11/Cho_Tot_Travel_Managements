import axiosInstance from '../config';
import { jwtDecode } from 'jwt-decode';

const authService = {
    login: async (username, password) => {
        try {
            const response = await axiosInstance.post('/account/login', {
                username,
                password
            });

            if (response.data) {
                const { token, refreshToken } = response.data;

                const decodedToken = jwtDecode(token);
                const {
                    AccountID,
                    given_name,
                    email,
                    role,
                    exp,
                    iat
                } = decodedToken;

                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userInfo', JSON.stringify({
                    AccountID,
                    given_name,
                    email,
                    role,
                    tokenExp: exp,
                    tokenIat: iat
                }));
                localStorage.setItem('isAuthenticated', 'true');

                return {
                    token,
                    refreshToken,
                    user: decodedToken
                };
            }
        } catch (error) {
            localStorage.clear();
            throw error?.response?.data || error;
        }
    },

    logout: () => {
        localStorage.clear();
    },

    register: async (formData) => {
        try {
            const response = await axiosInstance.post('/account/register-Owner', formData);
            return response.data;
        } catch (error) {
            throw error?.response?.data || error;
        }
    },

    verifyOTP: async (email, otp) => {
        try {
            const response = await axiosInstance.post(`/account/confirmation/${email}/${otp}`);
            return response.data;
        } catch (error) {
            throw error?.response?.data || { message: 'Có lỗi xảy ra khi xác thực OTP' };
        }
    },

    resetToken: async () => {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            const response = await axiosInstance.post('/account/resetToken', {
                accessToken: token,
                refreshToken: refreshToken
            });

            if (response.data) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                const decodedToken = jwtDecode(newToken);
                const {
                    AccountID,
                    given_name,
                    email,
                    role,
                    exp,
                    iat
                } = decodedToken;

                localStorage.setItem('token', newToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                localStorage.setItem('userInfo', JSON.stringify({
                    AccountID,
                    given_name,
                    email,
                    role,
                    tokenExp: exp,
                    tokenIat: iat
                }));

                return {
                    token: newToken,
                    refreshToken: newRefreshToken,
                    user: decodedToken
                };
            }
        } catch (error) {
            localStorage.clear();
            throw error?.response?.data || error;
        }
    }
};

export default authService;