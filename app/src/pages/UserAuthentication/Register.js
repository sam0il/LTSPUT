// app/src/pages/UserAuthentication/Register.js

import React, { useState } from 'react';
import server_api from '../../api/server_api';
import { useNavigate } from 'react-router';

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
                navigate('/login'); // or navigate("/") if you want to redirect to homepage
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;
