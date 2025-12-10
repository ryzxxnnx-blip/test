/**
 * Auth API - Serverless Function
 * Note: For demo purposes. In production, use proper JWT/session management
 */

// Demo users
const users = [
    {
        user_id: 1,
        username: 'admin',
        email: 'admin@siapsantap.com',
        password: 'admin123', // In production, use hashed passwords
        full_name: 'Administrator',
        role: 'admin'
    },
    {
        user_id: 2,
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        full_name: 'Demo User',
        role: 'customer'
    }
];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    if (req.method === 'GET' && action === 'check') {
        // Check auth from header token (simplified)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            // In demo, token is just the user_id
            const user = users.find(u => u.user_id === parseInt(token));
            if (user) {
                return res.status(200).json({
                    success: true,
                    logged_in: true,
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        full_name: user.full_name,
                        role: user.role
                    }
                });
            }
        }
        return res.status(200).json({ success: true, logged_in: false });
    }

    if (req.method === 'POST') {
        const { username, password, email, full_name } = req.body;

        switch (action) {
            case 'login':
                const user = users.find(u => 
                    (u.username === username || u.email === username) && u.password === password
                );
                
                if (user) {
                    return res.status(200).json({
                        success: true,
                        message: 'Login successful',
                        token: user.user_id.toString(), // Simplified token
                        user: {
                            user_id: user.user_id,
                            username: user.username,
                            full_name: user.full_name,
                            role: user.role
                        }
                    });
                }
                return res.status(401).json({ success: false, message: 'Invalid credentials' });

            case 'register':
                // Check if username/email exists
                if (users.find(u => u.username === username || u.email === email)) {
                    return res.status(400).json({ success: false, message: 'Username or email already exists' });
                }
                
                const newUser = {
                    user_id: users.length + 1,
                    username,
                    email,
                    password,
                    full_name,
                    role: 'customer'
                };
                users.push(newUser);
                
                return res.status(201).json({
                    success: true,
                    message: 'Registration successful',
                    user: {
                        user_id: newUser.user_id,
                        username: newUser.username,
                        full_name: newUser.full_name
                    }
                });

            case 'logout':
                return res.status(200).json({ success: true, message: 'Logged out' });

            default:
                return res.status(400).json({ success: false, message: 'Invalid action' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
