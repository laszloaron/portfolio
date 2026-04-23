import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle 401 unauth errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          if (res.data.access_token) {
            sessionStorage.setItem('accessToken', res.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logic to force logout could be here or handled in the store
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
