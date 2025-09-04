import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://10.71.224.181:3000', {
  withCredentials: true,
  autoConnect: false
});

export default socket;
