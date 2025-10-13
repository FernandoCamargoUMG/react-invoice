import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';

const PurchaseModal = ({ 
    open, 
    onClose, 
    onSave,
    editMode,
    suppliers,
    products,
    purchaseHeader,
    setPurchaseHeader,
    purchaseItems,
    setPurchaseItems,
    error,
    formatAmount,
    total 
}) => {

    const handleItemChange = (index, field, value) => {
        const newItems = [...purchaseItems];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Calcular total del item
        if (field === 'quantity' || field === 'cost_price') {
            const quantity = field === 'quantity' ? value : newItems[index].quantity;
            const cost_price = field === 'cost_price' ? value : newItems[index].cost_price;
            newItems[index].total_cost = quantity * cost_price;
        }
        
        setPurchaseItems(newItems);
    };

    const handleAddItem = () => {
        setPurchaseItems([...purchaseItems, { product_id: '', quantity: 1, cost_price: 0, total_cost: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = purchaseItems.filter((_, i) => i !== index);
        setPurchaseItems(newItems);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px rgba(139, 95, 191, 0.3)'
                }
            }}
        >
            <DialogTitle sx={{ 
                p: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                textAlign: 'center'
            }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                }}>
                    🛒 {editMode ? 'Editar Compra' : 'Nueva Compra'}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ 
                p: 0, 
                backgroundColor: 'white',
                borderRadius: '0 0 16px 16px',
                position: 'relative'
            }}>
                {error && (
                    <Box sx={{ 
                        p: 3,
                        m: 4, 
                        mb: 0,
                        backgroundColor: '#fff5f5', 
                        border: '1px solid #fed7d7',
                        borderRadius: 2,
                        color: '#c53030',
                        borderLeft: '4px solid #f56565'
                    }}>
                        {error}
                    </Box>
                )}

                {/* Información de la Compra */}
                <Box sx={{ p: 4, pb: 0 }}>
                    <Typography variant="h6" sx={{ 
                        mb: 3, 
                        color: '#4a5568', 
                        fontWeight: 700,
                        borderBottom: '2px solid #8B5FBF',
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        📋 Información de la Compra
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                borderRadius: 4,
                                padding: 2.5,
                                border: '2px solid #e3f2fd',
                                boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    border: '2px solid #8B5FBF',
                                    boxShadow: '0 12px 35px rgba(139, 95, 191, 0.2)',
                                    transform: 'translateY(-4px) scale(1.01)'
                                }
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2, 
                                    mb: 2 
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                                    }}>
                                        🏢
                                    </Box>
                                    <Typography variant="h6" sx={{ 
                                        color: '#8B5FBF', 
                                        fontWeight: 700,
                                        fontSize: '1.1rem'
                                    }}>
                                        Proveedor *
                                    </Typography>
                                </Box>
                                <Autocomplete
                                    options={suppliers || []}
                                    getOptionLabel={(option) => option?.name || ''}
                                    value={suppliers?.find(s => s.id === purchaseHeader.supplier_id) || null}
                                    onChange={(e, value) => setPurchaseHeader({ ...purchaseHeader, supplier_id: value?.id || '' })}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Escriba el nombre del proveedor..."
                                            fullWidth
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    borderRadius: 3,
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '1rem',
                                                    padding: '2px',
                                                    '&:hover': {
                                                        border: '1px solid #cbd5e0'
                                                    },
                                                    '&.Mui-focused': {
                                                        border: '2px solid #8B5FBF',
                                                        boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)'
                                                    }
                                                },
                                                '& .MuiInputBase-input': {
                                                    padding: '12px 14px'
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                borderRadius: 4,
                                padding: 2.5,
                                border: '2px solid #e3f2fd',
                                boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    border: '2px solid #8B5FBF',
                                    boxShadow: '0 12px 35px rgba(139, 95, 191, 0.2)',
                                    transform: 'translateY(-4px) scale(1.01)'
                                }
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2, 
                                    mb: 2 
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                                    }}>
                                        📅
                                    </Box>
                                    <Typography variant="h6" sx={{ 
                                        color: '#8B5FBF', 
                                        fontWeight: 700,
                                        fontSize: '1.1rem'
                                    }}>
                                        Fecha de Compra
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    type="date"
                                    value={purchaseHeader.purchase_date}
                                    onChange={(e) => setPurchaseHeader({ ...purchaseHeader, purchase_date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            background: 'white',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#8B5FBF',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#8B5FBF',
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Productos */}
                <Box sx={{ px: 4, py: 3 }}>
                    <Typography variant="h6" sx={{ 
                        mb: 3, 
                        color: '#4a5568', 
                        fontWeight: 700,
                        borderBottom: '2px solid #8B5FBF',
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        🛍️ Productos de la Compra
                    </Typography>
                    
                    {purchaseItems.map((item, index) => (
                        <Box key={index} sx={{ 
                            mb: 3, 
                            p: 3, 
                            backgroundColor: '#f8fafc',
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: '#f1f5f9',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }
                        }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={5}>
                                    <Box sx={{
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                        borderRadius: 4,
                                        padding: 2.5,
                                        border: '2px solid #e3f2fd',
                                        boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            border: '2px solid #8B5FBF',
                                            boxShadow: '0 12px 35px rgba(139, 95, 191, 0.2)',
                                            transform: 'translateY(-4px) scale(1.01)'
                                        }
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2, 
                                            mb: 2 
                                        }}>
                                            <Box sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.1rem',
                                                boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                                            }}>
                                                🛒
                                            </Box>
                                            <Typography variant="h6" sx={{ 
                                                color: '#8B5FBF', 
                                                fontWeight: 700,
                                                fontSize: '1.1rem'
                                            }}>
                                                Producto a Comprar *
                                            </Typography>
                                        </Box>
                                        <Autocomplete
                                            options={products || []}
                                            getOptionLabel={(option) => option?.name || ''}
                                            value={products?.find(p => p.id === item.product_id) || null}
                                            onChange={(e, value) => handleItemChange(index, 'product_id', value?.id || '')}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Escriba el nombre del producto..."
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'white',
                                                            borderRadius: 3,
                                                            border: '1px solid #e2e8f0',
                                                            fontSize: '1rem',
                                                            padding: '2px',
                                                            '&:hover': {
                                                                border: '1px solid #cbd5e0'
                                                            },
                                                            '&.Mui-focused': {
                                                                border: '2px solid #8B5FBF',
                                                                boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)'
                                                            }
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            padding: '12px 14px'
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={6} md={2}>
                                    <Box sx={{
                                        background: 'linear-gradient(145deg, #ffffff 0%, #fefce8 100%)',
                                        borderRadius: 4,
                                        padding: 2,
                                        border: '2px solid #fde047',
                                        boxShadow: '0 4px 20px rgba(234, 179, 8, 0.08)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            border: '2px solid #eab308',
                                            boxShadow: '0 8px 25px rgba(234, 179, 8, 0.2)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, 
                                            mb: 1.5 
                                        }}>
                                            <Box sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem'
                                            }}>
                                                📊
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#eab308', 
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Cantidad *
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    borderRadius: 2,
                                                    fontSize: '1rem',
                                                    '& fieldset': { border: 'none' }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={6} md={2}>
                                    <Box sx={{
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)',
                                        borderRadius: 4,
                                        padding: 2,
                                        border: '2px solid #0ea5e9',
                                        boxShadow: '0 4px 20px rgba(14, 165, 233, 0.08)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            border: '2px solid #0284c7',
                                            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.2)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, 
                                            mb: 1.5 
                                        }}>
                                            <Box sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem'
                                            }}>
                                                💰
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#0ea5e9', 
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Precio Costo *
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={item.cost_price}
                                            onChange={(e) => handleItemChange(index, 'cost_price', e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    borderRadius: 2,
                                                    fontSize: '1rem',
                                                    '& fieldset': { border: 'none' }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={6} md={2}>
                                    <Box sx={{
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                                        borderRadius: 4,
                                        padding: 2,
                                        border: '2px solid #22c55e',
                                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.08)'
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, 
                                            mb: 1.5 
                                        }}>
                                            <Box sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem'
                                            }}>
                                                💵
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#22c55e', 
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Total
                                            </Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#16a34a',
                                            fontWeight: 800,
                                            fontSize: '1.1rem'
                                        }}>
                                            {formatAmount(item.total_cost || 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={6} md={1}>
                                    <IconButton
                                        onClick={() => handleRemoveItem(index)}
                                        sx={{
                                            color: '#dc2626',
                                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                            borderRadius: 2,
                                            padding: 1.5,
                                            '&:hover': {
                                                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                    
                    <Box sx={{ 
                        textAlign: 'center', 
                        mt: 3,
                        p: 2,
                        backgroundColor: '#f8fafc',
                        borderRadius: 3,
                        border: '2px dashed #cbd5e0'
                    }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddItem}
                            sx={{
                                color: '#8B5FBF',
                                borderColor: '#8B5FBF',
                                fontWeight: 600,
                                borderRadius: 2,
                                padding: '12px 24px',
                                '&:hover': {
                                    backgroundColor: 'rgba(139, 95, 191, 0.1)',
                                    borderColor: '#6A4C93'
                                }
                            }}
                        >
                            Agregar Producto
                        </Button>
                    </Box>
                </Box>

                {/* Notas */}
                <Box sx={{ px: 4, pb: 4 }}>
                    <Box sx={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                        borderRadius: 4,
                        padding: 2.5,
                        border: '2px solid #e3f2fd',
                        boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)'
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mb: 2 
                        }}>
                            <Box sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)'
                            }}>
                                📝
                            </Box>
                            <Typography variant="h6" sx={{ 
                                color: '#8B5FBF', 
                                fontWeight: 700,
                                fontSize: '1.1rem'
                            }}>
                                Notas (Opcional)
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Añade observaciones o detalles adicionales sobre esta compra..."
                            value={purchaseHeader.notes}
                            onChange={(e) => setPurchaseHeader({ ...purchaseHeader, notes: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    background: 'white',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#8B5FBF',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#8B5FBF',
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
                gap: 2,
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 800,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        💰 Total: {formatAmount(total)}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        onClick={onClose}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        variant="outlined"
                    >
                        CANCELAR
                    </Button>
                    <Button 
                        onClick={onSave}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            boxShadow: '0 6px 20px rgba(46, 139, 87, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #228B22 0%, #2E8B57 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(46, 139, 87, 0.4)'
                            }
                        }}
                    >
                        {editMode ? '💾 ACTUALIZAR COMPRA' : '✨ CREAR COMPRA'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default PurchaseModal;