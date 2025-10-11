import React from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';

const NavigationBar = ({ 
    title = "Sistema de Gestión", 
    showBackButton = true, 
    showHomeButton = true, 
    showLogoutButton = true,
    onBack,
    onHome,
    onLogout
}) => {
    const defaultHandlers = {
        back: () => window.history.back(),
        home: () => window.location.href = '/',
        logout: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            sessionStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                mb: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
        >
            {/* Header con título */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                mb: 2
            }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                >
                    {title}
                </Typography>

                {/* Botones de navegación */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    flexWrap: 'wrap'
                }}>
                    {showBackButton && (
                        <Button
                            variant="outlined"
                            onClick={onBack || defaultHandlers.back}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                color: '#667eea',
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                background: 'rgba(102, 126, 234, 0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                px: { xs: 2, md: 3 },
                                py: 1,
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                fontWeight: '600',
                                textTransform: 'none',
                                minWidth: { xs: 'auto', md: '100px' },
                                '&:hover': {
                                    borderColor: 'rgba(102, 126, 234, 0.5)',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    color: '#5a6fd8',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Atrás
                        </Button>
                    )}

                    {showHomeButton && (
                        <Button
                            variant="contained"
                            onClick={onHome || defaultHandlers.home}
                            startIcon={<HomeIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                                color: 'white',
                                borderRadius: 2,
                                px: { xs: 2, md: 3 },
                                py: 1,
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                fontWeight: '600',
                                textTransform: 'none',
                                minWidth: { xs: 'auto', md: '100px' },
                                boxShadow: '0 4px 16px rgba(78, 205, 196, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #26d0ce 0%, #38a085 100%)',
                                    transform: 'translateY(-2px) scale(1.02)',
                                    boxShadow: '0 6px 24px rgba(78, 205, 196, 0.35)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            Inicio
                        </Button>
                    )}

                    {showLogoutButton && (
                        <Button
                            variant="outlined"
                            onClick={onLogout || defaultHandlers.logout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                color: '#ff6b6b',
                                borderColor: 'rgba(255, 107, 107, 0.3)',
                                background: 'rgba(255, 107, 107, 0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                px: { xs: 2, md: 3 },
                                py: 1,
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                fontWeight: '600',
                                textTransform: 'none',
                                minWidth: { xs: 'auto', md: '120px' },
                                '&:hover': {
                                    borderColor: 'rgba(255, 107, 107, 0.5)',
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    color: '#ee5a24',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 16px rgba(255, 107, 107, 0.2)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Cerrar sesión
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Divider decorativo */}
            <Divider 
                sx={{ 
                    background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
                    height: '2px',
                    border: 'none'
                }} 
            />
        </Paper>
    );
};

export default NavigationBar;