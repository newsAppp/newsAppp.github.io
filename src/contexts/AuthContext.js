// Global Authentication Context for NewsFlash

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { migrateGuestBookmarks, migrateLegacyBookmarks } from '../utils/bookmarkUtils';


const AuthContext = createContext({
    user: null,
    token: null,
    login: async (email, password) => { },
    signup: async (userData) => { },
    logout: () => { },
    isAuthenticated: false,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    // Verify token and get user info
                    const response = await axios.get('/api/auth/me', {
                        headers: {
                            Authorization: `Bearer ${storedToken}`
                        }
                    });

                    setUser(response.data);
                    setToken(storedToken);

                    // Migrate any legacy bookmarks to this user's account
                    migrateLegacyBookmarks(response.data);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    // Token is invalid, clear it
                    localStorage.removeItem('token');
                }
            } else {
                // No user logged in, migrate legacy bookmarks to guest
                migrateLegacyBookmarks(null);
            }

            setLoading(false);
        };

        loadUser();
    }, []);

    const signup = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            const { access_token } = response.data;

            // Store token
            localStorage.setItem('token', access_token);
            setToken(access_token);

            // Get user info
            const userResponse = await axios.get('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            setUser(userResponse.data);

            // Migrate guest bookmarks to this new user account
            migrateGuestBookmarks(userResponse.data);

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            const { access_token } = response.data;

            // Store token
            localStorage.setItem('token', access_token);
            setToken(access_token);

            // Get user info
            const userResponse = await axios.get('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            setUser(userResponse.data);

            // Migrate guest bookmarks to this user account
            migrateGuestBookmarks(userResponse.data);

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
