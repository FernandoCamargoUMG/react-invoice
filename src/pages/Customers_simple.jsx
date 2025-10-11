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

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Logout function
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
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.CUSTOMERS);
            if (response.ok) {
                const data = await response.json();
                setCustomers(Array.isArray(data) ? data : []);
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

    // Load customers on component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

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

    const stats = {
        total: customers.length,
        withPhone: customers.filter(c => c.phone).length,
        withAddress: customers.filter(c => c.address).length
    };

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
                {/* Navigation Bar Simple */}
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Typography variant="h5" sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            👥 Gestión de Clientes
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                onClick={() => window.history.back()}
                                startIcon={<ArrowBackIcon />}
                                sx={{
                                    color: '#667eea',
                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                    '&:hover': { borderColor: '#667eea' }
                                }}
                            >
                                Atrás
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => window.location.href = '/'}
                                startIcon={<HomeIcon />}
                                sx={{
                                    background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                                    '&:hover': { background: 'linear-gradient(135deg, #26d0ce 0%, #38a085 100%)' }
                                }}
                            >
                                Inicio
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    color: '#ff6b6b',
                                    borderColor: 'rgba(255, 107, 107, 0.3)',
                                    '&:hover': { borderColor: '#ff6b6b' }
                                }}
                            >
                                Cerrar sesión
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* Alerts */}
                {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 3 }}>
                        {error}
                    </Alert>
                )}

                {successMsg && (
                    <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 3, borderRadius: 3 }}>
                        {successMsg}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ background: 'linear-gradient(45deg, #2196F3, #21CBF3)' }}>
                                    <PeopleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Clientes
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ background: 'linear-gradient(45deg, #4CAF50, #45A049)' }}>
                                    <PhoneIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                        {stats.withPhone}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Con Teléfono
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ background: 'linear-gradient(45deg, #FF9800, #F57C00)' }}>
                                    <LocationIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                        {stats.withAddress}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Con Dirección
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    p: 3,
                    mb: 3
                }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={fetchCustomers}
                            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RefreshIcon />}
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                px: 3,
                                py: 1.2,
                                fontSize: '1rem',
                                fontWeight: '600',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)'
                                }
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
                                px: 3,
                                py: 1.2,
                                fontSize: '1rem',
                                fontWeight: '600',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #45A049, #388E3C)'
                                }
                            }}
                        >
                            Nuevo Cliente
                        </Button>
                    </Box>
                </Paper>

                {/* Customers Table */}
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dirección</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {customers.length > 0 ? (
                                    customers.map((customer) => (
                                        <TableRow key={customer.id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }}>
                                            <TableCell sx={{ fontWeight: '600' }}>{customer.name}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>
                                                {customer.phone ? (
                                                    <Chip label={customer.phone} size="small" color="primary" />
                                                ) : (
                                                    <Chip label="Sin teléfono" size="small" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {customer.address ? (
                                                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {customer.address}
                                                    </Typography>
                                                ) : (
                                                    <Chip label="Sin dirección" size="small" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <IconButton
                                                    onClick={() => handleOpenDialog(customer)}
                                                    sx={{ color: '#2196F3', mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(customer.id)}
                                                    sx={{ color: '#f44336' }}
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
                                                {loading ? 'Cargando clientes...' : 'No hay clientes registrados. Haz clic en "Cargar Clientes" para obtener los datos.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Customer Dialog */}
            <Dialog 
                open={open} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editMode ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
                
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre Completo"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dirección"
                                    multiline
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editMode ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Customers;