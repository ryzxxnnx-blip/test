/**
 * Products API - Serverless Function
 * Deploy to Vercel/Netlify
 */

// In-memory data store (for demo - use database in production)
let products = [
    {
        product_id: 1,
        category_id: 1,
        product_name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
        price: 25000,
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
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
        image_url: '/assets/placeholder.jpg',
        stock: 50,
        is_available: 1,
        is_archived: 0,
        category_name: 'Minuman'
    }
];

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, query } = req;

    switch (method) {
        case 'GET':
            if (query.id) {
                const product = products.find(p => p.product_id === parseInt(query.id));
                if (product) {
                    return res.status(200).json({ success: true, data: product });
                }
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            
            let result = products.filter(p => p.is_available === 1 && p.is_archived === 0);
            
            if (query.category) {
                result = result.filter(p => p.category_id === parseInt(query.category));
            }
            
            return res.status(200).json({ success: true, data: result });

        case 'POST':
            const newProduct = {
                product_id: products.length + 1,
                ...req.body,
                is_available: 1,
                is_archived: 0
            };
            products.push(newProduct);
            return res.status(201).json({ success: true, data: newProduct });

        case 'PUT':
            const updateId = parseInt(query.id || req.body.product_id);
            const index = products.findIndex(p => p.product_id === updateId);
            if (index !== -1) {
                products[index] = { ...products[index], ...req.body };
                return res.status(200).json({ success: true, data: products[index] });
            }
            return res.status(404).json({ success: false, message: 'Product not found' });

        case 'DELETE':
            const deleteId = parseInt(query.id);
            const deleteIndex = products.findIndex(p => p.product_id === deleteId);
            if (deleteIndex !== -1) {
                products.splice(deleteIndex, 1);
                return res.status(200).json({ success: true, message: 'Product deleted' });
            }
            return res.status(404).json({ success: false, message: 'Product not found' });

        default:
            return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
