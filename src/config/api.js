// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS: {
        // Autenticación
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
        LOGOUT: '/auth/logout',
        
        // Clientes
        CUSTOMERS: '/customers',
        
        // Productos
        PRODUCTS: '/products',
        PRODUCTS_STOCK: (id) => `/products/${id}/stock`,
        
        // Facturas
        INVOICES: '/invoices',
        INVOICE_STATUS: (id) => `/invoices/${id}/status`,
        
        // Pagos
        PAYMENTS: '/payments',
        INVOICE_PAYMENTS: (invoiceId) => `/invoices/${invoiceId}/payments`,
        
        // Usuarios
        USERS: '/users',
        USER_ROLE: (id) => `/users/${id}/role`,
        
        // Proveedores
        SUPPLIERS: '/suppliers',
        SUPPLIERS_ACTIVE: '/suppliers-active',
        SUPPLIER_STATUS: (id) => `/suppliers/${id}/toggle-status`,
        
        // Compras
        PURCHASES: '/purchases',
        PURCHASE_RECEIVE: (id) => `/purchases/${id}/receive`,
        PURCHASE_CANCEL: (id) => `/purchases/${id}/cancel`,
        PURCHASES_STATS: '/purchases-stats',
        
        // Cotizaciones
        QUOTES: '/quotes',
        QUOTE_SEND: (id) => `/quotes/${id}/send`,
        QUOTE_APPROVE: (id) => `/quotes/${id}/approve`,
        QUOTE_REJECT: (id) => `/quotes/${id}/reject`,
        QUOTE_TO_INVOICE: (id) => `/quotes/${id}/convert-to-invoice`,
        QUOTES_EXPIRED: '/quotes/mark-expired',
        QUOTES_STATS: '/quotes-stats',
        
        // Inventario
        INVENTORY_MOVEMENTS: '/inventory-movements',
        INVENTORY_ADJUSTMENTS: '/inventory-adjustments',
        INVENTORY_BY_PRODUCT: (id) => `/inventory-movements/product/${id}`,
        INVENTORY_SUMMARY: '/inventory-summary',
        INVENTORY_STATS: '/inventory-stats',
        INVENTORY_ALERTS: '/inventory-alerts',
        INVENTORY_EXPORT: '/inventory-export'
    }
};

// Helper para construir URLs completas
export const buildUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper para obtener headers con autenticación
export const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Helper para peticiones GET con autenticación
export const apiGet = async (endpoint) => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};

// Helper para peticiones POST con autenticación
export const apiPost = async (endpoint, data) => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};

// Helper para peticiones PUT con autenticación
export const apiPut = async (endpoint, data) => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};

// Helper para peticiones PATCH con autenticación
export const apiPatch = async (endpoint, data) => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};

// Helper para peticiones DELETE con autenticación
export const apiDelete = async (endpoint) => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return response;
};

export { API_CONFIG };