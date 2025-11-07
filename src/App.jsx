//import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Quotes from './pages/Quotes';
import InventoryMovements from './pages/InventoryMovements';

function App() {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return <Login />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/inventory-movements" element={<InventoryMovements />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
