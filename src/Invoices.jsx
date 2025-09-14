import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, CircularProgress, Alert, TextField, InputAdornment, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    // Para selects
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    // Cabecera y detalle de factura
    const [invoiceHeader, setInvoiceHeader] = useState({ customer_id: '', date: '', status: 'pending' });
    const [invoiceItems, setInvoiceItems] = useState([{ product_id: '', quantity: 1, price: 0 }]);
    const [total, setTotal] = useState(0);

    // Cargar clientes y productos para selects
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const [resC, resP] = await Promise.all([
                    fetch('https://novacodefc.com/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('https://novacodefc.com/products', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const [dataC, dataP] = await Promise.all([resC.json(), resP.json()]);
                if (Array.isArray(dataC)) setCustomers(dataC);
                if (Array.isArray(dataP)) setProducts(dataP);
            } catch (err) {
                console.error('Error al cargar clientes/productos:', err);
            }
        };
        if (openModal) fetchData();
    }, [openModal]);

    // Calcular total local (solo visual, el real lo calcula la API)
    useEffect(() => {
        let t = 0;
        invoiceItems.forEach(item => {
            const prod = products.find(p => p.id === item.product_id);
            const price = item.price || (prod ? Number(prod.price) : 0);
            t += price * (item.quantity || 1);
        });
        setTotal(t);
    }, [invoiceItems, products]);

    // Cargar facturas
    const fetchInvoices = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('https://novacodefc.com/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setInvoices(data);
                setShowTable(true);
            } else {
                setError('No se pudo obtener el listado de facturas.');
            }
        } catch (err) {
            setError('Error de conexión: ' + err.message);
        }
        setLoading(false);
    };


    // Filtro visual
    const filteredInvoices = invoices.filter((inv) => {
        return (
            (inv.id + '').includes(search) ||
            (inv.customer_name && inv.customer_name.toLowerCase().includes(search.toLowerCase())) ||
            (inv.status && inv.status.toLowerCase().includes(search.toLowerCase()))
        );
    });
    const paginatedInvoices = filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Marcar factura como pagada (enviando todos los campos requeridos)
    const handleMarkAsPaid = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            // 1. Obtener la factura actual
            const resGet = await fetch(`https://novacodefc.com/invoices/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resGet.json();
            if (!resGet.ok || !data) {
                alert('No se pudo obtener la factura para marcar como pagada.');
                return;
            }
            // 2. Preparar payload con todos los campos requeridos
            const userId = localStorage.getItem('user_id');
            const payload = {
                customer_id: data.customer_id,
                user_id: userId || data.user_id,
                total: data.total,
                status: 'paid',
                items: Array.isArray(data.items) ? data.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })) : []
            };
            // 3. Hacer el PUT con todos los datos
            const response = await fetch(`https://novacodefc.com/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                fetchInvoices();
                setSuccessMsg('Factura marcada como pagada');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                alert('Error al marcar como pagada.');
            }
        } catch (err) {
            alert('Error de conexión al marcar como pagada: ' + err.message);
        }
    };

    // Guardar o editar factura con validación de campos
    const handleSaveInvoice = async () => {
        // Validar cabecera
        if (!invoiceHeader.customer_id || !invoiceHeader.date || !invoiceHeader.status) {
            setError('Completa todos los campos de la cabecera.');
            return;
        }
        // Validar productos
        for (const item of invoiceItems) {
            if (!item.product_id || Number(item.quantity) <= 0 || Number(item.price) <= 0) {
                setError('Todos los productos deben tener producto, cantidad y precio mayor a 0.');
                return;
            }
        }
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const userId = localStorage.getItem('user_id');
            const payload = {
                ...invoiceHeader,
                user_id: userId,
                items: invoiceItems.map(item => ({
                    product_id: item.product_id,
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                }))
            };
            let response;
            if (editMode && editId) {
                response = await fetch(`https://novacodefc.com/invoices/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch('https://novacodefc.com/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }
            if (response.ok) {
                fetchInvoices();
                setOpenModal(false);
                setEditMode(false);
                setEditId(null);
                setInvoiceHeader({ customer_id: '', date: '', status: 'pending' });
                setInvoiceItems([{ product_id: '', quantity: 1, price: 0 }]);
                setShowTable(true);
                setSuccessMsg(editMode ? 'Factura editada correctamente' : 'Factura guardada correctamente');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                alert(editMode ? 'Error al editar la factura.' : 'Error al guardar la factura.');
            }
        } catch (err) {
            alert('Error de conexión al guardar/editar la factura.' + err.message);
        }
    };

    // Eliminar factura
    const handleDeleteInvoice = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`https://novacodefc.com/invoices/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchInvoices();
                setSuccessMsg('Factura eliminada correctamente');
            } else {
                alert('Error al eliminar la factura.');
            }
            setOpenDelete(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            alert('Error de conexión al eliminar la factura.' + err.message);
        }
    };

    // Cargar datos para editar
    const handleEditInvoice = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`https://novacodefc.com/invoices/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data) {
                setInvoiceHeader({
                    customer_id: data.customer_id,
                    date: data.date || '',
                    status: data.status || 'pending'
                });
                setInvoiceItems(
                    Array.isArray(data.items) && data.items.length > 0
                        ? data.items.map(item => ({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                        : [{ product_id: '', quantity: 1, price: 0 }]
                );
                setEditMode(true);
                setEditId(id);
                setOpenModal(true);
            }
        } catch (err) {
            console.error('Error al cargar datos de factura para editar:', err);
        }
    };

    return (
        <>
            <div style={{ padding: '2rem' }}>
                <Typography variant="h4" gutterBottom color="primary">
                    Listado de Facturas
                </Typography>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <Button variant="contained" color="primary" onClick={fetchInvoices}>Ver listado</Button>
                    <Button variant="outlined" color="primary" onClick={() => {
                        setOpenModal(true);
                        setEditMode(false);
                        setEditId(null);
                        setInvoiceHeader({ customer_id: '', date: '', status: 'pending' });
                        setInvoiceItems([{ product_id: '', quantity: 1, price: 0 }]);
                    }}>Agregar factura</Button>
                </div>
                {/* Barra de búsqueda */}
                {showTable && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
                        <TextField
                            placeholder="Buscar factura"
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1, backgroundColor: '#fff', borderRadius: 2 }}
                        />
                    </div>
                )}
                {loading && <CircularProgress sx={{ display: 'block', margin: '1.5em auto' }} />}
                {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ my: 2 }}>{successMsg}</Alert>}
                {showTable && (
                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, maxWidth: 900, margin: '0 auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell><b>ID</b></TableCell>
                                    <TableCell><b>Cliente</b></TableCell>
                                    <TableCell><b>Total</b></TableCell>
                                    <TableCell><b>Estado</b></TableCell>
                                    <TableCell align="center"><b>Acciones</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedInvoices.length > 0 ? (
                                    paginatedInvoices.map((inv) => (
                                        <TableRow key={inv.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>{inv.id}</TableCell>
                                            <TableCell>{inv.customer_name || inv.customer_id}</TableCell>
                                            <TableCell>{inv.total}</TableCell>
                                            <TableCell>{inv.status}</TableCell>
                                            <TableCell align="center">
                                                {inv.status === 'pending' && (
                                                    <Button size="small" color="success" variant="outlined" onClick={() => handleMarkAsPaid(inv.id)} style={{ marginRight: 8 }}>
                                                        Marcar como pagada
                                                    </Button>
                                                )}
                                                <IconButton color="primary" size="small" onClick={() => handleEditInvoice(inv.id)} disabled={inv.status === 'paid'}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" size="small" onClick={() => {
                                                    setDeleteId(inv.id);
                                                    setOpenDelete(true);
                                                }} disabled={inv.status === 'paid'}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ color: 'gray', fontStyle: 'italic', py: 6 }}>
                                            No hay facturas que coincidan con la búsqueda.<br />
                                            {invoices.length === 0 && 'No hay facturas aún, agrega una para comenzar.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={filteredInvoices.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Filas por página"
                        />
                    </TableContainer>
                )}
            </div>
            {/* Modal de confirmación para eliminar factura */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Eliminar factura</DialogTitle>
                <DialogContent>
                    <DialogContentText>¿Estás seguro de que deseas eliminar esta factura?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)} color="secondary">Cancelar</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteInvoice}>Eliminar</Button>
                </DialogActions>
            </Dialog>
            {/* Modal para agregar/editar factura */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? 'Editar factura' : 'Agregar factura'}</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    {/* Cabecera */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <TextField
                            select
                            value={invoiceHeader.customer_id}
                            onChange={e => setInvoiceHeader(h => ({ ...h, customer_id: e.target.value }))}
                            SelectProps={{ native: true }}
                            sx={{ minWidth: 200 }}
                        >
                            <option value="">Seleccione...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </TextField>
                        <TextField
                            label="Fecha"
                            type="date"
                            value={invoiceHeader.date}
                            onChange={e => setInvoiceHeader(h => ({ ...h, date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            select
                            label="Estado"
                            value={invoiceHeader.status}
                            onChange={e => setInvoiceHeader(h => ({ ...h, status: e.target.value }))}
                            SelectProps={{ native: true }}
                            sx={{ minWidth: 120 }}
                        >
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagada</option>
                            <option value="canceled">Cancelada</option>
                        </TextField>
                    </div>
                    {/* Detalle */}
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Detalle de productos</Typography>
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Producto</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Precio</TableCell>
                                    <TableCell>Subtotal</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoiceItems.map((item, idx) => {
                                    const prod = products.find(p => p.id === item.product_id);
                                    const price = item.price || (prod ? Number(prod.price) : 0);
                                    return (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    value={item.product_id}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setInvoiceItems(items => items.map((it, i) => i === idx ? { ...it, product_id: val, price: products.find(p => p.id === val) ? Number(products.find(p => p.id === val).price) : 0 } : it));
                                                    }}
                                                    SelectProps={{ native: true }}
                                                    sx={{ minWidth: 140 }}
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const val = Math.max(1, Number(e.target.value));
                                                        setInvoiceItems(items => items.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                                                    }}
                                                    inputProps={{ min: 1 }}
                                                    sx={{ width: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={item.price}
                                                    onChange={e => {
                                                        const val = Number(e.target.value);
                                                        setInvoiceItems(items => items.map((it, i) => i === idx ? { ...it, price: val } : it));
                                                    }}
                                                    sx={{ width: 100 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {((price * item.quantity) || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button color="error" size="small" onClick={() => setInvoiceItems(items => items.length > 1 ? items.filter((_, i) => i !== idx) : items)} disabled={invoiceItems.length === 1}>Eliminar</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Button variant="outlined" onClick={() => setInvoiceItems(items => [...items, { product_id: '', quantity: 1, price: 0 }])}>Agregar producto</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Typography variant="h6" align="right">Total: {total.toFixed(2)}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="secondary">Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={handleSaveInvoice}>{editMode ? 'Guardar cambios' : 'Guardar'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Invoices;
