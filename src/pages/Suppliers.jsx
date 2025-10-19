import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    TablePagination,
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
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    ToggleOn as ToggleOnIcon,
    ToggleOff as ToggleOffIcon,
    Person as PersonIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import NavigationBar from '../components/NavigationBar';
import { useCurrency } from '../utils/currency';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch, API_CONFIG } from '../config/api';

const Suppliers = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    // Estados principales
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        contact_person: '',
        notes: ''
    });

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // Paginación
    const [page, setPage] = useState(0); // 0-based for TablePagination
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    // Track per-row updating (activate/deactivate)
    const [updatingIds, setUpdatingIds] = useState([]);

    // Función para obtener proveedores (paginada)
    const fetchSuppliers = async (pageNumber = page, perPage = rowsPerPage) => {
    setLoading(true);
        try {
            const query = `?page=${(pageNumber || 0) + 1}&per_page=${perPage}`;
            const res = await apiGet(`${API_CONFIG.ENDPOINTS.SUPPLIERS}${query}`);
            if (!res.ok) throw new Error(`Error al cargar proveedores: ${res.status}`);
            const json = await res.json();
            // Soporta varios formatos: Laravel paginación en json.data.data, o json.data como lista
            const rawItems = json?.data?.data ?? json?.data ?? json?.items ?? json?.results ?? [];
            // Normalizar status en cada item
            const items = rawItems.map(it => ({ ...it, status: normalizeStatus(it.status) }));
            // Buscar total en varios lugares (data.total, meta.total, total)
            const total = json?.data?.total ?? json?.meta?.total ?? json?.total ?? items.length;
            setSuppliers(items);
            setTotalCount(Number.isFinite(total) ? total : items.length);
            setStats({
                total: Number.isFinite(total) ? total : items.length,
                active: items.filter(s => s.status === 'active').length,
                inactive: items.filter(s => s.status === 'inactive').length
            });
        } catch (_error) {
            console.error(_error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage]);

    const handleOpenDialog = (supplier = null) => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address || '',
                tax_id: supplier.tax_id || '',
                contact_person: supplier.contact_person || '',
                notes: supplier.notes || ''
            });
            setSelectedSupplier(supplier);
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                tax_id: '',
                contact_person: '',
                notes: ''
            });
            setSelectedSupplier(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSupplier(null);
    };

    const handleSubmit = () => {
        // Crear o actualizar proveedor a través del backend
        const save = async () => {
                try {
                setLoading(true);
                if (selectedSupplier) {
                    // actualizar
                    const res = await apiPut(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${selectedSupplier.id}`, formData);
                    if (!res.ok) throw new Error('Error actualizando proveedor');
                    const json = await res.json();
                    // actualizar en estado
                    // refrescar lista desde backend para mantener paginación
                    await fetchSuppliers(page, rowsPerPage);
                } else {
                    // crear
                    const res = await apiPost(API_CONFIG.ENDPOINTS.SUPPLIERS, formData);
                    if (!res.ok) throw new Error('Error creando proveedor');
                    const json = await res.json();
                    const newSupplier = json.data ?? json;
                    // recargar desde backend para mantener consistencia
                    await fetchSuppliers(0, rowsPerPage);
                }
                handleCloseDialog();
                } catch (_error) {
                console.error(_error);
                alert('Ocurrió un error al guardar el proveedor. Revisa la consola.');
            } finally {
                setLoading(false);
            }
        };
        save();
    };

    const toggleStatus = (supplier) => {
        const toggle = async () => {
            try {
                // Only block the specific row
                setUpdatingIds(prev => [...prev, supplier.id]);
                const res = await apiPatch(API_CONFIG.ENDPOINTS.SUPPLIER_STATUS(supplier.id));
                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    console.error('Error cambiando estado', res.status, txt);
                    throw new Error('Error cambiando estado');
                }
                const json = await res.json().catch(() => null);
                const updated = json?.data ?? json ?? null;

                if (updated && updated.id) {
                    // Determinar nuevo estado: preferir el campo status del backend si viene
                    let newStatus = normalizeStatus(updated.status ?? updated.state ?? null);
                    if (!newStatus) {
                        // fallback: alternar el estado local actual
                        newStatus = supplier.status === 'active' ? 'inactive' : 'active';
                    }

                    // Actualizar solo el proveedor modificado en el estado local
                    setSuppliers(prev => {
                        const next = prev.map(s => (String(s.id) === String(updated.id)) ? { ...s, ...updated, status: newStatus } : s);
                        // Recalcular estadísticas locales basadas en next
                        setStats({
                            total: next.length,
                            active: next.filter(x => x.status === 'active').length,
                            inactive: next.filter(x => x.status === 'inactive').length
                        });
                        return next;
                    });

                    // Actualizar totalCount si el backend lo retorna
                    if (json?.data?.total) setTotalCount(json.data.total);

                    // Mostrar mensaje del backend si viene
                    if (json?.message) alert(json.message);
                } else {
                    // Fallback: recargar la página actual si la respuesta no contiene el recurso
                    await fetchSuppliers(page, rowsPerPage);
                }
                } catch (_error) {
                console.error(_error);
                alert('No se pudo cambiar el estado del proveedor. Revisa la consola.');
            } finally {
                setUpdatingIds(prev => prev.filter(id => id !== supplier.id));
            }
        };
        toggle();
    };

    const handleDelete = (supplierId) => {
        if (!window.confirm('¿Estás seguro de eliminar este proveedor? Esta acción es irreversible.')) return;
        const remove = async () => {
            try {
                setLoading(true);
                const res = await apiDelete(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${supplierId}`);
                if (!res.ok) throw new Error('Error eliminando proveedor');
                // eliminar del estado
                // recargar página actual; si quedó vacía, bajar página
                const newTotal = Math.max(0, totalCount - 1);
                const lastPage = Math.max(0, Math.ceil(newTotal / rowsPerPage) - 1);
                const targetPage = page > lastPage ? lastPage : page;
                setPage(targetPage);
                await fetchSuppliers(targetPage, rowsPerPage);
            } catch (error) {
                console.error(error);
                alert('No se pudo eliminar el proveedor.');
            } finally {
                setLoading(false);
            }
        };
        remove();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#2E8B57';
            case 'inactive': return '#8B5FBF';
            default: return '#666';
        }
    };

    // Normalizar diferentes representaciones de estado a 'active'|'inactive'
    const normalizeStatus = (raw) => {
        if (raw === null || raw === undefined) return 'inactive';
        const s = String(raw).trim().toLowerCase();
        if (s === 'active' || s === 'activo' || s === '1' || s === 'true') return 'active';
        if (s === 'inactive' || s === 'inactivo' || s === '0' || s === 'false') return 'inactive';
        // si viene un número y es 1/0
        if (!isNaN(Number(s))) return Number(s) === 1 ? 'active' : 'inactive';
        return 'inactive';
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'inactive': return 'Inactivo';
            default: return status;
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
                title="🤝 Gestión de Proveedores"
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
                    <Grid item xs={12} sm={4}>
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
                                <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
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
                                Total Proveedores
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                                <ToggleOnIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #2E8B57, #228B22)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                {stats.active}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Activos
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                                background: 'linear-gradient(135deg, #6A4C93 0%, #8B5FBF 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 4px 16px rgba(106, 76, 147, 0.3)'
                            }}>
                                <ToggleOffIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #6A4C93, #8B5FBF)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                {stats.inactive}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Inactivos
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
                        <BusinessIcon />
                        Lista de Proveedores
                    </Typography>
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
                        Nuevo Proveedor
                    </Button>
                </Paper>

                {/* Tabla de Proveedores */}
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
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Proveedor</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NIT/RUC</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {suppliers.map((supplier) => (
                                    <TableRow 
                                        key={supplier.id}
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
                                                    background: `linear-gradient(135deg, ${getStatusColor(supplier.status)} 0%, ${getStatusColor(supplier.status)}80 100%)`,
                                                    width: 48,
                                                    height: 48
                                                }}>
                                                    <BusinessIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {supplier.name}
                                                    </Typography>
                                                    {supplier.contact_person && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                            {supplier.contact_person}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                    <EmailIcon sx={{ fontSize: 16, color: '#8B5FBF' }} />
                                                    {supplier.email}
                                                </Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PhoneIcon sx={{ fontSize: 16, color: '#8B5FBF' }} />
                                                    {supplier.phone}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusText(supplier.status)}
                                                sx={{
                                                    backgroundColor: `${getStatusColor(supplier.status)}20`,
                                                    color: getStatusColor(supplier.status),
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${getStatusColor(supplier.status)}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {supplier.tax_id || 'No especificado'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Editar proveedor">
                                                    <IconButton
                                                        onClick={() => handleOpenDialog(supplier)}
                                                        sx={{
                                                            color: '#8B5FBF',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={`${supplier.status === 'active' ? 'Desactivar' : 'Activar'} proveedor`}>
                                                    {/* <span> 
                                                    <IconButton
                                                        onClick={() => toggleStatus(supplier)}
                                                        disabled={updatingIds.includes(supplier.id)}
                                                        sx={{
                                                            color: getStatusColor(supplier.status),
                                                            '&:hover': {
                                                                backgroundColor: `${getStatusColor(supplier.status)}20`,
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        {updatingIds.includes(supplier.id) ? (
                                                            <CircularProgress size={20} sx={{ color: getStatusColor(supplier.status) }} />
                                                        ) : (
                                                            supplier.status === 'active' ? <ToggleOnIcon /> : <ToggleOffIcon />
                                                        )}
                                                    </IconButton>
                                                     </span> */}
                                                </Tooltip>
                                                <Tooltip title="Eliminar proveedor">
                                                    <IconButton
                                                        onClick={() => handleDelete(supplier.id)}
                                                        sx={{
                                                            color: '#dc3545',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(220,53,69,0.08)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 2, py: 1 }}>
                        <TablePagination
                            component="div"
                            count={totalCount}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 15, 25]}
                        />
                    </Box>
                </Paper>
                </Box>
            </Box>

            {/* Modal para Crear/Editar Proveedor */}
            <Dialog 
                open={openDialog} 
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
                        🏢
                    </Box>
                    {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </DialogTitle>
                
                <DialogContent sx={{ p: 4, background: 'rgba(255, 255, 255, 0.98)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nombre del Proveedor *"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email de Contacto *"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="NIT / RUC"
                                value={formData.tax_id}
                                onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Persona de Contacto"
                                value={formData.contact_person}
                                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Dirección"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notas Adicionales"
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#8B5FBF'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#8B5FBF'
                                    }
                                }}
                            />
                        </Grid>
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
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
                            borderRadius: 2,
                            px: 3,
                            fontWeight: 'bold'
                        }}
                    >
                        {selectedSupplier ? 'Actualizar' : 'Crear'} Proveedor
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Suppliers;
