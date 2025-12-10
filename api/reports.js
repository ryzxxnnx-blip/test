/**
 * Reports API - Serverless Function
 */

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { type } = req.query;
        
        if (type === 'summary') {
            return res.status(200).json({
                success: true,
                data: {
                    daily: { total_revenue: 0, total_orders: 0 },
                    weekly: { total_revenue: 0, total_orders: 0 },
                    monthly: { total_revenue: 0, total_orders: 0 },
                    top_products: []
                }
            });
        }
        
        if (type === 'sales') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        return res.status(200).json({ success: true, data: {} });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
