import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    IconButton,
    Collapse,
    Alert
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Close as CloseIcon,
    NotificationsActive
} from '@mui/icons-material';
import {
    isPushNotificationSupported,
    getNotificationPermission,
    requestNotificationPermission,
    registerServiceWorker,
    subscribeUserToPush,
    sendSubscriptionToBackend
} from '../utils/notificationUtils';

const PROMPT_DISMISSED_KEY = 'newsflash_notification_prompt_dismissed';
const PROMPT_DELAY_MS = 30000; // 30 seconds

const NotificationPrompt = () => {
    const [show, setShow] = useState(false);
    const [permission, setPermission] = useState('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if notifications are supported
        if (!isPushNotificationSupported()) {
            return;
        }

        // Check current permission status
        const currentPermission = getNotificationPermission();
        setPermission(currentPermission);

        // Don't show if already granted or denied
        if (currentPermission !== 'default') {
            return;
        }

        // Check if user previously dismissed the prompt
        const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
        if (dismissed) {
            return;
        }

        // Show prompt after delay (user engagement indicator)
        const timer = setTimeout(() => {
            setShow(true);
        }, PROMPT_DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    const handleEnableNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            // Register service worker
            await registerServiceWorker();

            // Request permission
            const newPermission = await requestNotificationPermission();
            setPermission(newPermission);

            if (newPermission === 'granted') {
                // Subscribe to push notifications
                const subscription = await subscribeUserToPush();

                // Send subscription to backend
                await sendSubscriptionToBackend(subscription, {
                    categories: [], // Subscribe to all by default
                    frequency: 'instant'
                });

                // Hide the prompt
                setShow(false);

                // Show success message (optional)
                console.log('Push notifications enabled successfully!');
            } else {
                setError('Permission denied. You can enable notifications later in settings.');
                setTimeout(() => setShow(false), 3000);
            }
        } catch (err) {
            console.error('Error enabling notifications:', err);
            setError('Failed to enable notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        // Remember that user dismissed the prompt
        localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
        setShow(false);
    };

    if (!show || !isPushNotificationSupported()) {
        return null;
    }

    return (
        <Collapse in={show}>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: { xs: 16, md: 24 },
                    left: { xs: 16, md: 24 },
                    right: { xs: 16, md: 'auto' },
                    maxWidth: { xs: '100%', md: 400 },
                    zIndex: 1300,
                    animation: 'slideUp 0.4s ease-out'
                }}
            >
                <Card
                    elevation={8}
                    sx={{
                        background: (theme) =>
                            theme.palette.mode === 'light'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
                        color: 'white',
                        borderRadius: 3
                    }}
                >
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                <NotificationsActive sx={{ fontSize: 32 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Stay Updated!
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={handleDismiss}
                                sx={{ color: 'white', opacity: 0.8 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.95 }}>
                            Get instant notifications for breaking news and stories that matter to you.
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box display="flex" gap={1.5}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleEnableNotifications}
                                disabled={loading}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.secondary',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        bgcolor: 'rgba(34, 168, 16, 0.9)'
                                    }
                                }}
                            >
                                {loading ? 'Enabling...' : 'Enable Notifications'}
                            </Button>
                            <Button
                                variant="text"
                                onClick={handleDismiss}
                                sx={{
                                    color: 'white',
                                    opacity: 0.9,
                                    '&:hover': {
                                        opacity: 1,
                                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Maybe Later
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <style>
                {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
            </style>
        </Collapse>
    );
};

export default NotificationPrompt;
