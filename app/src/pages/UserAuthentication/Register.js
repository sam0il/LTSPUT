import React, { useState } from 'react';
import server_api from '../../api/server_api';
import { useNavigate } from 'react-router';
import './UserAuthentication.css';

function Register() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const { data } = await server_api.post('/user/register', {
                name: name,
                password: password
            });

            if (data.success) {
                navigate('/login');
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Register</h2>
            <input
                type="text"
                placeholder="Name"
                className="auth-input"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button className="auth-button" onClick={handleRegister}>Register</button>
            <button
                className="auth-button secondary"
                onClick={() => navigate('/login')}
                style={{ marginTop: '10px' }}
            >
                Already have an account? Login
            </button>
        </div>
    );

}

export default Register;
