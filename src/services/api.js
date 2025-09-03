import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL_AUTH || 'http://192.168.29.156:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
