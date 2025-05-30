// API Base URL configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://gameday-central-production.up.railway.app/api'
    : 'http://localhost:5000/api';

// API Endpoints
export const ENDPOINTS = {
    GAMES: {
        ALL: `${API_BASE_URL}/games`,
        BY_TEAM: (teamId: string) => `${API_BASE_URL}/games/team/${teamId}`,
        BY_DATE: (date: string) => `${API_BASE_URL}/games/date/${date}`,
        BY_VENUE: (venueId: string) => `${API_BASE_URL}/games/venue/${venueId}`,
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        ME: `${API_BASE_URL}/auth/me`,
        PREFERENCES: `${API_BASE_URL}/auth/preferences`,
    }
};
