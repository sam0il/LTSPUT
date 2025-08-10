import React, { useEffect, useState } from 'react';
import server_api from '../api/server_api';
import { Link } from 'react-router-dom';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await server_api.get('/user/my-requests', { withCredentials: true });
        if (data.success) {
          setRequests(data.requests || []);
        } else {
          setError('Failed to fetch requests');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error fetching your requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

 return (
    <div className="request-page">
      <h2>📄 My Service Requests</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : requests.length === 0 ? (
        <p>You have not made any service requests yet.</p>
      ) : (
        <ul className="request-list">
          {requests.map((req) => {
            const techName = req.technician_name || 'Technician';
            const message = req.description || '(no message)';
            const status = req.status || 'pending';
            
            return (
              <li key={req.id} className="request-item">
                <p><strong>Technician:</strong> {techName}</p>
                <p><strong>Message:</strong> {message}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-${status}`}> {status}</span>
                </p>

                {status === 'finished' && (
                  <div className="rating-section">
                    <Link to={`/rate/${req.id}`} className="rate-link">
                      ⭐ Rate This Service
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MyRequests;