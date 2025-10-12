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
    Send as SendIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';

const Quotes = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    // Estados principales
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
    });

    // Datos de ejemplo (simulando la API)
    useEffect(() => {
        const mockQuotes = [
            {
                id: 5,
                customer_id: 4,
                user_id: 23,
                quote_number: 'COT-005',
                subtotal: 0.00,
                tax_amount: 0.00,
                tax_rate: 0.1200,
                total: 2250.75,
                status: 'approved',
                quote_date: '2025-09-15T00:00:00.000000Z',
                valid_until: '2025-10-15T00:00:00.000000Z',
                notes: 'Cotización para proyecto de implementación - descuento especial incluido',
                customer: {
                    id: 4,
                    name: 'TechSolutions Corp.',
                    email: 'compras@techsolutions.com',
                    contact_person: 'Ana María Rodríguez',
                    address: 'Av. Principal 123, Oficina 456',
                    city: 'Medellín',
                    phone: '+57 4 444-5555'
                },
                items: [
                    {
                        id: 8,
                        product: { 
                            name: 'Sistema de Inventarios Premium', 
                            description: 'Sistema completo de gestión de inventarios con módulos avanzados' 
                        },
                        quantity: 1,
                        unit_price: 1500.00,
                        total_price: 1500.00
                    },
                    {
                        id: 9,
                        product: { 
                            name: 'Capacitación y Soporte',
                            description: 'Capacitación inicial y soporte técnico por 6 meses'
                        },
                        quantity: 1,
                        unit_price: 750.75,
                        total_price: 750.75
                    }
                ]
            },
            {
                id: 6,
                customer_id: 5,
                user_id: 23,
                quote_number: 'COT-006',
                subtotal: 0.00,
                tax_amount: 0.00,
                tax_rate: 0.1200,
                total: 1825.50,
                status: 'pending',
                quote_date: '2025-10-01T00:00:00.000000Z',
                valid_until: '2025-11-01T00:00:00.000000Z',
                notes: 'Cotización urgente - cliente solicita respuesta en 48 horas',
                customer: {
                    id: 5,
                    name: 'Industrias del Norte S.A.S.',
                    email: 'ventas@industriasdelnorte.com',
                    contact_person: 'Carlos Alberto Jiménez',
                    address: 'Zona Industrial Norte, Bodega 78',
                    city: 'Barranquilla',
                    phone: '+57 5 555-6666'
                },
                items: [
                    {
                        id: 10,
                        product: { 
                            name: 'Consultoría Empresarial',
                            description: 'Análisis y optimización de procesos empresariales'
                        },
                        quantity: 40,
                        unit_price: 35.50,
                        total_price: 1420.00
                    },
                    {
                        id: 11,
                        product: { 
                            name: 'Informe de Recomendaciones',
                            description: 'Documento detallado con recomendaciones estratégicas'
                        },
                        quantity: 1,
                        unit_price: 405.50,
                        total_price: 405.50
                    }
                ]
            }
        ];

        setQuotes(mockQuotes);
        setStats({
            total: mockQuotes.length,
            pending: mockQuotes.filter(q => q.status === 'pending').length,
            approved: mockQuotes.filter(q => q.status === 'approved').length,
            rejected: mockQuotes.filter(q => q.status === 'rejected').length,
            totalAmount: mockQuotes.reduce((sum, q) => sum + q.total, 0)
        });
        setLoading(false);
    }, []);

    const handleViewQuote = (quote) => {
        setSelectedQuote(quote);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedQuote(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FF9800';
            case 'approved': return '#2E8B57';
            case 'rejected': return '#F44336';
            case 'expired': return '#757575';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'approved': return 'Aprobada';
            case 'rejected': return 'Rechazada';
            case 'expired': return 'Expirada';
            default: return status;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <ScheduleIcon />;
            case 'approved': return <CheckCircleIcon />;
            case 'rejected': return <CancelIcon />;
            case 'expired': return <ScheduleIcon />;
            default: return <ScheduleIcon />;
        }
    };

    const isQuoteExpired = (validUntil) => {
        return new Date(validUntil) < new Date();
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
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => console.log('Nueva cotización')}
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
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {quote.id}
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
                                                        onClick={() => console.log('Editar', quote.id)}
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
                                                        onClick={() => console.log('Descargar PDF', quote.id)}
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
                            >
                                📄 Descargar PDF
                            </Button>
                            {selectedQuote.status === 'pending' && (
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
        </Box>
    );
};

export default Quotes;
