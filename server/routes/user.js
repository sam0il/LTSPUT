const express = require('express');
const router = express.Router();
const DB = require('../config/db.js');

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  next();
}

// Update login route to properly set session
router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const users = await DB.authenticateLogin(name, password); //1
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    // Set session properly
    req.session.user = {
      id: user.id,
      name: user.name,
      isTechnician: user.isTechnician,
      technicianId: user.technicianId
    };
    
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// In routes/user.js
router.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ 
      loggedIn: true, 
      user: req.session.user 
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// server/routes/user.js
router.post('/register', async (req, res) => {
    const {name, password} = req.body;
    try {
        const result = await DB.registerUser(name, password); //2
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
        const technicians = await DB.getFilteredTechnicians(name, category); //3
        res.json({ success: true, technicians });
    } catch (err) {
        console.error('Error fetching technicians:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch technicians' });
    }
});





router.post('/become-technician', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  const userId = req.session.user.id;
  const { category } = req.body;

  try {
    const result = await DB.becomeTechnician(userId, category); //4

    // Update session to reflect technician status
    req.session.user.isTechnician = true;
    req.session.user.category = category;
    // Optionally also save technicianId or other data if you want
    req.session.user.technicianId = result.insertId;

    res.json({ 
      success: true, 
      message: 'You are now a technician!',
      technicianId: result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a technician.' 
      });
    }
    console.error('Become Technician Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + err.message 
    });
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
        const result = await DB.createServiceRequest(userId, technicianId, description); //5
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
        const requests = await DB.getUserServiceRequests(userId); //6
        res.json({ success: true, requests });
    } catch (err) {
        console.error('Error fetching user requests:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Updated /rate endpoint
// Updated /rate endpoint
router.post('/rate', requireLogin, async (req, res) => {
  const { requestId, stars, comment, repair_lasted } = req.body;
  const userId = req.session.user.id;

  try {
    // Verify request using db.js function
    const request = await DB.canRateRequest(requestId, userId); //7
    
    if (!request || request.status !== 'finished') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot rate this request' 
      });
    }

    // Submit rating using db.js function
    await DB.createRating( //8
      requestId,
      userId,
      request.technician_id,
      stars,
      comment,
      repair_lasted
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ success: false, message: 'Rating failed' });
  }
});

// Updated route in user.js
router.get('/request/:id', requireLogin, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.session.user.id;

  try {
    const requestDetails = await DB.getRequestDetailsForUser(requestId, userId); //9
    
    if (requestDetails) {
      res.json({ 
        success: true, 
        technicianName: requestDetails.technician_name 
      });
    } else {
      res.status(404).json({ success: false, message: 'Request not found' });
    }
  } catch (err) {
    console.error('Request details error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // optional: clear cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
});



module.exports = router;
