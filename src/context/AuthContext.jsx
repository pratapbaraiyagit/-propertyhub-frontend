// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Flex, Spinner } from '@chakra-ui/react'; // For global loading spinner

const AuthContext = createContext(null);

// --- IMPORTANT: Define how your FULL API BASE URL is constructed ---
// Option 1: VITE_API_URL includes /api (e.g., VITE_API_URL=http://localhost:8080/api)
// const FULL_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Option 2: VITE_API_URL is just the root (e.g., VITE_API_URL=http://localhost:8080)
const API_ROOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const FULL_API_BASE_URL = `${API_ROOT_URL}/api`; // Construct it here
// --- END API URL DEFINITION ---

// Configure axios defaults ONCE when this module loads
console.log("[AuthContext] Setting Axios default base URL to:", FULL_API_BASE_URL);
axios.defaults.baseURL = FULL_API_BASE_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => { // Initialize from localStorage
        const storedToken = localStorage.getItem('token');
        console.log("[AuthContext] Initial token from localStorage:", storedToken ? "Exists" : "Does not exist");
        return storedToken;
    });// Initialize from localStorage
    const [loading, setLoading] = useState(true); // Start true for initial token check
    const [error, setError] = useState(null);

    // Effect to update axios Authorization header when token state changes
    useEffect(() => {
          if (token) {
            console.log("[AuthContext] useEffect[token]: Token IS present. Setting Axios header.", token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            console.log("[AuthContext] useEffect[token]: Token is NOT present. Deleting Axios header.");
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);// This effect runs when `token` changes

    // Effect to verify user on initial load if token exists from localStorage
    useEffect(() => {
        const verifyUserWithToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                console.log("[AuthContext] Found stored token, attempting to verify user.");
                // Token is already set in axios headers by the above useEffect if `token` state was initialized
                try {
                    // Your "verify me" endpoint, relative to FULL_API_BASE_URL
                    // e.g., if it's /api/auth/me or /api/users/me
                    const response = await axios.get('/auth/me'); // CHANGE IF YOUR "ME" ENDPOINT IS DIFFERENT
                    setUser(response.data.user || response.data); // Adjust based on your "me" endpoint response
                    // If token state wasn't set initially but localStorage had it, set it now
                    if (!token) setToken(storedToken);
                    console.log("[AuthContext] User verified successfully.", response.data.user || response.data);
                } catch (error) {
                    console.error("[AuthContext] Token verification failed:", error.response ? error.response.data : error.message);
                    localStorage.removeItem('token');
                    setToken(null); // This will trigger header removal
                    setUser(null);
                }
            }
            setLoading(false);
        };
        verifyUserWithToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const login = async (credentials) => {
        console.log("[AuthContext] Attempting login with credentials:", credentials);
        // setLoading(true); // You might want a specific login loading state if it's different from initial page load
        try {
            // --- CRUCIAL: Ensure this path is for your LOGIN endpoint ---
            // It should be relative to FULL_API_BASE_URL (which is http://localhost:8080/api)
            // So, '/auth/login' will hit 'http://localhost:8080/api/auth/login'
            const response = await axios.post('/auth/login', credentials); // Line 104 was here in your error
            console.log("[AuthContext] Login API call successful, response:", response.data);

            const { token: newToken, user: userData } = response.data;

            localStorage.setItem('token', newToken);
            setUser(userData);
            setToken(newToken); // This triggers useEffect to set Authorization header
            // setLoading(false);
            return { success: true, user: userData };
        } catch (error) {
            // This is where your error "Authorization denied, no token or invalid format" originates from the backend
            // if the request hits a protected route.
            console.error("[AuthContext] Login API call failed:", error.response ? error.response.data?.message || error.message : error.message, error.response); // Line 125 was here
            localStorage.removeItem('token'); // Clean up on failed login
            setToken(null);
            setUser(null);
            // setLoading(false);
            return { success: false, message: error.response?.data?.message || "Login failed due to server error or invalid credentials." };
        }
    };

    const register = async ({ name, email, password, phone }) => {
        setError(null);
        try {
            const response = await axios.post('/auth/register', { name, email, password, phone });
            const { token: newToken, user: userData, message } = response.data;
            localStorage.setItem('token', newToken);
            setUser(userData);
            setToken(newToken);
            return { success: true, user: userData, message: message || 'Registration successful.' };
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Registration failed.';
            setError(errMsg);
            return { success: false, message: errMsg };
        }
    };

    const logout = async () => {
        console.log("[AuthContext] Logging out.");
        // Optional: Call backend logout endpoint
        // try { await axios.post('/auth/logout'); } catch (e) { console.warn("Backend logout call failed", e); }
        localStorage.removeItem('token');
        setUser(null);
        setToken(null); // Triggers header removal and updates isAuthenticated
    };

    const clearError = () => setError(null);

    if (loading) { // Show global spinner during initial token check
        return (
            <Flex justify="center" align="center" height="100vh">
                <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="primary.500" />
            </Flex>
        );
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading, isAuthenticated: !!user && !!token, error, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);