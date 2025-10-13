import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Avatar,
    Tooltip,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    ShoppingCart as ShoppingCartIcon,
    Receipt as ReceiptIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    ExpandMore as ExpandMoreIcon,
    Business as BusinessIcon,
    LocalShipping as LocalShippingIcon,
    Refresh as RefreshIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';
import { apiGet, API_CONFIG } from '../config/api';

const Purchases = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    // Estados principales
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    // Estados del formulario
    const [formData, setFormData] = useState({
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: []
    });
    
    // Estados para items
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [costPrice, setCostPrice] = useState('');

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        received: 0,
        cancelled: 0,
        totalAmount: 0
    });

    // Estados de paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loadingData, setLoadingData] = useState(false);

    // Cargar solo proveedores y productos al inicio
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Solo cargar proveedores y productos, NO las compras
                const suppliersResponse = await apiGet(API_CONFIG.ENDPOINTS.SUPPLIERS);
                const suppliersData = await suppliersResponse.json();
                if (suppliersData.success) {
                    setSuppliers(suppliersData.data.data || suppliersData.data);
                }

                const productsResponse = await apiGet(API_CONFIG.ENDPOINTS.PRODUCTS);
                const productsData = await productsResponse.json();
                if (productsData.success) {
                    setProducts(productsData.data.data || productsData.data);
                }
            } catch (error) {
                console.error('Error cargando datos iniciales:', error);
                // Datos de fallback mínimos
                setSuppliers([
                    { id: 1, name: 'Proveedor de Prueba' },
                    { id: 2, name: 'Distribuidora ABC S.A.' },
                    { id: 3, name: 'Importaciones XYZ Ltda.' }
                ]);
                setProducts([
                    { id: 9, name: 'Laptop HP', price: 896.00 },
                    { id: 10, name: 'Mouse Logitech', price: 28.56 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Función para cargar compras desde el backend
    const loadPurchases = async (pageNum = 1) => {
        setLoadingData(true);
        try {
            const response = await apiGet(`${API_CONFIG.ENDPOINTS.PURCHASES}?page=${pageNum}`);
            const data = await response.json();
            
            if (data.success) {
                setPurchases(data.data.data);
                setPage(data.data.current_page);
                setTotalPages(data.data.last_page);
                setTotalRecords(data.data.total);
                
                // Calcular estadísticas
                const purchases = data.data.data;
                setStats({
                    total: data.data.total,
                    pending: purchases.filter(p => p.status === 'pending').length,
                    received: purchases.filter(p => p.status === 'received').length,
                    cancelled: purchases.filter(p => p.status === 'cancelled').length,
                    totalAmount: purchases.reduce((sum, p) => sum + parseFloat(p.total), 0)
                });
            } else {
                alert('Error al cargar las compras: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al cargar las compras');
        } finally {
            setLoadingData(false);
        }
    };

    // Funciones CRUD
    const handleOpenDialog = (purchase = null) => {
        if (purchase) {
            setEditMode(true);
            setSelectedPurchase(purchase);
            setFormData({
                supplier_id: purchase.supplier_id,
                purchase_date: purchase.purchase_date.split('T')[0],
                notes: purchase.notes || '',
                items: purchase.items || []
            });
        } else {
            setEditMode(false);
            setSelectedPurchase(null);
            setFormData({
                supplier_id: '',
                purchase_date: new Date().toISOString().split('T')[0],
                notes: '',
                items: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPurchase(null);
        setEditMode(false);
        setSelectedProduct('');
        setQuantity('');
        setCostPrice('');
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity || !costPrice) return;
        
        const product = products.find(p => p.id === parseInt(selectedProduct));
        const newItem = {
            id: Date.now(),
            product_id: product.id,
            product: product,
            quantity: parseInt(quantity),
            cost_price: parseFloat(costPrice),
            total_cost: parseInt(quantity) * parseFloat(costPrice)
        };

        setFormData({
            ...formData,
            items: [...formData.items, newItem]
        });

        setSelectedProduct('');
        setQuantity('');
        setCostPrice('');
    };

    const handleRemoveItem = (itemId) => {
        setFormData({
            ...formData,
            items: formData.items.filter(item => item.id !== itemId)
        });
    };

    const handleSubmit = () => {
        if (!formData.supplier_id || formData.items.length === 0) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        const total = formData.items.reduce((sum, item) => sum + item.total_cost, 0);
        const newPurchase = {
            id: editMode ? selectedPurchase.id : Date.now(),
            supplier_id: formData.supplier_id,
            user_id: 23,
            purchase_number: editMode ? selectedPurchase.purchase_number : `PUR-${String(purchases.length + 1).padStart(3, '0')}`,
            subtotal: total,
            tax_amount: total * 0.12,
            tax_rate: 0.12,
            total: total + (total * 0.12),
            status: 'pending',
            purchase_date: formData.purchase_date + 'T00:00:00.000000Z',
            notes: formData.notes,
            supplier: suppliers.find(s => s.id === parseInt(formData.supplier_id)),
            items: formData.items
        };

        if (editMode) {
            setPurchases(purchases.map(p => p.id === selectedPurchase.id ? newPurchase : p));
        } else {
            setPurchases([newPurchase, ...purchases]);
        }

        handleCloseDialog();
    };

    const handleDelete = (purchaseId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta compra?')) {
            setPurchases(purchases.filter(p => p.id !== purchaseId));
        }
    };

    const handleViewPurchase = (purchase) => {
        setSelectedPurchase(purchase);
        setOpenDialog(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FF9800';
            case 'received': return '#2E8B57';
            case 'cancelled': return '#F44336';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'received': return 'Recibida';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <ScheduleIcon />;
            case 'received': return <CheckCircleIcon />;
            case 'cancelled': return <CancelIcon />;
            default: return <ScheduleIcon />;
        }
    };

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
            <NavigationBar 
                title="🛒 Gestión de Compras"
                onHome={() => navigate('/')}
                onBack={() => navigate('/')}
            />

            {/* Contenedor Principal con Scroll */}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: 3,
                '&::-webkit-scrollbar': { width: 8 },
                '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
                '&::-webkit-scrollbar-thumb': { 
                    background: 'rgba(139, 95, 191, 0.3)', 
                    borderRadius: 4,
                    '&:hover': { background: 'rgba(139, 95, 191, 0.5)' }
                }
            }}>
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    maxWidth: '1400px',
                    mx: 'auto'
                }}>
                    {/* Estadísticas */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            p: 3,
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}>
                            <Box sx={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #8B5FBF 0%, #B794F6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 4px 16px rgba(139, 95, 191, 0.3)'
                            }}>
                                <ShoppingCartIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #8B5FBF, #B794F6)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Total Compras
                            </Typography>
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
                            textAlign: 'center'
                        }}>
                            <Box sx={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)'
                            }}>
                                <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: '#FF9800'
                            }}>
                                {stats.pending}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Pendientes
                            </Typography>
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
                            textAlign: 'center'
                        }}>
                            <Box sx={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 4px 16px rgba(46, 139, 87, 0.3)'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: '#2E8B57'
                            }}>
                                {stats.received}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Recibidas
                            </Typography>
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
                            textAlign: 'center'
                        }}>
                            <Box sx={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 4px 16px rgba(46, 139, 87, 0.3)'
                            }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>$</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: '#2E8B57'
                            }}>
                                {formatCurrency(stats.totalAmount)}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Total Comprado
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                {/* Acciones */}
                <Paper sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        color: '#8B5FBF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <ShoppingCartIcon />
                        Lista de Compras
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => loadPurchases()}
                            disabled={loadingData}
                            sx={{
                                color: '#8B5FBF',
                                borderColor: '#8B5FBF',
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                fontWeight: 'bold',
                                '&:hover': {
                                    borderColor: '#6A4C93',
                                    backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            {loadingData ? 'Cargando...' : 'Cargar Datos'}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                background: 'linear-gradient(135deg, #8B5FBF 0%, #B794F6 100%)',
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 16px rgba(139, 95, 191, 0.3)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(139, 95, 191, 0.4)'
                                }
                            }}
                        >
                            Nueva Compra
                        </Button>
                    </Box>
                </Paper>

                {/* Tabla de Compras */}
                <Paper sx={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ background: 'linear-gradient(135deg, #8B5FBF 0%, #B794F6 100%)' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Compra</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Proveedor</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {purchases.map((purchase) => (
                                    <TableRow 
                                        key={purchase.id}
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: 'rgba(139, 95, 191, 0.05)' 
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ 
                                                    background: `linear-gradient(135deg, ${getStatusColor(purchase.status)} 0%, ${getStatusColor(purchase.status)}80 100%)`,
                                                    width: 48,
                                                    height: 48
                                                }}>
                                                    <ShoppingCartIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {purchase.purchase_number}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {purchase.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {purchase.supplier.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {purchase.supplier.contact_person}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(purchase.purchase_date).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getStatusIcon(purchase.status)}
                                                label={getStatusText(purchase.status)}
                                                sx={{
                                                    backgroundColor: `${getStatusColor(purchase.status)}20`,
                                                    color: getStatusColor(purchase.status),
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${getStatusColor(purchase.status)}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 'bold',
                                                color: '#2E8B57'
                                            }}>
                                                {formatCurrency(purchase.total)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        onClick={() => handleViewPurchase(purchase)}
                                                        sx={{
                                                            color: '#8B5FBF',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar compra">
                                                    <IconButton
                                                        onClick={() => handleOpenDialog(purchase)}
                                                        sx={{
                                                            color: '#6A4C93',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(106, 76, 147, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar compra">
                                                    <IconButton
                                                        onClick={() => handleDelete(purchase.id)}
                                                        sx={{
                                                            color: '#dc3545',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    {/* Controles de Paginación */}
                    <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderTop: '1px solid rgba(139, 95, 191, 0.1)'
                    }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Mostrando {purchases.length} de {totalRecords} registros
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeftIcon />}
                                onClick={() => loadPurchases(page - 1)}
                                disabled={page <= 1 || loadingData}
                                size="small"
                                sx={{
                                    color: '#8B5FBF',
                                    borderColor: '#8B5FBF',
                                    '&:hover': {
                                        borderColor: '#6A4C93',
                                        backgroundColor: 'rgba(139, 95, 191, 0.1)'
                                    }
                                }}
                            >
                                Anterior
                            </Button>
                            
                            <Typography variant="body2" sx={{ 
                                mx: 2, 
                                color: '#8B5FBF',
                                fontWeight: 'bold'
                            }}>
                                Página {page} de {totalPages}
                            </Typography>
                            
                            <Button
                                variant="outlined"
                                endIcon={<ChevronRightIcon />}
                                onClick={() => loadPurchases(page + 1)}
                                disabled={page >= totalPages || loadingData}
                                size="small"
                                sx={{
                                    color: '#8B5FBF',
                                    borderColor: '#8B5FBF',
                                    '&:hover': {
                                        borderColor: '#6A4C93',
                                        backgroundColor: 'rgba(139, 95, 191, 0.1)'
                                    }
                                }}
                            >
                                Siguiente
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                </Box>
            </Box>

            {/* Modal para Crear/Editar Compra */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px rgba(139, 95, 191, 0.3)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    p: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                    }}>
                        🛒 {editMode ? `Editar Compra - ${selectedPurchase?.purchase_number}` : 'Nueva Compra'}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ 
                    p: 0, 
                    backgroundColor: 'white',
                    borderRadius: '0 0 16px 16px',
                    position: 'relative'
                }}>
                    {/* Información de la Compra */}
                    <Box sx={{ p: 4, pb: 0 }}>
                        <Typography variant="h6" sx={{ 
                            mb: 3, 
                            color: '#4a5568', 
                            fontWeight: 700,
                            borderBottom: '2px solid #8B5FBF',
                            pb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            📋 Información de la Compra
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                    borderRadius: 4,
                                    padding: 2.5,
                                    border: '2px solid #e3f2fd',
                                    boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        border: '2px solid #8B5FBF',
                                        boxShadow: '0 12px 35px rgba(139, 95, 191, 0.2)',
                                        transform: 'translateY(-4px) scale(1.01)'
                                    }
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2, 
                                        mb: 2 
                                    }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                                        }}>
                                            🏢
                                        </Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#8B5FBF', 
                                            fontWeight: 700,
                                            fontSize: '1.1rem'
                                        }}>
                                            Proveedor *
                                        </Typography>
                                    </Box>
                                    <FormControl fullWidth>
                                        <Select
                                            value={formData.supplier_id}
                                            onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                                            displayEmpty
                                            sx={{
                                                borderRadius: 3,
                                                '& .MuiOutlinedInput-root': {
                                                    background: 'white',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#8B5FBF',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#8B5FBF',
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>Seleccionar proveedor</em>
                                            </MenuItem>
                                            {suppliers.map((supplier) => (
                                                <MenuItem key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                    borderRadius: 4,
                                    padding: 2.5,
                                    border: '2px solid #e3f2fd',
                                    boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        border: '2px solid #8B5FBF',
                                        boxShadow: '0 12px 35px rgba(139, 95, 191, 0.2)',
                                        transform: 'translateY(-4px) scale(1.01)'
                                    }
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2, 
                                        mb: 2 
                                    }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                                        }}>
                                            📅
                                        </Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#8B5FBF', 
                                            fontWeight: 700,
                                            fontSize: '1.1rem'
                                        }}>
                                            Fecha de Compra
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                background: 'white',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5FBF',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5FBF',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Sección de Productos */}
                    <Box sx={{ p: 4, pt: 0 }}>
                        <Typography variant="h6" sx={{ 
                            mb: 3, 
                            color: '#4a5568', 
                            fontWeight: 700,
                            borderBottom: '2px solid #8B5FBF',
                            pb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            📦 Agregar Productos
                        </Typography>

                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                            borderRadius: 4,
                            padding: 3,
                            border: '2px solid #e3f2fd',
                            boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                            mb: 3
                        }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#8B5FBF' }}>Producto</InputLabel>
                                        <Select
                                            value={selectedProduct}
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                            label="Producto"
                                            sx={{
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#8B5FBF',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#8B5FBF',
                                                    }
                                                }
                                            }}
                                        >
                                            {products.map((product) => (
                                                <MenuItem key={product.id} value={product.id}>
                                                    {product.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Cantidad"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        sx={{
                                            '& .MuiInputLabel-root': { color: '#8B5FBF' },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5FBF',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5FBF',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Precio Costo"
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(e.target.value)}
                                        sx={{
                                            '& .MuiInputLabel-root': { color: '#8B5FBF' },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5FBF',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5FBF',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddItem}
                                        sx={{
                                            height: '56px',
                                            background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                            borderRadius: 3,
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            boxShadow: '0 6px 20px rgba(139, 95, 191, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #6A4C93 0%, #8B5FBF 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(139, 95, 191, 0.4)'
                                            }
                                        }}
                                    >
                                        AGREGAR
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Lista de productos agregados */}
                        {formData.items.length > 0 && (
                            <Box sx={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                borderRadius: 4,
                                padding: 3,
                                border: '2px solid #e3f2fd',
                                boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                                mb: 3
                            }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 2, 
                                    color: '#8B5FBF', 
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    📝 Productos Agregados
                                </Typography>
                                <Box sx={{ 
                                    borderRadius: 3, 
                                    overflow: 'hidden',
                                    border: '1px solid rgba(139, 95, 191, 0.2)'
                                }}>
                                    <Table>
                                        <TableHead sx={{ background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Producto</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Cantidad</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Precio</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#8B5FBF' }}>Total</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Acción</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {formData.items.map((item, index) => (
                                                <TableRow 
                                                    key={item.id}
                                                    sx={{
                                                        '&:nth-of-type(odd)': {
                                                            backgroundColor: 'rgba(139, 95, 191, 0.04)'
                                                        },
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(139, 95, 191, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 500 }}>{item.product?.name}</TableCell>
                                                    <TableCell sx={{ fontWeight: 500 }}>{item.quantity}</TableCell>
                                                    <TableCell sx={{ fontWeight: 500 }}>{formatCurrency(item.cost_price)}</TableCell>
                                                    <TableCell sx={{ color: '#2E8B57', fontWeight: 'bold' }}>
                                                        {formatCurrency(item.total_cost)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            sx={{ 
                                                                color: '#dc3545',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                                    transform: 'scale(1.1)'
                                                                }
                                                            }}
                                                        >
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Box>
                        )}

                        {/* Notas */}
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                            borderRadius: 4,
                            padding: 3,
                            border: '2px solid #e3f2fd',
                            boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)'
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 2 
                            }}>
                                <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                                }}>
                                    📝
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#8B5FBF', 
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    Notas (Opcional)
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Añade observaciones o detalles adicionales sobre esta compra..."
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        background: 'white',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#8B5FBF',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#8B5FBF',
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ 
                    p: 4, 
                    gap: 3, 
                    background: 'linear-gradient(135deg, rgba(139, 95, 191, 0.02) 0%, rgba(183, 148, 246, 0.02) 100%)',
                    borderTop: '1px solid rgba(139, 95, 191, 0.1)',
                    justifyContent: 'center'
                }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: '#8B5FBF',
                            color: '#8B5FBF',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            minWidth: 120,
                            '&:hover': {
                                borderColor: '#6A4C93',
                                backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        ✕ CANCELAR
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        variant="contained"
                        size="large"
                        sx={{
                            background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            minWidth: 120,
                            boxShadow: '0 6px 20px rgba(46, 139, 87, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #228B22 0%, #2E8B57 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(46, 139, 87, 0.4)'
                            }
                        }}
                    >
                        {editMode ? '💾 ACTUALIZAR COMPRA' : '✅ CREAR COMPRA'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Purchases;
