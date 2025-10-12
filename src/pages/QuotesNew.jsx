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
    Chip,
    Avatar,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    RequestQuote as RequestQuoteIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';

const Quotes = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    const [quotes, setQuotes] = useState([]);

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
    });

    // Datos de ejemplo simplificados
    useEffect(() => {
        const mockQuotes = [
            {
                id: 5,
                quote_number: 'COT-005',
                total: 2250.75,
                status: 'approved',
                quote_date: '2025-09-15T00:00:00.000000Z',
                valid_until: '2025-10-15T00:00:00.000000Z',
                customer: {
                    name: 'TechSolutions Corp.',
                    contact_person: 'Ana María Rodríguez'
                }
            },
            {
                id: 6,
                quote_number: 'COT-006',
                total: 1825.50,
                status: 'pending',
                quote_date: '2025-10-01T00:00:00.000000Z',
                valid_until: '2025-11-01T00:00:00.000000Z',
                customer: {
                    name: 'Industrias del Norte S.A.S.',
                    contact_person: 'Carlos Alberto Jiménez'
                }
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
    }, []);

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
                                                <Typography variant="body2">
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
                                                            onClick={() => console.log('Ver', quote.id)}
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
        </Box>
    );
};

export default Quotes;