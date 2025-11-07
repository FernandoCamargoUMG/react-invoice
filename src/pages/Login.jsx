import React, { useState } from "react";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from "@mui/material";
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Login as LoginIcon
} from "@mui/icons-material";
import { buildUrl, API_CONFIG } from "../config/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Variables de estado limpias

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok && data.access_token && data.refresh_token) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refresh_token);
                // Guardar usuario en sessionStorage y user_id en localStorage
                if (data.user && data.user.id && data.user.name && data.user.email) {
                    sessionStorage.setItem(
                        "user",
                        JSON.stringify({
                            id: data.user.id,
                            nombre: data.user.name, // renombrar para el frontend
                            email: data.user.email,
                        })
                    );
                    localStorage.setItem("user_id", data.user.id); // <-- para facturas y otras operaciones
                }
                // Redirigir al dashboard o página principal (respetando base path)
                window.location.href = import.meta.env.BASE_URL || '/';
            } else {
                setError(data.message || "Credenciales incorrectas");
            }
        } catch (err) {
            setError("Error de conexión: " + err.message);
        }
        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 25%, #c084fc 50%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3, md: 4 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.3) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: { xs: '100%', sm: '500px', md: '600px', lg: '700px' }
                }}
            >
                <Paper
                    elevation={24}
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '350px', sm: '400px', md: '450px' },
                        p: { xs: 3, sm: 4, md: 5 },
                        borderRadius: { xs: 3, md: 4 },
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                                mb: 1
                            }}
                        >
                            🏢
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #7c3aed, #a855f7)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                mb: 1
                            }}
                        >
                            Bienvenido
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                        >
                            Inicia sesión para gestionar tus facturas
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '1.25rem'
                                }
                            }}
                        >
                            ❌ {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            type="email"
                            label="Correo Electrónico"
                            placeholder="ejemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: '#7c3aed' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderWidth: '2px',
                                        borderColor: '#e0e4e7'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#7c3aed',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#7c3aed',
                                        boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
                                    },
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label="Contraseña"
                            placeholder="Tu contraseña segura"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: '#7c3aed' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            disabled={loading}
                                            sx={{ color: '#7c3aed' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderWidth: '2px',
                                        borderColor: '#e0e4e7'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#7c3aed',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#7c3aed',
                                        boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
                                    },
                                }
                            }}
                        />

                        {/* Botón de Iniciar Sesión */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <LoginIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                color: 'white',
                                py: { xs: 1.8, md: 2.2 },
                                fontSize: { xs: '1rem', md: '1.1rem' },
                                fontWeight: '600',
                                borderRadius: { xs: 2, md: 3 },
                                textTransform: 'none',
                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                },
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
                                    boxShadow: '0 12px 40px rgba(124, 58, 237, 0.35)',
                                    transform: 'translateY(-3px) scale(1.02)',
                                    '&::before': {
                                        opacity: 1
                                    }
                                },
                                '&:active': {
                                    transform: 'translateY(-1px) scale(1.01)',
                                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)'
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    transform: 'none',
                                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.15)',
                                    '&::before': {
                                        opacity: 0
                                    }
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                mt: 1
                            }}
                        >
                            {loading ? 'Ingresando...' : '🔐 Iniciar Sesión'}
                        </Button>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: { xs: 3, md: 4 } }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                        >
                            Sistema de Gestión de Facturas
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                mt: 0.5,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                        >
                            Versión 2.0 • Seguro y Confiable
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
