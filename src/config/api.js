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

// Función para refrescar el token
export const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
        throw new Error('No refresh token available');
    }

    console.log('🔄 Refrescando token...');
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.REFRESH), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        console.log('✅ Token refrescado exitosamente');
        return data.access_token;
    } else {
        console.log('❌ Refresh token expirado, redirigiendo al login');
        // Si el refresh token también expiró, limpiar todo y redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        sessionStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Refresh token expired');
    }
};

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let refreshPromise = null;

// Helper para hacer peticiones con manejo automático de refresh token
export const apiRequest = async (endpoint, options = {}) => {
    let response = await fetch(buildUrl(endpoint), {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    });

    // Si recibimos 401 (Unauthorized), intentar refrescar el token
    if (response.status === 401) {
        try {
            // Evitar múltiples refreshes simultáneos
            if (isRefreshing) {
                await refreshPromise;
            } else {
                isRefreshing = true;
                refreshPromise = refreshToken();
                await refreshPromise;
                isRefreshing = false;
                refreshPromise = null;
            }
            
            // Reintentar la petición con el nuevo token
            response = await fetch(buildUrl(endpoint), {
                ...options,
                headers: {
                    ...getAuthHeaders(),
                    ...options.headers
                }
            });
        } catch (error) {
            console.error('❌ Error refreshing token:', error);
            isRefreshing = false;
            refreshPromise = null;
            return response; // Devolver la respuesta 401 original
        }
    }

    return response;
};

// Helper para peticiones GET con autenticación y refresh automático
export const apiGet = async (endpoint) => {
    return await apiRequest(endpoint, {
        method: 'GET'
    });
};

// Helper para peticiones POST con autenticación y refresh automático
export const apiPost = async (endpoint, data) => {
    return await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

// Helper para peticiones PUT con autenticación y refresh automático
export const apiPut = async (endpoint, data) => {
    return await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

// Helper para peticiones PATCH con autenticación y refresh automático
export const apiPatch = async (endpoint, data) => {
    return await apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

// Helper para peticiones DELETE con autenticación y refresh automático
export const apiDelete = async (endpoint) => {
    return await apiRequest(endpoint, {
        method: 'DELETE'
    });
};

export { API_CONFIG };