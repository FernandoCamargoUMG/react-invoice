import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    Divider,
    ListItemIcon,
    ListItemText,
    Grid,
    Paper
} from '@mui/material';
import {
    Apps as AppsIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Receipt as ReceiptIcon,
    Person as PersonIcon,
    Dashboard as DashboardIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
    Payment as PaymentIcon,
    Backup as BackupIcon,
    Security as SecurityIcon,
    Help as HelpIcon,
    Business as BusinessIcon,
    ShoppingCart as ShoppingCartIcon,
    RequestQuote as RequestQuoteIcon,
    History as HistoryIcon
} from '@mui/icons-material';

const ModulesMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path) => {
        navigate(path);
        handleClose();
    };

    const modules = [
        {
            category: 'Principal',
            items: [
                { name: 'Dashboard', icon: <DashboardIcon />, path: '/', color: '#8B5FBF' },
                { name: 'Facturas', icon: <ReceiptIcon />, path: '/invoices', color: '#6A4C93' },
                { name: 'Clientes', icon: <PeopleIcon />, path: '/customers', color: '#B794F6' },
                { name: 'Productos', icon: <InventoryIcon />, path: '/products', color: '#8B5FBF' }
            ]
        },
        {
            category: 'Administración',
            items: [
                { name: 'Proveedores', icon: <BusinessIcon />, path: '/suppliers', color: '#8B5FBF' },
                { name: 'Compras', icon: <ShoppingCartIcon />, path: '/purchases', color: '#6A4C93' },
                { name: 'Cotizaciones', icon: <RequestQuoteIcon />, path: '/quotes', color: '#B794F6' },
                { name: 'Mov. Inventario', icon: <HistoryIcon />, path: '/inventory-movements', color: '#8B5FBF' },
                { name: 'Usuarios', icon: <PersonIcon />, path: '/users', color: '#6A4C93' },
                { name: 'Pagos', icon: <PaymentIcon />, path: '/payments', color: '#8B5FBF', disabled: true }
            ]
        },
        {
            category: 'Sistema',
            items: [
                { name: 'Configuración', icon: <SettingsIcon />, path: '/settings', color: '#6A4C93' },
                { name: 'Respaldos', icon: <BackupIcon />, path: '/backup', color: '#B794F6', disabled: true },
                { name: 'Seguridad', icon: <SecurityIcon />, path: '/security', color: '#8B5FBF', disabled: true },
                { name: 'Ayuda', icon: <HelpIcon />, path: '/help', color: '#6A4C93', disabled: true }
            ]
        }
    ];

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<AppsIcon />}
                onClick={handleClick}
                aria-controls={open ? 'modules-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{
                    borderColor: '#8B5FBF',
                    color: '#8B5FBF',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(139, 95, 191, 0.2)',
                    '&:hover': {
                        borderColor: '#6A4C93',
                        background: 'rgba(139, 95, 191, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(139, 95, 191, 0.3)'
                    }
                }}
            >
                🧩 Todos los Módulos
            </Button>
            
            <Menu
                anchorEl={anchorEl}
                id="modules-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 4px 12px rgba(139, 95, 191, 0.2))',
                        mt: 1.5,
                        minWidth: 450,
                        maxWidth: 600,
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 95, 191, 0.1)',
                        borderRadius: 3,
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 12,
                            height: 12,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                            border: '1px solid rgba(139, 95, 191, 0.1)',
                            borderBottom: 'none',
                            borderRight: 'none'
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 'bold',
                            mb: 1
                        }}
                    >
                        🧩 Módulos del Sistema
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Accede a todas las funcionalidades disponibles
                    </Typography>
                </Box>
                
                <Divider sx={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139, 95, 191, 0.3) 50%, transparent 100%)' }} />
                
                {modules.map((category, categoryIndex) => (
                    <Box key={category.category}>
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    color: '#8B5FBF', 
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {category.category}
                            </Typography>
                        </Box>
                        
                        <Grid container sx={{ px: 1, pb: 1 }}>
                            {category.items.map((item, itemIndex) => (
                                <Grid item xs={6} key={item.name}>
                                    <MenuItem 
                                        onClick={() => !item.disabled && handleNavigate(item.path)}
                                        disabled={item.disabled}
                                        sx={{
                                            mx: 0.5,
                                            my: 0.25,
                                            borderRadius: 2,
                                            minHeight: 48,
                                            transition: 'all 0.2s ease',
                                            opacity: item.disabled ? 0.5 : 1,
                                            '&:hover': {
                                                background: item.disabled ? 'transparent' : `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                                                transform: item.disabled ? 'none' : 'translateY(-1px)',
                                                boxShadow: item.disabled ? 'none' : `0 2px 8px ${item.color}30`
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ 
                                            color: item.color,
                                            minWidth: 36
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.name}
                                            sx={{
                                                '& .MuiTypography-root': {
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }
                                            }}
                                        />
                                        {item.disabled && (
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                                                Próximamente
                                            </Typography>
                                        )}
                                    </MenuItem>
                                </Grid>
                            ))}
                        </Grid>
                        
                        {categoryIndex < modules.length - 1 && (
                            <Divider sx={{ mx: 2, my: 1, opacity: 0.3 }} />
                        )}
                    </Box>
                ))}
                
                <Divider sx={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139, 95, 191, 0.3) 50%, transparent 100%)' }} />
                
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Algunos módulos están en desarrollo
                    </Typography>
                </Box>
            </Menu>
        </>
    );
};

export default ModulesMenu;