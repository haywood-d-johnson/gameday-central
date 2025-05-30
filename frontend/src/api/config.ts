import axios from 'axios';

// Validate API URL
const validateApiUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// API Base URL configuration
const determineApiUrl = (): string => {
    const envUrl = process.env.REACT_APP_API_URL;
    const defaultUrl = process.env.NODE_ENV === 'production'
        ? 'https://gameday-central-production.up.railway.app'
        : 'http://localhost:5000';

    const apiUrl = envUrl || defaultUrl;

    if (!validateApiUrl(apiUrl)) {
        console.error(`Invalid API URL: ${apiUrl}. Please check your environment configuration.`);
        // In production, fall back to the default URL
        return process.env.NODE_ENV === 'production' ? defaultUrl : apiUrl;
    }

    return apiUrl;
};

export const API_BASE_URL = determineApiUrl();

// Log API configuration in non-production environments
if (process.env.NODE_ENV !== 'production') {
    console.log('API Configuration:', {
        environment: process.env.NODE_ENV,
        apiUrl: API_BASE_URL,
        usingEnvVar: !!process.env.REACT_APP_API_URL
    });
}

// API Endpoints
export const ENDPOINTS = {
    HEALTH: `${API_BASE_URL}/api/health`,
    GAMES: {
        ALL: `${API_BASE_URL}/api/games`,
        BY_TEAM: (teamId: string) => `${API_BASE_URL}/api/games/team/${teamId}`,
        BY_DATE: (date: string) => `${API_BASE_URL}/api/games/date/${date}`,
        BY_VENUE: (venueId: string) => `${API_BASE_URL}/api/games/venue/${venueId}`,
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        ME: `${API_BASE_URL}/api/auth/me`,
        PREFERENCES: `${API_BASE_URL}/api/auth/preferences`,
    }
};

interface HealthCheckResponse {
    status: string;
    timestamp: string;
    environment: string;
}

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
    try {
        const response = await axios.get<HealthCheckResponse>(ENDPOINTS.HEALTH, {
            timeout: 5000, // 5 second timeout
            headers: {
                'Accept': 'application/json',
            },
            validateStatus: (status) => status === 200 // Only consider 200 as success
        });

        console.log('Health Check Response:', response.data);
        return response.data.status === 'ok';
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API Health Check Failed:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: ENDPOINTS.HEALTH
            });
        } else {
            console.error('API Health Check Failed:', error);
        }
        return false;
    }
};
