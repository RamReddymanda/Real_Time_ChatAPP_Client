import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import ChatPage from './pages/ChatPage';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import AuthInitializer from './context/AuthInitializer';
import LogoutPage from './pages/LogoutPage';
const App = () => {
  return (
    <Router>
      <AuthProvider>
        {/* Wrapping ChatProvider and CallProvider around the Routes */}
        <ChatProvider>
          <CallProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp" element={<OtpPage />} />
              <Route path="/logout" element={<LogoutPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
          </Routes>
          </CallProvider>
        </ChatProvider>

      </AuthProvider>
    </Router>
  );
};

export default App;
