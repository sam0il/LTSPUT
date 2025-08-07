// app/src/api/server_api.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const server_api = axios.create({
    baseURL: 'http://88.200.63.148:5022'
});

export default server_api;
