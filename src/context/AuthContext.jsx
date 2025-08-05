import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
// import { set } from 'mongoose';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('token');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log("user",user)
    if (user) {
      
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
      console.log("token",token)    
    if (token) {

      localStorage.setItem('token', JSON.stringify(token));
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (data) => {
    console.log("hi",data.token)
    setUser(data.user);
    setToken(data.token);
    console.log(token)
    // navigate('/');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
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
