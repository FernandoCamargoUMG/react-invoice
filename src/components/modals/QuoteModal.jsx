import React from 'react';
import { applyProductDefaultsToItem, recalcItemTotal } from '../../utils/itemHelpers';
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
    Remove as RemoveIcon,
    CalendarToday as CalendarTodayIcon,
    MonetizationOn as MonetizationOnIcon,
    PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { generateQuotePdf } from '../../utils/reportQuote';

const QuoteModal = ({
    open,
    onClose,
    onSave,
    editMode,
    customers = [],
    products = [],
    quoteHeader,
    setQuoteHeader,
    quoteItems,
    setQuoteItems,
    error,
    formatAmount = (v) => v,
    total = 0,
    loadingCustomers = false,
    loadingProducts = false
}) => {

    const handleItemChange = (index, field, value) => {
        const newItems = [...(quoteItems || [])];
        // Normalizar números cuando vienen de inputs
        let normalized = value;
        if (field === 'quantity') normalized = parseFloat(value) || 0;
        if (field === 'price') normalized = parseFloat(value) || 0;

        newItems[index] = { ...newItems[index], [field]: normalized };

        // Recalcular total del item usando helper
        if (field === 'quantity' || field === 'price') {
            newItems[index] = recalcItemTotal(newItems[index], 'price', 'quantity', 'total_price');
        }

        setQuoteItems(newItems);
    };

    const handleAddItem = () => setQuoteItems([...(quoteItems || []), { product_id: '', quantity: 1, price: 0, total_price: 0 }]);
    const handleRemoveItem = (index) => { setQuoteItems((quoteItems || []).filter((_, i) => i !== index)); };

    const handleUseProductPrice = (index) => {
        const item = (quoteItems || [])[index] || {};
        const prod = (products || []).find(p => p.id === item.product_id);
        const prodPrice = prod ? Number(prod.price || prod.unit_price || prod.sale_price || 0) : 0;
        handleItemChange(index, 'price', prodPrice);
    };

    const handleExportPdf = () => {
        try {
            const customer = (customers || []).find(c => c.id === quoteHeader?.customer_id) || {};
            const itemsForPdf = (quoteItems || []).map(it => {
                const prod = (products || []).find(p => p.id === it.product_id) || {};
                return {
                    description: prod.name || it.description || prod.label || '-',
                    quantity: it.quantity ?? 1,
                    price: it.price ?? prod.price ?? 0,
                    total: it.total_price ?? ((it.quantity && it.price) ? it.quantity * it.price : undefined)
                };
            });

            const quote = { ...quoteHeader, total };
            const doc = generateQuotePdf({ quote, customer, items: itemsForPdf, meta: { companyName: 'Mi Empresa' } });
            const filename = `cotizacion-${quote.number || quote.quote_number || (quote.quote_date || new Date().toISOString().slice(0,10))}.pdf`;
            doc.save(filename);
        } catch (err) {
            console.error('Error generando PDF de cotización', err);
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
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #7b61d9 0%, #8b5fbf 50%, #6a4c93 100%)',
                    boxShadow: '0 30px 90px rgba(106,76,147,0.28)'
                }
            }}
        >
            <DialogTitle sx={{ 
                p: 4,
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                    🛒 {editMode ? 'Editar Cotización' : 'Nueva Cotización'}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0, backgroundColor: 'transparent' }}>
                {error && (
                    <Box sx={{ p: 3, m: 4, mb: 0, backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2, color: '#c53030', borderLeft: '4px solid #f56565' }}>{error}</Box>
                )}

                {/* White inner card that adapts Purchase visual */}
                <Box sx={{ mx: 4, mt: -6, mb: 4, background: '#fff', borderRadius: 4, p: 0, boxShadow: '0 10px 30px rgba(11,12,20,0.06)' }}>
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: '#4a5568', fontWeight: 700, borderBottom: '2px solid #8B5FBF', pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>📋 Información de la Cotización</Typography>

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
                                            Seleccionar Cliente *
                                        </Typography>
                                    </Box>
                                    <Autocomplete
                                        options={customers}
                                        getOptionLabel={(option) => option.name}
                                        value={customers.find(c => c.id === quoteHeader.customer_id) || null}
                                        onChange={(e, value) => setQuoteHeader({ ...quoteHeader, customer_id: value?.id || '' })}
                                        loading={loadingCustomers}
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

                            <Grid item xs={12} md={2}>
                                <Box sx={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                                    borderRadius: 4,
                                    padding: 2.5,
                                    border: '2px solid #e3f2fd',
                                    boxShadow: '0 4px 20px rgba(139, 95, 191, 0.08)'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(139, 95, 191, 0.3)' }}>📅</Box>
                                        <Typography variant="h6" sx={{ color: '#8B5FBF', fontWeight: 700, fontSize: '1.1rem' }}>Fechas</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <TextField fullWidth type="date" label="Fecha de Cotización" value={quoteHeader.quote_date || ''} onChange={(e) => setQuoteHeader({ ...quoteHeader, quote_date: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'white' } }} />
                                        <TextField fullWidth type="date" label="Válido hasta" value={quoteHeader.valid_until || ''} onChange={(e) => setQuoteHeader({ ...quoteHeader, valid_until: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'white' } }} />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            <TextField label="Notas" multiline rows={3} fullWidth value={quoteHeader.notes || ''} onChange={(e) => setQuoteHeader({ ...quoteHeader, notes: e.target.value })} sx={{ borderRadius: 2 }} />
                        </Box>
                    </Box>

                    {/* Productos */}
                    <Box sx={{ px: 4, py: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: '#4a5568', fontWeight: 700, borderBottom: '2px solid #8B5FBF', pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>🛍️ Productos de la Cotización</Typography>

                        {(quoteItems || []).map((item, index) => (
                            <Box key={index} sx={{ mb: 3, p: 3, backgroundColor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} md={5}>
                                        <Box sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)', borderRadius: 4, padding: 2.5, border: '2px solid #e3f2fd' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🛒</Box>
                                                <Typography variant="h6" sx={{ color: '#8B5FBF', fontWeight: 700, fontSize: '1.1rem' }}>Producto a Cotizar *</Typography>
                                            </Box>
                                            <Autocomplete
                                                options={products || []}
                                                getOptionLabel={(option) => option?.name || ''}
                                                value={(products || []).find(p => p.id === item.product_id) || null}
                                            onChange={(e, value) => {
                                                // Aplicar defaults del producto de forma atómica
                                                setQuoteItems(prev => {
                                                    const arr = [...(prev || [])];
                                                    const existing = arr[index] || { product_id: '', quantity: 1, price: 0, total_price: 0 };
                                                    const newItem = applyProductDefaultsToItem(existing, value, 'price', 'total_price', 'quantity');
                                                    arr[index] = newItem;
                                                    return arr;
                                                });
                                            }}
                                                loading={loadingProducts}
                                                renderInput={(params) => (
                                                    <TextField {...params} placeholder="Escriba el nombre del producto..." fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: 3, border: '1px solid #e2e8f0' }, '& .MuiInputBase-input': { padding: '12px 14px' } }} />
                                                )}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} md={2}>
                                        <Box sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #fefce8 100%)', borderRadius: 4, padding: 2, border: '2px solid #fde047' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📊</Box>
                                                <Typography variant="subtitle2" sx={{ color: '#eab308', fontWeight: 700, fontSize: '0.9rem' }}>Cantidad *</Typography>
                                            </Box>
                                            <TextField fullWidth type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: 2, '& fieldset': { border: 'none' } } }} />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} md={2}>
                                        <Box sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)', borderRadius: 4, padding: 2, border: '2px solid #0ea5e9' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>💰</Box>
                                                <Typography variant="subtitle2" sx={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.9rem' }}>Precio *</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <TextField fullWidth type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: 2, '& fieldset': { border: 'none' } } }} />
                                                <IconButton title="Usar precio del producto" onClick={() => handleUseProductPrice(index)} sx={{ bgcolor: '#e6f6ff', color: '#0284c7' }}>
                                                    <MonetizationOnIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} md={2}>
                                        <Box sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)', borderRadius: 4, padding: 2, border: '2px solid #22c55e' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>💵</Box>
                                                <Typography variant="subtitle2" sx={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>Total</Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: '#16a34a', fontWeight: 800, fontSize: '1.1rem' }}>{formatAmount(item.total_price || 0)}</Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} md={1}>
                                        <IconButton onClick={() => handleRemoveItem(index)} sx={{ color: '#dc2626', backgroundColor: 'rgba(220,38,38,0.1)', borderRadius: 2, padding: 1.5 }}>
                                            <RemoveIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Box sx={{ textAlign: 'center', mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 3, border: '2px dashed #cbd5e0' }}>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem} sx={{ color: '#8B5FBF', borderColor: '#8B5FBF', fontWeight: 600, borderRadius: 2, padding: '12px 24px' }}>Agregar Producto</Button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 0 }}>
                <Box sx={{ width: '100%', background: 'linear-gradient(90deg,#7b61d9 0%, #8b5fbf 60%, #6a4c93 100%)', px: 4, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 10, px: 3, py: 1.2 }}>
                            <Typography sx={{ color: 'white', fontWeight: 800 }}>💰 Total:</Typography>
                            <Typography sx={{ color: 'white', fontWeight: 900 }}>{formatAmount(total)}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.18)', color: 'white', textTransform: 'none', px: 3 }}>CANCELAR</Button>
                        <Button onClick={handleExportPdf} variant="outlined" startIcon={<PictureAsPdfIcon />} sx={{ borderColor: 'rgba(255,255,255,0.18)', color: 'white', textTransform: 'none', px: 3 }}>EXPORTAR PDF</Button>
                        <Button variant="contained" onClick={onSave} sx={{ background: 'linear-gradient(90deg,#16a34a,#10b981)', color: 'white', borderRadius: 2, px: 3, py: 1, textTransform: 'none', boxShadow: '0 8px 24px rgba(16,185,129,0.16)' }}>{editMode ? 'ACTUALIZAR' : 'CREAR COTIZACIÓN'}</Button>
                    </Box>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default QuoteModal;
