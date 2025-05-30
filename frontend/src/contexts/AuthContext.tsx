import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../api/config';

interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    preferences: {
        darkMode: boolean;
        favoriteTeams: string[];
        notifications: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

interface RegisterData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.baseURL = API_BASE_URL;

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await axios.get(ENDPOINTS.AUTH.ME, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    setUser(response.data);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Failed to restore auth state:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        try {
            const response = await axios.post(ENDPOINTS.AUTH.LOGIN, { emailOrUsername, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await axios.post(ENDPOINTS.AUTH.REGISTER, data);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updatePreferences = async (preferences: Partial<User['preferences']>) => {
        if (!token || !user) throw new Error('Not authenticated');

        try {
            const response = await axios.patch('/auth/preferences', preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(prev => prev ? { ...prev, preferences: response.data } : null);
        } catch (error) {
            console.error('Failed to update preferences:', error);
            throw error;
        }
    };

    // Update axios authorization header when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const value = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updatePreferences
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
