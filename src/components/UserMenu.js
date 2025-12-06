// User Menu Component for authenticated users

import React, { useState } from 'react';
import {
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Box,
    Button
} from '@mui/material';
import {
    Person,
    Bookmark,
    Settings,
    Logout,
    Login as LoginIcon,
    PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = ({ onLoginClick, onSignupClick }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
    };

    const handleBookmarks = () => {
        // Navigate to bookmarks
        window.location.hash = '#/bookmarks';
        handleMenuClose();
    };

    if (!isAuthenticated) {
        // Show Login/Signup buttons when not authenticated
        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<LoginIcon />}
                    onClick={onLoginClick}
                    sx={{
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        }
                    }}
                >
                    Login
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAdd />}
                    onClick={onSignupClick}
                >
                    Sign Up
                </Button>
            </Box>
        );
    }

    // Authenticated user menu
    const getInitials = () => {
        if (user?.full_name) {
            const names = user.full_name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        return user?.username?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <>
            <IconButton
                onClick={handleMenuOpen}
                sx={{ p: 0 }}
            >
                <Avatar
                    sx={{
                        bgcolor: 'primary.main',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 'bold'
                    }}
                >
                    {getInitials()}
                </Avatar>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        minWidth: 200,
                        boxShadow: 3,
                        borderRadius: 2
                    }
                }}
            >
                {/* User Info Header */}
                <Box sx={{ px: 2, py: 1.5, backgroundColor: 'rgba(102, 126, 234, 0.08)' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {user?.full_name || user?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.email}
                    </Typography>
                </Box>

                <Divider />

                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleBookmarks}>
                    <ListItemIcon>
                        <Bookmark fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Bookmarks</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;
