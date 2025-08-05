import api from './api';

export const sendOtp = (phone) => api.post('/auth/send-otp', { phone });

export const verifyOtp = (phone, otp) => api.post('/auth/verify-otp', { phone, otp });

export const fetchRecentChats = (phone) => api.get(`/chat/recent-chats/${phone}`);

export const getCurrentUser = (token) => api.get(`/auth/me/${token}`);