import './HomePage.css';
import React, { useState } from 'react';
import server_api from '../api/server_api.js';
import TechnicianList from './/UserAuthentication/TechnicianList.js';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [category, setCategory] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');

    const handleBecomeTechnician = async () => {
        try {
            const response = await server_api.post('/user/become-technician', { category });
            if (response.data.success) {
                setMessage('Successfully registered as technician!');
            } else {
                setMessage(response.data.message || 'Failed to register.');
            }
        } catch (err) {
            console.error('Error:', err);
            setMessage('An error occurred.');
        }
    };

    return (
        <div className="home-container">
            <h1 className="home-title">Welcome to the LTSPUT!</h1>

            <button onClick={() => setShowForm(!showForm)} className="become-tech-button">
                {showForm ? 'Cancel' : 'Become a Technician'}
            </button>

            {showForm && (
                <div className="form-section">
                    <label>Choose your skill category:</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">--Select Category--</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Console">Console</option>
                        <option value="PC">PC</option>
                    </select>

                    <button onClick={handleBecomeTechnician} disabled={!category}>
                        Submit
                    </button>
                </div>
            )}

            {message && <p className="message">{message}</p>}

            <TechnicianList />

            <Link to="/requests">
                <button className="my-requests-button">📄 My Requests</button>
            </Link>
        </div>
    );
};

export default HomePage;
