import React, { useEffect, useState } from 'react';
import server_api from '../api/server_api';
import './TechnicianDashboard.css';

function TechnicianDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await server_api.get('/technician/requests', { withCredentials: true });
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

const [technicianId, setTechnicianId] = useState(null);

useEffect(() => {
  // Get technician ID from session
  const techId = sessionStorage.getItem('technicianId');
  setTechnicianId(techId);
  
  fetchRequests();
}, []);

  const handleAccept = async (requestId) => {
    try {
      const { data } = await server_api.post('/technician/accept-request', { requestId }, { withCredentials: true });
      if (data.success) {
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'accepted' } : req
        ));
        setSuccessMessage('Request accepted!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to accept request');
      }
    } catch (err) {
      console.error('Accept error:', err);
      setError('Failed to accept request');
    }
  };

  const handleDecline = async (requestId) => {
  try { 
    const { data } = await server_api.post('/technician/decline-request', { requestId }, { withCredentials: true });
    if (data.success) {
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'declined' } : req
      ));
      setSuccessMessage('Request declined!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      // Show detailed error message
      setError(`Failed to decline: ${data.message || 'Unknown error'}`);
    }
  } catch (err) {
    // Show complete error info
    setError(`Decline failed: ${err.response?.data?.message || err.message}`);
    console.error('Decline error:', err.response?.data || err);
  }
};

  const handleFinish = async (requestId) => {
  try {
    const { data } = await server_api.post('/technician/finish-request', { requestId }, { withCredentials: true });
    if (data.success) {
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'finished' } : req
      ));
      setSuccessMessage('Request marked as finished!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      // Show detailed error message
      setError(`Failed to finish: ${data.message || 'Unknown error'}`);
    }
  } catch (err) {
    // Show complete error info
    setError(`Finish failed: ${err.response?.data?.message || err.message}`);
    console.error('Finish error:', err.response?.data || err);
  }
};

  return (
    <div className="technician-dashboard">
      <h2>🛠️ Service Requests for You</h2>
      
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      <button onClick={fetchRequests} className="refresh-button">
        🔄 Refresh Requests
      </button>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No service requests assigned to you yet.</p>
      ) : (
        <div className="request-list">
          {requests.map((req) => {
            const userName = req.user_name || 'User';
            const message = req.description || 'No description provided';
            const status = req.status || 'pending';

            return (
              <div key={req.id} className="request-card">
                <div className="request-header">
                  <h3>Request #{req.id}</h3>
                  <span className={`status-badge status-${status}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                
                <div className="request-details">
                  <p><strong>From:</strong> {userName}</p>
                  <p><strong>Issue:</strong> {message}</p>
                  <p><strong>Created:</strong> {new Date(req.created_at).toLocaleString()}</p>
                  <p><strong>Technician ID:</strong> {req.technician_id}</p>
                </div>
                
                <div className="request-actions">
                  {status === 'pending' && (
                    <>
                      <button 
                        className="action-btn accept-btn"
                        onClick={() => handleAccept(req.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="action-btn decline-btn"
                        onClick={() => handleDecline(req.id)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  {status === 'accepted' && (
                    <button 
                      className="action-btn finish-btn"
                      onClick={() => handleFinish(req.id)}
                    >
                      Mark as Finished
                    </button>
                  )}
                  
                  {status === 'finished' && (
                    <p className="info-note">User can now rate this service</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TechnicianDashboard;