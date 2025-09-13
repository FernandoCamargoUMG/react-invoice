//import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';
import Users from './Users';
import Customers from './Customers';
import Products from './Products';
import Invoices from './Invoices';

function App() {
  const accessToken = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Router>
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 300, display: 'flex', gap: '10px' }}>
        <button
          onClick={() => window.location.href = '/'}
          className="logout-btn"
          style={{ background: '#22223b', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}
        >
          Inicio
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar sesión
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/invoices" element={<Invoices />} />
      </Routes>
    </Router>
  );
}

export default App
