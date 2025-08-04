import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import ChatPage from './pages/ChatPage';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <CallProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route
              path="/chat"
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
