import axios from "axios";
import { isTokenExpired } from '../utils/tokenUtils';
export const API_BASE_URL = "http://localhost:8080";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Interceptor để luôn lấy token mới từ localStorage
api.interceptors.request.use(
    (config) => {
        const jwt = localStorage.getItem("jwt");
        if (jwt) {
            if (isTokenExpired(jwt)) {
                // Nếu token hết hạn, xóa token và chuyển hướng đến trang đăng nhập
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                window.location.href = '/auth/sign-in';
                return Promise.reject(new Error('Token expired'));
              }
            config.headers["Authorization"] = `Bearer ${jwt}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
