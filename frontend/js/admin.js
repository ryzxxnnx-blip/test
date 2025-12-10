/**
 * Admin Dashboard Script
 */

// Check admin access
async function checkAdminAccess() {
    const result = await api.get('auth.php?action=check');
    if (!result.logged_in || result.user.role !== 'admin') {
        window.location.href = 'index.html';
    }
}

// Tab Management
function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadAdminOrders();
            break;
        case 'reports':
            loadReports();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    const result = await api.get('reports.php?type=summary');
    
    if (result.success) {
        document.getElementById('daily-revenue').textContent = formatCurrency(result.data.daily.total_revenue || 0);
        document.getElementById('weekly-revenue').textContent = formatCurrency(result.data.weekly.total_revenue || 0);
        document.getElementById('monthly-revenue').textContent = formatCurrency(result.data.monthly.total_revenue || 0);
        
        const topProducts = document.getElementById('top-products');
        topProducts.innerHTML = `
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th>Terjual</th>
                            <th>Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.top_products.map(p => `
                            <tr>
                                <td>${p.product_name}</td>
                                <td>${p.total_sold}</td>
                                <td>${formatCurrency(p.revenue)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Products Management
async function loadProducts() {
    const container = document.getElementById('products-list');
    const filterSelect = document.getElementById('product-filter');
    const filterValue = filterSelect ? filterSelect.value : 'all';
    
    try {
        console.log('Loading products for admin...');
        
        // Show loading state
        container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Memuat produk...</p></div>';
        
        const result = await api.get('products.php?archived=true');
        console.log('Admin products result:', result);
        
        if (result.success && result.data) {
            // Filter products based on selection
            let filteredProducts = result.data;
            if (filterValue === 'active') {
                filteredProducts = result.data.filter(p => !p.is_archived);
            } else if (filterValue === 'archived') {
                filteredProducts = result.data.filter(p => p.is_archived);
            }
            
            if (filteredProducts.length === 0) {
                const emptyMessage = filterValue === 'archived' 
                    ? 'Tidak ada produk yang diarsipkan' 
                    : filterValue === 'active'
                    ? 'Tidak ada produk aktif'
                    : 'Belum ada produk';
                    
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <h3>${emptyMessage}</h3>
                        <p>${filterValue === 'all' ? 'Klik "Tambah Produk" untuk menambahkan produk baru.' : 'Coba ubah filter untuk melihat produk lainnya.'}</p>
                    </div>
                `;
            } else {
                container.innerHTML = filteredProducts.map(product => `
                    <div class="product-item ${product.is_archived ? 'archived' : ''}" data-product-id="${product.product_id}">
                        <img src="${product.image_url || '../assets/placeholder.jpg'}" 
                             alt="${product.product_name}"
                             onerror="this.src='../assets/placeholder.jpg'">
                        <div class="product-item-info">
                            <h3>${product.product_name} ${product.is_archived ? '<span style="color: #999; font-size: 0.8em;">(Diarsipkan)</span>' : ''}</h3>
                            <p><strong style="color: #667eea;">${formatCurrency(product.price)}</strong> | Stok: <strong>${product.stock}</strong></p>
                            <p style="color: #666; font-size: 0.9rem;">📂 ${product.category_name || 'Tanpa Kategori'}</p>
                            <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${product.is_archived 
                                    ? '<span class="badge badge-cancelled">📁 Diarsipkan</span>' 
                                    : '<span class="badge badge-delivered">✓ Aktif</span>'}
                                ${!product.is_available 
                                    ? '<span class="badge badge-pending">⚠️ Tidak Tersedia</span>' 
                                    : '<span class="badge" style="background: #4facfe; color: white;">🛒 Tersedia</span>'}
                            </div>
                        </div>
                        <div class="action-buttons">
                            ${!product.is_archived ? `
                                <button class="btn btn-primary" onclick="showProductModal(${product.product_id})" title="Edit Produk">
                                    ✏️ Edit
                                </button>
                            ` : ''}
                            <button class="btn ${product.is_archived ? 'btn-success' : 'btn-warning'}" 
                                    onclick="archiveProduct(${product.product_id}, ${!product.is_archived})" 
                                    title="${product.is_archived ? 'Aktifkan Kembali' : 'Arsipkan Produk'}">
                                ${product.is_archived ? '📂 Aktifkan' : '📁 Arsipkan'}
                            </button>
                            <button class="btn btn-danger" onclick="deleteProduct(${product.product_id})" title="Hapus Permanen">
                                🗑️ Hapus
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Gagal memuat produk</h3><p>Silakan refresh halaman atau hubungi administrator.</p></div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><h3>Terjadi kesalahan</h3><p>Tidak dapat memuat data produk.</p></div>';
    }
    
    await loadCategories();
}

function filterProducts(value) {
    loadProducts();
}

async function loadCategories() {
    const result = await api.get('categories.php');
    if (result.success) {
        const select = document.getElementById('category_select');
        if (select) {
            select.innerHTML = '<option value="">Pilih Kategori</option>' + 
                result.data.map(cat => `<option value="${cat.category_id}">${cat.category_name}</option>`).join('');
        }
    }
}

function showProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (modal && form) {
        modal.style.display = 'block';
        
        if (productId) {
            document.getElementById('modal-title').textContent = '✏️ Edit Produk';
            loadProductData(productId);
        } else {
            document.getElementById('modal-title').textContent = '➕ Tambah Produk Baru';
            form.reset();
            document.getElementById('product_id').value = '';
            document.getElementById('is_available').checked = true;
        }
        
        // Load categories if not loaded
        loadCategories();
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (form) {
        form.reset();
    }
    
    // Clear image preview
    removeImagePreview();
}

async function loadProductData(productId) {
    try {
        const result = await api.get(`products.php?id=${productId}`);
        console.log('Loading product data:', result);
        
        if (result.success && result.data) {
            const form = document.getElementById('productForm');
            const product = result.data;
            
            // Fill form fields
            document.getElementById('product_id').value = product.product_id || '';
            document.getElementById('product_name').value = product.product_name || '';
            document.getElementById('category_select').value = product.category_id || '';
            document.getElementById('description').value = product.description || '';
            document.getElementById('price').value = product.price || '';
            document.getElementById('stock').value = product.stock || '';
            document.getElementById('image_url').value = product.image_url || '';
            document.getElementById('is_available').checked = product.is_available ? true : false;
            
            // Show current image if exists
            if (product.image_url) {
                const preview = document.getElementById('image_preview');
                const previewImg = document.getElementById('preview_img');
                previewImg.src = product.image_url;
                preview.style.display = 'block';
            }
        } else {
            showNotification('Gagal memuat data produk', 'error');
        }
    } catch (error) {
        console.error('Error loading product data:', error);
        showNotification('Terjadi kesalahan saat memuat data produk', 'error');
    }
}

// Image Preview Functions
function previewImage(input) {
    const preview = document.getElementById('image_preview');
    const previewImg = document.getElementById('preview_img');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const imageUrlInput = document.getElementById('image_url');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Ukuran file terlalu besar! Maksimal 5MB', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.match('image.*')) {
            showNotification('File harus berupa gambar!', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
            // Clear URL input when file is uploaded
            if (imageUrlInput) imageUrlInput.value = '';
        };
        reader.readAsDataURL(file);
    }
}

function removeImagePreview() {
    const input = document.getElementById('image_upload');
    const preview = document.getElementById('image_preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const previewImg = document.getElementById('preview_img');
    
    input.value = '';
    preview.style.display = 'none';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
    if (previewImg) previewImg.src = '';
}

function handleImageUrlChange(input) {
    const preview = document.getElementById('image_preview');
    const previewImg = document.getElementById('preview_img');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const fileInput = document.getElementById('image_upload');
    
    if (input.value.trim()) {
        // Clear file input when URL is provided
        if (fileInput) fileInput.value = '';
        
        // Show preview of URL image
        previewImg.src = input.value;
        preview.style.display = 'block';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    } else {
        // Reset preview if URL is cleared
        preview.style.display = 'none';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
    }
}

// Format price input to allow custom values
function formatPriceInput(input) {
    // Remove non-numeric characters
    let value = input.value.replace(/[^0-9]/g, '');
    
    // Update input value
    input.value = value;
}

// Product Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            
            // Check if image file is uploaded
            const imageFile = formData.get('image');
            const hasImageFile = imageFile && imageFile.size > 0;
            const productId = formData.get('product_id');
            
            // If image file exists, use multipart/form-data
            if (hasImageFile) {
                // Convert is_available checkbox
                if (!formData.has('is_available')) {
                    formData.set('is_available', '0');
                } else {
                    formData.set('is_available', '1');
                }
                
                // Clean price value
                const priceValue = formData.get('price').replace(/[^0-9]/g, '');
                formData.set('price', priceValue);
                
                try {
                    const url = `${API_URL}/products.php`;
                    
                    const response = await fetch(url, {
                        method: 'POST', // Always use POST for file upload
                        body: formData,
                        credentials: 'include'
                    });
                    
                    const result = await response.json();
                    console.log('Product save result:', result);
                    
                    if (result.success) {
                        showNotification('✓ Produk berhasil disimpan!', 'success');
                        closeProductModal();
                        loadProducts();
                    } else {
                        showNotification(result.message || 'Gagal menyimpan produk', 'error');
                    }
                } catch (error) {
                    console.error('Error saving product:', error);
                    showNotification('Terjadi kesalahan saat menyimpan produk', 'error');
                }
            } else {
                // Use JSON for non-file uploads
                const data = {};
                
                // Convert FormData to object
                for (let [key, value] of formData.entries()) {
                    if (key === 'image') continue; // Skip empty file input
                    
                    if (key === 'is_available') {
                        data[key] = true;
                    } else if (key === 'price') {
                        // Clean and parse price
                        data[key] = parseInt(value.replace(/[^0-9]/g, '')) || 0;
                    } else if (key === 'stock' || key === 'category_id') {
                        data[key] = value ? parseInt(value) : null;
                    } else {
                        data[key] = value;
                    }
                }
                
                // Handle checkbox if not checked
                if (!formData.has('is_available')) {
                    data.is_available = false;
                }
                
                // Remove empty product_id
                if (!data.product_id) {
                    delete data.product_id;
                }
                
                console.log('Submitting product data:', data);
                
                try {
                    const productId = data.product_id;
                    const result = productId 
                        ? await api.put('products.php', data)
                        : await api.post('products.php', data);
                    
                    console.log('Product save result:', result);
                    
                    if (result.success) {
                        showNotification('✓ Produk berhasil disimpan!', 'success');
                        closeProductModal();
                        loadProducts();
                    } else {
                        showNotification(result.message || 'Gagal menyimpan produk', 'error');
                    }
                } catch (error) {
                    console.error('Error saving product:', error);
                    showNotification('Terjadi kesalahan saat menyimpan produk', 'error');
                }
            }
        });
    }
});

async function archiveProduct(productId, archive) {
    try {
        const action = archive ? 'mengarsipkan' : 'mengaktifkan kembali';
        const actionPast = archive ? 'diarsipkan' : 'diaktifkan kembali';
        
        if (!confirm(`Yakin ingin ${action} produk ini?\n\n${archive ? 'Produk yang diarsipkan tidak akan muncul di halaman toko.' : 'Produk akan muncul kembali di halaman toko.'}`)) {
            return;
        }
        
        // Show loading on the button
        const productItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (productItem) {
            productItem.style.opacity = '0.5';
            productItem.style.pointerEvents = 'none';
        }
        
        const result = await api.put('products.php', {
            product_id: productId,
            is_archived: archive
        });
        
        console.log('Archive result:', result);
        
        if (result.success) {
            showNotification(`✓ Produk berhasil ${actionPast}!`, 'success');
            
            // Smooth transition
            if (productItem) {
                productItem.style.transition = 'all 0.3s ease';
                productItem.style.transform = 'scale(0.95)';
                productItem.style.opacity = '0';
                
                setTimeout(() => {
                    loadProducts();
                }, 300);
            } else {
                loadProducts();
            }
        } else {
            if (productItem) {
                productItem.style.opacity = '1';
                productItem.style.pointerEvents = 'auto';
            }
            showNotification(result.message || 'Gagal mengubah status produk', 'error');
        }
    } catch (error) {
        console.error('Error archiving product:', error);
        showNotification('Terjadi kesalahan saat mengubah status produk', 'error');
        
        // Restore UI
        const productItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (productItem) {
            productItem.style.opacity = '1';
            productItem.style.pointerEvents = 'auto';
        }
    }
}

async function deleteProduct(productId) {
    if (!confirm('⚠️ PERHATIAN!\n\nYakin ingin menghapus produk ini PERMANEN?\n\nData yang dihapus tidak dapat dikembalikan!\n\nTip: Gunakan fitur "Arsipkan" jika ingin menyembunyikan produk tanpa menghapusnya.')) {
        return;
    }
    
    // Double confirmation for safety
    if (!confirm('Konfirmasi sekali lagi: Hapus produk ini PERMANEN?')) {
        return;
    }
    
    try {
        // Show loading
        const productItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (productItem) {
            productItem.style.opacity = '0.5';
            productItem.style.pointerEvents = 'none';
        }
        
        const result = await api.delete(`products.php?id=${productId}`);
        console.log('Delete result:', result);
        
        if (result.success) {
            showNotification('✓ Produk berhasil dihapus permanen!', 'success');
            
            // Smooth removal animation
            if (productItem) {
                productItem.style.transition = 'all 0.3s ease';
                productItem.style.transform = 'translateX(-100%)';
                productItem.style.opacity = '0';
                
                setTimeout(() => {
                    loadProducts();
                }, 300);
            } else {
                loadProducts();
            }
        } else {
            if (productItem) {
                productItem.style.opacity = '1';
                productItem.style.pointerEvents = 'auto';
            }
            showNotification(result.message || 'Gagal menghapus produk', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Terjadi kesalahan saat menghapus produk', 'error');
        
        // Restore UI
        const productItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (productItem) {
            productItem.style.opacity = '1';
            productItem.style.pointerEvents = 'auto';
        }
    }
}

// Orders Management
async function loadAdminOrders() {
    const result = await api.get('orders.php');
    const container = document.getElementById('orders-list');
    
    if (result.success) {
        container.innerHTML = result.data.map(order => `
            <div class="order-item-admin">
                <h3>Order #${order.order_number}</h3>
                <p>Customer: ${order.full_name} (${order.email})</p>
                <p>Total: ${formatCurrency(order.total_amount)}</p>
                <p>Pembayaran: ${order.payment_method.toUpperCase()}</p>
                <p>Status: <span class="badge badge-${order.order_status}">${order.order_status}</span></p>
                <div class="action-buttons" style="margin-top: 1rem;">
                    <select onchange="updateOrderStatus(${order.order_id}, this.value)">
                        <option value="">Update Status</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        `).join('');
    }
}

async function updateOrderStatus(orderId, status) {
    if (!status) return;
    
    const result = await api.put('orders.php', {
        order_id: orderId,
        status: status,
        description: `Order status updated to ${status}`
    });
    
    if (result.success) {
        showNotification('Status pesanan diperbarui!');
        loadAdminOrders();
    }
}

// Reports
async function loadReports() {
    const result = await api.get('reports.php?type=sales');
    const container = document.getElementById('sales-report');
    
    if (result.success) {
        container.innerHTML = `
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(order => `
                            <tr>
                                <td>${order.order_number}</td>
                                <td>${order.full_name}</td>
                                <td>${formatCurrency(order.total_amount)}</td>
                                <td>${order.payment_method}</td>
                                <td>${new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Messages
async function loadMessages() {
    const result = await api.get('messages.php');
    const container = document.getElementById('messages-list');
    
    if (result.success) {
        container.innerHTML = result.data.map(msg => `
            <div class="message-item ${msg.status === 'unread' ? 'unread' : ''}">
                <h3>${msg.subject}</h3>
                <p><strong>From:</strong> ${msg.full_name} (${msg.email})</p>
                <p>${msg.message}</p>
                <p style="color: #666; font-size: 0.9rem;">
                    ${new Date(msg.created_at).toLocaleString('id-ID')}
                </p>
                ${msg.admin_reply ? `
                    <div style="background: var(--bg-light); padding: 1rem; border-radius: 5px; margin-top: 1rem;">
                        <strong>Reply:</strong>
                        <p>${msg.admin_reply}</p>
                    </div>
                ` : `
                    <div class="reply-form">
                        <textarea id="reply-${msg.message_id}" placeholder="Tulis balasan..." rows="3" style="width: 100%; padding: 0.5rem;"></textarea>
                        <button class="btn btn-primary" onclick="replyMessage(${msg.message_id})" style="margin-top: 0.5rem;">Kirim Balasan</button>
                    </div>
                `}
            </div>
        `).join('');
    }
}

async function replyMessage(messageId) {
    const reply = document.getElementById(`reply-${messageId}`).value;
    if (!reply) return;
    
    const result = await api.post('messages.php', {
        message_id: messageId,
        reply: reply
    });
    
    if (result.success) {
        showNotification('Balasan terkirim!');
        loadMessages();
    }
}

// Initialize
checkAdminAccess();
loadDashboard();
