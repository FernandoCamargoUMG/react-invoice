import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Settings as SettingsIcon,
    Receipt as ReceiptIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    Payment as PaymentIcon,
    Dashboard as DashboardIcon,
    Close as CloseIcon,
    Edit as EditIcon
} from '@mui/icons-material';

const QuickActions = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const open = Boolean(anchorEl);

    // Todas las acciones disponibles
    const allActions = [
        { 
            id: 'new-invoice',
            title: 'Nueva Factura', 
            action: () => navigate('/invoices'), 
            color: 'linear-gradient(45deg, #8B5FBF 30%, #B794F6 90%)',
            icon: <ReceiptIcon />,
            description: 'Crear una nueva factura'
        },
        { 
            id: 'new-product',
            title: 'Nuevo Producto', 
            action: () => navigate('/products'), 
            color: 'linear-gradient(45deg, #6A4C93 30%, #8B5FBF 90%)',
            icon: <InventoryIcon />,
            description: 'Agregar un producto al inventario'
        },
        { 
            id: 'new-customer',
            title: 'Nuevo Cliente', 
            action: () => navigate('/customers'), 
            color: 'linear-gradient(45deg, #B794F6 30%, #8B5FBF 90%)',
            icon: <PeopleIcon />,
            description: 'Registrar un nuevo cliente'
        },
        { 
            id: 'view-users',
            title: 'Ver Usuarios', 
            action: () => navigate('/users'), 
            color: 'linear-gradient(45deg, #553C9A 30%, #6A4C93 90%)',
            icon: <PersonIcon />,
            description: 'Gestionar usuarios del sistema'
        },
        {
            id: 'dashboard',
            title: 'Dashboard',
            action: () => navigate('/'),
            color: 'linear-gradient(45deg, #8B5FBF 30%, #B794F6 90%)',
            icon: <DashboardIcon />,
            description: 'Ir al panel principal'
        },
        {
            id: 'reports',
            title: 'Reportes',
            action: () => navigate('/reports'),
            color: 'linear-gradient(45deg, #6A4C93 30%, #B794F6 90%)',
            icon: <AssessmentIcon />,
            description: 'Ver reportes y estadísticas',
            disabled: true
        },
        {
            id: 'payments',
            title: 'Pagos',
            action: () => navigate('/payments'),
            color: 'linear-gradient(45deg, #B794F6 30%, #8B5FBF 90%)',
            icon: <PaymentIcon />,
            description: 'Gestionar pagos',
            disabled: true
        }
    ];

    // Acciones rápidas guardadas (por defecto las primeras 4)
    const [quickActions, setQuickActions] = useState(() => {
        const saved = localStorage.getItem('quickActions');
        return saved ? JSON.parse(saved) : ['new-invoice', 'new-product', 'new-customer', 'view-users'];
    });

    // Guardar cambios en localStorage
    useEffect(() => {
        localStorage.setItem('quickActions', JSON.stringify(quickActions));
    }, [quickActions]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleAction = (actionId) => {
        if (quickActions.includes(actionId)) {
            // Remover acción
            setQuickActions(quickActions.filter(id => id !== actionId));
        } else {
            // Agregar acción (máximo 6)
            if (quickActions.length < 6) {
                setQuickActions([...quickActions, actionId]);
            }
        }
    };

    const removeAction = (actionId) => {
        setQuickActions(quickActions.filter(id => id !== actionId));
    };

    const getActionById = (id) => allActions.find(action => action.id === id);

    return (
        <Paper sx={{
            p: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
            {/* Header con configuración */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    🚀 Acciones Rápidas
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Personalizar acciones rápidas">
                        <IconButton
                            onClick={() => setIsEditMode(!isEditMode)}
                            sx={{
                                color: '#8B5FBF',
                                backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(139, 95, 191, 0.2)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            {isEditMode ? <CloseIcon /> : <EditIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Agregar nueva acción">
                        <IconButton
                            onClick={handleClick}
                            sx={{
                                color: '#8B5FBF',
                                backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(139, 95, 191, 0.2)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Acciones rápidas */}
            <Grid container spacing={3}>
                {quickActions.map((actionId) => {
                    const action = getActionById(actionId);
                    if (!action) return null;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={action.id}>
                            <Box sx={{ position: 'relative' }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={action.action}
                                    disabled={action.disabled}
                                    startIcon={action.icon}
                                    sx={{
                                        background: action.color,
                                        color: 'white',
                                        py: 2.5,
                                        px: 3,
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        minHeight: 80,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
                                        },
                                        '&:disabled': {
                                            opacity: 0.6
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {action.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                        {action.description}
                                    </Typography>
                                    {action.disabled && (
                                        <Chip 
                                            label="Próximamente" 
                                            size="small" 
                                            sx={{ 
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontSize: '0.7rem'
                                            }} 
                                        />
                                    )}
                                </Button>

                                {/* Botón de eliminar en modo edición */}
                                {isEditMode && (
                                    <IconButton
                                        onClick={() => removeAction(actionId)}
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            backgroundColor: '#c44569',
                                            color: 'white',
                                            width: 24,
                                            height: 24,
                                            '&:hover': {
                                                backgroundColor: '#a0345a',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                )}
                            </Box>
                        </Grid>
                    );
                })}

                {/* Botón para agregar si hay menos de 6 acciones */}
                {quickActions.length < 6 && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleClick}
                            sx={{
                                borderColor: 'rgba(139, 95, 191, 0.3)',
                                color: '#8B5FBF',
                                background: 'rgba(139, 95, 191, 0.05)',
                                py: 2.5,
                                px: 3,
                                fontSize: '1rem',
                                fontWeight: '600',
                                borderRadius: 3,
                                textTransform: 'none',
                                minHeight: 80,
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                '&:hover': {
                                    borderColor: 'rgba(139, 95, 191, 0.5)',
                                    background: 'rgba(139, 95, 191, 0.1)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <AddIcon sx={{ fontSize: 28 }} />
                                <Typography>Agregar Acción</Typography>
                            </Box>
                        </Button>
                    </Grid>
                )}
            </Grid>

            {/* Información en modo edición */}
            {isEditMode && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(139, 95, 191, 0.05)', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        💡 <strong>Modo de edición activo:</strong> Haz clic en ✕ para eliminar acciones o en + para agregar nuevas
                    </Typography>
                </Box>
            )}

            {/* Menú para agregar acciones */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        maxWidth: 300,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 95, 191, 0.1)',
                        borderRadius: 2
                    }
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(139, 95, 191, 0.1)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#8B5FBF' }}>
                        Agregar Acción Rápida
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Máximo 6 acciones ({quickActions.length}/6)
                    </Typography>
                </Box>

                {allActions.map((action) => {
                    const isSelected = quickActions.includes(action.id);
                    const isMaxReached = quickActions.length >= 6 && !isSelected;

                    return (
                        <MenuItem
                            key={action.id}
                            onClick={() => toggleAction(action.id)}
                            disabled={isMaxReached}
                            sx={{
                                opacity: isSelected ? 0.5 : 1,
                                backgroundColor: isSelected ? 'rgba(139, 95, 191, 0.1)' : 'transparent'
                            }}
                        >
                            <ListItemIcon sx={{ color: action.disabled ? 'text.disabled' : '#8B5FBF' }}>
                                {action.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={action.title}
                                secondary={isSelected ? 'Ya agregada' : action.description}
                            />
                            {action.disabled && (
                                <Chip label="Próximo" size="small" sx={{ ml: 1 }} />
                            )}
                        </MenuItem>
                    );
                })}
            </Menu>
        </Paper>
    );
};

export default QuickActions;