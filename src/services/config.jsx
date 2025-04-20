export const API_CONFIG = {
    // BASE_URL: 'https://localhost:7221/api',
    BASE_URL: 'https://hungnv.iselab.cloud:7221/api',
    TOAST_CONFIG: {
        SUCCESS: {
            style: {
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #6EE7B7'
            }
        },
        ERROR: {
            style: {
                background: '#FEE2E2',
                color: '#991B1B',
                border: '1px solid #FCA5A5'
            }
        }
    }
};

// Cấu hình axios instance
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const token = localStorage.getItem('token');
                const refreshToken = localStorage.getItem('refreshToken');

                const response = await axios.post(
                    `${API_CONFIG.BASE_URL}/account/resetToken`,
                    {
                        accessToken: token,
                        refreshToken: refreshToken
                    }
                );

                if (response.data) {
                    const { token: newToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('token', newToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (error) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;