import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Button,
    Paper,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Fab,
    Divider,
    TablePagination,
    CircularProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete, API_CONFIG } from '../config/api';
import GlobalSettings from '../components/GlobalSettings';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Navegación simple
    const handleBack = () => window.history.back();
    const handleHome = () => window.location.href = '/';
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        sessionStorage.removeItem('user');
        window.location.href = '/';
    };

    // Fetch customers
    const fetchCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.CUSTOMERS);
            if (response.ok) {
                const result = await response.json();
                // El servidor devuelve datos paginados con estructura: { data: [...], current_page: 1, etc }
                const customers = result.data || result || [];
                setCustomers(Array.isArray(customers) ? customers : []);
                setSuccessMsg('Clientes cargados exitosamente');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setError('Error al cargar clientes');
                setCustomers([]);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Error de conexión: ' + err.message);
            setCustomers([]);
        }
        setLoading(false);
    };



    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email) {
            setError('Nombre y email son requeridos.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor ingresa un email válido.');
            return;
        }

        setError('');
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                address: formData.address || null
            };

            let response;
            if (editMode && editId) {
                response = await apiPut(`${API_CONFIG.ENDPOINTS.CUSTOMERS}/${editId}`, payload);
            } else {
                response = await apiPost(API_CONFIG.ENDPOINTS.CUSTOMERS, payload);
            }

            if (response.ok) {
                fetchCustomers();
                handleCloseDialog();
                setSuccessMsg(editMode ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al procesar la solicitud');
            }
        } catch (err) {
            setError('Error de conexión: ' + err.message);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                const response = await apiDelete(`${API_CONFIG.ENDPOINTS.CUSTOMERS}/${id}`);
                if (response.ok) {
                    fetchCustomers();
                    setSuccessMsg('Cliente eliminado exitosamente');
                    setTimeout(() => setSuccessMsg(''), 3000);
                } else {
                    setError('Error al eliminar cliente');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            }
        }
    };

    // Dialog handlers
    const handleOpenDialog = (customer = null) => {
        if (customer) {
            setEditMode(true);
            setEditId(customer.id);
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
        } else {
            setEditMode(false);
            setEditId(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
        setOpen(true);
        setError('');
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setEditMode(false);
        setEditId(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
        setError('');
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const stats = {
        total: customers.length,
        withPhone: customers.filter(c => c.phone).length,
        withAddress: customers.filter(c => c.address).length
    };

    const paginatedCustomers = customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            {/* Barra de Navegación Simple */}
            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 0,
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
                <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    👥 Gestión de Clientes
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<ArrowBackIcon />}
                        sx={{ 
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': { 
                                borderColor: '#5a6fd8', 
                                background: 'rgba(102, 126, 234, 0.1)' 
                            }
                        }}
                    >
                        Atrás
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleHome}
                        startIcon={<HomeIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                            '&:hover': { 
                                background: 'linear-gradient(45deg, #26d0ce, #38a085)' 
                            }
                        }}
                    >
                        Inicio
                    </Button>
                    <GlobalSettings />
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{
                            borderColor: '#ff6b6b',
                            color: '#ff6b6b',
                            '&:hover': { 
                                borderColor: '#ee5a24', 
                                background: 'rgba(255, 107, 107, 0.1)' 
                            }
                        }}
                    >
                        Cerrar sesión
                    </Button>
                </Box>
            </Paper>

            {/* Contenido Principal */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {/* Alerts */}
                {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {successMsg && (
                    <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 3 }}>
                        {successMsg}
                    </Alert>
                )}

                {/* Stats */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {[
                        { 
                            title: 'Total Clientes', 
                            value: stats.total, 
                            icon: <PeopleIcon />, 
                            gradient: 'linear-gradient(135deg, #2196F3, #1976D2)',
                            emoji: '👥'
                        },
                        { 
                            title: 'Con Teléfono', 
                            value: stats.withPhone, 
                            icon: <PhoneIcon />, 
                            gradient: 'linear-gradient(135deg, #4CAF50, #45A049)',
                            emoji: '📱'
                        },
                        { 
                            title: 'Con Dirección', 
                            value: stats.withAddress, 
                            icon: <LocationIcon />, 
                            gradient: 'linear-gradient(135deg, #FF9800, #F57C00)',
                            emoji: '📍'
                        }
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card sx={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 4,
                                textAlign: 'center',
                                p: 3,
                                height: 140,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-8px) scale(1.02)',
                                    boxShadow: '0 20px 40px rgba(31, 38, 135, 0.4)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: stat.gradient,
                                    borderRadius: '16px 16px 0 0'
                                }
                            }}>
                                <Box sx={{ 
                                    fontSize: '2rem', 
                                    mb: 1,
                                    background: stat.gradient,
                                    borderRadius: '50%',
                                    width: 60,
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                }}>
                                    {stat.emoji}
                                </Box>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 'bold', 
                                    background: stat.gradient,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    mb: 0.5,
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    fontWeight: 'medium'
                                }}>
                                    {stat.title}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Botones de Acción */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={fetchCustomers}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RefreshIcon />}
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)' }
                        }}
                    >
                        {loading ? 'Cargando...' : 'Cargar Clientes'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleOpenDialog()}
                        startIcon={<AddIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                            '&:hover': { background: 'linear-gradient(45deg, #45A049, #388E3C)' }
                        }}
                    >
                        Nuevo Cliente
                    </Button>
                </Box>

                {/* Tabla Bonita */}
                <Paper sx={{ 
                    width: '100%', 
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)'
                }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>👤 Nombre</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>📧 Email</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>📱 Teléfono</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>📍 Dirección</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>⚙️ Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedCustomers.length > 0 ? (
                                    paginatedCustomers.map((customer) => (
                                        <TableRow key={customer.id} sx={{ 
                                            '&:hover': { 
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                transform: 'scale(1.01)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <TableCell sx={{ 
                                                fontWeight: '600',
                                                color: '#2d3748',
                                                py: 2
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ 
                                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                        width: 35,
                                                        height: 35,
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    {customer.name}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <EmailIcon sx={{ color: '#667eea', fontSize: 16 }} />
                                                    {customer.email}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                {customer.phone ? (
                                                    <Chip 
                                                        label={customer.phone} 
                                                        size="small" 
                                                        sx={{
                                                            background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                        icon={<PhoneIcon sx={{ color: 'white !important' }} />}
                                                    />
                                                ) : (
                                                    <Chip 
                                                        label="Sin teléfono" 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ color: '#9e9e9e' }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 2, maxWidth: 200 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationIcon sx={{ color: '#FF9800', fontSize: 16 }} />
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {customer.address || 'Sin dirección'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', py: 2 }}>
                                                <IconButton
                                                    onClick={() => handleOpenDialog(customer)}
                                                    sx={{ 
                                                        background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                                                        color: 'white',
                                                        mr: 1,
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(customer.id)}
                                                    sx={{ 
                                                        background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #d32f2f, #c62828)',
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {loading ? 'Cargando clientes...' : 'No hay clientes registrados'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={customers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </Box>

            {/* Modal Bonito */}
            <Dialog 
                open={open} 
                onClose={handleCloseDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        overflow: 'visible'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    py: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                            👤
                        </Box>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {editMode ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    p: 4
                }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                borderRadius: 3,
                                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.2)'
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        {/* Información Personal */}
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                            borderRadius: 4,
                            p: 4,
                            mb: 3,
                            border: '2px solid #e3f2fd',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #667eea',
                                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 3,
                                pb: 2,
                                borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                                }}>
                                    👤
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#667eea', 
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    Información Personal
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ 
                                                mb: 1, 
                                                fontWeight: '700',
                                                color: '#667eea',
                                                fontSize: '0.95rem'
                                            }}>
                                                Nombre completo *
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="Ej: Juan Carlos Pérez"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: 'white',
                                                        borderRadius: 3,
                                                        fontSize: '1.1rem',
                                                        border: '2px solid #e3f2fd',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            border: '2px solid #bbdefb',
                                                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
                                                        },
                                                        '&.Mui-focused': {
                                                            border: '2px solid #667eea',
                                                            boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.15)',
                                                            backgroundColor: '#fafbff'
                                                        },
                                                        '& fieldset': {
                                                            border: 'none'
                                                        }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '18px 16px',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '500'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ 
                                                mb: 1, 
                                                fontWeight: '700',
                                                color: '#667eea',
                                                fontSize: '0.95rem'
                                            }}>
                                                📧 Correo electrónico *
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                type="email"
                                                placeholder="ejemplo@correo.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                required
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: 'white',
                                                        borderRadius: 3,
                                                        fontSize: '1.1rem',
                                                        border: '2px solid #e3f2fd',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            border: '2px solid #bbdefb',
                                                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
                                                        },
                                                        '&.Mui-focused': {
                                                            border: '2px solid #667eea',
                                                            boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.15)',
                                                            backgroundColor: '#fafbff'
                                                        },
                                                        '& fieldset': {
                                                            border: 'none'
                                                        }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '18px 16px',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '500'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>

                        {/* Información de Contacto */}
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f0fff4 100%)',
                            borderRadius: 4,
                            p: 4,
                            border: '2px solid #e8f5e8',
                            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.12)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #4CAF50',
                                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)',
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 3,
                                pb: 2,
                                borderBottom: '2px solid rgba(76, 175, 80, 0.1)'
                            }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                                }}>
                                    📞
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#4CAF50', 
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    Información de Contacto (Opcional)
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Box>
                                            <Typography variant="body2" sx={{ 
                                                mb: 1, 
                                                fontWeight: '700',
                                                color: '#4CAF50',
                                                fontSize: '0.95rem'
                                            }}>
                                                📱 Número de teléfono
                                            </Typography>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                                                border: '2px solid #c8e6c9',
                                                borderRadius: 3,
                                                p: 2,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    border: '2px solid #81c784',
                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                                                }
                                            }}>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Ej: +57 300 123 4567"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'white',
                                                            borderRadius: 3,
                                                            border: '2px solid #f1f8e9',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                border: '2px solid #dcedc8',
                                                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
                                                            },
                                                            '&.Mui-focused': {
                                                                border: '2px solid #4CAF50',
                                                                boxShadow: '0 0 0 4px rgba(76, 175, 80, 0.15)',
                                                                backgroundColor: '#f9fdf9'
                                                            },
                                                            '& fieldset': {
                                                                border: 'none'
                                                            }
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            padding: '18px 16px',
                                                            fontSize: '1.1rem',
                                                            fontWeight: '500'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Box>
                                            <Typography variant="body2" sx={{ 
                                                mb: 1, 
                                                fontWeight: '700',
                                                color: '#4CAF50',
                                                fontSize: '0.95rem'
                                            }}>
                                                📍 Dirección completa
                                            </Typography>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                                                border: '2px solid #c8e6c9',
                                                borderRadius: 3,
                                                p: 2,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    border: '2px solid #81c784',
                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                                                }
                                            }}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    placeholder="Ej: Calle 45 #12-34, Apartamento 501, Bogotá, Colombia - Código postal 110111"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'white',
                                                            borderRadius: 3,
                                                            border: '2px solid #f1f8e9',
                                                            transition: 'all 0.2s ease',
                                                            minHeight: '120px',
                                                            '&:hover': {
                                                                border: '2px solid #dcedc8',
                                                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
                                                            },
                                                            '&.Mui-focused': {
                                                                border: '2px solid #4CAF50',
                                                                boxShadow: '0 0 0 4px rgba(76, 175, 80, 0.15)',
                                                                backgroundColor: '#f9fdf9'
                                                            },
                                                            '& fieldset': {
                                                                border: 'none'
                                                            }
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            fontSize: '1.1rem',
                                                            fontWeight: '400',
                                                            lineHeight: 1.6,
                                                            padding: '18px 16px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                    p: 3,
                    gap: 2,
                    borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <Button 
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            '&:hover': {
                                borderColor: '#5a6fd8',
                                background: 'rgba(102, 126, 234, 0.1)'
                            }
                        }}
                    >
                        ❌ Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                            }
                        }}
                    >
                        ✨ {editMode ? 'Actualizar Cliente' : 'Crear Cliente'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Customers;