const express = require('express');
const router = express.Router();
const DB = require('../config/db.js');

// POST /user/login
router.post('/login', async (req, res) => {
    const { name, password } = req.body;
    
    try {
        const rows = await DB.authenticateLogin(name, password)
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found', success:false });
        }

        const user = rows[0];
        if (user.password !== password) {
            return res.status(401).json({ message: 'Incorrect password', success:false });
        }

        // Store user in session
        req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        res.json({ message: 'Login successful', success:true, user: req.session.user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /user/session
router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// server/routes/user.js
router.post('/register', async (req, res) => {
    const {name, password} = req.body;
    try {
        const result = await DB.registerUser(name, password);
        if (result.affectedRows > 0) {
            return res.json({ 
                message: 'Register successful', 
                success: true,
                userId: result.insertId  // Return the new user ID
            });
        }
        res.status(500).json({ 
            message: 'Registration failed', 
            success: false 
        });
    } catch (err) {
        console.error('Registration error:', err);
        
        // Handle duplicate username error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                message: 'Username already exists', 
                success: false 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error', 
            success: false 
        });
    }
});

// GET /user/technicians
router.get('/technicians', async (req, res) => {
    const { name, category } = req.query;
    try {
        const technicians = await DB.getFilteredTechnicians(name, category);
        res.json({ success: true, technicians });
    } catch (err) {
        console.error('Error fetching technicians:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch technicians' });
    }
});


router.post('/become-technician', async (req, res) => {
    const { category } = req.body;

    if (!req.session.user || !req.session.user.name) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const username = req.session.user.name;

    try {
        const result = await DB.becomeTechnician(username, category);
        res.json({ success: true, message: 'You are now a technician!', result });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'You are already a technician.' });
        }
        console.error('Become Technician Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /user/request-service
router.post('/request-service', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const { technicianId, description } = req.body;
    const userId = req.session.user.id;

    try {
        const result = await DB.createServiceRequest(userId, technicianId, description);
        res.json({ success: true, message: 'Service request sent!', requestId: result.insertId });
    } catch (err) {
        console.error('Service request error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /user/my-requests
router.get('/my-requests', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const userId = req.session.user.id;

    try {
        const requests = await DB.getUserServiceRequests(userId);
        res.json({ success: true, requests });
    } catch (err) {
        console.error('Error fetching user requests:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



module.exports = router;
