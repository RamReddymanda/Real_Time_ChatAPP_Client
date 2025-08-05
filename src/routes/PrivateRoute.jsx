import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user,token } = useAuth();
  console.log(user,token,"hi")
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
