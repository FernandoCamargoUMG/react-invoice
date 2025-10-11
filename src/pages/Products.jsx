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
import { useCurrency } from '../utils/currency';
import GlobalSettings from '../components/GlobalSettings';

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

const Products = () => {
    const { formatAmount } = useCurrency();
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
            background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 25%, #6A4C93 70%, #8B5FBF 100%)',
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
                    background: 'linear-gradient(45deg, #8B5FBF, #B794F6)',
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
                            borderColor: '#8B5FBF',
                            color: '#8B5FBF',
                            '&:hover': { 
                                borderColor: '#6A4C93', 
                                background: 'rgba(139, 95, 191, 0.1)' 
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
                            title: 'Total Productos', 
                            value: stats.total, 
                            gradient: 'linear-gradient(135deg, #2196F3, #1976D2)',
                            emoji: '📦'
                        },
                        { 
                            title: 'Valor Inventario', 
                            value: formatAmount(stats.totalValue), 
                            gradient: 'linear-gradient(135deg, #4CAF50, #45A049)',
                            emoji: '💰'
                        },
                        { 
                            title: 'Sin Stock', 
                            value: stats.outOfStock, 
                            gradient: 'linear-gradient(135deg, #f44336, #d32f2f)',
                            emoji: '❌'
                        },
                        { 
                            title: 'Stock Bajo', 
                            value: stats.lowStock, 
                            gradient: 'linear-gradient(135deg, #FF9800, #F57C00)',
                            emoji: '⚠️'
                        }
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
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
                                    fontSize: { xs: '1rem', md: '1.25rem' }
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
                        onClick={fetchProducts}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RefreshIcon />}
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
                            '&:hover': { background: 'linear-gradient(45deg, #7A52A8, #6a42a0)' }
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
                                <TableRow sx={{ background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)' }}>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>📦 Producto</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>📝 Descripción</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>💰 Precio</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>🏷️ Tipo</TableCell>
                                    <TableCell sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2
                                    }}>📊 Stock</TableCell>
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
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.description || 'Sin descripción'}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                                {formatAmount(parseFloat(product.price) || 0)}
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

            {/* Modal Bonito */}
            <Dialog 
                open={open} 
                onClose={handleCloseDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
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
                            📦
                        </Box>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {editMode ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
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
                        {/* Información del Producto */}
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                            borderRadius: 4,
                            p: 4,
                            mb: 3,
                            border: '2px solid #e3f2fd',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #8B5FBF',
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
                                    background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                                }}>
                                    📝
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#8B5FBF', 
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    Información del Producto
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Campo Nombre */}
                                <Box>
                                    <Typography variant="body2" sx={{ 
                                        mb: 1, 
                                        fontWeight: '700',
                                        color: '#8B5FBF',
                                        fontSize: '0.95rem'
                                    }}>
                                        Nombre del Producto *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Ej: Laptop Dell Inspiron 15"
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
                                                    border: '2px solid #8B5FBF',
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

                                {/* Campo Descripción */}
                                <Box>
                                    <Typography variant="body2" sx={{ 
                                        mb: 1, 
                                        fontWeight: '700',
                                        color: '#8B5FBF',
                                        fontSize: '0.95rem'
                                    }}>
                                        Descripción del producto (opcional)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Describe las características principales del producto..."
                                        multiline
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'white',
                                                borderRadius: 3,
                                                border: '2px solid #e3f2fd',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    border: '2px solid #bbdefb',
                                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
                                                },
                                                '&.Mui-focused': {
                                                    border: '2px solid #8B5FBF',
                                                    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.15)',
                                                    backgroundColor: '#fafbff'
                                                },
                                                '& fieldset': {
                                                    border: 'none'
                                                }
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '1rem',
                                                fontWeight: '400',
                                                lineHeight: 1.6
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Información Comercial */}
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
                                    💰
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#4CAF50', 
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    Información Comercial
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Precio y Stock en una fila */}
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ 
                                                mb: 1, 
                                                fontWeight: '700',
                                                color: '#ff8f00',
                                                fontSize: '0.95rem',
                                                textAlign: 'center'
                                            }}>
                                                💵 Precio del Producto *
                                            </Typography>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
                                                border: '2px solid #ffecb3',
                                                borderRadius: 3,
                                                p: 2,
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    border: '2px solid #ffcc02',
                                                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)'
                                                }
                                            }}>
                                                <TextField
                                                    fullWidth
                                                    placeholder="0.00"
                                                    type="number"
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                    required
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'white',
                                                            borderRadius: 3,
                                                            border: '2px solid #fff3e0',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                border: '2px solid #ffe0b2',
                                                                boxShadow: '0 2px 8px rgba(255, 143, 0, 0.1)'
                                                            },
                                                            '&.Mui-focused': {
                                                                border: '2px solid #ff8f00',
                                                                boxShadow: '0 0 0 4px rgba(255, 143, 0, 0.15)',
                                                                backgroundColor: '#fffbf5'
                                                            },
                                                            '& fieldset': {
                                                                border: 'none'
                                                            }
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            textAlign: 'center',
                                                            fontSize: '1.4rem',
                                                            fontWeight: 'bold',
                                                            color: '#ff8f00',
                                                            padding: '18px 16px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ 
                                                mb: 1, 
                                                fontWeight: '700',
                                                color: '#4CAF50',
                                                fontSize: '0.95rem',
                                                textAlign: 'center'
                                            }}>
                                                📦 Stock Disponible
                                            </Typography>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                                                border: '2px solid #c8e6c9',
                                                borderRadius: 3,
                                                p: 2,
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    border: '2px solid #81c784',
                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                                                }
                                            }}>
                                                <TextField
                                                    fullWidth
                                                    placeholder="0"
                                                    type="number"
                                                    inputProps={{ min: 0 }}
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
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
                                                            textAlign: 'center',
                                                            fontSize: '1.4rem',
                                                            fontWeight: 'bold',
                                                            color: '#4CAF50',
                                                            padding: '18px 16px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                                
                                {/* Categoría */}
                                <Box>
                                    <Typography variant="body2" sx={{ 
                                        mb: 1, 
                                        fontWeight: '700',
                                        color: '#9c27b0',
                                        fontSize: '0.95rem'
                                    }}>
                                        🏷️ Categoría del producto
                                    </Typography>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
                                        border: '2px solid #e1bee7',
                                        borderRadius: 3,
                                        p: 2,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            border: '2px solid #ce93d8',
                                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)'
                                        }
                                    }}>
                                        <FormControl fullWidth>
                                            <Select
                                                value={formData.category}
                                                displayEmpty
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    borderRadius: 3,
                                                    border: '2px solid #f8bbd9',
                                                    fontSize: '1.1rem',
                                                    '&:hover': {
                                                        border: '2px solid #f48fb1',
                                                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)'
                                                    },
                                                    '&.Mui-focused': {
                                                        border: '2px solid #9c27b0',
                                                        boxShadow: '0 0 0 4px rgba(156, 39, 176, 0.15)',
                                                        backgroundColor: '#fdf7ff'
                                                    },
                                                    '& fieldset': {
                                                        border: 'none'
                                                    },
                                                    '& .MuiSelect-select': {
                                                        padding: '18px 16px',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '600'
                                                    }
                                                }}
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return (
                                                            <Typography sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                                                                Selecciona una categoría...
                                                            </Typography>
                                                        );
                                                    }
                                                    return (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{ 
                                                                width: 12, 
                                                                height: 12, 
                                                                borderRadius: '50%', 
                                                                background: 'linear-gradient(45deg, #9c27b0, #7b1fa2)' 
                                                            }} />
                                                            <Typography sx={{ fontWeight: '600', color: '#9c27b0' }}>
                                                                {selected}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                }}
                                            >
                                                {categories.map((cat) => (
                                                    <MenuItem key={cat} value={cat} sx={{ 
                                                        py: 2,
                                                        fontSize: '1.1rem',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)'
                                                        }
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{ 
                                                                width: 12, 
                                                                height: 12, 
                                                                borderRadius: '50%', 
                                                                background: 'linear-gradient(45deg, #9c27b0, #7b1fa2)' 
                                                            }} />
                                                            <Typography sx={{ fontWeight: '600' }}>
                                                                {cat}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
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
                            borderColor: '#8B5FBF',
                            color: '#8B5FBF',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            '&:hover': {
                                borderColor: '#7A52A8',
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
                            background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #7A52A8, #6a42a0)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                            }
                        }}
                    >
                        ✨ {editMode ? 'Actualizar Producto' : 'Crear Producto'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Products;
