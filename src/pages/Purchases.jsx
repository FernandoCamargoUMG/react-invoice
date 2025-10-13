import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
// Componente Alert para Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
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
    Chip,
    Avatar,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    ShoppingCart as ShoppingCartIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    Refresh as RefreshIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import PurchaseModal from '../components/modals/PurchaseModal';
import { useCurrency } from '../utils/currency';
import { apiGet, API_CONFIG } from '../config/api';

const Purchases = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    // Estado para Snackbar (alerta bonita)
    // Estado para Dialog de confirmación
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, purchaseId: null, message: '' });

    const openConfirmDialog = (action, purchaseId, message) => {
        setConfirmDialog({ open: true, action, purchaseId, message });
    };
    const closeConfirmDialog = () => {
        setConfirmDialog({ ...confirmDialog, open: false });
    };
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };
    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    // Estados principales
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);

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

    // Estados para el modal (siguiendo el patrón de InvoiceModal)
    const [purchaseItems, setPurchaseItems] = useState([{ product_id: '', quantity: 1, cost_price: 0, total_cost: 0 }]);
    const [purchaseHeader, setPurchaseHeader] = useState({
        supplier_id: '',
        purchase_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
        notes: ''
    });
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');

    // Calcular total local (solo visual, el real lo calcula la API)
    useEffect(() => {
        const newTotal = purchaseItems.reduce((sum, item) => {
            const cost_price = parseFloat(item.cost_price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (cost_price * quantity);
        }, 0);
        setTotal(newTotal);
    }, [purchaseItems]);



    // Cargar proveedores y productos para selects - COPIADO EXACTO DE INVOICES
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resS, resP] = await Promise.all([
                    apiGet(API_CONFIG.ENDPOINTS.SUPPLIERS),
                    apiGet(API_CONFIG.ENDPOINTS.PRODUCTS)
                ]);
                const [dataS, dataP] = await Promise.all([resS.json(), resP.json()]);
                
                // Debug solo para proveedores
                console.log('🔍 Estructura proveedores:', dataS);
                
                // Laravel devuelve los datos en 'data'
                if (dataS.data && Array.isArray(dataS.data)) {
                    setSuppliers(dataS.data);
                    console.log('✅ Proveedores cargados:', dataS.data.length);
                } else if (dataS.success && dataS.data && Array.isArray(dataS.data.data)) {
                    setSuppliers(dataS.data.data);
                    console.log('✅ Proveedores cargados (data.data):', dataS.data.data.length);
                }
                
                if (dataP.data && Array.isArray(dataP.data)) setProducts(dataP.data);
            } catch (err) {
                console.error('Error al cargar proveedores/productos:', err);
            }
        };
        if (openDialog) fetchData();
    }, [openDialog]);

    // Cargar compras desde el backend - IGUAL QUE EN INVOICES
    const fetchPurchases = async () => {
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.PURCHASES);
            const data = await response.json();
            if (data.success) {
                const purchasesArray = data.data.data || [];
                setPurchases(purchasesArray);
                
                // Calcular estadísticas
                setStats({
                    total: data.data.total || 0,
                    pending: purchasesArray.filter(p => p.status === 'pending').length,
                    received: purchasesArray.filter(p => p.status === 'received').length,
                    cancelled: purchasesArray.filter(p => p.status === 'cancelled').length,
                    totalAmount: purchasesArray.reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
                });
            }
        } catch (error) {
            console.error('Error loading purchases:', error);
        }
    };
    
    // 1. Estado para controlar si ya se pidió cargar datos
    const [dataLoaded, setDataLoaded] = useState(false);

    // 2. Elimina el useEffect que llama fetchPurchases() al inicio
    // ...NO uses useEffect(() => { fetchPurchases(); }, []);

    // 3. Modifica loadPurchases para marcar dataLoaded y cargar datos
    const loadPurchases = async (pageNum = 1) => {
        if (loadingData) return; // Evitar múltiples cargas simultáneas
        
        setLoadingData(true);
        setDataLoaded(true); // Marca que el usuario ya pidió cargar
        try {
            console.log(`🛒 Cargando compras - Página ${pageNum}...`);
            const response = await apiGet(`${API_CONFIG.ENDPOINTS.PURCHASES}?page=${pageNum}`);
            const result = await response.json();
            
            console.log('📊 Respuesta completa del backend:', result);
            
            if (result.success && result.data) {
                const purchasesData = result.data;
                const purchasesArray = purchasesData.data || [];
                
                console.log(`✅ ${purchasesArray.length} compras encontradas`);
                
                // Establecer datos de compras
                setPurchases(purchasesArray);
                setPage(purchasesData.current_page || 1);
                setTotalPages(purchasesData.last_page || 1);
                setTotalRecords(purchasesData.total || 0);
                
                // Calcular estadísticas reales
                const realStats = {
                    total: purchasesData.total || 0,
                    pending: purchasesArray.filter(p => p.status === 'pending').length,
                    received: purchasesArray.filter(p => p.status === 'received').length,
                    cancelled: purchasesArray.filter(p => p.status === 'cancelled').length,
                    totalAmount: purchasesArray.reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
                };
                
                setStats(realStats);
                console.log('📈 Estadísticas calculadas:', realStats);
                
            } else {
                console.error('❌ Error en respuesta:', result.message || 'Sin datos');
                setPurchases([]);
                setStats({ total: 0, pending: 0, received: 0, cancelled: 0, totalAmount: 0 });
            }
            
        } catch (error) {
            console.error('💥 Error fatal cargando compras:', error);
            setPurchases([]);
            setStats({ total: 0, pending: 0, received: 0, cancelled: 0, totalAmount: 0 });
        } finally {
            setLoadingData(false);
        }
    };

    const handleOpenDialog = (purchase = null) => {
        if (purchase) {
            setEditMode(true);
            setSelectedPurchase(purchase);
            setPurchaseHeader({
                supplier_id: purchase.supplier_id,
                purchase_date: purchase.purchase_date.split('T')[0],
                notes: purchase.notes || ''
            });
            setPurchaseItems(purchase.items && purchase.items.length > 0 ? 
                purchase.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    cost_price: item.cost_price,
                    total_cost: item.total_cost
                })) : 
                [{ product_id: '', quantity: 1, cost_price: 0, total_cost: 0 }]
            );
        } else {
            setEditMode(false);
            setSelectedPurchase(null);
            setPurchaseHeader({
                supplier_id: '',
                purchase_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
                notes: ''
            });
            setPurchaseItems([{ product_id: '', quantity: 1, cost_price: 0, total_cost: 0 }]);
        }
        
        setError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedPurchase(null);
        setError('');
    };

    // Guardar o editar compra
    const handleSavePurchase = async () => {
        try {
            setError('');
            if (!purchaseHeader.supplier_id) {
                setError('Debe seleccionar un proveedor');
                showSnackbar('Debe seleccionar un proveedor', 'warning');
                return;
            }
            if (purchaseItems.length === 0 || !purchaseItems.some(item => item.product_id)) {
                setError('Debe agregar al menos un producto');
                showSnackbar('Debe agregar al menos un producto', 'warning');
                return;
            }
            // Validar que hay items válidos
            const validItems = purchaseItems.filter(item => 
                item.product_id && 
                item.quantity > 0 && 
                item.cost_price >= 0
            );
            if (validItems.length === 0) {
                setError('Debe agregar al menos un producto válido');
                showSnackbar('Debe agregar al menos un producto válido', 'warning');
                return;
            }
            // Calcular el total sumando todos los items
            const calculatedTotal = validItems.reduce((sum, item) => {
                const quantity = parseInt(item.quantity) || 0;
                const cost = parseFloat(item.cost_price) || 0;
                return sum + (quantity * cost);
            }, 0);
            const purchaseData = {
                supplier_id: parseInt(purchaseHeader.supplier_id),
                purchase_date: purchaseHeader.purchase_date,
                notes: purchaseHeader.notes || '',
                items: validItems.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(item.quantity),
                    cost_price: parseFloat(item.cost_price)
                }))
            };
            console.log('💾 Guardando compra - Datos enviados:', JSON.stringify(purchaseData, null, 2));
            if (editMode && selectedPurchase) {
                // Actualizar compra existente en el backend
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}/${selectedPurchase.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify(purchaseData)
                });
                const result = await response.json();
                if (result.success) {
                    await fetchPurchases(); // Recargar la lista de compras
                    handleCloseDialog();
                    showSnackbar('Compra actualizada correctamente', 'success');
                } else {
                    setError(result.message || 'Error al actualizar la compra');
                    showSnackbar(result.message || 'Error al actualizar la compra', 'error');
                }
            } else {
                // Crear nueva compra en el backend
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify(purchaseData)
                });
                const result = await response.json();
                console.log('📥 Respuesta del backend:', result);
                console.log('📊 Status HTTP:', response.status);
                if (result.success) {
                    await fetchPurchases(); // Recargar la lista de compras
                    handleCloseDialog();
                    showSnackbar('Compra creada correctamente', 'success');
                } else {
                    setError(result.message || 'Error al crear la compra');
                    showSnackbar(result.message || 'Error al crear la compra', 'error');
                }
            }
        } catch (error) {
            console.error('Error al guardar compra:', error);
            setError('Error de conexión al guardar la compra');
            showSnackbar('Error de conexión al guardar la compra', 'error');
        }
    };

    // Abrir dialog de confirmación para eliminar
    const handleDelete = (purchaseId) => {
        openConfirmDialog('delete', purchaseId, '¿Estás seguro de que deseas eliminar esta compra?');
    };

    // Abrir dialog de confirmación para recibir
    const handleReceivePurchase = (id) => {
        openConfirmDialog('receive', id, '¿Marcar esta compra como recibida?');
    };

    // Abrir dialog de confirmación para cancelar
    const handleCancelPurchase = (id) => {
        openConfirmDialog('cancel', id, '¿Cancelar esta compra?');
    };

    // Ejecutar acción confirmada
    const handleConfirmAction = async () => {
        const { action, purchaseId } = confirmDialog;
        closeConfirmDialog();
        try {
            if (action === 'delete') {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}/${purchaseId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    await fetchPurchases();
                    showSnackbar('Compra eliminada correctamente', 'success');
                } else {
                    showSnackbar('Error al eliminar la compra: ' + (result.message || 'Error desconocido'), 'error');
                }
            } else if (action === 'receive') {
                const response = await fetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_RECEIVE(purchaseId)}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const result = await response.json();
                if (result.success) {
                    await fetchPurchases();
                    showSnackbar('Compra marcada como recibida', 'success');
                } else {
                    showSnackbar(result.message || 'Error al marcar como recibida', 'error');
                }
            } else if (action === 'cancel') {
                const response = await fetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_CANCEL(purchaseId)}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const result = await response.json();
                if (result.success) {
                    await fetchPurchases();
                    showSnackbar('Compra cancelada correctamente', 'success');
                } else {
                    showSnackbar(result.message || 'Error al cancelar la compra', 'error');
                }
            }
        } catch (error) {
            if (action === 'delete') showSnackbar('Error de conexión al eliminar la compra', 'error');
            if (action === 'receive') showSnackbar('Error de conexión al marcar como recibida', 'error');
            if (action === 'cancel') showSnackbar('Error de conexión al cancelar la compra', 'error');
        }
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
                    {dataLoaded ? (
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
                                                            {purchase.supplier?.name || 'Sin proveedor'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {purchase.supplier?.contact_person || ''}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString()}
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
                                                        {purchase.status === 'pending' && (
                                                            <>
                                                                <Tooltip title="Marcar como recibida">
                                                                    <IconButton
                                                                        onClick={() => handleReceivePurchase(purchase.id)}
                                                                        sx={{
                                                                            color: '#2E8B57',
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(46, 139, 87, 0.1)',
                                                                                transform: 'scale(1.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CheckCircleIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Cancelar compra">
                                                                    <IconButton
                                                                        onClick={() => handleCancelPurchase(purchase.id)}
                                                                        sx={{
                                                                            color: '#FF9800',
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                                                transform: 'scale(1.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CancelIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
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
                    ) : (
                        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center', color: '#888' }}>
                            Presiona "Cargar Datos" para ver las compras.
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Modal para Crear/Editar Compra */}
            <PurchaseModal
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSavePurchase}
                editMode={editMode}
                suppliers={suppliers}
                products={products}
                purchaseHeader={purchaseHeader}
                setPurchaseHeader={setPurchaseHeader}
                purchaseItems={purchaseItems}
                setPurchaseItems={setPurchaseItems}
                error={error}
                formatAmount={formatCurrency}
                total={total}
            />
        {/* Snackbar de notificación */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3500}
            onClose={closeSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>

        {/* Dialog de confirmación bonito */}
        <Dialog
            open={confirmDialog.open}
            onClose={closeConfirmDialog}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle id="confirm-dialog-title">Confirmar acción</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    {confirmDialog.message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeConfirmDialog} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={handleConfirmAction} color="primary" variant="contained" autoFocus>
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
        </Box>
    );
};

export default Purchases;