// src/pages/LogoutPage.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutPage = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout(); // Clears user, token, and localStorage
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Logging out...</p>
    </div>
  );
};

export default LogoutPage;
