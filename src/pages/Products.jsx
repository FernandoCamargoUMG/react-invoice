import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    Typography,
    Button,
    Paper,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    TablePagination,
    CircularProgress
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete, API_CONFIG } from '../config/api';

// Categorías de productos
const categories = [
    'Electrónicos',
    'Ropa',
    'Hogar',
    'Deportes',
    'Libros',
    'Alimentación',
    'Salud',
    'Automóvil',
    'Otros'
];

// Formatear moneda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(amount);
};

const Products = () => {
    const [products, setProducts] = useState([]);
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
        description: '',
        price: '',
        category: '',
        stock: ''
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

    // Fetch products
    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.PRODUCTS);
            if (response.ok) {
                const result = await response.json();
                // El servidor devuelve datos paginados con estructura: { data: [...], current_page: 1, etc }
                const products = result.data || result || [];
                setProducts(Array.isArray(products) ? products : []);
                setSuccessMsg('Productos cargados exitosamente');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setError('Error al cargar productos');
                setProducts([]);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Error de conexión: ' + err.message);
            setProducts([]);
        }
        setLoading(false);
    };



    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.price) {
            setError('Nombre y precio son requeridos.');
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            setError('El precio debe ser un número válido y mayor que 0.');
            return;
        }

        const stock = formData.stock ? parseInt(formData.stock) : 0;
        if (isNaN(stock) || stock < 0) {
            setError('El stock debe ser un número válido mayor o igual a 0.');
            return;
        }

        setError('');
        try {
            const payload = {
                name: formData.name,
                description: formData.description || null,
                price: price,
                category: formData.category || 'Otros',
                stock: stock
            };

            let response;
            if (editMode && editId) {
                response = await apiPut(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${editId}`, payload);
            } else {
                response = await apiPost(API_CONFIG.ENDPOINTS.PRODUCTS, payload);
            }

            if (response.ok) {
                fetchProducts();
                handleCloseDialog();
                setSuccessMsg(editMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
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
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                const response = await apiDelete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
                if (response.ok) {
                    fetchProducts();
                    setSuccessMsg('Producto eliminado exitosamente');
                    setTimeout(() => setSuccessMsg(''), 3000);
                } else {
                    setError('Error al eliminar producto');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            }
        }
    };

    // Dialog handlers
    const handleOpenDialog = (product = null) => {
        if (product) {
            setEditMode(true);
            setEditId(product.id);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price ? product.price.toString() : '',
                category: product.category || 'Otros',
                stock: product.stock ? product.stock.toString() : '0'
            });
        } else {
            setEditMode(false);
            setEditId(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Otros',
                stock: '0'
            });
        }
        setOpen(true);
        setError('');
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setEditMode(false);
        setEditId(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Otros',
            stock: '0'
        });
        setError('');
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const stats = {
        total: products.length,
        totalValue: products.reduce((sum, product) => sum + (parseFloat(product.price) * parseInt(product.stock)), 0),
        outOfStock: products.filter(p => parseInt(p.stock) === 0).length,
        lowStock: products.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) < 10).length
    };

    const paginatedProducts = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                    📦 Gestión de Productos
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
                    <Grid item xs={12} sm={3}>
                        <Card sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <InventoryIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Productos
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Card sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <MoneyIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                        {formatCurrency(stats.totalValue)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Valor Total Inventario
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Card sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                    {stats.outOfStock}
                                </Typography>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Sin Stock
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Card sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                    {stats.lowStock}
                                </Typography>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Stock Bajo
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
                        onClick={fetchProducts}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RefreshIcon />}
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)' }
                        }}
                    >
                        {loading ? 'Cargando...' : 'Cargar Productos'}
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
                        Nuevo Producto
                    </Button>
                </Box>

                {/* Tabla */}
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Categoría</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.description || 'Sin descripción'}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                                {formatCurrency(parseFloat(product.price) || 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={product.category || product.type || 'Producto'} size="small" color="primary" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={product.stock} 
                                                    size="small" 
                                                    color={parseInt(product.stock) === 0 ? 'error' : parseInt(product.stock) < 10 ? 'warning' : 'success'}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <IconButton
                                                    onClick={() => handleOpenDialog(product)}
                                                    sx={{ color: '#2196F3', mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(product.id)}
                                                    sx={{ color: '#f44336' }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {loading ? 'Cargando productos...' : 'No hay productos registrados'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={products.length}
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
                    {editMode ? 'Editar Producto' : 'Nuevo Producto'}
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
                            label="Nombre del Producto"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Descripción (opcional)"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            sx={{ mb: 2 }}
                        />
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Precio"
                                    type="number"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Stock"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    value={formData.stock}
                                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                />
                            </Grid>
                        </Grid>
                        <FormControl fullWidth>
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                value={formData.category}
                                label="Categoría"
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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

export default Products;