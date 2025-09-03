import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://192.168.29.156:3000', {
  withCredentials: true,
  autoConnect: false
});

export default socket;
