import './HomePage.css';
import React, { useEffect, useState } from 'react';
import server_api from '../api/server_api.js';
import TechnicianList from './UserAuthentication/TechnicianList.js';
import TechnicianDashboard from './TechnicianDashboard';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';

const HomePage = () => {
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);  // Track userId separately
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await server_api.get('/user/session');

        if (data.loggedIn && data.user) {
          const { id, technicianId } = data.user;
          sessionStorage.setItem('userId', id);
          setUserId(id);

          // Update role based on technician status
          if (technicianId) {
            sessionStorage.setItem('technicianId', technicianId);
            setRole('technician');
          } else {
            setRole('user');
          }
        } else {
          // Handle not logged in state
          setRole(null);
        }
      } catch (err) {
        console.error('Session error:', err);
        setRole(null);
      }
    };

    fetchSession();
  }, []);
  const handleBecomeTechnician = async () => {
    try {
      // Ensure this is a POST request
      const { data } = await server_api.post('/user/become-technician', { category });

      if (data.success) {
        setMessage('Successfully registered as technician!');
        sessionStorage.setItem('technicianId', data.technicianId);
        setRole('technician');
      } else {
        setMessage(data.message || 'Failed to register.');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        setMessage(err.response.data.message || 'An error occurred');
      } else {
        setMessage('Network error. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await server_api.post('/user/logout');
      sessionStorage.clear();
      navigate('/login'); 
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  return (
    <div className="home-container">
      <button
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </button>
      <div className="main-content">
        <h1 className="home-title">Welcome to the LTSPUT!</h1>
        {role !== 'technician' && (
          <div className="become-tech-section">
            <button
              onClick={() => setShowForm(!showForm)}
              className="become-tech-button"
            >
              {showForm ? 'Cancel' : 'Become a Technician'}
            </button>
            {showForm && (
              <div className="form-section">
                <label>Choose your skill category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="">--Select Category--</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Console">Console</option>
                  <option value="PC">PC</option>
                </select>

                <button
                  onClick={handleBecomeTechnician}
                  disabled={!category}
                  className="submit-button"
                >
                  Submit
                </button>
              </div>
            )}

            {message && <p className="message">{message}</p>}
          </div>
        )}

        <TechnicianList />

        <Link to="/requests">
          <button className="my-requests-button">📄 My Requests</button>
        </Link>
      </div>
      {role === 'technician' && (
        <div className="technician-sidebar">
          <h2>Technician Dashboard</h2>
          <TechnicianDashboard />
        </div>
      )}
    </div>
  );
};

export default HomePage;