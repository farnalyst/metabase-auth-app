import axios from 'axios';

const API = axios.create({
    baseURL: 'http://192.168.115.145:5001/api' // Your backend URL
    // baseURL: 'http://192.168.1.53:5001/api'
    // baseURL: 'http://192.168.0.116:5001/api'
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;