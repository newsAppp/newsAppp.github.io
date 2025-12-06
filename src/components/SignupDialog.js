// Beautiful Signup Dialog for NewsFlash

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Alert,
    Box,
    Typography,
    CircularProgress,
    Link,
    LinearProgress,
    Divider
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAdd as SignupIcon,
    Close as CloseIcon,
    CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const SignupDialog = ({ open, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        full_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { signup } = useAuth();

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        setError('');
    };

    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 15;
        if (/[^a-zA-Z\d]/.test(password)) strength += 10;

        return Math.min(strength, 100);
    };

    const passwordStrength = getPasswordStrength();
    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'error';
        if (passwordStrength < 70) return 'warning';
        return 'success';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const result = await signup({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                full_name: formData.full_name || null
            });

            if (result.success) {
                setSuccess(true);
                // Close after a brief success message
                setTimeout(() => {
                    setFormData({
                        email: '',
                        username: '',
                        password: '',
                        confirmPassword: '',
                        full_name: ''
                    });
                    setSuccess(false);
                    onClose();
                }, 1500);
            } else {
                setError(result.error || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            full_name: ''
        });
        setSuccess(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 3,
                    position: 'relative'
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white'
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <SignupIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h5" fontWeight="600">
                        Create Account
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                        Join NewsFlash today
                    </Typography>
                </Box>
            </Box>


            {/* Form */}
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3 }}>
                    {success ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                            <Typography variant="h6" color="success.main">
                                Account created successfully!
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                required
                                autoFocus
                                margin="dense"
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={handleChange('username')}
                                required
                                margin="dense"
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Full Name (Optional)"
                                value={formData.full_name}
                                onChange={handleChange('full_name')}
                                margin="dense"
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange('password')}
                                required
                                margin="dense"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {formData.password && (
                                <Box sx={{ mt: 1, mb: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength}
                                        color={getStrengthColor()}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        Password strength: {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong'}
                                    </Typography>
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                required
                                margin="dense"
                                variant="outlined"
                                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4291 100%)',
                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                    },
                                    '&:disabled': {
                                        background: '#ccc'
                                    }
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={() => {
                                            handleClose();
                                            onSwitchToLogin();
                                        }}
                                        sx={{
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            color: '#667eea',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        Login
                                    </Link>
                                </Typography>
                            </Box>
                        </>
                    )}
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default SignupDialog;
