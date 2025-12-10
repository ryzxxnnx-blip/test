/**
 * Messages API - Serverless Function
 */

let messages = [];
let messageIdCounter = 1;

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({ success: true, data: messages });
    }

    if (req.method === 'POST') {
        const { subject, message, message_id, reply } = req.body;
        
        // Reply to existing message
        if (message_id && reply) {
            const msg = messages.find(m => m.message_id === parseInt(message_id));
            if (msg) {
                msg.admin_reply = reply;
                msg.status = 'replied';
                msg.replied_at = new Date().toISOString();
                return res.status(200).json({ success: true, message: 'Reply sent' });
            }
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        // Create new message
        const newMessage = {
            message_id: messageIdCounter++,
            subject: subject || 'No Subject',
            message: message || '',
            full_name: 'Guest User',
            email: 'guest@example.com',
            status: 'unread',
            admin_reply: null,
            created_at: new Date().toISOString()
        };
        
        messages.push(newMessage);
        
        return res.status(201).json({
            success: true,
            message: 'Message sent',
            message_id: newMessage.message_id
        });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
