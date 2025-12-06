// Personalization hook for NewsFlash

import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export const usePersonalization = () => {
    const { user, token } = useAuth();

    const trackView = async (articleId, category, duration = 0, bookmarked = false, shared = false) => {
        if (!user || !token) return;

        try {
            await axios.post('/api/history/view', {
                article_id: articleId,
                category: category,
                view_duration: duration,
                bookmarked: bookmarked,
                shared: shared
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const getPersonalizedFeed = async (page = 1, perPage = 20) => {
        if (!user || !token) return null;

        try {
            const response = await axios.get(
                `/api/feed/personalized?page=${page}&per_page=${perPage}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.feed;
        } catch (error) {
            console.error('Error getting personalized feed:', error);
            return null;
        }
    };

    const getPreferences = async () => {
        if (!user || !token) return null;

        try {
            const response = await axios.get('/api/preferences', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting preferences:', error);
            return null;
        }
    };

    const updatePreferences = async (preferences) => {
        if (!user || !token) return null;

        try {
            const response = await axios.put('/api/preferences', preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating preferences:', error);
            return null;
        }
    };

    const getCategoryAffinity = async () => {
        if (!user || !token) return null;

        try {
            const response = await axios.get('/api/analytics/affinity', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.affinities;
        } catch (error) {
            console.error('Error getting affinity:', error);
            return null;
        }
    };

    return {
        trackView,
        getPersonalizedFeed,
        getPreferences,
        updatePreferences,
        getCategoryAffinity,
        isAuthenticated: !!user
    };
};
