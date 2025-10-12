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
    LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';

const Purchases = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    // Estados principales
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        received: 0,
        cancelled: 0,
        totalAmount: 0
    });

    // Datos de ejemplo (simulando la API)
    useEffect(() => {
        const mockPurchases = [
            {
                id: 2,
                supplier_id: 2,
                user_id: 23,
                purchase_number: 'PUR-002',
                subtotal: 0.00,
                tax_amount: 0.00,
                tax_rate: 0.1200,
                total: 1199.75,
                status: 'received',
                purchase_date: '2025-10-05T00:00:00.000000Z',
                notes: 'Reposición de stock - productos importados',
                supplier: {
                    id: 2,
                    name: 'Distribuidora ABC S.A.',
                    email: 'ventas@distribuidoraabc.com',
                    contact_person: 'Juan Carlos Méndez'
                },
                items: [
                    {
                        id: 3,
                        product: { 
                            name: 'Producto Verificación', 
                            description: 'Producto para verificar' 
                        },
                        quantity: 25,
                        cost_price: 12.75,
                        total_cost: 318.75
                    },
                    {
                        id: 4,
                        product: { 
                            name: 'Producto de Prueba BIGINT',
                            description: 'de prueba otra vez'
                        },
                        quantity: 40,
                        cost_price: 8.90,
                        total_cost: 356.00
                    }
                ]
            },
            {
                id: 3,
                supplier_id: 3,
                user_id: 23,
                purchase_number: 'PUR-003',
                subtotal: 0.00,
                tax_amount: 0.00,
                tax_rate: 0.1200,
                total: 1082.50,
                status: 'pending',
                purchase_date: '2025-10-08T00:00:00.000000Z',
                notes: 'Compra pendiente de recibir - productos de consumo',
                supplier: {
                    id: 3,
                    name: 'Importaciones XYZ Ltda.',
                    email: 'compras@importacionesxyz.com',
                    contact_person: 'María Elena García'
                },
                items: [
                    {
                        id: 6,
                        product: { 
                            name: 'Laptop HP',
                            description: 'Laptop HP Pavilion 15"'
                        },
                        quantity: 60,
                        cost_price: 7.25,
                        total_cost: 435.00
                    },
                    {
                        id: 7,
                        product: { 
                            name: 'Mouse Logitech',
                            description: 'Mouse inalámbrico Logitech'
                        },
                        quantity: 35,
                        cost_price: 18.50,
                        total_cost: 647.50
                    }
                ]
            }
        ];

        setPurchases(mockPurchases);
        setStats({
            total: mockPurchases.length,
            pending: mockPurchases.filter(p => p.status === 'pending').length,
            received: mockPurchases.filter(p => p.status === 'received').length,
            cancelled: mockPurchases.filter(p => p.status === 'cancelled').length,
            totalAmount: mockPurchases.reduce((sum, p) => sum + p.total, 0)
        });
        setLoading(false);
    }, []);

    const handleViewPurchase = (purchase) => {
        setSelectedPurchase(purchase);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPurchase(null);
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
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => console.log('Nueva compra')}
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
                                                        onClick={() => console.log('Editar', purchase.id)}
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

            {/* Modal para Ver Detalles de Compra */}
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
                {selectedPurchase && (
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
                                🛒
                            </Box>
                            Detalles de Compra - {selectedPurchase.purchase_number}
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
                                                    {selectedPurchase.purchase_number}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                                                <Typography variant="body1">
                                                    {new Date(selectedPurchase.purchase_date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                                                <Chip
                                                    icon={getStatusIcon(selectedPurchase.status)}
                                                    label={getStatusText(selectedPurchase.status)}
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(selectedPurchase.status)}20`,
                                                        color: getStatusColor(selectedPurchase.status),
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Total:</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E8B57' }}>
                                                    {formatCurrency(selectedPurchase.total)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Proveedor
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedPurchase.supplier.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                                <Typography variant="body2">
                                                    {selectedPurchase.supplier.email}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Contacto:</Typography>
                                                <Typography variant="body2">
                                                    {selectedPurchase.supplier.contact_person}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Productos Comprados
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: 'rgba(139, 95, 191, 0.1)' }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Costo Unit.</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedPurchase.items.map((item, index) => (
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
                                                            <TableCell>{formatCurrency(item.cost_price)}</TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#2E8B57' }}>
                                                                    {formatCurrency(item.total_cost)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>

                                {selectedPurchase.notes && (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                            <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                                Notas
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedPurchase.notes}
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
                            {selectedPurchase.status === 'pending' && (
                                <Button 
                                    variant="contained"
                                    sx={{
                                        background: 'linear-gradient(45deg, #2E8B57, #228B22)',
                                        borderRadius: 2,
                                        px: 3,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✅ Marcar como Recibida
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default Purchases;
