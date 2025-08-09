// src/pages/RateRequestPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import server_api from '../api/server_api';
import './RateRequestPage.css';

function RateRequestPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [repairLasted, setRepairLasted] = useState(false);
  const [technicianName, setTechnicianName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const { data } = await server_api.get(`/user/request/${requestId}`);
        if (data.success) {
          setTechnicianName(data.technicianName || 'Technician');
        } else {
          setError(data.message || 'Failed to load request details');
        }
      } catch (err) {
        setError('Error loading request details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [requestId]);

  const handleSubmit = async () => {
    try {
      const { data } = await server_api.post('/user/rate', {
        requestId,
        stars,
        comment,
        repair_lasted: repairLasted
      });
      
      if (data.success) {
       // navigate('/');
      } else {
        setError(data.message || 'Failed to submit rating');
      }
    } catch (err) {
      setError('Error submitting rating');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="rate-container">
      <h2>Rate Service from {technicianName}</h2>
      
      {error && <p className="error">{error}</p>}
      
      <div className="rate-form">
        <div className="form-group">
          <label>Rating (1-5 stars):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={stars}
            onChange={(e) => setStars(parseInt(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label>Your Review:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience..."
            rows={5}
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={repairLasted}
              onChange={(e) => setRepairLasted(e.target.checked)}
            />
            Repair lasted beyond warranty period
          </label>
        </div>
        
        <button onClick={handleSubmit} className="submit-button">
          Submit Rating
        </button>
      </div>
    </div>
  );
}

export default RateRequestPage;