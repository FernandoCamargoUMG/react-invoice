import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Button,
    Paper
} from '@mui/material';
import {
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Receipt as ReceiptIcon,
    AttachMoney as MoneyIcon,
    Add as AddIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';

const Dashboard = () => {
    const navigate = useNavigate();

    // Formato de moneda simple
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(amount || 0);
    };

    // Datos de ejemplo
    const metrics = {
        totalClientes: 3,
        totalProductos: 5,
        totalFacturas: 1,
        ventasHoy: 0
    };

    const quickActions = [
        { 
            title: 'Nueva Factura', 
            action: () => navigate('/invoices'), 
            color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
        },
        { 
            title: 'Nuevo Producto', 
            action: () => navigate('/products'), 
            color: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)'
        },
        { 
            title: 'Nuevo Cliente', 
            action: () => navigate('/customers'), 
            color: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)'
        },
        { 
            title: 'Ver Usuarios', 
            action: () => navigate('/users'), 
            color: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)'
        }
    ];

    return (
        <Box sx={{ 
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0
        }}>
            {/* Contenido Principal */}
            <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                p: { xs: 2, md: 4 }
            }}>
                {/* Barra de Navegación Integrada */}
                <NavigationBar
                    title="📊 ERP Dashboard - Sistema de Gestión Integral"
                    showBackButton={false}
                    showHomeButton={false}
                    showLogoutButton={true}
                />

                {/* Main Content */}
                <Box sx={{ 
                    mt: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                }}>
                    {/* Stats Cards */}
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                p: 3,
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                height: 120,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar sx={{ 
                                        background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                        width: 60,
                                        height: 60
                                    }}>
                                        <PeopleIcon fontSize="large" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent'
                                        }}>
                                            {metrics.totalClientes}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary">
                                            Clientes
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                p: 3,
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                height: 120,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar sx={{ 
                                        background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                                        width: 60,
                                        height: 60
                                    }}>
                                        <InventoryIcon fontSize="large" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent'
                                        }}>
                                            {metrics.totalProductos}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary">
                                            Productos
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                p: 3,
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                height: 120,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar sx={{ 
                                        background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                                        width: 60,
                                        height: 60
                                    }}>
                                        <ReceiptIcon fontSize="large" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent'
                                        }}>
                                            {metrics.totalFacturas}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary">
                                            Facturas
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                p: 3,
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                height: 120,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar sx={{ 
                                        background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
                                        width: 60,
                                        height: 60
                                    }}>
                                        <MoneyIcon fontSize="large" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent'
                                        }}>
                                            {formatCurrency(metrics.ventasHoy)}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary">
                                            Ventas Hoy
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Quick Actions */}
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
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}>
                            🚀 Acciones Rápidas
                        </Typography>
                        
                        <Grid container spacing={3}>
                            {quickActions.map((action, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={action.action}
                                        sx={{
                                            background: action.color,
                                            color: 'white',
                                            py: 2,
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <AddIcon sx={{ mr: 1 }} />
                                        {action.title}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Recent Activity */}
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
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}>
                            📈 Actividad Reciente
                        </Typography>
                        
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No hay actividad reciente para mostrar
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;