const express = require('express');
const router = express.Router();
const DB = require('../config/db.js'); 

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  next();
}

async function handleStatusChange(req, res, requiredStatus, newStatus) {
  const { requestId } = req.body;
  const technicianId = req.session.user.technicianId;

  try {
    // Verify technician owns the request and that it's in requiredStatus
    const check = await DB.canChangeStatus(requestId, technicianId, requiredStatus, newStatus);
    if (!check || !check.canChange) {
      return res.status(403).json({
        success: false,
        message: `Request must be in ${requiredStatus} status and belong to you.`
      });
    }

    // Update status
    const success = await DB.updateRequestStatus(requestId, newStatus);
    res.json({
      success: !!success,
      message: success ? `Request ${newStatus}` : `Failed to update status`
    });
  } catch (err) {
    console.error(`${newStatus} error:`, err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


// Get technician's requests
router.get('/requests', requireLogin, async (req, res) => {
  const technicianId = req.session.user.technicianId; 

  if (!technicianId) {
    return res.status(403).json({ 
      success: false, 
      message: 'User is not a technician' 
    });
  }

  try {
    const requests = await DB.getTechnicianServiceRequests(technicianId);
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching technician requests:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Accept request
router.post('/accept-request', requireLogin, 
  (req, res) => handleStatusChange(req, res, 'pending', 'accepted'));

// Decline request
router.post('/decline-request', requireLogin, 
  (req, res) => handleStatusChange(req, res, 'pending', 'declined'));

// Finish request
router.post('/finish-request', requireLogin, 
  (req, res) => handleStatusChange(req, res, 'accepted', 'finished'));

// Get requests by technician ID (public)
router.get('/:id/requests', async (req, res) => {
  const technicianId = req.params.id;

  try {
    const requests = await DB.getTechnicianServiceRequests(technicianId);
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching technician requests by ID:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;