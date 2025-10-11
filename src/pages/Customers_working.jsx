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
                const data = await response.json();
                setCustomers(Array.isArray(data) ? data : []);
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
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ p: 3 }}>
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
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ p: 3 }}>
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
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ p: 3 }}>
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
                        </Card>
                    </Grid>
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

                {/* Tabla */}
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                                {paginatedCustomers.length > 0 ? (
                                    paginatedCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>{customer.name}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>
                                                {customer.phone ? (
                                                    <Chip label={customer.phone} size="small" color="primary" />
                                                ) : (
                                                    <Chip label="Sin teléfono" size="small" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {customer.address || 'Sin dirección'}
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

            {/* Modal Simple */}
            <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Teléfono (opcional)"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Dirección (opcional)"
                            multiline
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
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