/**
 * Siap Santap - Main JavaScript Application
 * Dependencies: config.js, api.js, demo-data.js (must be loaded before this file)
 */

// Utility Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Cart Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }
    
    add(product, quantity = 1) {
        // Validation
        if (!product || !product.product_id) {
            console.error('Invalid product');
            return false;
        }
        
        if (quantity < 1) {
            console.error('Invalid quantity');
            return false;
        }
        
        const existing = this.items.find(item => item.product_id === product.product_id);
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price,
                image_url: product.image_url,
                quantity
            });
        }
        
        this.save();
        this.updateUI();
        return true;
    }
    
    remove(productId) {
        const id = parseInt(productId);
        this.items = this.items.filter(item => item.product_id !== id);
        this.save();
        this.updateUI();
    }
    
    updateQuantity(productId, quantity) {
        const id = parseInt(productId);
        const qty = parseInt(quantity);
        const item = this.items.find(item => item.product_id === id);
        
        if (item) {
            if (qty <= 0) {
                this.remove(id);
            } else {
                item.quantity = qty;
                this.save();
                this.updateUI();
            }
        }
    }
    
    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    }
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getTotalWithTax() {
        const subtotal = this.getTotal();
        const tax = subtotal * (CONFIG?.TAX_RATE || 0.11);
        return subtotal + tax;
    }
    
    getItemCount() {
        return this.items.length;
    }
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
    updateUI() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const count = this.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }
}

const cart = new Cart();

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FF9800'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${bgColors[type] || bgColors.success};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: CONFIG?.CURRENCY || 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    cart.updateUI();
    checkAuth();
});

async function checkAuth() {
    try {
        const result = await api.get('auth.php?action=check');
        if (result.logged_in) {
            updateAuthUI(result.user);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

function updateAuthUI(user) {
    const authLinks = document.querySelector('.auth-links');
    if (authLinks && user) {
        authLinks.innerHTML = `
            <span>Welcome, ${user.full_name}</span>
            <a href="orders.html">My Orders</a>
            ${user.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
            <a href="#" onclick="logout()">Logout</a>
        `;
    }
}

async function logout() {
    await api.post('auth.php?action=logout');
    localStorage.clear();
    window.location.href = 'index.html';
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && navLinks.classList.contains('active')) {
        if (!nav.contains(e.target) || (!toggle.contains(e.target) && !navLinks.contains(e.target))) {
            navLinks.classList.remove('active');
        }
    }
});

// Handle image load errors
function handleImageError(img) {
    img.onerror = null;
    img.src = CONFIG?.PLACEHOLDER_IMAGE || '../assets/images/placeholder.jpg';
}
