import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000';
const API_TIMEOUT = 120000; // 2 minutes for long-running requests

// Configure axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handling utilities
const handleError = (error) => {
    // Network errors (no response received)
    if (error.code === 'ERR_NETWORK' || !error.response) {
        return {
            success: false,
            error: 'Unable to connect to the server. Please check your connection.',
        };
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
            success: false,
            error: 'Request timed out. The generation process is taking longer than expected. Please try again.',
        };
    }

    // API errors (response received with error status)
    if (error.response) {
        const errorMessage = error.response.data?.error ||
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
        return {
            success: false,
            error: errorMessage,
        };
    }

    // Fallback for unknown errors
    return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
    };
};

// API Methods
export const generateImage = async (payload) => {
    try {
        const response = await apiClient.post('/api/generate', payload);
        return response.data;
    } catch (error) {
        return handleError(error);
    }
};

export default {
    generateImage,
};
