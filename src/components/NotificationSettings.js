import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Button,
    Chip,
    Stack,
    Alert,
    Snackbar,
    Divider,
    FormGroup,
    Checkbox
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsOff,
    Send as SendIcon
} from '@mui/icons-material';
import {
    getNotificationPermission,
    getSubscription,
    requestNotificationPermission,
    registerServiceWorker,
    subscribeUserToPush,
    unsubscribeUser,
    sendSubscriptionToBackend,
    removeSubscriptionFromBackend,
    sendTestNotification,
    updateNotificationPreferences
} from '../utils/notificationUtils';

const CATEGORIES = [
    { id: 'national', label: 'National & Politics', labelHindi: 'राष्ट्रीय और राजनीति' },
    { id: 'international', label: 'International', labelHindi: 'अंतर्राष्ट्रीय' },
    { id: 'business', label: 'Business & Economy', labelHindi: 'व्यवसाय और अर्थव्यवस्था' },
    { id: 'technology', label: 'Science & Technology', labelHindi: 'विज्ञान और तकनीक' },
    { id: 'sports', label: 'Sports', labelHindi: 'खेल' },
    { id: 'entertainment', label: 'Entertainment & Lifestyle', labelHindi: 'मनोरंजन और जीवन शैली' },
    { id: 'health', label: 'Health & Society', labelHindi: 'स्वास्थ्य और समाज' }
];

const NotificationSettings = ({ isHindi = false }) => {
    const [enabled, setEnabled] = useState(false);
    const [permission, setPermission] = useState('default');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        const perm = getNotificationPermission();
        setPermission(perm);

        if (perm === 'granted') {
            const subscription = await getSubscription();
            setEnabled(!!subscription);

            // Load preferences from localStorage (or could fetch from backend)
            const savedPrefs = localStorage.getItem('notification_preferences');
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                setSelectedCategories(prefs.categories || []);
            }
        }
    };

    const handleToggleNotifications = async (event) => {
        const newEnabled = event.target.checked;
        setLoading(true);

        try {
            if (newEnabled) {
                // Enable notifications
                await registerServiceWorker();
                const perm = await requestNotificationPermission();

                if (perm === 'granted') {
                    const subscription = await subscribeUserToPush();
                    await sendSubscriptionToBackend(subscription, {
                        categories: selectedCategories,
                        frequency: 'instant'
                    });

                    setEnabled(true);
                    setPermission('granted');
                    showSnackbar('Notifications enabled successfully!', 'success');
                } else {
                    showSnackbar('Permission denied', 'error');
                }
            } else {
                // Disable notifications
                const subscription = await getSubscription();
                if (subscription) {
                    await removeSubscriptionFromBackend(subscription);
                    await unsubscribeUser();
                }

                setEnabled(false);
                showSnackbar('Notifications disabled', 'info');
            }
        } catch (error) {
            console.error('Error toggling notifications:', error);
            showSnackbar('Failed to update notification settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = async (categoryId) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(newCategories);

        // Save to localStorage
        const prefs = { categories: newCategories, frequency: 'instant' };
        localStorage.setItem('notification_preferences', JSON.stringify(prefs));

        // Update backend if notifications are enabled
        if (enabled) {
            try {
                await updateNotificationPreferences(prefs);
                showSnackbar('Preferences updated', 'success');
            } catch (error) {
                console.error('Error updating preferences:', error);
            }
        }
    };

    const handleSendTest = async () => {
        setLoading(true);
        try {
            await sendTestNotification();
            showSnackbar('Test notification sent! Check your notifications.', 'success');
        } catch (error) {
            console.error('Error sending test notification:', error);
            showSnackbar('Failed to send test notification', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        {enabled ? (
                            <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
                        ) : (
                            <NotificationsOff sx={{ fontSize: 40, color: 'text.secondary' }} />
                        )}
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {isHindi ? 'सूचनाएं' : 'Notifications'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isHindi
                                    ? 'ब्रेकिंग न्यूज और महत्वपूर्ण अपडेट प्राप्त करें'
                                    : 'Get breaking news and important updates'
                                }
                            </Typography>
                        </Box>
                    </Box>

                    {permission === 'denied' && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {isHindi
                                ? 'सूचनाएं ब्लॉक की गई हैं। कृपया अपनी ब्राउज़र सेटिंग्स से अनुमति दें।'
                                : 'Notifications are blocked. Please enable them in your browser settings.'
                            }
                        </Alert>
                    )}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={enabled}
                                onChange={handleToggleNotifications}
                                disabled={loading || permission === 'denied'}
                            />
                        }
                        label={
                            <Typography variant="body1">
                                {enabled
                                    ? (isHindi ? 'सूचनाएं सक्षम' : 'Notifications Enabled')
                                    : (isHindi ? 'सूचनाएं अक्षम' : 'Notifications Disabled')
                                }
                            </Typography>
                        }
                    />

                    {enabled && (
                        <>
                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {isHindi ? 'श्रेणियां चुनें' : 'Select Categories'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {isHindi
                                    ? 'आप किन विषयों के बारे में सूचनाएं प्राप्त करना चाहते हैं?'
                                    : 'What topics would you like to receive notifications about?'
                                }
                            </Typography>

                            <FormGroup>
                                {CATEGORIES.map((category) => (
                                    <FormControlLabel
                                        key={category.id}
                                        control={
                                            <Checkbox
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={() => handleCategoryToggle(category.id)}
                                            />
                                        }
                                        label={isHindi ? category.labelHindi : category.label}
                                    />
                                ))}
                            </FormGroup>

                            <Divider sx={{ my: 3 }} />

                            <Button
                                variant="outlined"
                                startIcon={<SendIcon />}
                                onClick={handleSendTest}
                                disabled={loading}
                                fullWidth
                            >
                                {isHindi ? 'परीक्षण सूचना भेजें' : 'Send Test Notification'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NotificationSettings;
