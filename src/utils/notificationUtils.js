// Utility functions for managing push notifications

const VAPID_PUBLIC_KEY = 'BFRU8Ki2Im_Qvl6mK17rKZLHeCi9UjMeyhH3R_1oaORf36XCY7K4b4qtBWLTmWCk07H_Is1NUOt-Dn0OMAKYjno';
const API_URL = 'http://localhost:8000';

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = () => {
    if (!isPushNotificationSupported()) {
        return 'unsupported';
    }
    return Notification.permission; // 'default', 'granted', or 'denied'
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async () => {
    if (!isPushNotificationSupported()) {
        throw new Error('Push notifications are not supported in this browser');
    }

    try {
        const permission = await Notification.requestPermission();
        return permission; // 'granted', 'denied', or 'default'
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        throw error;
    }
};

/**
 * Register service worker
 */
export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported');
    }

    try {
        const registration = await navigator.serviceWorker.register(
            '/service-worker.js',
            { scope: '/' }
        );
        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
    }
};

/**
 * Get current push subscription
 */
export const getSubscription = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription;
    } catch (error) {
        console.error('Error getting subscription:', error);
        return null;
    }
};

/**
 * Subscribe user to push notifications
 */
export const subscribeUserToPush = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('User subscribed to push:', subscription);
        return subscription;
    } catch (error) {
        console.error('Failed to subscribe to push:', error);
        throw error;
    }
};

/**
 * Unsubscribe user from push notifications
 */
export const unsubscribeUser = async () => {
    try {
        const subscription = await getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            console.log('User unsubscribed from push');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error unsubscribing from push:', error);
        throw error;
    }
};

/**
 * Send subscription to backend server
 */
export const sendSubscriptionToBackend = async (subscription, preferences = {}) => {
    try {
        const response = await fetch(`${API_URL}/api/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscription: subscription.toJSON(),
                user_agent: navigator.userAgent,
                categories: preferences.categories || [],
                frequency: preferences.frequency || 'instant'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save subscription to backend');
        }

        const data = await response.json();
        console.log('Subscription saved to backend:', data);
        return data;
    } catch (error) {
        console.error('Error sending subscription to backend:', error);
        throw error;
    }
};

/**
 * Remove subscription from backend server
 */
export const removeSubscriptionFromBackend = async (subscription) => {
    try {
        const response = await fetch(`${API_URL}/api/push/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint
            })
        });

        if (!response.ok) {
            throw new Error('Failed to remove subscription from backend');
        }

        console.log('Subscription removed from backend');
        return true;
    } catch (error) {
        console.error('Error removing subscription from backend:', error);
        throw error;
    }
};

/**
 * Send test notification
 */
export const sendTestNotification = async () => {
    try {
        const subscription = await getSubscription();

        if (!subscription) {
            throw new Error('No active subscription');
        }

        const response = await fetch(`${API_URL}/api/push/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send test notification');
        }

        return true;
    } catch (error) {
        console.error('Error sending test notification:', error);
        throw error;
    }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (preferences) => {
    try {
        const subscription = await getSubscription();

        if (!subscription) {
            throw new Error('No active subscription');
        }

        const response = await fetch(`${API_URL}/api/push/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint,
                categories: preferences.categories,
                frequency: preferences.frequency
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update preferences');
        }

        return true;
    } catch (error) {
        console.error('Error updating preferences:', error);
        throw error;
    }
};
