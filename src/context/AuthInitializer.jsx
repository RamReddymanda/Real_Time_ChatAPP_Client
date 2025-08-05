import React, { useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AuthInitializer = ({ children }) => {
  const { login,user,token } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // if (!token) {
        //   console.warn('No token found, redirecting to login');
        //   return;
        // }
        // const res =  api.get(`/auth/me/${token}`);
        // console.log('Session check response:', res.data.user);
        // if (res.user ===user) {
        //   login({ user: res.data.user, token: res.data.user });
        // }else{
        //   navigator('/');
        // }
      } catch (err) {
        console.warn('No session found:', err.response?.data || err.message);
      }
    };

    checkAuth();
  }, [login]);

  return children;
};

export default AuthInitializer;
