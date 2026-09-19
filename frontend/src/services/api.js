/**
 * Centralized REST API Service for Smart Stationery Inventory System
 * Communicates with Core Java 21 REST backend at http://localhost:8080/api
 */

// Supports direct relative path (via Vite proxy or unified server) and explicit remote API URLs
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const errorMsg = (data && data.error) ? data.error : `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

// -------------------------------------------------------------
// Products API
// -------------------------------------------------------------
export const api = {
  // Products
  getProducts: (search = '', categoryId = '', stockStatus = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('category', categoryId);
    if (stockStatus && stockStatus !== 'ALL') params.append('status', stockStatus);
    const qs = params.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  getCategoryById: (id) => request(`/categories/${id}`),
  createCategory: (category) => request('/categories', { method: 'POST', body: JSON.stringify(category) }),
  updateCategory: (id, category) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => request('/suppliers'),
  getSupplierById: (id) => request(`/suppliers/${id}`),
  createSupplier: (supplier) => request('/suppliers', { method: 'POST', body: JSON.stringify(supplier) }),
  updateSupplier: (id, supplier) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(supplier) }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  // Stock Operations
  stockInward: (productId, quantity, remarks) =>
    request('/stock/inward', { method: 'POST', body: JSON.stringify({ productId, quantity, remarks }) }),
  stockOutward: (productId, quantity, remarks) =>
    request('/stock/outward', { method: 'POST', body: JSON.stringify({ productId, quantity, remarks }) }),
  stockDamaged: (productId, quantity, remarks) =>
    request('/stock/damaged', { method: 'POST', body: JSON.stringify({ productId, quantity, remarks }) }),
  getStockHistory: () => request('/stock/history'),

  // Sales (POS)
  recordSale: (productId, quantitySold) =>
    request('/sales', { method: 'POST', body: JSON.stringify({ productId, quantitySold }) }),
  getSalesHistory: () => request('/sales'),

  // Reports & Analytics
  getDashboardSummary: () => request('/reports/dashboard'),
  getLowStockReport: () => request('/reports/low-stock'),
  getValuationReport: () => request('/reports/valuation'),
  getStockMovementReport: () => request('/reports/stock-movement'),
};

/**
 * Client-Side CSV Export Utility (Pure JS, zero extra npm libraries)
 */
export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) return;

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(h => escapeCsv(h.label)).join(',');
  const dataRows = rows.map(row => {
    return headers.map(h => escapeCsv(row[h.key])).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...dataRows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
