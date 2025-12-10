/**
 * Home Page Script
 */

let featuredProducts = [];

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    try {
        const result = await api.get('products.php');
        
        if (result.success && result.data && Array.isArray(result.data)) {
            featuredProducts = result.data.filter(p => p.is_available == 1 && p.is_archived == 0).slice(0, 6);
            const placeholder = CONFIG?.PLACEHOLDER_IMAGE || '../assets/images/placeholder.jpg';
            
            if (featuredProducts.length > 0) {
                container.innerHTML = featuredProducts.map(product => `
                    <div class="product-card">
                        <img src="${product.image_url || placeholder}" 
                             alt="${product.product_name}" 
                             class="product-image"
                             onerror="handleImageError(this)">
                        <div class="product-info">
                            <h3 class="product-name">${product.product_name}</h3>
                            <p class="product-description">${product.description || ''}</p>
                            <div class="product-price">${formatCurrency(product.price)}</div>
                            <div class="product-actions">
                                <button class="btn btn-primary" onclick="addToCart(${product.product_id})">
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">Belum ada produk tersedia.</p>';
            }
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">Gagal memuat produk.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">Terjadi kesalahan.</p>';
    }
}

async function addToCart(productId) {
    try {
        // First try to find product in already loaded products (works in demo mode)
        let product = featuredProducts.find(p => p.product_id === productId);
        
        // If not found locally, try API
        if (!product) {
            const result = await api.get(`products.php?id=${productId}`);
            if (result.success && result.data) {
                product = result.data;
            }
        }
        
        if (product) {
            cart.add(product);
            showNotification('Produk ditambahkan ke keranjang!', 'success');
        } else {
            showNotification('Produk tidak ditemukan', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
});
