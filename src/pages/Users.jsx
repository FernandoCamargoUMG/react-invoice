import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Button,
    Paper,
    IconButton,
    Badge,
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
    CircularProgress,
    Snackbar
} from '@mui/material';
import { apiGet, apiPost, apiPut, apiDelete, API_CONFIG } from '../config/api';
import {
    People as PeopleIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    SupervisorAccount as SupervisorIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'cashier'
    });
    const [alert, setAlert] = useState({ open: false, message: '', type: 'success' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Navegación simple
    const handleBack = () => window.history.back();
    const handleHome = () => (window.location.href = import.meta.env.BASE_URL || '/');
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        sessionStorage.removeItem('user');
    window.location.href = import.meta.env.BASE_URL || '/';
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await apiGet(API_CONFIG.ENDPOINTS.USERS);
            const data = await response.json();
            
            if (response.ok) {
                setUsers(data.data || []);
            } else {
                setAlert({ open: true, message: data.message || 'Error al cargar usuarios', type: 'error' });
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setAlert({ open: true, message: 'Error de conexión al cargar usuarios', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'cashier'
            });
        }
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'cashier'
        });
        setErrors({});
        setSubmitting(false);
    };

    const handleSaveUser = async () => {
        if (submitting) return;
        
        setSubmitting(true);
        setErrors({});

        // Validaciones básicas
        if (!formData.name.trim()) {
            setErrors({ name: 'El nombre es requerido' });
            setSubmitting(false);
            return;
        }
        if (!formData.email.trim()) {
            setErrors({ email: 'El email es requerido' });
            setSubmitting(false);
            return;
        }
        if (!editingUser && !formData.password.trim()) {
            setErrors({ password: 'La contraseña es requerida' });
            setSubmitting(false);
            return;
        }

        try {
            let response;
            let data;

            if (editingUser) {
                // Actualizar usuario existente
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                };
                
                // Solo incluir password si se proporcionó
                if (formData.password.trim()) {
                    updateData.password = formData.password;
                }

                response = await apiPut(`${API_CONFIG.ENDPOINTS.USERS}/${editingUser.id}`, updateData);
                data = await response.json();

                if (response.ok) {
                    await loadUsers(); // Recargar la lista
                    setAlert({ open: true, message: 'Usuario actualizado exitosamente', type: 'success' });
                    handleCloseDialog();
                } else {
                    if (data.errors) {
                        setErrors(data.errors);
                    } else {
                        setAlert({ open: true, message: data.message || 'Error al actualizar usuario', type: 'error' });
                    }
                }
            } else {
                // Crear nuevo usuario
                response = await apiPost(API_CONFIG.ENDPOINTS.USERS, formData);
                data = await response.json();

                if (response.ok) {
                    await loadUsers(); // Recargar la lista
                    setAlert({ open: true, message: 'Usuario creado exitosamente', type: 'success' });
                    handleCloseDialog();
                } else {
                    if (data.errors) {
                        setErrors(data.errors);
                    } else {
                        setAlert({ open: true, message: data.message || 'Error al crear usuario', type: 'error' });
                    }
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            setAlert({ open: true, message: 'Error de conexión al guardar usuario', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        try {
            const response = await apiDelete(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`);
            const data = await response.json();

            if (response.ok) {
                await loadUsers(); // Recargar la lista
                setAlert({ open: true, message: 'Usuario eliminado exitosamente', type: 'success' });
            } else {
                setAlert({ open: true, message: data.message || 'Error al eliminar usuario', type: 'error' });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setAlert({ open: true, message: 'Error de conexión al eliminar usuario', type: 'error' });
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <AdminIcon />;
            case 'cashier': return <SupervisorIcon />;
            default: return <UserIcon />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'linear-gradient(45deg, #7c3aed, #a855f7)';
            case 'cashier': return 'linear-gradient(45deg, #6d28d9, #8b5cf6)';
            default: return 'linear-gradient(45deg, #4caf50, #388e3c)';
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'success' : 'default';
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch {
            return dateString;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        cashier: users.filter(u => u.role === 'cashier').length,
        active: users.length // Todos los usuarios se consideran activos por defecto
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
                            <PeopleIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 'bold', 
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                👥 Gestión de Usuarios
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administra usuarios y roles del sistema
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            startIcon={<ArrowBackIcon />}
                            sx={{ 
                                borderColor: '#8B5FBF',
                                color: '#8B5FBF',
                                '&:hover': { 
                                    borderColor: '#6A4C93', 
                                    background: 'rgba(139, 95, 191, 0.1)' 
                                }
                            }}
                        >
                            Atrás
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleHome}
                            startIcon={<HomeIcon />}
                            sx={{
                                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                                '&:hover': { 
                                    background: 'linear-gradient(45deg, #26d0ce, #38a085)' 
                                }
                            }}
                        >
                            Inicio
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                borderColor: '#ff6b6b',
                                color: '#ff6b6b',
                                '&:hover': { 
                                    borderColor: '#ee5a24', 
                                    background: 'rgba(255, 107, 107, 0.1)' 
                                }
                            }}
                        >
                            Cerrar sesión
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
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
                            Nuevo Usuario
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
                {/* Alert */}
                {alert.open && (
                    <Alert 
                        severity={alert.type} 
                        onClose={() => setAlert({ ...alert, open: false })}
                        sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        {alert.message}
                    </Alert>
                )}

                {/* Estadísticas */}
                <Grid container spacing={3}>
                    {[
                        { title: 'Total Usuarios', value: loading ? '...' : stats.total, icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
                        { title: 'Administradores', value: loading ? '...' : stats.admin, icon: <AdminIcon />, gradient: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' },
                        { title: 'Cajeros', value: loading ? '...' : stats.cashier, icon: <SupervisorIcon />, gradient: 'linear-gradient(135deg, #9333ea, #c084fc)' },
                        { title: 'Total Activos', value: loading ? '...' : stats.active, icon: <UserIcon />, gradient: 'linear-gradient(135deg, #4CAF50, #45A049)' }
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
                                    mb: 0.5
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
                                placeholder="Buscar usuarios..."
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
                                <InputLabel>Filtrar por Rol</InputLabel>
                                <Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <MenuItem value="all">Todos los roles</MenuItem>
                                    <MenuItem value="admin">Administradores</MenuItem>
                                    <MenuItem value="cashier">Cajeros</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                {filteredUsers.length} usuario(s) encontrado(s)
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Tabla de Usuarios */}
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
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #7c3aed, #a855f7)', color: 'white' }}>Usuario</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #7c3aed, #a855f7)', color: 'white' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #7c3aed, #a855f7)', color: 'white' }}>Rol</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #7c3aed, #a855f7)', color: 'white' }}>Fecha Creación</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #7c3aed, #a855f7)', color: 'white' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                                            <CircularProgress sx={{ color: '#7c3aed' }} />
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                Cargando usuarios...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No se encontraron usuarios
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.map((user) => (
                                    <TableRow key={user.id} sx={{ 
                                        '&:hover': { 
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            transform: 'scale(1.01)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ 
                                                    background: getRoleColor(user.role),
                                                    width: 40,
                                                    height: 40
                                                }}>
                                                    {getRoleIcon(user.role)}
                                                </Avatar>
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                    {user.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role === 'admin' ? 'ADMINISTRADOR' : 'CAJERO'}
                                                sx={{
                                                    background: getRoleColor(user.role),
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    borderRadius: 2
                                                }}
                                                icon={getRoleIcon(user.role)}
                                            />
                                        </TableCell>
                                        <TableCell>{formatDate(user.created_at)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handleOpenDialog(user)}
                                                    sx={{
                                                        background: 'linear-gradient(45deg, #7c3aed, #a855f7)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #6d28d9, #9333ea)',
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    sx={{
                                                        background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #b91c1c, #991b1b)',
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
                </Paper>
            </Box>

            {/* FAB para móvil */}
            <Fab
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    background: 'linear-gradient(45deg, #7c3aed 30%, #a855f7 90%)',
                    display: { xs: 'flex', md: 'none' },
                    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #6d28d9 30%, #9333ea 90%)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 30px rgba(124, 58, 237, 0.6)'
                    }
                }}
                onClick={() => handleOpenDialog()}
            >
                <AddIcon />
            </Fab>

            {/* Dialog de Usuario */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 20px 40px rgba(31, 38, 135, 0.3)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(45deg, #7c3aed, #a855f7)',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRadius: '16px 16px 0 0'
                }}>
                    {editingUser ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre Completo"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!errors.name}
                                helperText={errors.name}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={!!errors.email}
                                helperText={errors.email}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={!!errors.password}
                                helperText={errors.password}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Rol</InputLabel>
                                <Select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <MenuItem value="cashier">Cajero</MenuItem>
                                    <MenuItem value="admin">Administrador</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        disabled={submitting}
                        sx={{
                            borderRadius: 3,
                            px: 3,
                            py: 1.5,
                            color: '#7c3aed',
                            border: '2px solid #7c3aed',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'rgba(124, 58, 237, 0.1)'
                            },
                            '&:disabled': {
                                color: 'rgba(124, 58, 237, 0.5)',
                                borderColor: 'rgba(124, 58, 237, 0.5)'
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSaveUser}
                        variant="contained"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                            background: 'linear-gradient(45deg, #7c3aed, #a855f7)',
                            borderRadius: 3,
                            px: 3,
                            py: 1.5,
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #6d28d9, #9333ea)',
                                transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                                background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.5), rgba(168, 85, 247, 0.5))',
                            }
                        }}
                    >
                        {submitting ? (editingUser ? 'Actualizando...' : 'Creando...') : (editingUser ? 'Actualizar' : 'Crear')}
                    </Button>
                </DialogActions>
                </Dialog>

            {/* Snackbar para mensajes */}
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setAlert({ ...alert, open: false })} 
                    severity={alert.type}
                    sx={{ 
                        width: '100%',
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Users;