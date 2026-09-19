/**
 * =============================================================
 * SMART STATIONERY INVENTORY MANAGEMENT SYSTEM
 * Client Tier: Pure Vanilla JavaScript (ES6+)
 * Zero Frameworks: No React, No jQuery, No DataTables
 * Communicates with Core Java 21 REST API at :8080
 * =============================================================
 */

const API_BASE = '/api'; // Relative so works both on direct :8080 or reverse proxy

// State Store
let state = {
  products: [],
  categories: [],
  suppliers: [],
  stockHistory: [],
  sales: [],
  valuation: []
};

// -------------------------------------------------------------
// INITIALIZATION & TAB NAVIGATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadInitialData();
});

function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  const activeView = document.getElementById(`tab-${tabId}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeView) activeView.classList.add('active');

  // Trigger data refreshes on tab switch
  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'products') loadProducts();
  if (tabId === 'categories') loadCategories();
  if (tabId === 'suppliers') loadSuppliers();
  if (tabId === 'stock') loadStockLedger();
  if (tabId === 'sales') loadSales();
  if (tabId === 'reports') loadReports();
}

async function loadInitialData() {
  await Promise.all([
    loadCategories(),
    loadSuppliers(),
    loadDashboard(),
    loadProducts()
  ]);
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// -------------------------------------------------------------
// 1. DASHBOARD MODULE
// -------------------------------------------------------------
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/reports/dashboard`);
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    const data = await res.json();

    document.getElementById('kpiTotalProducts').textContent = data.totalProducts ?? 0;
    document.getElementById('kpiTotalStock').textContent = data.totalStock ?? 0;
    document.getElementById('kpiLowStock').textContent = data.lowStockCount ?? 0;
    document.getElementById('kpiValuation').textContent = `₹${(data.inventoryValue ?? 0).toFixed(2)}`;

    loadLowStockTable();
  } catch (err) {
    console.error('Error in loadDashboard:', err);
    showToast('Failed to refresh dashboard KPIs', 'error');
  }
}

async function loadLowStockTable() {
  const tbody = document.getElementById('lowStockTableBody');
  try {
    const res = await fetch(`${API_BASE}/reports/low-stock`);
    const items = await res.json();

    if (!items || items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="color: #10b981; font-weight: 600;">✨ All stock levels are healthy! No reorder needed.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(p => {
      const suggestedOrder = Math.max(0, (p.reorderPoint * 2) - p.quantity);
      return `
        <tr>
          <td><strong>${escapeHtml(p.sku)}</strong></td>
          <td>${escapeHtml(p.productName)}</td>
          <td>${escapeHtml(p.categoryName || 'Stationery')}</td>
          <td><span class="status-pill status-low-stock">${p.quantity} units</span></td>
          <td>${p.reorderPoint}</td>
          <td><strong style="color: #b45309;">+${suggestedOrder} units</strong></td>
          <td>${escapeHtml(p.binLocation || '-')}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="quickRestockPrompt(${p.productId}, '${escapeHtml(p.productName)}')">⚡ Restock</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="color: #ef4444;">Error loading low-stock items.</td></tr>';
  }
}

// -------------------------------------------------------------
// 2. PRODUCTS MODULE
// -------------------------------------------------------------
let searchDebounceTimer;
function debounceFilterProducts() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadProducts, 250);
}

async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  const search = document.getElementById('productSearchInput').value.trim();
  const catFilter = document.getElementById('productCategoryFilter').value;
  const statusFilter = document.getElementById('productStatusFilter').value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (catFilter) params.append('category', catFilter);
  if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);

  try {
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    state.products = await res.json();

    populateProductSelects();

    if (!state.products || state.products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center">No products found matching filters.</td></tr>';
      return;
    }

    tbody.innerHTML = state.products.map(p => {
      let badgeClass = 'status-in-stock';
      if (p.quantity === 0) badgeClass = 'status-out-stock';
      else if (p.quantity <= p.reorderPoint) badgeClass = 'status-low-stock';

      return `
        <tr>
          <td><strong>${escapeHtml(p.sku)}</strong></td>
          <td>${escapeHtml(p.productName)}</td>
          <td>${escapeHtml(p.categoryName || '-')}</td>
          <td>${escapeHtml(p.supplierName || '-')}</td>
          <td>₹${Number(p.unitPrice).toFixed(2)}</td>
          <td><strong>${p.quantity}</strong></td>
          <td>${p.reorderPoint}</td>
          <td><span class="status-pill ${badgeClass}">${p.status}</span></td>
          <td>${escapeHtml(p.binLocation || '-')}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" onclick="editProduct(${p.productId})">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.productId})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="color: #ef4444;">Failed to load products.</td></tr>';
  }
}

function openProductModal(id = null) {
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('prodFormId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add Stationery Product';

  // Fill category & supplier selects
  const catSelect = document.getElementById('prodFormCategory');
  catSelect.innerHTML = state.categories.map(c => `<option value="${c.categoryId}">${escapeHtml(c.categoryName)}</option>`).join('');

  const suppSelect = document.getElementById('prodFormSupplier');
  suppSelect.innerHTML = state.suppliers.map(s => `<option value="${s.supplierId}">${escapeHtml(s.supplierName)}</option>`).join('');

  if (id) {
    const prod = state.products.find(p => p.productId === id);
    if (prod) {
      document.getElementById('productModalTitle').textContent = 'Edit Product';
      document.getElementById('prodFormId').value = prod.productId;
      document.getElementById('prodFormName').value = prod.productName;
      document.getElementById('prodFormSku').value = prod.sku;
      document.getElementById('prodFormBarcode').value = prod.barcode || '';
      document.getElementById('prodFormCategory').value = prod.categoryId;
      document.getElementById('prodFormSupplier').value = prod.supplierId;
      document.getElementById('prodFormPrice').value = prod.unitPrice;
      document.getElementById('prodFormQuantity').value = prod.quantity;
      document.getElementById('prodFormReorder').value = prod.reorderPoint;
      document.getElementById('prodFormBin').value = prod.binLocation || '';
    }
  }

  openModal('productModal');
}

function editProduct(id) {
  openProductModal(id);
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('prodFormId').value;
  const payload = {
    productName: document.getElementById('prodFormName').value.trim(),
    sku: document.getElementById('prodFormSku').value.trim(),
    barcode: document.getElementById('prodFormBarcode').value.trim(),
    categoryId: parseInt(document.getElementById('prodFormCategory').value),
    supplierId: parseInt(document.getElementById('prodFormSupplier').value),
    unitPrice: parseFloat(document.getElementById('prodFormPrice').value),
    quantity: parseInt(document.getElementById('prodFormQuantity').value),
    reorderPoint: parseInt(document.getElementById('prodFormReorder').value),
    binLocation: document.getElementById('prodFormBin').value.trim()
  };

  try {
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save product');

    closeModal('productModal');
    showToast(id ? 'Product updated successfully!' : 'Product added successfully!');
    loadProducts();
    loadDashboard();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    showToast('Product deleted successfully');
    loadProducts();
    loadDashboard();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// 3. CATEGORIES MODULE
// -------------------------------------------------------------
async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  const catFilter = document.getElementById('productCategoryFilter');

  try {
    const res = await fetch(`${API_BASE}/categories`);
    state.categories = await res.json();

    // Populate category filter in products tab
    if (catFilter) {
      catFilter.innerHTML = '<option value="">All Categories</option>' +
        state.categories.map(c => `<option value="${c.categoryId}">${escapeHtml(c.categoryName)}</option>`).join('');
    }

    if (!state.categories || state.categories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found.</td></tr>';
      return;
    }

    tbody.innerHTML = state.categories.map(c => `
      <tr>
        <td>${c.categoryId}</td>
        <td><strong>${escapeHtml(c.categoryName)}</strong></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.categoryId})">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color: #ef4444;">Failed to load categories.</td></tr>';
  }
}

function openCategoryModal() {
  document.getElementById('categoryForm').reset();
  openModal('categoryModal');
}

async function saveCategory(e) {
  e.preventDefault();
  const name = document.getElementById('catFormName').value.trim();
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName: name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save category');

    closeModal('categoryModal');
    showToast('Category created!');
    loadCategories();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function deleteCategory(id) {
  if (!confirm('Are you sure? Items in this category might be affected.')) return;
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    showToast('Category deleted');
    loadCategories();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// 4. SUPPLIERS MODULE
// -------------------------------------------------------------
async function loadSuppliers() {
  const tbody = document.getElementById('suppliersTableBody');
  try {
    const res = await fetch(`${API_BASE}/suppliers`);
    state.suppliers = await res.json();

    if (!state.suppliers || state.suppliers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No suppliers recorded.</td></tr>';
      return;
    }

    tbody.innerHTML = state.suppliers.map(s => `
      <tr>
        <td>${s.supplierId}</td>
        <td><strong>${escapeHtml(s.supplierName)}</strong></td>
        <td>${escapeHtml(s.contactPerson || '-')}</td>
        <td>${escapeHtml(s.phone || '-')}</td>
        <td>${escapeHtml(s.email || '-')}</td>
        <td>${escapeHtml(s.address || '-')}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${s.supplierId})">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="color: #ef4444;">Failed to load suppliers.</td></tr>';
  }
}

function openSupplierModal() {
  document.getElementById('supplierForm').reset();
  openModal('supplierModal');
}

async function saveSupplier(e) {
  e.preventDefault();
  const payload = {
    supplierName: document.getElementById('suppFormName').value.trim(),
    contactPerson: document.getElementById('suppFormContact').value.trim(),
    phone: document.getElementById('suppFormPhone').value.trim(),
    email: document.getElementById('suppFormEmail').value.trim(),
    address: document.getElementById('suppFormAddress').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save supplier');

    closeModal('supplierModal');
    showToast('Supplier registered successfully!');
    loadSuppliers();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function deleteSupplier(id) {
  if (!confirm('Delete this supplier?')) return;
  try {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    showToast('Supplier removed');
    loadSuppliers();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// 5. STOCK OPERATIONS MODULE
// -------------------------------------------------------------
async function loadStockLedger() {
  const tbody = document.getElementById('stockTableBody');
  try {
    const res = await fetch(`${API_BASE}/stock/history`);
    state.stockHistory = await res.json();

    if (!state.stockHistory || state.stockHistory.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No stock movements recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = state.stockHistory.map(tx => {
      let badgeClass = 'status-in-stock';
      let prefix = '+';
      if (tx.transactionType === 'OUTWARD') {
        badgeClass = 'status-low-stock';
        prefix = '-';
      } else if (tx.transactionType === 'DAMAGED') {
        badgeClass = 'status-out-stock';
        prefix = '-';
      }

      return `
        <tr>
          <td>#${tx.transactionId}</td>
          <td><strong>${escapeHtml(tx.productName || 'Product #' + tx.productId)}</strong></td>
          <td><span class="status-pill ${badgeClass}">${tx.transactionType}</span></td>
          <td><strong>${prefix}${tx.quantity} units</strong></td>
          <td>${escapeHtml(tx.remarks || '-')}</td>
          <td>${tx.transactionDate}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color: #ef4444;">Failed to load stock ledger.</td></tr>';
  }
}

function openStockModal() {
  const select = document.getElementById('stockProductSelect');
  select.innerHTML = state.products.map(p => `<option value="${p.productId}">${escapeHtml(p.productName)} (Cur: ${p.quantity})</option>`).join('');
  document.getElementById('stockForm').reset();
  openModal('stockModal');
}

function quickRestockPrompt(productId, productName) {
  openStockModal();
  document.getElementById('stockProductSelect').value = productId;
  document.getElementById('stockMovementType').value = 'INWARD';
  document.getElementById('stockRemarks').value = 'Batch delivery restock';
}

async function saveStockAdjustment(e) {
  e.preventDefault();
  const prodId = parseInt(document.getElementById('stockProductSelect').value);
  const type = document.getElementById('stockMovementType').value;
  const qty = parseInt(document.getElementById('stockQuantity').value);
  const remarks = document.getElementById('stockRemarks').value.trim();

  let endpoint = '/stock/inward';
  if (type === 'OUTWARD') endpoint = '/stock/outward';
  if (type === 'DAMAGED') endpoint = '/stock/damaged';

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: prodId, quantity: qty, remarks })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Stock adjustment failed');

    closeModal('stockModal');
    showToast(`Stock movement recorded: ${type} ${qty} units`);
    loadStockLedger();
    loadProducts();
    loadDashboard();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// 6. POS SALES MODULE
// -------------------------------------------------------------
function populateProductSelects() {
  const select = document.getElementById('posProductSelect');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Choose Item --</option>' +
    state.products.map(p => `<option value="${p.productId}" data-price="${p.unitPrice}" data-stock="${p.quantity}">
      ${escapeHtml(p.productName)} (Stock: ${p.quantity}, ₹${Number(p.unitPrice).toFixed(2)})
    </option>`).join('');

  if (currentVal) select.value = currentVal;
  if (typeof updatePosItemDetails === 'function') updatePosItemDetails();
}

// -------------------------------------------------------------
// 7. REPORTS & CSV EXPORT
// -------------------------------------------------------------
async function loadReports() {
  const tbody = document.getElementById('valuationTableBody');
  try {
    const res = await fetch(`${API_BASE}/reports/valuation`);
    state.valuation = await res.json();

    if (!state.valuation || state.valuation.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">No valuation data available.</td></tr>';
      return;
    }

    let grandTotal = 0;
    const rows = state.valuation.map(v => {
      grandTotal += Number(v.categoryValuation || 0);
      return `
        <tr>
          <td><strong>${escapeHtml(v.categoryName)}</strong></td>
          <td>${v.totalProducts} items</td>
          <td>${v.totalQuantity} units</td>
          <td><strong style="color: #10b981;">₹${Number(v.categoryValuation).toFixed(2)}</strong></td>
        </tr>
      `;
    }).join('');

    const totalRow = `
      <tr style="background: #f1f5f9; font-weight: bold;">
        <td>Total Store Valuation</td>
        <td>-</td>
        <td>-</td>
        <td><strong style="color: #2563eb; font-size: 1rem;">₹${grandTotal.toFixed(2)}</strong></td>
      </tr>
    `;

    tbody.innerHTML = rows + totalRow;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #ef4444;">Failed to load valuation report.</td></tr>';
  }
}

function exportCategoryValuationCsv() {
  if (!state.valuation || state.valuation.length === 0) {
    alert('No valuation data to export.');
    return;
  }

  const headers = ['Category Name', 'Total Items', 'Total Stock Units', 'Valuation (INR)'];
  const rows = state.valuation.map(v => [
    `"${v.categoryName}"`,
    v.totalProducts,
    v.totalQuantity,
    Number(v.categoryValuation).toFixed(2)
  ]);

  downloadCsvFile('Category_Valuation_Report.csv', headers, rows);
}

async function exportLowStockCsv() {
  try {
    const res = await fetch(`${API_BASE}/reports/low-stock`);
    const items = await res.json();

    if (!items || items.length === 0) {
      alert('No low stock items currently!');
      return;
    }

    const headers = ['SKU', 'Product Name', 'Category', 'Current Quantity', 'Reorder Point', 'Suggested Reorder Qty', 'Bin Location'];
    const rows = items.map(p => [
      `"${p.sku}"`,
      `"${p.productName}"`,
      `"${p.categoryName || '-'}"`,
      p.quantity,
      p.reorderPoint,
      Math.max(0, (p.reorderPoint * 2) - p.quantity),
      `"${p.binLocation || '-'}"`
    ]);

    downloadCsvFile('Low_Stock_Reorder_Report.csv', headers, rows);
  } catch (err) {
    alert('Failed to export low stock report.');
  }
}

function downloadCsvFile(filename, headers, rows) {
  const csvContent = 'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${new Date().toISOString().slice(0, 10)}_${filename}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloaded ${filename}`);
}

// -------------------------------------------------------------
// POINT OF SALE (POS) & MULTI-COMMODITY BILLING
// -------------------------------------------------------------
let posCart = [];

async function loadSales() {
  const tbody = document.getElementById('salesTableBody');
  const prodSelect = document.getElementById('posProductSelect');

  try {
    const [salesRes, prodsRes] = await Promise.all([
      fetch(`${API_BASE}/sales`),
      fetch(`${API_BASE}/products`)
    ]);

    state.sales = await salesRes.json();
    state.products = await prodsRes.json();

    // Populate commodity dropdown
    if (prodSelect) {
      const currentVal = prodSelect.value;
      prodSelect.innerHTML = '<option value="">-- Choose Item --</option>' +
        state.products.map(p => `
          <option value="${p.productId}" ${p.quantity === 0 ? 'disabled' : ''}>
            ${escapeHtml(p.productName)} (${p.sku}) — ₹${Number(p.unitPrice).toFixed(2)} [Stock: ${p.quantity}]${p.quantity === 0 ? ' (OUT OF STOCK)' : ''}
          </option>
        `).join('');
      if (currentVal) prodSelect.value = currentVal;
      updatePosItemDetails();
    }

    // Render historical sales register
    if (tbody) {
      if (!state.sales || state.sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No sales recorded yet.</td></tr>';
      } else {
        tbody.innerHTML = state.sales.map(s => `
          <tr>
            <td><span style="font-weight: 700; color: #4f46e5; background: #eef2ff; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${escapeHtml(s.billNo || '#' + s.saleId)}</span></td>
            <td>#${s.saleId}</td>
            <td><strong>${escapeHtml(s.productName)}</strong></td>
            <td>${s.quantitySold} units</td>
            <td>₹${Number(s.unitPrice).toFixed(2)}</td>
            <td><strong style="color: #15803d;">₹${Number(s.totalAmount).toFixed(2)}</strong></td>
            <td>${escapeHtml(s.customerName || 'Walk-in Customer')}</td>
            <td><span class="badge badge-info" style="font-size: 11px;">${escapeHtml(s.paymentMethod || 'Cash')}</span></td>
            <td style="font-size: 12px; color: #64748b;">${s.saleDate || '-'}</td>
          </tr>
        `).join('');
      }
    }

    renderPosCart();
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="color: #ef4444;">Failed to load sales register.</td></tr>';
  }
}

function updatePosItemDetails() {
  const prodSelect = document.getElementById('posProductSelect');
  const priceInput = document.getElementById('posUnitPrice');
  const stockInput = document.getElementById('posAvailableStock');
  const qtyInput = document.getElementById('posQuantity');

  const prodId = parseInt(prodSelect.value);
  const prod = state.products.find(p => p.productId === prodId);

  if (prod) {
    const existing = posCart.find(c => c.productId === prodId);
    const inCart = existing ? existing.quantity : 0;
    const remaining = Math.max(0, prod.quantity - inCart);

    priceInput.value = `₹${Number(prod.unitPrice).toFixed(2)}`;
    stockInput.value = remaining;
    qtyInput.max = remaining > 0 ? remaining : 1;
    qtyInput.disabled = remaining === 0;
  } else {
    priceInput.value = '₹0.00';
    stockInput.value = '0';
    qtyInput.disabled = false;
  }
}

function addCommodityToCart(e) {
  e.preventDefault();
  const prodSelect = document.getElementById('posProductSelect');
  const qtyInput = document.getElementById('posQuantity');

  const prodId = parseInt(prodSelect.value);
  const qty = parseInt(qtyInput.value);

  if (!prodId) {
    alert('Please select a stationery commodity first.');
    return;
  }
  if (isNaN(qty) || qty <= 0) {
    alert('Quantity must be at least 1.');
    return;
  }

  const prod = state.products.find(p => p.productId === prodId);
  if (!prod) return;

  const existing = posCart.find(c => c.productId === prodId);
  const currentInCart = existing ? existing.quantity : 0;

  if (currentInCart + qty > prod.quantity) {
    alert(`Cannot add ${qty} units. Only ${prod.quantity - currentInCart} more units available on shelf.`);
    return;
  }

  if (existing) {
    existing.quantity += qty;
    existing.lineTotal = Math.round(existing.quantity * prod.unitPrice * 100) / 100;
  } else {
    posCart.push({
      productId: prod.productId,
      productName: prod.productName,
      sku: prod.sku,
      unitPrice: prod.unitPrice,
      quantity: qty,
      lineTotal: Math.round(qty * prod.unitPrice * 100) / 100
    });
  }

  qtyInput.value = 1;
  updatePosItemDetails();
  renderPosCart();
  showToast(`Added ${qty}x ${prod.productName} to bill cart`);
}

function renderPosCart() {
  const tbody = document.getElementById('posCartTableBody');
  const itemsCountEl = document.getElementById('posCartItemsCount');
  const unitsCountEl = document.getElementById('posCartUnitsCount');
  const grandTotalEl = document.getElementById('posGrandTotalDisplay');

  if (!tbody) return;

  const totalItems = posCart.length;
  const totalUnits = posCart.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = Math.round(posCart.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;

  if (itemsCountEl) itemsCountEl.textContent = totalItems;
  if (unitsCountEl) unitsCountEl.textContent = totalUnits;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;

  if (posCart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: #64748b; padding: 24px;">Bill cart is empty. Add products on the left.</td></tr>';
    return;
  }

  tbody.innerHTML = posCart.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.productName)}</strong> <span style="font-size: 11px; color: #64748b;">(${item.sku})</span></td>
      <td>₹${Number(item.unitPrice).toFixed(2)}</td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-secondary" onclick="updatePosCartItemQty(${item.productId}, -1)" style="padding: 1px 6px;">-</button>
        <span style="font-weight: 700; margin: 0 6px;">${item.quantity}</span>
        <button type="button" class="btn btn-sm btn-secondary" onclick="updatePosCartItemQty(${item.productId}, 1)" style="padding: 1px 6px;">+</button>
      </td>
      <td style="text-align: right; font-weight: 700;">₹${Number(item.lineTotal).toFixed(2)}</td>
      <td style="text-align: center;">
        <button type="button" onclick="removePosCartItem(${item.productId})" style="background: none; border: none; cursor: pointer; color: #ef4444; font-size: 15px;">❌</button>
      </td>
    </tr>
  `).join('');
}

function updatePosCartItemQty(productId, delta) {
  const item = posCart.find(c => c.productId === productId);
  if (!item) return;

  const prod = state.products.find(p => p.productId === productId);
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    removePosCartItem(productId);
    return;
  }
  if (prod && newQty > prod.quantity) {
    alert(`Cannot exceed available shelf stock of ${prod.quantity} units.`);
    return;
  }

  item.quantity = newQty;
  item.lineTotal = Math.round(newQty * item.unitPrice * 100) / 100;
  updatePosItemDetails();
  renderPosCart();
}

function removePosCartItem(productId) {
  posCart = posCart.filter(c => c.productId !== productId);
  updatePosItemDetails();
  renderPosCart();
}

function clearPosCart() {
  if (posCart.length > 0 && confirm('Clear all items from current bill?')) {
    posCart = [];
    updatePosItemDetails();
    renderPosCart();
  }
}

async function generatePosBill() {
  if (posCart.length === 0) {
    alert('Bill cart is empty. Add at least one commodity.');
    return;
  }

  const customerName = (document.getElementById('posCustomerName').value || 'Walk-in Customer').trim();
  const paymentMethod = document.getElementById('posPaymentMethod').value || 'Cash';

  const payload = {
    customerName,
    paymentMethod,
    items: posCart.map(c => ({
      productId: c.productId,
      quantitySold: c.quantity
    }))
  };

  const btn = document.getElementById('btnGenerateBill');
  btn.disabled = true;
  btn.textContent = '⏳ Processing Sale...';

  try {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to complete sale');
    }

    // Render receipt modal
    const receiptContainer = document.getElementById('receiptModalContent');
    if (receiptContainer) {
      receiptContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 1px dashed #94a3b8; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="font-size: 16px; margin: 0;">SMART STATIONERY STORE</h2>
          <p style="margin: 2px 0; font-size: 11px; color: #475569;">Sathyabama Institute of Science and Technology</p>
          <div style="margin-top: 6px; font-weight: bold; border: 1px solid #000; display: inline-block; padding: 2px 6px; font-size: 11px;">RETAIL TAX INVOICE</div>
        </div>
        <div style="border-bottom: 1px dashed #94a3b8; padding-bottom: 8px; margin-bottom: 10px; font-size: 11px;">
          <div>Bill No: <strong>${data.billNo}</strong></div>
          <div>Date: ${data.billDate || new Date().toLocaleString()}</div>
          <div>Customer: <strong>${escapeHtml(data.customerName || customerName)}</strong></div>
          <div>Payment Mode: <strong>${escapeHtml(data.paymentMethod || paymentMethod)}</strong></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(data.items || []).map(it => `
              <tr style="border-bottom: 1px dotted #ccc;">
                <td style="padding: 4px 0;">${escapeHtml(it.productName)}</td>
                <td style="text-align: center;">${it.quantitySold}</td>
                <td style="text-align: right;">₹${Number(it.unitPrice).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">₹${Number(it.totalAmount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="border-top: 1px solid #000; padding-top: 6px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Total Commodities:</span>
            <strong>${data.totalCommodities || (data.items ? data.items.length : 1)} items</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Total Units:</span>
            <strong>${data.totalQuantity} units</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 1px dashed #94a3b8; padding-top: 6px; margin-top: 6px;">
            <span>NET AMOUNT:</span>
            <span>₹${Number(data.grandTotal).toFixed(2)}</span>
          </div>
        </div>
        <div style="text-align: center; border-top: 1px dashed #94a3b8; padding-top: 10px; margin-top: 10px; font-size: 10px; color: #475569;">
          <div>*** THANK YOU FOR SHOPPING! ***</div>
          <div style="margin-top: 4px; font-family: monospace; letter-spacing: 2px;">||| | ||| || ||| ||</div>
        </div>
      `;
    }

    openModal('receiptModal');
    posCart = [];
    renderPosCart();
    await loadSales();
    showToast(`Bill ${data.billNo} generated successfully!`);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🧾 Complete Sale & Print Bill Receipt';
  }
}

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
