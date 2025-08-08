import React, { useEffect, useState } from 'react';
import server_api from '../api/server_api';
//import './MyRequests.css'; // Optional styling

function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await server_api.get('/user/my-requests', { withCredentials: true });
                if (data.success) {
                    setRequests(data.requests);
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
                    {requests.map((req, index) => (
                        <li key={index} className="request-item">
                            <p><strong>Technician:</strong> {req.technician_name}</p>
                            <p><strong>Message:</strong> {req.message}</p>
                            <p><strong>Status:</strong> {req.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyRequests;
