import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    Autocomplete,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const InvoiceModal = ({ 
    open, 
    onClose, 
    onSave,
    editMode,
    customers,
    products,
    invoiceHeader,
    setInvoiceHeader,
    invoiceItems,
    setInvoiceItems,
    error,
    formatAmount,
    total 
}) => {

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceItems];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Si se selecciona un producto, actualizar automáticamente el precio
        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].price = Number(product.price);
            }
        }
        
        setInvoiceItems(newItems);
    };

    const handleAddItem = () => {
        setInvoiceItems([
            ...invoiceItems,
            { product_id: '', quantity: 1, price: 0 }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (invoiceItems.length > 1) {
            setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
        }
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px rgba(102, 126, 234, 0.3)'
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
                    📄 {editMode ? 'Editar Factura' : 'Nueva Factura'}
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

                {/* Información de la Factura */}
                <Box sx={{ p: 4, pb: 0 }}>
                    <Typography variant="h6" sx={{ 
                        mb: 3, 
                        color: '#4a5568', 
                        fontWeight: 700,
                        borderBottom: '2px solid #667eea',
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        📋 Información de la Factura
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                borderRadius: 4,
                                padding: 2.5,
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
                                    mb: 2 
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    }}>
                                        👤
                                    </Box>
                                    <Typography variant="h6" sx={{ 
                                        color: '#667eea', 
                                        fontWeight: 700,
                                        fontSize: '1.1rem'
                                    }}>
                                        Cliente Facturación *
                                    </Typography>
                                </Box>
                                <Autocomplete
                                    options={customers}
                                    getOptionLabel={(option) => option.name}
                                    value={customers.find(c => c.id === invoiceHeader.customer_id) || null}
                                    onChange={(e, value) => setInvoiceHeader({ ...invoiceHeader, customer_id: value?.id || '' })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Escriba el nombre del cliente..."
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
                                                        border: '2px solid #667eea',
                                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                                    }
                                                },
                                                '& .MuiInputBase-input': {
                                                    padding: '12px 14px'
                                                }
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box 
                                            component="li" 
                                            {...props}
                                            sx={{
                                                padding: '24px 20px !important',
                                                borderBottom: '1px solid #f7fafc',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                minHeight: '120px !important',
                                                height: 'auto !important',
                                                display: 'flex !important',
                                                alignItems: 'flex-start !important',
                                                '&:hover': {
                                                    backgroundColor: '#f8faff',
                                                    borderLeft: '4px solid #667eea'
                                                },
                                                '&:last-child': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                        >
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: 3, 
                                                width: '100%',
                                                paddingTop: '8px'
                                            }}>
                                                <Box sx={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '1.3rem',
                                                    fontWeight: 'bold',
                                                    flexShrink: 0,
                                                    boxShadow: '0 3px 10px rgba(102, 126, 234, 0.3)',
                                                    marginTop: '4px'
                                                }}>
                                                    {option.name.charAt(0).toUpperCase()}
                                                </Box>
                                                <Box sx={{ 
                                                    flex: 1, 
                                                    minWidth: 0, 
                                                    paddingTop: '4px',
                                                    paddingRight: '8px'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ 
                                                        fontWeight: 700, 
                                                        color: '#2d3748',
                                                        fontSize: '1.1rem',
                                                        marginBottom: '10px',
                                                        lineHeight: 1.5,
                                                        wordWrap: 'break-word'
                                                    }}>
                                                        {option.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        color: '#667eea', 
                                                        fontSize: '0.9rem',
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        lineHeight: 1.6,
                                                        wordWrap: 'break-word',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        📧 {option.email}
                                                    </Typography>
                                                    {option.phone && (
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#48bb78', 
                                                            fontSize: '0.9rem',
                                                            display: 'block',
                                                            lineHeight: 1.6,
                                                            wordWrap: 'break-word'
                                                        }}>
                                                            📞 {option.phone}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                    noOptionsText="No se encontraron clientes"
                                    loadingText="Cargando clientes..."
                                    ListboxProps={{
                                        sx: {
                                            maxHeight: '500px',
                                            '& .MuiAutocomplete-option': {
                                                padding: '0 !important',
                                                minHeight: '120px !important',
                                                height: 'auto !important'
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                            <Box sx={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #fff5f0 100%)',
                                borderRadius: 4,
                                padding: 2.5,
                                border: '2px solid #fed7ab',
                                boxShadow: '0 4px 20px rgba(251, 146, 60, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    border: '2px solid #fb923c',
                                    boxShadow: '0 12px 35px rgba(251, 146, 60, 0.2)',
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
                                        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.3)'
                                    }}>
                                        📅
                                    </Box>
                                    <Typography variant="h6" sx={{ 
                                        color: '#fb923c', 
                                        fontWeight: 700,
                                        fontSize: '1.1rem'
                                    }}>
                                        Fecha Emisión *
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    type="date"
                                    value={invoiceHeader.date}
                                    onChange={(e) => setInvoiceHeader({ ...invoiceHeader, date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
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
                                                border: '2px solid #fb923c',
                                                boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.1)'
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '12px 14px'
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                            <Box sx={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)',
                                borderRadius: 4,
                                padding: 2.5,
                                border: '2px solid #bfdbfe',
                                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    border: '2px solid #3b82f6',
                                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.2)',
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
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }}>
                                        💼
                                    </Box>
                                    <Typography variant="h6" sx={{ 
                                        color: '#3b82f6', 
                                        fontWeight: 700,
                                        fontSize: '1.1rem'
                                    }}>
                                        Estado Factura *
                                    </Typography>
                                </Box>
                                <FormControl fullWidth>
                                    <Select
                                        value={invoiceHeader.status}
                                        onChange={(e) => setInvoiceHeader({ ...invoiceHeader, status: e.target.value })}
                                        disabled={editMode}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: editMode ? '#f5f5f5' : 'white',
                                            borderRadius: 3,
                                            border: editMode ? '1px solid #d0d0d0' : '1px solid #e2e8f0',
                                            opacity: editMode ? 0.6 : 1,
                                            '&:hover': {
                                                border: editMode ? '1px solid #d0d0d0' : '1px solid #cbd5e0'
                                            },
                                            '&.Mui-focused': {
                                                border: editMode ? '1px solid #d0d0d0' : '2px solid #3b82f6',
                                                boxShadow: editMode ? 'none' : '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                            },
                                            '& fieldset': { border: 'none' }
                                        }}
                                    >
                                        <MenuItem value="pending" sx={{ 
                                            padding: '12px 16px',
                                            '&:hover': { backgroundColor: '#fef3c7' }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{ 
                                                    width: 8, 
                                                    height: 8, 
                                                    borderRadius: '50%', 
                                                    backgroundColor: '#f59e0b' 
                                                }} />
                                                ⏳ Pendiente
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="paid" sx={{ 
                                            padding: '12px 16px',
                                            '&:hover': { backgroundColor: '#dcfce7' }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{ 
                                                    width: 8, 
                                                    height: 8, 
                                                    borderRadius: '50%', 
                                                    backgroundColor: '#22c55e' 
                                                }} />
                                                ✅ Pagado
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                    {editMode && (
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            mt: 1, 
                                            fontStyle: 'italic',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            🔒 El estado no se puede cambiar al editar facturas
                                        </Typography>
                                    )}
                                </FormControl>
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
                        borderBottom: '2px solid #667eea',
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        🛍️ Productos de la Factura
                    </Typography>
                    
                    {invoiceItems.map((item, index) => (
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
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f0fff4 100%)',
                                        borderRadius: 4,
                                        padding: 2.5,
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
                                            mb: 2 
                                        }}>
                                            <Box sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.1rem',
                                                boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
                                            }}>
                                                🛒
                                            </Box>
                                            <Typography variant="h6" sx={{ 
                                                color: '#48bb78', 
                                                fontWeight: 700,
                                                fontSize: '1.1rem'
                                            }}>
                                                Producto a Facturar *
                                            </Typography>
                                        </Box>
                                        <Autocomplete
                                            options={products}
                                            getOptionLabel={(option) => option.name}
                                            value={products.find(p => p.id === item.product_id) || null}
                                            onChange={(e, value) => handleItemChange(index, 'product_id', value?.id || '')}
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
                                                                border: '2px solid #48bb78',
                                                                boxShadow: '0 0 0 3px rgba(72, 187, 120, 0.1)'
                                                            }
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            padding: '12px 14px'
                                                        }
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box 
                                                    component="li" 
                                                    {...props}
                                                    sx={{
                                                        padding: '16px 20px !important',
                                                        borderBottom: '1px solid #f0fff4',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#f0fff4',
                                                            borderLeft: '4px solid #48bb78'
                                                        },
                                                        '&:last-child': {
                                                            borderBottom: 'none'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 3, 
                                                        width: '100%' 
                                                    }}>
                                                        <Box sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '1.3rem',
                                                            fontWeight: 'bold',
                                                            flexShrink: 0,
                                                            boxShadow: '0 3px 10px rgba(72, 187, 120, 0.3)'
                                                        }}>
                                                            🛒
                                                        </Box>
                                                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                                            <Typography variant="subtitle1" sx={{ 
                                                                fontWeight: 700, 
                                                                color: '#2d3748',
                                                                fontSize: '1rem',
                                                                mb: 0.8,
                                                                lineHeight: 1.3
                                                            }}>
                                                                {option.name}
                                                            </Typography>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: 1.5, 
                                                                flexWrap: 'wrap',
                                                                mb: option.description ? 0.8 : 0
                                                            }}>
                                                                <Typography variant="body2" sx={{ 
                                                                    color: '#48bb78',
                                                                    fontSize: '0.8rem',
                                                                    background: 'rgba(72, 187, 120, 0.15)',
                                                                    padding: '3px 8px',
                                                                    borderRadius: 2,
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5,
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    📦 Stock: {option.stock}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ 
                                                                    fontWeight: 800, 
                                                                    color: 'white',
                                                                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                                                    padding: '4px 10px',
                                                                    borderRadius: 2,
                                                                    fontSize: '0.85rem',
                                                                    boxShadow: '0 2px 8px rgba(72, 187, 120, 0.3)',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    💰 {formatAmount(option.price)}
                                                                </Typography>
                                                            </Box>
                                                            {option.description && (
                                                                <Typography variant="body2" sx={{ 
                                                                    color: '#718096',
                                                                    fontSize: '0.85rem',
                                                                    fontStyle: 'italic',
                                                                    background: 'rgba(113, 128, 150, 0.1)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: 1,
                                                                    borderLeft: '3px solid #48bb78'
                                                                }}>
                                                                    {option.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )}
                                            noOptionsText="No se encontraron productos"
                                            loadingText="Cargando productos..."
                                            ListboxProps={{
                                                sx: {
                                                    maxHeight: '400px',
                                                    '& .MuiAutocomplete-option': {
                                                        padding: 0,
                                                        minHeight: '90px'
                                                    }
                                                }
                                            }}
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
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                            inputProps={{ min: 1 }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    borderRadius: 2,
                                                    border: 'none',
                                                    '&.Mui-focused': {
                                                        boxShadow: '0 0 0 2px rgba(234, 179, 8, 0.3)'
                                                    }
                                                },
                                                '& fieldset': { border: 'none' }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={6} md={3}>
                                    <Box sx={{
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                                        borderRadius: 4,
                                        padding: 2,
                                        border: '2px solid #86efac',
                                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.08)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            border: '2px solid #22c55e',
                                            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.2)',
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
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem'
                                            }}>
                                                💰
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ 
                                                color: '#22c55e', 
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Precio *
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                            inputProps={{ min: 0, step: 0.01 }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    borderRadius: 2,
                                                    border: 'none',
                                                    '&.Mui-focused': {
                                                        boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)'
                                                    }
                                                },
                                                '& fieldset': { border: 'none' }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={2}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <IconButton
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={invoiceItems.length === 1}
                                            sx={{
                                                backgroundColor: '#fed7d7',
                                                color: '#c53030',
                                                '&:hover': {
                                                    backgroundColor: '#feb2b2',
                                                    transform: 'scale(1.05)'
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                        {index === invoiceItems.length - 1 && (
                                            <IconButton
                                                onClick={handleAddItem}
                                                sx={{
                                                    backgroundColor: '#c6f6d5',
                                                    color: '#2f855a',
                                                    '&:hover': {
                                                        backgroundColor: '#9ae6b4',
                                                        transform: 'scale(1.05)'
                                                    },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                </Box>

                {/* Total */}
                <Box sx={{ px: 4, pb: 0 }}>
                    <Box sx={{ 
                        p: 4, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        mb: 4,
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                    }}>
                        <Typography variant="h4" sx={{ 
                            textAlign: 'right', 
                            fontWeight: 'bold',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 2
                        }}>
                            💰 Total: {formatAmount(total)}
                        </Typography>
                    </Box>

                    {/* Notas */}
                    <TextField
                        fullWidth
                        label="📝 Notas Adicionales"
                        multiline
                        rows={4}
                        value={invoiceHeader.notes}
                        onChange={(e) => setInvoiceHeader({ ...invoiceHeader, notes: e.target.value })}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: 'white',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'white',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                                }
                            }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ 
                p: 4, 
                gap: 3,
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0'
            }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    size="large"
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        borderColor: '#cbd5e0',
                        color: '#4a5568',
                        '&:hover': {
                            borderColor: '#a0aec0',
                            backgroundColor: '#f7fafc',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    ❌ Cancelar
                </Button>
                <Button 
                    onClick={onSave}
                    variant="contained"
                    size="large"
                    sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    ✨ {editMode ? 'Actualizar' : 'Crear'} Factura
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvoiceModal;