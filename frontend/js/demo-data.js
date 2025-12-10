/**
 * Siap Santap - Demo Data Module
 * Sample data for demo mode when backend is unavailable
 */

const DEMO_DATA = {
    products: [
        {
            product_id: 1,
            category_id: 1,
            product_name: 'Nasi Goreng Spesial',
            description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
            price: 25000,
            image_url: '../assets/placeholder.jpg',
            stock: 50,
            is_available: 1,
            is_archived: 0,
            category_name: 'Makanan Berat'
        },
        {
            product_id: 2,
            category_id: 1,
            product_name: 'Mie Goreng Seafood',
            description: 'Mie goreng dengan udang, cumi, dan sayuran',
            price: 28000,
            image_url: '../assets/placeholder.jpg',
            stock: 40,
            is_available: 1,
            is_archived: 0,
            category_name: 'Makanan Berat'
        },
        {
            product_id: 3,
            category_id: 1,
            product_name: 'Ayam Bakar Madu',
            description: 'Ayam bakar dengan bumbu madu spesial',
            price: 35000,
            image_url: '../assets/placeholder.jpg',
            stock: 30,
            is_available: 1,
            is_archived: 0,
            category_name: 'Makanan Berat'
        },
        {
            product_id: 4,
            category_id: 2,
            product_name: 'Sate Ayam',
            description: '10 tusuk sate ayam dengan bumbu kacang',
            price: 20000,
            image_url: '../assets/placeholder.jpg',
            stock: 45,
            is_available: 1,
            is_archived: 0,
            category_name: 'Makanan Ringan'
        },
        {
            product_id: 5,
            category_id: 2,
            product_name: 'Kentang Goreng',
            description: 'Kentang goreng crispy dengan saus sambal',
            price: 15000,
            image_url: '../assets/placeholder.jpg',
            stock: 60,
            is_available: 1,
            is_archived: 0,
            category_name: 'Makanan Ringan'
        },
        {
            product_id: 6,
            category_id: 3,
            product_name: 'Es Teh Manis',
            description: 'Teh manis dingin segar',
            price: 5000,
            image_url: '../assets/placeholder.jpg',
            stock: 100,
            is_available: 1,
            is_archived: 0,
            category_name: 'Minuman'
        },
        {
            product_id: 7,
            category_id: 3,
            product_name: 'Jus Alpukat',
            description: 'Jus alpukat segar dengan susu',
            price: 12000,
            image_url: '../assets/placeholder.jpg',
            stock: 35,
            is_available: 1,
            is_archived: 0,
            category_name: 'Minuman'
        },
        {
            product_id: 8,
            category_id: 3,
            product_name: 'Kopi Susu',
            description: 'Kopi susu gula aren',
            price: 15000,
            image_url: '../assets/placeholder.jpg',
            stock: 50,
            is_available: 1,
            is_archived: 0,
            category_name: 'Minuman'
        }
    ],
    
    categories: [
        { category_id: 1, category_name: 'Makanan Berat', description: 'Menu utama yang mengenyangkan' },
        { category_id: 2, category_name: 'Makanan Ringan', description: 'Snack dan camilan' },
        { category_id: 3, category_name: 'Minuman', description: 'Berbagai pilihan minuman segar' }
    ],
    
    // Helper to get products by category
    getProductsByCategory(categoryId) {
        if (!categoryId || categoryId === 'all') {
            return this.products.filter(p => !p.is_archived && p.is_available);
        }
        return this.products.filter(p => 
            p.category_id === parseInt(categoryId) && !p.is_archived && p.is_available
        );
    },
    
    // Helper to get single product
    getProduct(productId) {
        return this.products.find(p => p.product_id === parseInt(productId));
    }
};

Object.freeze(DEMO_DATA.categories);
