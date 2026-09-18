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
  updatePosSubtotal();
}

function updatePosSubtotal() {
  const select = document.getElementById('posProductSelect');
  const selectedOpt = select.options[select.selectedIndex];
  const qtyInput = document.getElementById('posQuantity');

  if (!selectedOpt || !selectedOpt.value) {
    document.getElementById('posUnitPrice').value = '₹0.00';
    document.getElementById('posAvailableStock').value = '0';
    document.getElementById('posBillAmount').textContent = '₹0.00';
    return;
  }

  const price = parseFloat(selectedOpt.getAttribute('data-price') || 0);
  const stock = parseInt(selectedOpt.getAttribute('data-stock') || 0);
  const qty = parseInt(qtyInput.value || 1);

  document.getElementById('posUnitPrice').value = `₹${price.toFixed(2)}`;
  document.getElementById('posAvailableStock').value = stock;

  const total = price * Math.max(1, qty);
  document.getElementById('posBillAmount').textContent = `₹${total.toFixed(2)}`;
}

async function loadSales() {
  const tbody = document.getElementById('salesTableBody');
  try {
    const res = await fetch(`${API_BASE}/sales`);
    state.sales = await res.json();

    if (!state.sales || state.sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No sales billed yet.</td></tr>';
      return;
    }

    tbody.innerHTML = state.sales.map(s => `
      <tr>
        <td>#SALE-${s.saleId}</td>
        <td><strong>${escapeHtml(s.productName || 'Product #' + s.productId)}</strong></td>
        <td>${s.quantitySold} units</td>
        <td><strong style="color: #2563eb;">₹${Number(s.totalPrice).toFixed(2)}</strong></td>
        <td>${s.saleDate}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: #ef4444;">Failed to load sales register.</td></tr>';
  }
}

async function handlePosSale(e) {
  e.preventDefault();
  const prodId = parseInt(document.getElementById('posProductSelect').value);
  const qty = parseInt(document.getElementById('posQuantity').value);

  if (!prodId) {
    alert('Please select a product to sell.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: prodId, quantitySold: qty })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sale transaction failed');

    showToast(`Sale recorded successfully! Total: ₹${Number(data.totalPrice).toFixed(2)}`);
    document.getElementById('posSaleForm').reset();
    updatePosSubtotal();

    loadSales();
    loadProducts();
    loadDashboard();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
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
