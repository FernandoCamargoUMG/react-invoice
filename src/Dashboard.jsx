import { FaUserCircle } from 'react-icons/fa';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaUserFriends, FaUsers, FaBoxOpen, FaFileInvoiceDollar, FaTimes } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Obtener usuario de sessionStorage (debe estar guardado como objeto)
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userName = user.nombre; // Asegúrate de que el nombre se muestre correctamente

    return (
        <div className="dashboard-hamburger-layout">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                <FaBars size={28} />
            </button>
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                    <FaTimes size={24} />
                </button>
                <h2>Menú</h2>
                <nav className="sidebar-menu">
                    <Link to="/users" onClick={() => setSidebarOpen(false)}><FaUsers /> Usuarios</Link>
                    <Link to="/customers" onClick={() => setSidebarOpen(false)}><FaUserFriends /> Clientes</Link>
                    <Link to="/products" onClick={() => setSidebarOpen(false)}><FaBoxOpen /> Productos</Link>
                    <Link to="/invoices" onClick={() => setSidebarOpen(false)}><FaFileInvoiceDollar /> Facturas</Link>
                </nav>
            </aside>
            <div className="dashboard-main-content">
                <h1>Bienvenido al Sistema de Facturación</h1>
                <p>Selecciona una opción del menú para comenzar.</p>
            </div>
            {userName && (
                <div className="user-info-floating user-info-bottom-left">
                    <FaUserCircle size={32} style={{ marginRight: 10 }} />
                    <span style={{ fontSize: '1.13em', fontWeight: 100 }}>
                        Conectado como: <span style={{ fontWeight: 100 }}>{userName}</span>
                    </span>
                </div>
            )}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
        </div>
    );
};

export default Dashboard;
