import React, { useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Typography,
	CircularProgress,
	Alert,
	TextField,
	InputAdornment,
	TablePagination,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const Products = () => {
	const [editMode, setEditMode] = useState(false);
	const [editId, setEditId] = useState(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showTable, setShowTable] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [openModal, setOpenModal] = useState(false);
	const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
	const [successMsg, setSuccessMsg] = useState('');

	const fetchProducts = async () => {
		setLoading(true);
		setError('');
		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch('https://novacodefc.com/products', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			if (response.ok && Array.isArray(data)) {
				setProducts(data);
				setShowTable(true);
			} else {
				setError('No se pudo obtener el listado de productos.');
			}
		} catch (err) {
			setError('Error de conexión: ' + err.message);
		}
		setLoading(false);
	};

	const filteredProducts = products.filter((p) => {
		const matchesSearch =
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.description.toLowerCase().includes(search.toLowerCase());
		return matchesSearch;
	});

	const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<>
			<div style={{ padding: '2rem' }}>
				<Typography variant="h4" gutterBottom color="primary">
					Listado de Productos
				</Typography>
				<div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={fetchProducts}
					>
						Ver listado
					</Button>
					<Button
						variant="outlined"
						color="primary"
						onClick={() => setOpenModal(true)}
					>
						Agregar producto
					</Button>
				</div>
				{/* Modal para agregar/editar producto */}
				<Dialog open={openModal} onClose={() => {
					setOpenModal(false);
					setEditMode(false);
					setEditId(null);
					setNewProduct({ name: '', price: '', description: '' });
				}}>
					<DialogTitle>{editMode ? 'Editar producto' : 'Agregar producto'}</DialogTitle>
					<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
						<TextField
							label="Nombre"
							value={newProduct.name}
							onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
							autoFocus
						/>
						<TextField
							label="Precio"
							type="number"
							value={newProduct.price}
							onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
						/>
						<TextField
							label="Descripción"
							value={newProduct.description}
							onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => {
							setOpenModal(false);
							setEditMode(false);
							setEditId(null);
							setNewProduct({ name: '', price: '', description: '' });
						}} color="secondary">Cancelar</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={async () => {
								try {
									const token = localStorage.getItem('access_token');
									let response;
									if (editMode && editId) {
										response = await fetch(`https://novacodefc.com/products/${editId}`, {
											method: 'PUT',
											headers: {
												'Content-Type': 'application/json',
												'Authorization': `Bearer ${token}`
											},
											body: JSON.stringify(newProduct)
										});
									} else {
										response = await fetch('https://novacodefc.com/products', {
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
												'Authorization': `Bearer ${token}`
											},
											body: JSON.stringify(newProduct)
										});
									}
									if (response.ok) {
										fetchProducts();
										setOpenModal(false);
										setEditMode(false);
										setEditId(null);
										setNewProduct({ name: '', price: '', description: '' });
										setShowTable(true);
										setSuccessMsg(editMode ? 'Producto editado correctamente' : 'Producto guardado correctamente');
										setTimeout(() => setSuccessMsg(''), 3000);
									} else {
										alert(editMode ? 'Error al editar el producto.' : 'Error al guardar el producto.');
									}
								} catch (err) {
									alert('Error de conexión al guardar/editar el producto.'+ err.message);
								}
							}}
						>
							{editMode ? 'Guardar cambios' : 'Guardar'}
						</Button>
					</DialogActions>
				</Dialog>
				{/* Barra de búsqueda y filtro visual */}
				{showTable && (
					<div style={{ display: 'flex', gap: 16, marginBottom: 24, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
						<TextField
							placeholder="Buscar producto"
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
									<TableCell><b>Nombre</b></TableCell>
									<TableCell><b>Precio</b></TableCell>
									<TableCell><b>Descripción</b></TableCell>
									<TableCell align="center"><b>Acciones</b></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{paginatedProducts.length > 0 ? (
									paginatedProducts.map((p) => (
										<TableRow
											key={p.id}
											hover
											sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
										>
											<TableCell>{p.name}</TableCell>
											<TableCell>{p.price}</TableCell>
											<TableCell>{p.description}</TableCell>
											<TableCell align="center">
												<IconButton color="primary" size="small" onClick={() => {
													setEditMode(true);
													setEditId(p.id);
													setNewProduct({ name: p.name, price: p.price, description: p.description });
													setOpenModal(true);
												}}>
													<EditIcon />
												</IconButton>
												<IconButton color="error" size="small" onClick={() => {
													setDeleteId(p.id);
													setOpenDelete(true);
												}}>
													<DeleteIcon />
												</IconButton>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} align="center" sx={{ color: 'gray', fontStyle: 'italic', py: 6 }}>
											No hay productos que coincidan con la búsqueda.<br />
											{products.length === 0 && 'No hay productos aún, agrega uno para comenzar.'}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						<TablePagination
							component="div"
							count={filteredProducts.length}
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
			{/* Modal de confirmación para eliminar producto */}
			<Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
				<DialogTitle>Eliminar producto</DialogTitle>
				<DialogContent>
					<DialogContentText>¿Estás seguro de que deseas eliminar este producto?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDelete(false)} color="secondary">Cancelar</Button>
					<Button color="error" variant="contained" onClick={async () => {
						try {
							const token = localStorage.getItem('access_token');
							const response = await fetch(`https://novacodefc.com/products/${deleteId}`, {
								method: 'DELETE',
								headers: {
									'Authorization': `Bearer ${token}`
								}
							});
							if (response.ok) {
								fetchProducts();
								setSuccessMsg('Producto eliminado correctamente');
							} else {
								alert('Error al eliminar el producto.');
							}
							setOpenDelete(false);
							setTimeout(() => setSuccessMsg(''), 3000);
						} catch (err) {
							alert('Error de conexión al eliminar el producto.' + err.message);
						}
					}}>Eliminar</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default Products;
