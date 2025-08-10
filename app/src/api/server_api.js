import axios from 'axios';

axios.defaults.withCredentials = true;

const server_api = axios.create({
    baseURL: 'http://88.200.63.148:5022',
    withCredentials: true, 
});

export default server_api;
