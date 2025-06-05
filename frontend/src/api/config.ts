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
        return defaultUrl;
    }

    return apiUrl;
};

export const API_BASE_URL = determineApiUrl();

// Create axios instance for API endpoints
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Log configuration in development
if (process.env.NODE_ENV !== 'production') {
    console.log('API Configuration:', {
        baseURL: apiClient.defaults.baseURL,
        withCredentials: apiClient.defaults.withCredentials,
        headers: apiClient.defaults.headers
    });
}

// Add request interceptor for authentication
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Endpoints - all endpoints include /api prefix
export const ENDPOINTS = {
    HEALTH: '/api/health',
    GAMES: {
        ALL: '/api/games',
        BY_TEAM: (teamId: string) => `/api/games/team/${teamId}`,
        BY_DATE: (date: string) => `/api/games/date/${date}`,
        BY_VENUE: (venueId: string) => `/api/games/venue/${venueId}`,
    },
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
        PREFERENCES: '/api/auth/preferences',
    }
};

interface HealthCheckResponse {
    status: string;
    timestamp: string;
    environment: string;
}

// Test API connection with detailed logging
export const testApiConnection = async (): Promise<boolean> => {
    console.log('Health Check Configuration:', {
        baseURL: apiClient.defaults.baseURL,
        endpoint: ENDPOINTS.HEALTH
    });

    try {
        const response = await apiClient.get<HealthCheckResponse>(ENDPOINTS.HEALTH);
        console.log('Health Check Success:', {
            status: response.status,
            data: response.data,
            config: {
                url: response.config.url,
                baseURL: response.config.baseURL,
                fullUrl: response.request.responseURL
            }
        });

        return response.data.status === 'ok';
    } catch (error) {
        if (axios.isAxiosError(error) && error.config) {
            console.error('API Health Check Failed:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config.url || '',
                    baseURL: error.config.baseURL || '',
                    fullUrl: `${error.config.baseURL || ''}${error.config.url || ''}`
                }
            });
        } else {
            console.error('API Health Check Failed:', error);
        }
        return false;
    }
};

export default apiClient;
