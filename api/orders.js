/**
 * Orders API - Serverless Function
 */

// In-memory orders store (for demo)
let orders = [];
let orderIdCounter = 1;

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, query } = req;

    switch (method) {
        case 'GET':
            if (query.id) {
                const order = orders.find(o => o.order_id === parseInt(query.id));
                if (order) {
                    return res.status(200).json({ 
                        success: true, 
                        data: {
                            order,
                            items: order.items,
                            tracking: order.tracking || []
                        }
                    });
                }
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            return res.status(200).json({ success: true, data: orders });

        case 'POST':
            const { items, full_name, email, phone, address, city, postal_code, payment_method, notes, subtotal, tax, shipping, total } = req.body;
            
            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: 'Order items required' });
            }

            const newOrder = {
                order_id: orderIdCounter++,
                order_number: `ORD-${Date.now()}`,
                full_name,
                email,
                phone,
                shipping_address: `${address}, ${city} ${postal_code}`,
                city,
                postal_code,
                payment_method: payment_method || 'cod',
                notes,
                subtotal: subtotal || 0,
                tax: tax || 0,
                shipping: shipping || 10000,
                total_amount: total || 0,
                status: 'pending',
                items,
                tracking: [
                    {
                        status: 'pending',
                        description: 'Pesanan dibuat',
                        created_at: new Date().toISOString()
                    }
                ],
                created_at: new Date().toISOString()
            };

            orders.push(newOrder);

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order_id: newOrder.order_id,
                order_number: newOrder.order_number
            });

        case 'PUT':
            const orderId = parseInt(query.id || req.body.order_id);
            const orderIndex = orders.findIndex(o => o.order_id === orderId);
            
            if (orderIndex === -1) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            const { status, description } = req.body;
            
            if (status) {
                orders[orderIndex].status = status;
                orders[orderIndex].tracking.push({
                    status,
                    description: description || `Status diubah ke ${status}`,
                    created_at: new Date().toISOString()
                });
            }

            return res.status(200).json({ success: true, message: 'Order updated' });

        default:
            return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
