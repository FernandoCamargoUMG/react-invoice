import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    Typography,
    Button,
    Paper,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Backup as BackupIcon,
    Security as SecurityIcon,
    Help as HelpIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    History as HistoryIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Info as InfoIcon,
    ContactSupport as ContactSupportIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';

const Settings = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    
    // Estados para configuraciones
    const [settings, setSettings] = useState({
        notifications: true,
        autoBackup: false,
        darkMode: false,
        twoFactor: false,
        emailReports: true
    });

    const [backupProgress, setBackupProgress] = useState(0);
    const [isBackingUp, setIsBackingUp] = useState(false);

    // Funciones para manejar configuraciones
    const handleSettingChange = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleBackup = () => {
        setIsBackingUp(true);
        setBackupProgress(0);
        
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsBackingUp(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const configSections = [
        {
            title: 'Configuración General',
            icon: <SettingsIcon />,
            color: '#8B5FBF',
            items: [
                {
                    label: 'Notificaciones del sistema',
                    description: 'Recibir alertas y notificaciones importantes',
                    value: settings.notifications,
                    onChange: () => handleSettingChange('notifications')
                },
                {
                    label: 'Modo oscuro',
                    description: 'Cambiar la apariencia del sistema',
                    value: settings.darkMode,
                    onChange: () => handleSettingChange('darkMode'),
                    disabled: true,
                    comingSoon: true
                },
                {
                    label: 'Reportes por email',
                    description: 'Enviar reportes automáticos por correo',
                    value: settings.emailReports,
                    onChange: () => handleSettingChange('emailReports'),
                    disabled: true,
                    comingSoon: true
                }
            ]
        },
        {
            title: 'Respaldos',
            icon: <BackupIcon />,
            color: '#6A4C93',
            items: [
                {
                    label: 'Respaldo automático',
                    description: 'Crear respaldos automáticamente cada 24 horas',
                    value: settings.autoBackup,
                    onChange: () => handleSettingChange('autoBackup'),
                    disabled: true,
                    comingSoon: true
                }
            ]
        },
        {
            title: 'Seguridad',
            icon: <SecurityIcon />,
            color: '#B794F6',
            items: [
                {
                    label: 'Autenticación de dos factores',
                    description: 'Mayor seguridad para tu cuenta',
                    value: settings.twoFactor,
                    onChange: () => handleSettingChange('twoFactor'),
                    disabled: true,
                    comingSoon: true
                }
            ]
        }
    ];

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2D3748 0%, #8B5FBF 100%)',
            p: { xs: 2, md: 3 }
        }}>
            <NavigationBar 
                title="⚙️ Configuración del Sistema"
                onHome={() => navigate('/')}
                onBack={() => navigate('/')}
            />

            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 4
            }}>
                {/* Secciones de Configuración */}
                {configSections.map((section, index) => (
                    <Paper key={index} sx={{
                        p: 4,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${section.color}, ${section.color}80)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 4px 16px ${section.color}40`
                            }}>
                                {section.icon}
                            </Box>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 'bold',
                                color: section.color
                            }}>
                                {section.title}
                            </Typography>
                        </Box>

                        {section.items.map((item, itemIndex) => (
                            <Box key={itemIndex}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    py: 2
                                }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: '600' }}>
                                                {item.label}
                                            </Typography>
                                            {item.comingSoon && (
                                                <Chip 
                                                    label="Próximamente" 
                                                    size="small" 
                                                    sx={{ 
                                                        backgroundColor: `${section.color}20`,
                                                        color: section.color,
                                                        fontSize: '0.75rem'
                                                    }} 
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.description}
                                        </Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={item.value}
                                                onChange={item.onChange}
                                                disabled={item.disabled}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: section.color,
                                                        '&:hover': {
                                                            backgroundColor: `${section.color}20`,
                                                        },
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: section.color,
                                                    },
                                                }}
                                            />
                                        }
                                        label=""
                                    />
                                </Box>
                                {itemIndex < section.items.length - 1 && (
                                    <Divider sx={{ opacity: 0.3 }} />
                                )}
                            </Box>
                        ))}
                    </Paper>
                ))}

                {/* Sección de Respaldos */}
                <Paper sx={{
                    p: 4,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="h5" sx={{ 
                        mb: 3, 
                        fontWeight: 'bold',
                        color: '#6A4C93',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <BackupIcon />
                        💾 Gestión de Respaldos
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleBackup}
                                disabled={isBackingUp}
                                sx={{
                                    background: 'linear-gradient(135deg, #6A4C93 0%, #8B5FBF 100%)',
                                    py: 2,
                                    borderRadius: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                {isBackingUp ? 'Creando Respaldo...' : 'Crear Respaldo'}
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<UploadIcon />}
                                disabled
                                sx={{
                                    borderColor: '#6A4C93',
                                    color: '#6A4C93',
                                    py: 2,
                                    borderRadius: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                Restaurar Respaldo
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<HistoryIcon />}
                                disabled
                                sx={{
                                    borderColor: '#6A4C93',
                                    color: '#6A4C93',
                                    py: 2,
                                    borderRadius: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                Historial
                            </Button>
                        </Grid>
                    </Grid>

                    {isBackingUp && (
                        <Box sx={{ mt: 3 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={backupProgress} 
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    '& .MuiLinearProgress-bar': {
                                        background: 'linear-gradient(135deg, #6A4C93 0%, #8B5FBF 100%)'
                                    }
                                }}
                            />
                            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                                Progreso: {backupProgress}%
                            </Typography>
                        </Box>
                    )}

                    {backupProgress === 100 && !isBackingUp && (
                        <Alert 
                            severity="success" 
                            sx={{ mt: 3 }}
                            onClose={() => setBackupProgress(0)}
                        >
                            ¡Respaldo creado exitosamente!
                        </Alert>
                    )}
                </Paper>

                {/* Sección de Ayuda y Soporte */}
                <Paper sx={{
                    p: 4,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="h5" sx={{ 
                        mb: 3, 
                        fontWeight: 'bold',
                        color: '#8B5FBF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <HelpIcon />
                        ❓ Ayuda y Soporte
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: '2px solid rgba(139, 95, 191, 0.1)',
                                '&:hover': {
                                    border: '2px solid rgba(139, 95, 191, 0.3)',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(139, 95, 191, 0.2)'
                                },
                                transition: 'all 0.3s ease'
                            }}>
                                <DescriptionIcon sx={{ fontSize: 48, color: '#8B5FBF', mb: 2 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Documentación
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Guías completas y manuales de usuario
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    disabled
                                    sx={{ 
                                        borderColor: '#8B5FBF',
                                        color: '#8B5FBF'
                                    }}
                                >
                                    Próximamente
                                </Button>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: '2px solid rgba(139, 95, 191, 0.1)',
                                '&:hover': {
                                    border: '2px solid rgba(139, 95, 191, 0.3)',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(139, 95, 191, 0.2)'
                                },
                                transition: 'all 0.3s ease'
                            }}>
                                <ContactSupportIcon sx={{ fontSize: 48, color: '#6A4C93', mb: 2 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Soporte Técnico
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Contacta con nuestro equipo de soporte
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    disabled
                                    sx={{ 
                                        borderColor: '#6A4C93',
                                        color: '#6A4C93'
                                    }}
                                >
                                    Próximamente
                                </Button>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: '2px solid rgba(139, 95, 191, 0.1)',
                                '&:hover': {
                                    border: '2px solid rgba(139, 95, 191, 0.3)',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(139, 95, 191, 0.2)'
                                },
                                transition: 'all 0.3s ease'
                            }}>
                                <InfoIcon sx={{ fontSize: 48, color: '#B794F6', mb: 2 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Información del Sistema
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Versión: 1.0.0<br/>
                                    Última actualización: {new Date().toLocaleDateString()}
                                </Typography>
                                <Button 
                                    variant="contained"
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #B794F6 0%, #8B5FBF 100%)'
                                    }}
                                >
                                    Ver Detalles
                                </Button>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    );
};

export default Settings;