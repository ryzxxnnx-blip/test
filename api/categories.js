/**
 * Categories API - Serverless Function
 */

const categories = [
    { category_id: 1, category_name: 'Makanan Berat', description: 'Menu utama yang mengenyangkan' },
    { category_id: 2, category_name: 'Makanan Ringan', description: 'Snack dan camilan' },
    { category_id: 3, category_name: 'Minuman', description: 'Berbagai pilihan minuman segar' }
];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { id } = req.query;
        
        if (id) {
            const category = categories.find(c => c.category_id === parseInt(id));
            if (category) {
                return res.status(200).json({ success: true, data: category });
            }
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        return res.status(200).json({ success: true, data: categories });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
