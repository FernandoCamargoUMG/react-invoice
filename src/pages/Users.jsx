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
    Fab
} from '@mui/material';
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
    FilterList as FilterIcon
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
        role: 'user'
    });
    const [alert, setAlert] = useState({ open: false, message: '', type: 'success' });

    // Datos de ejemplo
    const sampleUsers = [
        { id: 1, name: 'Admin Test', email: 'admin@test.com', role: 'admin', status: 'active', created_at: '2024-01-15' },
        { id: 2, name: 'Juan Pérez', email: 'juan@empresa.com', role: 'user', status: 'active', created_at: '2024-02-10' },
        { id: 3, name: 'María González', email: 'maria@empresa.com', role: 'supervisor', status: 'active', created_at: '2024-02-20' },
        { id: 4, name: 'Carlos López', email: 'carlos@empresa.com', role: 'user', status: 'inactive', created_at: '2024-03-05' }
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setLoading(true);
        // Simular carga de API
        setTimeout(() => {
            setUsers(sampleUsers);
            setLoading(false);
        }, 1000);
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
                role: 'user'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
        });
    };

    const handleSaveUser = () => {
        if (editingUser) {
            // Actualizar usuario existente
            setUsers(users.map(user => 
                user.id === editingUser.id 
                    ? { ...user, ...formData }
                    : user
            ));
            setAlert({ open: true, message: 'Usuario actualizado exitosamente', type: 'success' });
        } else {
            // Crear nuevo usuario
            const newUser = {
                id: users.length + 1,
                ...formData,
                status: 'active',
                created_at: new Date().toISOString().split('T')[0]
            };
            setUsers([...users, newUser]);
            setAlert({ open: true, message: 'Usuario creado exitosamente', type: 'success' });
        }
        handleCloseDialog();
    };

    const handleDeleteUser = (userId) => {
        setUsers(users.filter(user => user.id !== userId));
        setAlert({ open: true, message: 'Usuario eliminado exitosamente', type: 'success' });
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <AdminIcon />;
            case 'supervisor': return <SupervisorIcon />;
            default: return <UserIcon />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'linear-gradient(45deg, #f44336, #d32f2f)';
            case 'supervisor': return 'linear-gradient(45deg, #ff9800, #f57c00)';
            default: return 'linear-gradient(45deg, #4caf50, #388e3c)';
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'success' : 'default';
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
        supervisor: users.filter(u => u.role === 'supervisor').length,
        user: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.status === 'active').length
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
                        { title: 'Total Usuarios', value: stats.total, icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #2196F3, #1976D2)' },
                        { title: 'Administradores', value: stats.admin, icon: <AdminIcon />, gradient: 'linear-gradient(135deg, #f44336, #d32f2f)' },
                        { title: 'Supervisores', value: stats.supervisor, icon: <SupervisorIcon />, gradient: 'linear-gradient(135deg, #ff9800, #f57c00)' },
                        { title: 'Activos', value: stats.active, icon: <UserIcon />, gradient: 'linear-gradient(135deg, #4CAF50, #45A049)' }
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
                                    <MenuItem value="supervisor">Supervisores</MenuItem>
                                    <MenuItem value="user">Usuarios</MenuItem>
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
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Usuario</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Rol</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Fecha Creación</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
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
                                                label={user.role.toUpperCase()}
                                                sx={{
                                                    background: getRoleColor(user.role),
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    borderRadius: 2
                                                }}
                                                icon={getRoleIcon(user.role)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.status === 'active' ? 'Activo' : 'Inactivo'}
                                                color={getStatusColor(user.status)}
                                                variant="filled"
                                                sx={{ borderRadius: 2, fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handleOpenDialog(user)}
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
                                                    onClick={() => handleDeleteUser(user.id)}
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
                </Paper>
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
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRadius: '16px 16px 0 0'
                }}>
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre Completo"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    <MenuItem value="user">Usuario</MenuItem>
                                    <MenuItem value="supervisor">Supervisor</MenuItem>
                                    <MenuItem value="admin">Administrador</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={handleCloseDialog}
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
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSaveUser}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            borderRadius: 3,
                            px: 3,
                            py: 1.5,
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {editingUser ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
