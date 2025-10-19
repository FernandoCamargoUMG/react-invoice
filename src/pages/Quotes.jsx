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
    Receipt as ReceiptIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    RequestQuote as RequestQuoteIcon,
    Assessment as AssessmentIcon,
    AttachMoney as AttachMoneyIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Send as SendIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { generateQuotePdf } from '../utils/reportQuote';
import QuoteModal from '../components/modals/QuoteModal';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, API_CONFIG } from '../config/api';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Quotes = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    // Estados principales
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [openDialog, setOpenDialog] = useState(false); // view dialog
    const [openEditor, setOpenEditor] = useState(false); // create/edit modal
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [quoteHeader, setQuoteHeader] = useState({ customer_id: '', quote_date: new Date().toISOString().split('T')[0], valid_until: '', notes: '' });
    const [quoteItems, setQuoteItems] = useState([{ product_id: '', quantity: 1, price: 0, total_price: 0 }]);
    const [editMode, setEditMode] = useState(false);
    const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const showSnackbar = (message, severity = 'info') => setSnackbar({ open: true, message, severity });
    const closeSnackbar = (e, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        draft: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
    });

    // Paginación
    const [page, setPage] = useState(1);
    const [_totalPages, set_TotalPages] = useState(1);
    const [_totalRecords, set_TotalRecords] = useState(0);

    // Inicial: no cargar mocks. El usuario debe pulsar "Cargar Datos" para obtener desde backend.
    useEffect(() => { setLoading(false); }, []);

    // Cargar catálogo de clientes y productos
    const loadCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const res = await apiGet(API_CONFIG.ENDPOINTS.CUSTOMERS + '?per_page=100');
            const json = await res.json().catch(() => null);
            if (json && json.data) setCustomers(json.data.data || json.data || []);
        } catch (e) { console.error('Error loading customers', e); }
        finally { setLoadingCustomers(false); }
    };

    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await apiGet(API_CONFIG.ENDPOINTS.PRODUCTS + '?per_page=100');
            const json = await res.json().catch(() => null);
            if (json && json.data) setProducts(json.data.data || json.data || []);
        } catch (e) { console.error('Error loading products', e); }
        finally { setLoadingProducts(false); }
    };

    // Precargar catálogos al montar
    useEffect(() => { loadCustomers(); loadProducts(); }, []);

    const handleViewQuote = (quote) => {
        setSelectedQuote(quote);
        setOpenDialog(true);
    };

    const handleDownloadQuotePdf = (quote) => {
        try {
            const customer = quote.customer || {};
            const items = (quote.items || []).map(i => ({
                description: i.product?.name || i.description || '-',
                quantity: i.quantity,
                price: i.unit_price ?? i.price ?? 0,
                total: i.total_price
            }));
            const quoteHeaderForPdf = { number: quote.quote_number, date: quote.quote_date, subtotal: quote.subtotal, tax: quote.tax, total: quote.total };
            const doc = generateQuotePdf({ quote: quoteHeaderForPdf, customer, items, meta: { companyName: 'Mi Empresa' } });
            const filename = `cotizacion-${quote.quote_number || (quote.quote_date || '').slice(0,10)}.pdf`;
            doc.save(filename);
        } catch (err) {
            console.error('Error generando PDF:', err);
            showSnackbar('Error generando PDF', 'error');
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedQuote(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#FF9800';
            case 'sent': return '#1976d2';
            case 'approved': return '#2E8B57';
            case 'rejected': return '#F44336';
            case 'expired': return '#757575';
            case 'converted': return '#6A4C93';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft': return 'Borrador';
            case 'sent': return 'Enviada';
            case 'approved': return 'Aprobada';
            case 'rejected': return 'Rechazada';
            case 'converted': return 'Convertida';
            case 'expired': return 'Expirada';
            default: return status;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return <ScheduleIcon />;
            case 'sent': return <SendIcon />;
            case 'approved': return <CheckCircleIcon />;
            case 'rejected': return <CancelIcon />;
            case 'expired': return <ScheduleIcon />;
            case 'converted': return <ReceiptIcon />;
            default: return <ScheduleIcon />;
        }
    };

    const isQuoteExpired = (validUntil) => {
        return new Date(validUntil) < new Date();
    };

    // Cargar cotizaciones desde backend
    const loadQuotes = async (pageNum = 1) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await apiGet(`${API_CONFIG.ENDPOINTS.QUOTES}?page=${pageNum}`);
            console.log('[Quotes] HTTP status:', res.status);
            const text = await res.text().catch(() => null);
            console.log('[Quotes] raw response text:', text);
            let json = null;
            try { json = text ? JSON.parse(text) : null; } catch (e) { console.error('[Quotes] JSON parse error:', e); }
            // if apiGet returned a Response that supports json(), prefer that
            if (!json && res.ok) {
                try { json = await res.json(); } catch (e) { console.error('[Quotes] fallback res.json() error:', e); }
            }
            if (json.success && json.data) {
                const data = json.data;
                const arr = data.data || [];
                console.log('[Quotes] parsed data:', data);
                setQuotes(arr.map(q => ({ ...q })));
                setStats({
                    total: data.total || arr.length,
                    draft: arr.filter(q => q.status === 'draft').length,
                    sent: arr.filter(q => q.status === 'sent').length,
                    approved: arr.filter(q => q.status === 'approved').length,
                    rejected: arr.filter(q => q.status === 'rejected').length,
                    converted: arr.filter(q => q.status === 'converted').length,
                    totalAmount: arr.reduce((s, q) => s + parseFloat(q.total || 0), 0)
                });
                setPage(data.current_page || 1);
                set_TotalPages(data.last_page || 1);
                set_TotalRecords(data.total || arr.length);
            } else {
                showSnackbar(json.message || 'No se encontraron cotizaciones', 'info');
                setQuotes([]);
            }
        } catch (err) {
            console.error('Error loading quotes:', err);
            showSnackbar('Error cargando cotizaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Abrir editor
    const openNewQuote = () => {
        setEditMode(false);
        setSelectedQuoteForEdit(null);
        setQuoteHeader({ customer_id: '', quote_date: new Date().toISOString().split('T')[0], valid_until: '', notes: '' });
        setQuoteItems([{ product_id: '', quantity: 1, price: 0, total_price: 0 }]);
        // Ensure catalogs are loaded
        if (customers.length === 0) loadCustomers();
        if (products.length === 0) loadProducts();
        setOpenEditor(true);
    };

    const openEditQuote = (quote) => {
        setEditMode(true);
        setSelectedQuoteForEdit(quote);
        setQuoteHeader({ customer_id: quote.customer_id, quote_date: quote.quote_date?.split('T')[0] || '', valid_until: quote.valid_until?.split('T')[0] || '', notes: quote.notes || '' });
        setQuoteItems(quote.items ? quote.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price || i.unit_price, total_price: i.total_price })) : [{ product_id: '', quantity: 1, price: 0, total_price: 0 }]);
        if (customers.length === 0) loadCustomers();
        if (products.length === 0) loadProducts();
        setOpenEditor(true);
    };

    const handleSaveQuote = async () => {
        try {
            const payload = { ...quoteHeader, items: quoteItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity), price: parseFloat(i.price) })) };
            if (editMode && selectedQuoteForEdit) {
                const res = await apiPut(`${API_CONFIG.ENDPOINTS.QUOTES}/${selectedQuoteForEdit.id}`, payload);
                const json = await res.json();
                if (json.success) { showSnackbar('Cotización actualizada', 'success'); setOpenEditor(false); await loadQuotes(page); }
                else showSnackbar(json.message || 'Error actualizando', 'error');
            } else {
                const res = await apiPost(API_CONFIG.ENDPOINTS.QUOTES, payload);
                const json = await res.json();
                if (json.success) { showSnackbar('Cotización creada', 'success'); setOpenEditor(false); await loadQuotes(1); }
                else showSnackbar(json.message || 'Error creando', 'error');
            }
        } catch (err) { console.error(err); showSnackbar('Error de conexión', 'error'); }
    };

    const handleDeleteQuote = async (id) => {
        if (!window.confirm('¿Eliminar cotización?')) return;
        try {
            const res = await apiDelete(`${API_CONFIG.ENDPOINTS.QUOTES}/${id}`);
            const json = await res.json();
            if (json.success) { showSnackbar('Cotización eliminada', 'success'); await loadQuotes(page); }
            else showSnackbar(json.message || 'Error eliminando', 'error');
        } catch (err) { console.error(err); showSnackbar('Error de conexión', 'error'); }
    };

    const handleQuoteAction = async (id, action) => {
        try {
            let endpoint = '';
            switch (action) {
                case 'send': endpoint = API_CONFIG.ENDPOINTS.QUOTE_SEND(id); break;
                case 'approve': endpoint = API_CONFIG.ENDPOINTS.QUOTE_APPROVE(id); break;
                case 'reject': endpoint = API_CONFIG.ENDPOINTS.QUOTE_REJECT(id); break;
                case 'convert': endpoint = API_CONFIG.ENDPOINTS.QUOTE_TO_INVOICE(id); break;
                default: return;
            }
            // Use POST for convert action because backend route expects POST
            const res = action === 'convert' ? await apiPost(endpoint) : await apiPatch(endpoint);
            const json = await res.json();
            if (json.success) { showSnackbar(json.message || 'Acción realizada', 'success'); await loadQuotes(page); }
            else showSnackbar(json.message || 'Error', 'error');
        } catch (err) { console.error(err); showSnackbar('Error de conexión', 'error'); }
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
                title="📋 Gestión de Cotizaciones"
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
                                <RequestQuoteIcon sx={{ fontSize: 32, color: 'white' }} />
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
                                Total Cotizaciones
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
                                {stats.approved}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Aprobadas
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
                                Total Cotizado
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
                        <RequestQuoteIcon />
                        Lista de Cotizaciones
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" onClick={() => loadQuotes(1)} sx={{ borderColor: '#8B5FBF', color: '#8B5FBF' }}>Cargar Datos</Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openNewQuote()}
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
                        Nueva Cotización
                    </Button>
                    </Box>
                </Paper>

                {/* Tabla de Cotizaciones */}
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
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cotización</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vence</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {quotes.map((quote) => (
                                    <TableRow 
                                        key={quote.id}
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
                                                    background: `linear-gradient(135deg, ${getStatusColor(quote.status)} 0%, ${getStatusColor(quote.status)}80 100%)`,
                                                    width: 48,
                                                    height: 48
                                                }}>
                                                    <RequestQuoteIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {quote.quote_number}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {quote.customer.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {quote.customer.contact_person}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(quote.quote_date).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="body2"
                                                sx={{
                                                    color: isQuoteExpired(quote.valid_until) ? '#F44336' : 'inherit',
                                                    fontWeight: isQuoteExpired(quote.valid_until) ? 'bold' : 'normal'
                                                }}
                                            >
                                                {new Date(quote.valid_until).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getStatusIcon(quote.status)}
                                                label={getStatusText(quote.status)}
                                                sx={{
                                                    backgroundColor: `${getStatusColor(quote.status)}20`,
                                                    color: getStatusColor(quote.status),
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${getStatusColor(quote.status)}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 'bold',
                                                color: '#2E8B57'
                                            }}>
                                                {formatCurrency(quote.total)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        onClick={() => handleViewQuote(quote)}
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
                                                <Tooltip title="Editar cotización">
                                                    <IconButton
                                                        onClick={() => openEditQuote(quote)}
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
                                                <Tooltip title="Descargar PDF">
                                                    <IconButton
                                                        onClick={() => handleDownloadQuotePdf(quote)}
                                                        sx={{
                                                            color: '#2E8B57',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(46, 139, 87, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar cotización">
                                                    <IconButton onClick={() => handleDeleteQuote(quote.id)} sx={{ color: '#dc3545' }}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Enviar cotización">
                                                    <IconButton onClick={() => handleQuoteAction(quote.id, 'send')}>
                                                        <SendIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Aprobar">
                                                    <IconButton onClick={() => handleQuoteAction(quote.id, 'approve')}>
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Rechazar">
                                                    <IconButton onClick={() => handleQuoteAction(quote.id, 'reject')}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Convertir a factura">
                                                    <IconButton onClick={() => handleQuoteAction(quote.id, 'convert')}>
                                                        <ReceiptIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                </Box>
            </Box>

            {/* Modal para Ver Detalles de Cotización */}
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
                        overflow: 'visible'
                    }
                }}
            >
                {selectedQuote && (
                    <>
                        <DialogTitle sx={{ 
                            color: 'white', 
                            fontWeight: 'bold', 
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderBottom: '2px solid rgba(139, 95, 191, 0.1)'
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
                                boxShadow: '0 4px 16px rgba(139, 95, 191, 0.3)'
                            }}>
                                📋
                            </Box>
                            Detalles de Cotización - {selectedQuote.quote_number}
                        </DialogTitle>
                        
                        <DialogContent sx={{ p: 4, background: 'rgba(255, 255, 255, 0.98)' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Información General
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Número:</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedQuote.quote_number}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                                                <Typography variant="body1">
                                                    {new Date(selectedQuote.quote_date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Válida hasta:</Typography>
                                                <Typography 
                                                    variant="body1"
                                                    sx={{
                                                        color: isQuoteExpired(selectedQuote.valid_until) ? '#F44336' : 'inherit',
                                                        fontWeight: isQuoteExpired(selectedQuote.valid_until) ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    {new Date(selectedQuote.valid_until).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                                                <Chip
                                                    icon={getStatusIcon(selectedQuote.status)}
                                                    label={getStatusText(selectedQuote.status)}
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(selectedQuote.status)}20`,
                                                        color: getStatusColor(selectedQuote.status),
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Total:</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E8B57' }}>
                                                    {formatCurrency(selectedQuote.total)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Cliente
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedQuote.customer.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                                <Typography variant="body2">
                                                    {selectedQuote.customer.email}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Contacto:</Typography>
                                                <Typography variant="body2">
                                                    {selectedQuote.customer.contact_person}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                                                <Typography variant="body2">
                                                    {selectedQuote.customer.phone}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Productos Cotizados
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: 'rgba(139, 95, 191, 0.1)' }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Producto/Servicio</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Precio Unit.</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedQuote.items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                                        {item.product.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {item.product.description}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{item.quantity}</TableCell>
                                                            <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#2E8B57' }}>
                                                                    {formatCurrency(item.total_price)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>

                                {selectedQuote.notes && (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                            <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                                Notas
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedQuote.notes}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        
                        <DialogActions sx={{ p: 3, gap: 2, background: 'rgba(255, 255, 255, 0.98)' }}>
                            <Button
                                onClick={handleCloseDialog}
                                variant="outlined"
                                sx={{
                                    borderColor: '#8B5FBF',
                                    color: '#8B5FBF',
                                    borderRadius: 2,
                                    px: 3,
                                    fontWeight: 'bold'
                                }}
                            >
                                ✕ Cerrar
                            </Button>
                            <Button 
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #6A4C93, #8B5FBF)',
                                    borderRadius: 2,
                                    px: 3,
                                    fontWeight: 'bold'
                                }}
                                onClick={() => handleDownloadQuotePdf(selectedQuote)}
                            >
                                📄 Descargar PDF
                            </Button>
                            {selectedQuote.status === 'draft' && (
                                <Button 
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    sx={{
                                        background: 'linear-gradient(45deg, #2E8B57, #228B22)',
                                        borderRadius: 2,
                                        px: 3,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    📧 Enviar al Cliente
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Editor modal for create/edit */}
            <QuoteModal
                open={openEditor}
                onClose={() => setOpenEditor(false)}
                onSave={handleSaveQuote}
                editMode={editMode}
                customers={customers}
                products={products}
                quoteHeader={quoteHeader}
                setQuoteHeader={setQuoteHeader}
                quoteItems={quoteItems}
                setQuoteItems={setQuoteItems}
                error={null}
                formatAmount={formatCurrency}
                total={quoteItems.reduce((s,i)=>s+parseFloat(i.total_price||0),0)}
                loadingCustomers={loadingCustomers}
                loadingProducts={loadingProducts}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Quotes;
