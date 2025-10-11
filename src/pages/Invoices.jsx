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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Fab,
    Autocomplete,
    Divider,
    TablePagination,
    CircularProgress
} from '@mui/material';
import {
    Receipt as ReceiptIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AttachMoney as MoneyIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Search as SearchIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Payment as PaymentIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch, API_CONFIG } from '../config/api';
import { useCurrency } from '../utils/currency';
import InvoiceModal from '../components/modals/InvoiceModal';

const Invoices = () => {
    const { formatAmount } = useCurrency();
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [openDialog, setOpenDialog] = useState(false);

    // Estilos implementados directamente en cada componente
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [invoiceItems, setInvoiceItems] = useState([{ product_id: '', quantity: 1, price: 0 }]);
    const [invoiceHeader, setInvoiceHeader] = useState({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
        notes: ''
    });
    const [total, setTotal] = useState(0);

    // Navegación
    const handleBack = () => window.history.back();
    const handleHome = () => window.location.href = '/';
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        sessionStorage.removeItem('user');
        window.location.href = '/';
    };

    // Cargar clientes y productos para selects
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resC, resP] = await Promise.all([
                    apiGet(API_CONFIG.ENDPOINTS.CUSTOMERS),
                    apiGet(API_CONFIG.ENDPOINTS.PRODUCTS)
                ]);
                const [dataC, dataP] = await Promise.all([resC.json(), resP.json()]);
                // Laravel devuelve los datos en 'data'
                if (dataC.data && Array.isArray(dataC.data)) setCustomers(dataC.data);
                if (dataP.data && Array.isArray(dataP.data)) setProducts(dataP.data);
            } catch (err) {
                console.error('Error al cargar clientes/productos:', err);
            }
        };
        if (openDialog) fetchData();
    }, [openDialog]);

    // Calcular total local (solo visual, el real lo calcula la API)
    useEffect(() => {
        let t = 0;
        invoiceItems.forEach(item => {
            const prod = products.find(p => p.id === item.product_id);
            const price = item.price || (prod ? Number(prod.price) : 0);
            t += price * (item.quantity || 1);
        });
        setTotal(t);
    }, [invoiceItems, products]);

    // Cargar facturas desde el backend
    const fetchInvoices = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.INVOICES);
            const data = await response.json();
            if (response.ok && data.data) {
                setInvoices(data.data);
                setShowTable(true);
            } else {
                setError('No se pudo obtener el listado de facturas.');
            }
        } catch (err) {
            setError('Error de conexión: ' + err.message);
        }
        setLoading(false);
    };

    // Marcar factura como pagada
    const handleMarkAsPaid = async (id) => {
        try {
            const response = await apiPatch(API_CONFIG.ENDPOINTS.INVOICE_STATUS.replace(':id', id), {
                status: 'paid'
            });
            
            if (response.ok) {
                fetchInvoices();
                setSuccessMsg('Factura marcada como pagada');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setError('Error al marcar como pagada.');
            }
        } catch (err) {
            setError('Error de conexión al marcar como pagada: ' + err.message);
        }
    };

    const handleOpenDialog = (invoice = null) => {
        if (invoice) {
            setEditMode(true);
            setEditId(invoice.id);
            setInvoiceHeader({
                customer_id: invoice.customer_id,
                date: invoice.date,
                due_date: invoice.due_date || '',
                status: invoice.status,
                notes: invoice.notes || ''
            });
            setInvoiceItems(invoice.items?.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            })) || [{ product_id: '', quantity: 1, price: 0 }]);
        } else {
            setEditMode(false);
            setEditId(null);
            setInvoiceHeader({
                customer_id: '',
                date: new Date().toISOString().split('T')[0],
                due_date: '',
                status: 'pending',
                notes: ''
            });
            setInvoiceItems([{ product_id: '', quantity: 1, price: 0 }]);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setEditId(null);
        setError('');
    };

    // Guardar o editar factura
    const handleSaveInvoice = async () => {
        // Validar cabecera
        if (!invoiceHeader.customer_id || !invoiceHeader.date || !invoiceHeader.status) {
            setError('Completa todos los campos de la cabecera.');
            return;
        }
        // Validar productos
        for (const item of invoiceItems) {
            if (!item.product_id || Number(item.quantity) <= 0 || Number(item.price) <= 0) {
                setError('Todos los productos deben tener producto, cantidad y precio mayor a 0.');
                return;
            }
        }
        setError('');
        try {
            const userId = localStorage.getItem('user_id');
            const payload = {
                ...invoiceHeader,
                user_id: userId,
                items: invoiceItems.map(item => ({
                    product_id: item.product_id,
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                }))
            };
            let response;
            if (editMode && editId) {
                response = await apiPut(`${API_CONFIG.ENDPOINTS.INVOICES}/${editId}`, payload);
            } else {
                response = await apiPost(API_CONFIG.ENDPOINTS.INVOICES, payload);
            }
            if (response.ok) {
                fetchInvoices();
                handleCloseDialog();
                setSuccessMsg(editMode ? 'Factura actualizada exitosamente' : 'Factura creada exitosamente');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al guardar la factura');
            }
        } catch (err) {
            setError('Error de conexión: ' + err.message);
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
            try {
                const response = await apiDelete(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`);
                if (response.ok) {
                    fetchInvoices();
                    setSuccessMsg('Factura eliminada exitosamente');
                    setTimeout(() => setSuccessMsg(''), 3000);
                } else {
                    setError('Error al eliminar la factura');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            }
        }
    };

    // Las funciones de manejo de items están implementadas en InvoiceModal.jsx

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Pagada';
            case 'pending': return 'Pendiente';
            case 'overdue': return 'Vencida';
            default: return status;
        }
    };

    // Filtro visual
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = (invoice.id + '').includes(searchTerm) ||
                             (invoice.customer && invoice.customer.name && 
                              invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (invoice.status && invoice.status.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const paginatedInvoices = filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const stats = {
        total: invoices.length,
        pending: invoices.filter(i => i.status === 'pending').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        totalAmount: invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0)
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
            {/* Header */}
            <Paper sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 0,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                minHeight: 70,
                display: 'flex',
                alignItems: 'center',
                px: 4,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            width: 50,
                            height: 50
                        }}>
                            <ReceiptIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 'bold', 
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                📋 Gestión de Facturas
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administra facturas y pagos del sistema
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            sx={{
                                borderColor: '#667eea',
                                color: '#667eea',
                                '&:hover': {
                                    borderColor: '#764ba2',
                                    background: 'rgba(102, 126, 234, 0.1)'
                                }
                            }}
                        >
                            ATRÁS
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<HomeIcon />}
                            onClick={handleHome}
                            sx={{
                                borderColor: '#667eea',
                                color: '#667eea',
                                '&:hover': {
                                    borderColor: '#764ba2',
                                    background: 'rgba(102, 126, 234, 0.1)'
                                }
                            }}
                        >
                            INICIO
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                '&:hover': {
                                    borderColor: '#d32f2f',
                                    background: 'rgba(244, 67, 54, 0.1)'
                                }
                            }}
                        >
                            CERRAR SESIÓN
                        </Button>
                        {!showTable && (
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchInvoices}
                                disabled={loading}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    color: '#667eea',
                                    border: '2px solid #667eea',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'rgba(102, 126, 234, 0.1)'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={20} /> : 'Cargar Facturas'}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #45A049, #388E3C)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                }
                            }}
                        >
                            Nueva Factura
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Main Content */}
            <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                {/* Error Alert */}
                {error && (
                    <Alert 
                        severity="error" 
                        onClose={() => setError('')}
                        sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Success Alert */}
                {successMsg && (
                    <Alert 
                        severity="success" 
                        onClose={() => setSuccessMsg('')}
                        sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        {successMsg}
                    </Alert>
                )}

                {showTable && (
                    <>
                        {/* Estadísticas */}
                        <Grid container spacing={3}>
                            {[
                                { title: 'Total Facturas', value: stats.total, icon: <ReceiptIcon />, gradient: 'linear-gradient(135deg, #2196F3, #1976D2)' },
                                { title: 'Pendientes', value: stats.pending, icon: <ReceiptIcon />, gradient: 'linear-gradient(135deg, #ff9800, #f57c00)' },
                                { title: 'Pagadas', value: stats.paid, icon: <ReceiptIcon />, gradient: 'linear-gradient(135deg, #4CAF50, #45A049)' },
                                { title: 'Total Ingresos', value: formatAmount(stats.totalAmount), icon: <MoneyIcon />, gradient: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' }
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
                                        <Avatar sx={{ 
                                            background: stat.gradient,
                                            mx: 'auto',
                                            mb: 1,
                                            width: 50,
                                            height: 50,
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                        }}>
                                            {stat.icon}
                                        </Avatar>
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

                        {/* Filtros y Búsqueda */}
                        <Paper sx={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            p: 3,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)'
                        }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar facturas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: '#667eea' }} />
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                background: 'rgba(255,255,255,0.8)',
                                                backdropFilter: 'blur(10px)'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Filtrar por Estado</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            sx={{
                                                borderRadius: 3,
                                                background: 'rgba(255,255,255,0.8)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            <MenuItem value="all">Todos los estados</MenuItem>
                                            <MenuItem value="pending">Pendientes</MenuItem>
                                            <MenuItem value="paid">Pagadas</MenuItem>
                                            <MenuItem value="overdue">Vencidas</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                        {filteredInvoices.length} factura(s) encontrada(s)
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Tabla de Facturas */}
                        <Paper sx={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
                            overflow: 'hidden'
                        }}>
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Cliente</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Fecha</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Estado</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Total</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedInvoices.map((invoice) => (
                                            <TableRow key={invoice.id} sx={{ 
                                                '&:hover': { 
                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                    transform: 'scale(1.01)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <TableCell>#{invoice.id}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ 
                                                            background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                                                            width: 40,
                                                            height: 40
                                                        }}>
                                                            <PeopleIcon />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                                {invoice.customer?.name || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {invoice.customer?.email || ''}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{invoice.date}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getStatusText(invoice.status)}
                                                        color={getStatusColor(invoice.status)}
                                                        variant="filled"
                                                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                                        {formatAmount(invoice.total)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        {invoice.status === 'pending' && (
                                                            <IconButton
                                                                onClick={() => handleMarkAsPaid(invoice.id)}
                                                                sx={{
                                                                    background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        background: 'linear-gradient(45deg, #45A049, #388E3C)',
                                                                        transform: 'scale(1.1)'
                                                                    }
                                                                }}
                                                            >
                                                                <PaymentIcon />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            onClick={() => handleOpenDialog(invoice)}
                                                            sx={{
                                                                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                                                                color: 'white',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                                                                    transform: 'scale(1.1)'
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteInvoice(invoice.id)}
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
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filteredInvoices.length}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                labelRowsPerPage="Filas por página:"
                                sx={{ 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            />
                        </Paper>
                    </>
                )}

                {/* Mensaje inicial si no se han cargado las facturas */}
                {!showTable && !loading && (
                    <Paper sx={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        p: 6,
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)'
                    }}>
                        <ReceiptIcon sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
                            Gestión de Facturas
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Haz clic en "Cargar Facturas" para ver todas las facturas del sistema
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={fetchInvoices}
                            sx={{
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Cargar Facturas
                        </Button>
                    </Paper>
                )}
            </Box>

            {/* FAB para móvil */}
            <Fab
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    display: { xs: 'flex', md: 'none' },
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)'
                    }
                }}
                onClick={() => handleOpenDialog()}
            >
                <AddIcon />
            </Fab>

            {/* Modal de Factura */}
            <InvoiceModal
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSaveInvoice}
                editMode={editMode}
                customers={customers}
                products={products}
                invoiceHeader={invoiceHeader}
                setInvoiceHeader={setInvoiceHeader}
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                error={error}
                formatAmount={formatAmount}
                total={total}
            />
        </Box>
    );
};

export default Invoices;