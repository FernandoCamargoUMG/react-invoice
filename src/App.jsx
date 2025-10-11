//import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GlobalSettings from './components/GlobalSettings';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Invoices from './pages/Invoices';

function App() {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Router>
      {/* Solo mantenemos GlobalSettings en la esquina superior */}
      <div style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 1000
      }}>
        <GlobalSettings />
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
