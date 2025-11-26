// src/api/axiosInstance.js
import axios from 'axios';

// Get API URL and remove trailing slash if present
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8080/api';
const axiosInstance = axios.create({
    // baseURL: 'http://localhost:8080/api',
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =================================================================
// THE FIX: Add a request interceptor to attach the auth token
// =================================================================
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from localStorage (or wherever you store it)
        const token = localStorage.getItem('token'); 

        // If the token exists, add it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Return the modified request configuration
        return config;
    },
    (error) => {
        // This part handles errors with the request itself
        return Promise.reject(error);
    }
);

export default axiosInstance;