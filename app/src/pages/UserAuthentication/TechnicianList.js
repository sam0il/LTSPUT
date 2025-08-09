import React, { useState, useEffect, useCallback } from 'react';
import server_api from '../../api/server_api';
import './TechnicianList.css';

function TechnicianList() {
    const [technicians, setTechnicians] = useState([]);
    const [nameFilter, setNameFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [requestFormVisible, setRequestFormVisible] = useState(null);
    const [requestMessage, setRequestMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch technicians with useCallback to memoize the function
    const fetchTechnicians = useCallback(async () => {
        try {
            const { data } = await server_api.get('/user/technicians', {
                params: {
                    name: nameFilter,
                    category: categoryFilter
                }
            });
            if (data.success) {
                setTechnicians(data.technicians || []);
            }
        } catch (err) {
            console.error('Error fetching technicians:', err);
        }
    }, [nameFilter, categoryFilter]); // Dependencies

    // Single useEffect for fetching technicians
    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]); // Now we can safely include fetchTechnicians as a dependency

    const toggleRequestForm = (techId) => {
        setRequestFormVisible(prev => (prev === techId ? null : techId));
        setRequestMessage('');
        setSuccessMessage('');
    };

    const handleSubmitRequest = async (techId) => {
        if (!requestMessage.trim()) return alert('Please enter your issue description.');

        try {
            const { data } = await server_api.post('/user/request-service', {
                technicianId: techId,
                description: requestMessage.trim()
            });

            if (data.success) {
                setSuccessMessage('✅ Request sent!');
                setTimeout(() => {
                    setRequestFormVisible(null);
                    setSuccessMessage('');
                }, 2000);
            } else {
                alert(data.message || 'Failed to send request.');
            }
        } catch (err) {
            console.error('Request error:', err);
            alert('Error sending request.');
        }
    };

    return (
        <div className="tech-container">
            <h2 className="tech-title">🔧 Browse Local Technicians</h2>

            <div className="tech-filters">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                />
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Console">Console</option>
                    <option value="PC">PC</option>
                </select>
                <button onClick={fetchTechnicians}>🔍 Filter</button>
            </div>

            <div className="tech-list">
                {technicians.length === 0 ? (
                    <p>No technicians found.</p>
                ) : (
                    technicians.map(t => (
                        <div key={t.id} className="tech-card">
                            <h3>{t.name}</h3>
                            <p><strong>Category:</strong> {t.category}</p>

                            <button onClick={() => toggleRequestForm(t.id)}>
                                {requestFormVisible === t.id ? 'Cancel' : 'Request Service'}
                            </button>

                            {requestFormVisible === t.id && (
                                <div className="request-form">
                                    <textarea
                                        placeholder="Describe your issue..."
                                        value={requestMessage}
                                        onChange={e => setRequestMessage(e.target.value)}
                                    />
                                    <button onClick={() => handleSubmitRequest(t.id)}>
                                        Submit Request
                                    </button>
                                    {successMessage && <p className="success-msg">{successMessage}</p>}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default TechnicianList;