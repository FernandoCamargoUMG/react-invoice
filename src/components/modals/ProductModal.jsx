import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Box,
    Typography,
    Grid
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

const ProductModal = ({ 
    open, 
    onClose, 
    onSave,
    editMode,
    formData,
    setFormData,
    error 
}) => {

    const handleSubmit = () => {
        onSave();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(10px)'
                }
            }}>
                <InventoryIcon sx={{ fontSize: 28, zIndex: 1 }} />
                <span style={{ zIndex: 1, position: 'relative' }}>
                    {editMode ? 'Editar Producto' : 'Nuevo Producto'}
                </span>
            </DialogTitle>
            
            <DialogContent sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)'
            }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                            borderRadius: 3,
                            padding: 3,
                            border: '2px solid #e3f2fd',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #667eea',
                                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.2)',
                                transform: 'translateY(-4px) scale(1.01)'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 2.5 
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    flexShrink: 0
                                }}>
                                    🏷️
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#667eea', 
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    Nombre del Producto *
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                placeholder="Ingrese el nombre del producto..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        '&:hover': {
                                            border: '1px solid #cbd5e0'
                                        },
                                        '&.Mui-focused': {
                                            border: '2px solid #667eea',
                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                        }
                                    },
                                    '& fieldset': { border: 'none' }
                                }}
                            />
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f0fff4 100%)',
                            borderRadius: 3,
                            padding: 3,
                            border: '2px solid #e8f5e8',
                            boxShadow: '0 4px 20px rgba(72, 187, 120, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #48bb78',
                                boxShadow: '0 12px 35px rgba(72, 187, 120, 0.2)',
                                transform: 'translateY(-4px) scale(1.01)'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 2.5 
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                                    flexShrink: 0
                                }}>
                                    📝
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#48bb78', 
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    Descripción del Producto
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Describa las características del producto..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        '&:hover': {
                                            border: '1px solid #cbd5e0'
                                        },
                                        '&.Mui-focused': {
                                            border: '2px solid #48bb78',
                                            boxShadow: '0 0 0 3px rgba(72, 187, 120, 0.1)'
                                        }
                                    },
                                    '& fieldset': { border: 'none' }
                                }}
                            />
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                            borderRadius: 3,
                            padding: 3,
                            border: '2px solid #86efac',
                            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #22c55e',
                                boxShadow: '0 12px 35px rgba(34, 197, 94, 0.2)',
                                transform: 'translateY(-4px) scale(1.01)'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 2.5 
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                    flexShrink: 0
                                }}>
                                    💰
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#22c55e', 
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    Precio *
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        '&:hover': {
                                            border: '1px solid #cbd5e0'
                                        },
                                        '&.Mui-focused': {
                                            border: '2px solid #22c55e',
                                            boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)'
                                        }
                                    },
                                    '& fieldset': { border: 'none' }
                                }}
                            />
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #fefce8 100%)',
                            borderRadius: 3,
                            padding: 3,
                            border: '2px solid #fde047',
                            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                border: '2px solid #eab308',
                                boxShadow: '0 12px 35px rgba(234, 179, 8, 0.2)',
                                transform: 'translateY(-4px) scale(1.01)'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                mb: 2.5 
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                                    flexShrink: 0
                                }}>
                                    📦
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#eab308', 
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    Stock
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                inputProps={{ min: 0 }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        '&:hover': {
                                            border: '1px solid #cbd5e0'
                                        },
                                        '&.Mui-focused': {
                                            border: '2px solid #eab308',
                                            boxShadow: '0 0 0 3px rgba(234, 179, 8, 0.1)'
                                        }
                                    },
                                    '& fieldset': { border: 'none' }
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button 
                    onClick={onClose}
                    startIcon={<CancelIcon />}
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
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<SaveIcon />}
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
                    {editMode ? 'Actualizar' : 'Crear'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductModal;