import axios from 'axios';

// Create an Axios instance configured for the backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to attach the API Key to requests
api.interceptors.request.use((config) => {
    // In production, fetch from process.env mapped through Vite
    const apiKey = import.meta.env.VITE_ADMIN_API_KEY || 'change_this_to_a_strong_random_secret_key';
    config.headers['x-api-key'] = apiKey;
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
