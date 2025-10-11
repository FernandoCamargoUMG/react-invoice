import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
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
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    ExitToApp as LogoutIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { apiGet, apiDelete, API_CONFIG } from '../config/api';
import { formatCurrency } from '../utils/currency';
import ProductModal from '../components/modals/ProductModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        sessionStorage.removeItem('user');
        window.location.href = '/';
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.PRODUCTS);
            if (response.ok) {
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (id) => {
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

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setProductModalOpen(true);
    };

    const handleProductModalClose = () => {
        setProductModalOpen(false);
        setSelectedProduct(null);
    };

    const handleProductSaved = () => {
        fetchProducts();
        setSuccessMsg('Producto guardado exitosamente');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const stats = {
        total: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        lowStock: products.filter(p => p.stock < 10).length
    };

    return (
        <Box sx={{ 
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            overflow: 'auto',
            p: 4
        }}>
            {/* Navigation Bar */}
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
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                        📦 Gestión de Productos
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            onClick={() => window.history.back()}
                            startIcon={<ArrowBackIcon />}
                            sx={{ color: '#667eea', borderColor: '#667eea' }}
                        >
                            Atrás
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => window.location.href = '/'}
                            startIcon={<HomeIcon />}
                            sx={{ bgcolor: '#4ecdc4' }}
                        >
                            Inicio
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}
                        >
                            Cerrar sesión
                        </Button>
                    </Box>
                </Box>
            </Paper>

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

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#2196F3' }}>
                                <InventoryIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Productos
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#4CAF50' }}>
                                <MoneyIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                    {formatCurrency(stats.totalValue)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Valor Inventario
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#FF9800' }}>
                                <CategoryIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                    {stats.lowStock}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stock Bajo
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={fetchProducts}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RefreshIcon />}
                        disabled={loading}
                        sx={{ bgcolor: '#667eea', px: 3, py: 1.2 }}
                    >
                        {loading ? 'Cargando...' : 'Cargar Productos'}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAddProduct}
                        startIcon={<AddIcon />}
                        sx={{ bgcolor: '#4CAF50', px: 3, py: 1.2 }}
                    >
                        Nuevo Producto
                    </Button>
                </Box>
            </Paper>

            {/* Products Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#667eea' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell sx={{ fontWeight: '600' }}>{product.name}</TableCell>
                                        <TableCell>
                                            {product.description ? (
                                                <Typography variant="body2">
                                                    {product.description}
                                                </Typography>
                                            ) : (
                                                <Chip label="Sin descripción" size="small" variant="outlined" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={formatCurrency(product.price)} 
                                                size="small" 
                                                color="primary" 
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={`${product.stock} und`}
                                                size="small" 
                                                color={product.stock < 10 ? 'error' : 'success'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <IconButton
                                                onClick={() => handleEditProduct(product)}
                                                sx={{ color: '#2196F3', mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteProduct(product.id)}
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
                                            {loading ? 'Cargando productos...' : 'No hay productos registrados'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Product Modal */}
            <ProductModal
                open={productModalOpen}
                onClose={handleProductModalClose}
                onSave={handleProductSaved}
                product={selectedProduct}
            />
        </Box>
    );
};

export default Products;