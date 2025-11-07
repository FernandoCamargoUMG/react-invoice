import React, { useState, useEffect } from 'react';
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
    Add as AddIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import GlobalSettings from '../components/GlobalSettings';
import ModulesMenu from '../components/ModulesMenu';
import QuickActions from '../components/QuickActions';
import NavigationBar from '../components/NavigationBar';
import { apiGet, API_CONFIG } from '../config/api';

const Dashboard = () => {
    const navigate = useNavigate();

    // Formato de moneda simple
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(amount || 0);
    };

    // Datos dinámicos
    const [metrics, setMetrics] = useState({
        totalClientes: 3,
        totalProductos: 5,
        totalFacturas: 1,
        ventasHoy: 2500.75
    });

    // Usuario logueado
    const [currentUser, setCurrentUser] = useState({
        name: 'Cargando...',
        email: '',
        role: ''
    });

    // Cargar datos del usuario logueado
    const loadUserData = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const response = await apiGet(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`);
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser({
                        name: userData.data?.name || 'Usuario',
                        email: userData.data?.email || '',
                        role: userData.data?.role || 'user'
                    });
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setCurrentUser({
                name: 'Usuario',
                email: '',
                role: 'user'
            });
        }
    };

    // Cargar datos reales
    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const [customersRes, productsRes, invoicesRes] = await Promise.all([
                    apiGet(API_CONFIG.ENDPOINTS.CUSTOMERS),
                    apiGet(API_CONFIG.ENDPOINTS.PRODUCTS),
                    apiGet(API_CONFIG.ENDPOINTS.INVOICES)
                ]);

                const customersData = await customersRes.json();
                const productsData = await productsRes.json();
                const invoicesData = await invoicesRes.json();

                const customers = customersData.data || [];
                const products = productsData.data || [];
                const invoices = invoicesData.data || [];

                // Calcular ventas del día actual
                const today = new Date();
                const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                const ventasHoy = invoices
                    .filter(invoice => {
                        const isPaid = invoice.status === 'paid';
                        const invoiceDateISO = invoice.invoice_date ? invoice.invoice_date.split('T')[0] : null;
                        const isToday = invoiceDateISO === todayISO;
                        return isPaid && isToday;
                    })
                    .reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);

                setMetrics({
                    totalClientes: customers.length,
                    totalProductos: products.length,
                    totalFacturas: invoices.length,
                    ventasHoy: ventasHoy
                });
            } catch (error) {
                console.error('Error loading metrics:', error);
            }
        };

        loadMetrics();
        loadUserData(); // Cargar datos del usuario
    }, []);

    // Refrescar datos cuando se enfoca la ventana
    useEffect(() => {
        const handleFocus = () => {
            const loadMetrics = async () => {
                try {
                    const [customersRes, productsRes, invoicesRes] = await Promise.all([
                        apiGet(API_CONFIG.ENDPOINTS.CUSTOMERS),
                        apiGet(API_CONFIG.ENDPOINTS.PRODUCTS),
                        apiGet(API_CONFIG.ENDPOINTS.INVOICES)
                    ]);

                    const customersData = await customersRes.json();
                    const productsData = await productsRes.json();
                    const invoicesData = await invoicesRes.json();

                    const customers = customersData.data || [];
                    const products = productsData.data || [];
                    const invoices = invoicesData.data || [];

                    // Comparar fechas directamente sin conversión de zona horaria
                    const today = new Date();
                    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    
                    const ventasHoy = invoices
                        .filter(invoice => {
                            const isPaid = invoice.status === 'paid';
                            // Extraer solo la fecha de la cadena ISO sin conversión
                            const invoiceDateISO = invoice.invoice_date ? invoice.invoice_date.split('T')[0] : null;
                            const isToday = invoiceDateISO === todayISO;
                            return isPaid && isToday;
                        })
                        .reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);

                    setMetrics({
                        totalClientes: customers.length,
                        totalProductos: products.length,
                        totalFacturas: invoices.length,
                        ventasHoy: ventasHoy
                    });
                } catch (error) {
                    console.error('Error loading metrics:', error);
                }
            };
            loadMetrics();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Definición de quickActions movida al componente QuickActions

    return (
        <Box sx={{ 
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 25%, #6A4C93 70%, #8B5FBF 100%)',
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
                p: 0
            }}>
                {/* Header Empresarial */}
                <Paper sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 0,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3,
                    mb: 0
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        {/* Logo y Título */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar sx={{ 
                                width: 60, 
                                height: 60,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1.8rem',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            }}>
                                🏢
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    mb: 0.5,
                                    fontSize: { xs: '1.8rem', md: '2.2rem' }
                                }}>
                                    Sistema ERP - Importadora Norte
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ 
                                    fontSize: '1.1rem',
                                    fontWeight: '500'
                                }}>
                                    Dashboard
                                </Typography>
                            </Box>
                        </Box>

                        {/* Información del Usuario */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.9) 100%)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 6,
                                p: 3,
                                border: '2px solid rgba(139, 95, 191, 0.15)',
                                boxShadow: '0 10px 40px rgba(139, 95, 191, 0.15)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 15px 50px rgba(139, 95, 191, 0.2)',
                                    border: '2px solid rgba(139, 95, 191, 0.25)'
                                }
                            }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar sx={{ 
                                        width: 60, 
                                        height: 60,
                                        background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        boxShadow: '0 8px 25px rgba(139, 95, 191, 0.4)',
                                        border: '3px solid rgba(255, 255, 255, 0.9)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: -2,
                                        right: -2,
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #B794F6 0%, #8B5FBF 100%)',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px rgba(183, 148, 246, 0.5)'
                                    }} />
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ 
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(135deg, #8B5FBF 0%, #B794F6 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                        fontSize: '1.3rem',
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>👋</span>
                                        Bienvenido, {currentUser.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body1" sx={{
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: '#8B5FBF',
                                            textTransform: 'capitalize',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <span style={{ fontSize: '1.2rem' }}>👑</span>
                                            Rol: {currentUser.role}
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            background: 'linear-gradient(135deg, #B794F6 0%, #8B5FBF 100%)',
                                            color: 'white',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 20,
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 10px rgba(183, 148, 246, 0.4)'
                                        }}>
                                            <span style={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                backgroundColor: '#E9D5FF',
                                                display: 'inline-block',
                                                animation: 'pulse 2s infinite'
                                            }} />
                                            Sesión Activa
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            
                            {/* Botones de Módulos, Configuración y Logout */}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <ModulesMenu />
                                <GlobalSettings />
                                
                                <Button
                                    variant="contained"
                                    startIcon={<LogoutIcon sx={{ fontSize: '1.3rem' }} />}
                                    onClick={() => {
                                        // Limpiar datos específicos de sesión
                                        localStorage.removeItem('access_token');
                                        localStorage.removeItem('refresh_token');
                                        localStorage.removeItem('user_id');
                                        
                                        // Limpiar sessionStorage
                                        sessionStorage.clear();
                                        
                                        // Forzar recarga completa de la página en el base path correcto
                                        window.location.href = `${import.meta.env.BASE_URL || '/'}login`;
                                    }}
                                    sx={{
                                        background: 'linear-gradient(135deg, #c44569 0%, #b83d52 100%)',
                                        borderRadius: 4,
                                        px: 4,
                                        py: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        minWidth: 140,
                                        boxShadow: '0 8px 25px rgba(196, 69, 105, 0.4)',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #a0345a 0%, #8b2f47 100%)',
                                            transform: 'translateY(-3px) scale(1.02)',
                                            boxShadow: '0 12px 35px rgba(160, 52, 90, 0.5)',
                                            border: '2px solid rgba(255, 255, 255, 0.3)'
                                        },
                                        '&:active': {
                                            transform: 'translateY(-1px) scale(0.98)'
                                        }
                                    }}
                                >
                                    🚪 Cerrar Sesión
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Main Content */}
                <Box sx={{ 
                    p: { xs: 2, md: 4 },
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
                                        background: 'linear-gradient(45deg, #2E8B57, #228B22)',
                                        width: 60,
                                        height: 60,
                                        boxShadow: '0 4px 15px rgba(46, 139, 87, 0.3)'
                                    }}>
                                        <ReceiptIcon fontSize="large" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #2E8B57, #228B22)',
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
                                        background: 'linear-gradient(45deg, #2E8B57, #228B22)',
                                        width: 60,
                                        height: 60,
                                        boxShadow: '0 4px 15px rgba(46, 139, 87, 0.3)'
                                    }}>
                                        <MoneyIcon fontSize="large" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #2E8B57, #228B22)',
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

                    {/* Quick Actions Personalizables */}
                    <QuickActions />

                    {/* Actividad Reciente - Comentado temporalmente
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
                            background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
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
                    */}
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;