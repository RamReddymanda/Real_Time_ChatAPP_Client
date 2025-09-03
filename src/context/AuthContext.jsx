import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
// import { set } from 'mongoose';
// import {setupUserKeys} from '../crypto/keyManager';
import {publishMyPublicKey} from '../services/keymanager'
// import api from '../services/api';
// import { setupUserKeys } from '../crypto/e2eeSetup';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('token');
    return saved ? saved : null;
  });

  const navigate = useNavigate();


/**
 * Ensure that a user's E2EE keys exist locally.
 * If missing, generate and upload them.
 *
 * @param {string|number} userId
 * @returns {Promise<void>}
 */
 async function ensureKeys(userId) {
  if (!userId) throw new Error('userId required');

  const localKeys = localStorage.getItem(`tn-identity-key`);

  if (!localKeys) {
    console.log(`No E2EE keys found for user ${userId} — generating new set...`);
    await publishMyPublicKey(userId);
  }
}

  useEffect(() => {
    console.log("user",user)
    if (user) {
      
      localStorage.setItem('user', JSON.stringify(user));
      // localStorage.removeItem('tn-identity-key');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('tn-identity-key');
    }
  }, [user]);

  useEffect(() => {
      console.log("token",token)    
    if (token) {

      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async(data) => {
    console.log("hi",data.token)
    setUser(data.user);
    setToken(data.token);
    await ensureKeys(data.user.phone)
    console.log(token)
    // navigate('/');
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    //  localStorage.removeItem('user');
    //   localStorage.removeItem('token');
    console.log("logout called")
    localStorage.removeItem('tn-identity-key');
    navigate('/login');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!token || !user) 
          {
            return
          };
        const res = await getCurrentUser(token);
        if (res.data.user.phone === user?.phone) {
          setUser(res.data.user);
          setToken(res.data.token);
          console.log('hbhjemdbznjs',res.data.user.phone)
          ensureKeys(res.data.user.phone)
          navigate('/');
        } else {
          console.log("logout")
          logout();
        }
      } catch (err) {
        console.warn('No session found:', err.response?.data || err.message);
        logout();
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user,token, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
