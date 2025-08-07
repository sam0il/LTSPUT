import React, { useState } from 'react';
import server_api from '../../api/server_api';
import {useNavigate} from "react-router";

function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    
    const navigate = useNavigate();
    
    const handleLogin = async () => {
        try {
            const { data } = await server_api.post('/user/login', {
                name:name,
                password:password
            });

            if(data.success){
                navigate("/")
            }
            
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            
        </div>
    );
}

export default Login;
