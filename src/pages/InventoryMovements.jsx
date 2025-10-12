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
    Inventory as InventoryIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    SwapHoriz as SwapHorizIcon,
    Build as BuildIcon,
    Archive as ArchiveIcon,
    ExpandMore as ExpandMoreIcon,
    Assessment as AssessmentIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';

const InventoryMovements = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    // Estados principales
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        inbound: 0,
        outbound: 0,
        adjustments: 0,
        totalValue: 0
    });

    // Datos de ejemplo (simulando la API)
    useEffect(() => {
        const mockMovements = [
            {
                id: 8,
                product_id: 3,
                movement_type: 'inbound',
                quantity: 150,
                reference_type: 'purchase',
                reference_id: 2,
                cost_per_unit: 12.75,
                total_cost: 1912.50,
                movement_date: '2025-10-05T14:30:00.000000Z',
                notes: 'Recepción de mercancía - Orden de compra PUR-002',
                product: {
                    id: 3,
                    name: 'Producto Verificación',
                    description: 'Producto para verificar inventario',
                    category: 'Electrónicos',
                    current_stock: 275
                },
                reference: {
                    number: 'PUR-002',
                    supplier: 'Distribuidora ABC S.A.'
                }
            },
            {
                id: 9,
                product_id: 4,
                movement_type: 'outbound',
                quantity: -75,
                reference_type: 'sale',
                reference_id: 8,
                cost_per_unit: 8.90,
                total_cost: -667.50,
                movement_date: '2025-10-08T09:15:00.000000Z',
                notes: 'Venta realizada - Factura INV-008',
                product: {
                    id: 4,
                    name: 'Producto de Prueba BIGINT',
                    description: 'Producto de prueba para testing',
                    category: 'Materiales',
                    current_stock: 185
                },
                reference: {
                    number: 'INV-008',
                    customer: 'Cliente Premium S.A.'
                }
            },
            {
                id: 10,
                product_id: 5,
                movement_type: 'adjustment',
                quantity: -15,
                reference_type: 'adjustment',
                reference_id: null,
                cost_per_unit: 25.00,
                total_cost: -375.00,
                movement_date: '2025-10-10T16:45:00.000000Z',
                notes: 'Ajuste de inventario - productos dañados identificados en revisión',
                product: {
                    id: 5,
                    name: 'Laptop HP Pavilion',
                    description: 'Laptop HP Pavilion 15" Intel Core i5',
                    category: 'Computadoras',
                    current_stock: 45
                },
                reference: {
                    number: 'ADJ-001',
                    reason: 'Productos dañados'
                }
            },
            {
                id: 11,
                product_id: 6,
                movement_type: 'inbound',
                quantity: 200,
                reference_type: 'purchase',
                reference_id: 3,
                cost_per_unit: 7.25,
                total_cost: 1450.00,
                movement_date: '2025-10-12T11:20:00.000000Z',
                notes: 'Recepción de stock - Nueva compra programada',
                product: {
                    id: 6,
                    name: 'Mouse Logitech Wireless',
                    description: 'Mouse inalámbrico Logitech M705',
                    category: 'Accesorios',
                    current_stock: 320
                },
                reference: {
                    number: 'PUR-003',
                    supplier: 'Importaciones XYZ Ltda.'
                }
            }
        ];

        setMovements(mockMovements);
        setStats({
            total: mockMovements.length,
            inbound: mockMovements.filter(m => m.movement_type === 'inbound').length,
            outbound: mockMovements.filter(m => m.movement_type === 'outbound').length,
            adjustments: mockMovements.filter(m => m.movement_type === 'adjustment').length,
            totalValue: Math.abs(mockMovements.reduce((sum, m) => sum + m.total_cost, 0))
        });
        setLoading(false);
    }, []);

    const handleViewMovement = (movement) => {
        setSelectedMovement(movement);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMovement(null);
    };

    const getMovementTypeColor = (type) => {
        switch (type) {
            case 'inbound': return '#2E8B57';
            case 'outbound': return '#F44336';
            case 'adjustment': return '#FF9800';
            default: return '#666';
        }
    };

    const getMovementTypeText = (type) => {
        switch (type) {
            case 'inbound': return 'Entrada';
            case 'outbound': return 'Salida';
            case 'adjustment': return 'Ajuste';
            default: return type;
        }
    };

    const getMovementTypeIcon = (type) => {
        switch (type) {
            case 'inbound': return <TrendingUpIcon />;
            case 'outbound': return <TrendingDownIcon />;
            case 'adjustment': return <BuildIcon />;
            default: return <SwapHorizIcon />;
        }
    };

    const getReferenceTypeText = (type) => {
        switch (type) {
            case 'purchase': return 'Compra';
            case 'sale': return 'Venta';
            case 'adjustment': return 'Ajuste';
            case 'transfer': return 'Transferencia';
            default: return type;
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
                title="📦 Movimientos de Inventario"
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
                                <InventoryIcon sx={{ fontSize: 32, color: 'white' }} />
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
                                Total Movimientos
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
                                <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: '#2E8B57'
                            }}>
                                {stats.inbound}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Entradas
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
                                background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)'
                            }}>
                                <TrendingDownIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: '#F44336'
                            }}>
                                {stats.outbound}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Salidas
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
                                {formatCurrency(stats.totalValue)}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Valor Total
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
                        <HistoryIcon />
                        Historial de Movimientos
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={() => console.log('Generar reporte')}
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
                        📊 Generar Reporte
                    </Button>
                </Paper>

                {/* Tabla de Movimientos */}
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
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producto</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cantidad</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Referencia</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valor</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {movements.map((movement) => (
                                    <TableRow 
                                        key={movement.id}
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
                                                    background: `linear-gradient(135deg, ${getMovementTypeColor(movement.movement_type)} 0%, ${getMovementTypeColor(movement.movement_type)}80 100%)`,
                                                    width: 48,
                                                    height: 48
                                                }}>
                                                    {getMovementTypeIcon(movement.movement_type)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {movement.product.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Stock: {movement.product.current_stock} unidades
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getMovementTypeIcon(movement.movement_type)}
                                                label={getMovementTypeText(movement.movement_type)}
                                                sx={{
                                                    backgroundColor: `${getMovementTypeColor(movement.movement_type)}20`,
                                                    color: getMovementTypeColor(movement.movement_type),
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${getMovementTypeColor(movement.movement_type)}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    color: movement.quantity >= 0 ? '#2E8B57' : '#F44336'
                                                }}
                                            >
                                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {movement.reference.number}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {getReferenceTypeText(movement.reference_type)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(movement.movement_date).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(movement.movement_date).toLocaleTimeString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    color: movement.total_cost >= 0 ? '#2E8B57' : '#F44336'
                                                }}
                                            >
                                                {formatCurrency(Math.abs(movement.total_cost))}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        onClick={() => handleViewMovement(movement)}
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

            {/* Modal para Ver Detalles del Movimiento */}
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
                {selectedMovement && (
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
                                📦
                            </Box>
                            Detalles del Movimiento - ID: {selectedMovement.id}
                        </DialogTitle>
                        
                        <DialogContent sx={{ p: 4, background: 'rgba(255, 255, 255, 0.98)' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Información del Movimiento
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">ID:</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedMovement.id}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                                                <Chip
                                                    icon={getMovementTypeIcon(selectedMovement.movement_type)}
                                                    label={getMovementTypeText(selectedMovement.movement_type)}
                                                    sx={{
                                                        backgroundColor: `${getMovementTypeColor(selectedMovement.movement_type)}20`,
                                                        color: getMovementTypeColor(selectedMovement.movement_type),
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Cantidad:</Typography>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: selectedMovement.quantity >= 0 ? '#2E8B57' : '#F44336'
                                                    }}
                                                >
                                                    {selectedMovement.quantity > 0 ? '+' : ''}{selectedMovement.quantity}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Costo por unidad:</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(selectedMovement.cost_per_unit)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Valor total:</Typography>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: selectedMovement.total_cost >= 0 ? '#2E8B57' : '#F44336'
                                                    }}
                                                >
                                                    {formatCurrency(Math.abs(selectedMovement.total_cost))}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                                                <Typography variant="body1">
                                                    {new Date(selectedMovement.movement_date).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Producto
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedMovement.product.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                                                <Typography variant="body2">
                                                    {selectedMovement.product.description}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Categoría:</Typography>
                                                <Typography variant="body2">
                                                    {selectedMovement.product.category}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Stock actual:</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E8B57' }}>
                                                    {selectedMovement.product.current_stock} unidades
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                            Referencia
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Tipo de referencia:</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {getReferenceTypeText(selectedMovement.reference_type)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Número:</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedMovement.reference.number}
                                                </Typography>
                                            </Box>
                                            {selectedMovement.reference.supplier && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">Proveedor:</Typography>
                                                    <Typography variant="body1">
                                                        {selectedMovement.reference.supplier}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {selectedMovement.reference.customer && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                                                    <Typography variant="body1">
                                                        {selectedMovement.reference.customer}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {selectedMovement.reference.reason && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">Razón:</Typography>
                                                    <Typography variant="body1">
                                                        {selectedMovement.reference.reason}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>

                                {selectedMovement.notes && (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3, borderRadius: 2, border: '2px solid rgba(139, 95, 191, 0.1)' }}>
                                            <Typography variant="h6" sx={{ mb: 2, color: '#8B5FBF', fontWeight: 'bold' }}>
                                                Notas
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedMovement.notes}
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
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default InventoryMovements;
