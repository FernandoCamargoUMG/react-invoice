
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

const Customers = () => {
	const [editMode, setEditMode] = useState(false);
	const [editId, setEditId] = useState(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showTable, setShowTable] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	// Modal agregar cliente
	const [openModal, setOpenModal] = useState(false);
	const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
	const [successMsg, setSuccessMsg] = useState('');

	const fetchCustomers = async () => {
		setLoading(true);
		setError('');
		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch('https://novacodefc.com/customers', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			if (response.ok && Array.isArray(data)) {
				setCustomers(data);
				setShowTable(true);
			} else {
				setError('No se pudo obtener el listado de clientes.');
			}
		} catch (err) {
			setError('Error de conexión: ' + err.message);
		}
		setLoading(false);
	};

	// Filtrado visual (no afecta datos reales, solo muestra lo que coincide)
		const filteredCustomers = customers.filter((c) => {
			const matchesSearch =
				c.name.toLowerCase().includes(search.toLowerCase()) ||
				c.email.toLowerCase().includes(search.toLowerCase()) ||
				c.phone.toLowerCase().includes(search.toLowerCase()) ||
				c.address.toLowerCase().includes(search.toLowerCase());
			return matchesSearch;
		});

		// Paginación
		const paginatedCustomers = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
				Listado de Clientes
			</Typography>
			<div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
				<Button
					variant="contained"
					color="primary"
					onClick={fetchCustomers}
				>
					Ver listado
				</Button>
				<Button
					variant="outlined"
					color="primary"
					onClick={() => setOpenModal(true)}
				>
					Agregar cliente
				</Button>
			</div>
			{/* Modal para agregar cliente */}
					<Dialog open={openModal} onClose={() => {
						setOpenModal(false);
						setEditMode(false);
						setEditId(null);
						setNewCustomer({ name: '', email: '', phone: '', address: '' });
					}}>
						<DialogTitle>{editMode ? 'Editar cliente' : 'Agregar cliente'}</DialogTitle>
						<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
							<TextField
								label="Nombre"
								value={newCustomer.name}
								onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
								autoFocus
							/>
							<TextField
								label="Email"
								value={newCustomer.email}
								onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
							/>
							<TextField
								label="Teléfono"
								value={newCustomer.phone}
								onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
							/>
							<TextField
								label="Dirección"
								value={newCustomer.address}
								onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => {
								setOpenModal(false);
								setEditMode(false);
								setEditId(null);
								setNewCustomer({ name: '', email: '', phone: '', address: '' });
							}} color="secondary">Cancelar</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={async () => {
									try {
										const token = localStorage.getItem('access_token');
										let response;
										if (editMode && editId) {
											response = await fetch(`https://novacodefc.com/customers/${editId}`, {
												method: 'PUT',
												headers: {
													'Content-Type': 'application/json',
													'Authorization': `Bearer ${token}`
												},
												body: JSON.stringify(newCustomer)
											});
										} else {
											response = await fetch('https://novacodefc.com/customers', {
												method: 'POST',
												headers: {
													'Content-Type': 'application/json',
													'Authorization': `Bearer ${token}`
												},
												body: JSON.stringify(newCustomer)
											});
										}
										if (response.ok) {
											fetchCustomers();
											setOpenModal(false);
											setEditMode(false);
											setEditId(null);
											setNewCustomer({ name: '', email: '', phone: '', address: '' });
											setShowTable(true);
											setSuccessMsg(editMode ? 'Cliente editado correctamente' : 'Cliente guardado correctamente');
											setTimeout(() => setSuccessMsg(''), 3000);
										} else {
											alert(editMode ? 'Error al editar el cliente.' : 'Error al guardar el cliente.');
										}
									} catch (err) {
										alert('Error de conexión al guardar/editar el cliente.'+ err.message);
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
								placeholder="Buscar cliente"
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
														<TableCell><b>Email</b></TableCell>
														<TableCell><b>Teléfono</b></TableCell>
														<TableCell><b>Dirección</b></TableCell>
														<TableCell align="center"><b>Acciones</b></TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{paginatedCustomers.length > 0 ? (
														paginatedCustomers.map((c) => (
															<TableRow
																key={c.id}
																hover
																sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
															>
																<TableCell>{c.name}</TableCell>
																<TableCell>{c.email}</TableCell>
																<TableCell>{c.phone}</TableCell>
																<TableCell>{c.address}</TableCell>
																<TableCell align="center">
																	<IconButton color="primary" size="small" onClick={() => {
																		setEditMode(true);
																		setEditId(c.id);
																		setNewCustomer({ name: c.name, email: c.email, phone: c.phone, address: c.address });
																		setOpenModal(true);
																	}}>
																		<EditIcon />
																	</IconButton>
																	<IconButton color="error" size="small" onClick={() => {
																		setDeleteId(c.id);
																		setOpenDelete(true);
																	}}>
																		<DeleteIcon />
																	</IconButton>
																</TableCell>
															</TableRow>
														))
													) : (
														<TableRow>
															<TableCell colSpan={5} align="center" sx={{ color: 'gray', fontStyle: 'italic', py: 6 }}>
																No hay clientes que coincidan con la búsqueda.<br />
																{customers.length === 0 && 'No hay clientes aún, agrega uno para comenzar.'}
															</TableCell>
														</TableRow>
													)}
												</TableBody>
							</Table>
							<TablePagination
								component="div"
								count={filteredCustomers.length}
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
			{/* Modal de confirmación para eliminar cliente */}
			<Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
				<DialogTitle>Eliminar cliente</DialogTitle>
				<DialogContent>
					<DialogContentText>¿Estás seguro de que deseas eliminar este cliente?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDelete(false)} color="secondary">Cancelar</Button>
					<Button color="error" variant="contained" onClick={async () => {
						try {
							const token = localStorage.getItem('access_token');
							const response = await fetch(`https://novacodefc.com/customers/${deleteId}`, {
								method: 'DELETE',
								headers: {
									'Authorization': `Bearer ${token}`
								}
							});
							if (response.ok) {
								fetchCustomers();
								setSuccessMsg('Cliente eliminado correctamente');
							} else {
								alert('Error al eliminar el cliente.');
							}
							setOpenDelete(false);
							setTimeout(() => setSuccessMsg(''), 3000);
						} catch (err) {
							alert('Error de conexión al eliminar el cliente.' + err.message);
						}
					}}>Eliminar</Button>
				</DialogActions>
			</Dialog>
			</>
		);
};

export default Customers;
