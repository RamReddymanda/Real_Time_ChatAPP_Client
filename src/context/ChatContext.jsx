import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
   useEffect(() => {
      if (messages) {
        console.log('Messages updated:', messages);
        localStorage.setItem('messages', JSON.stringify(messages));
        console.log('Messages saved to localStorage',localStorage.getItem('messages'));
      } 
    }, [messages]);
  useEffect(() => {
    // ✅ Receiving a message
    socket.on('receive-private-message', (msg) => {
      console.log('Received private message:', msg);
      setMessages((prev) => {
        const updated = [...prev, msg];
        return updated;
      });
    });

    // Optional: Clear listeners on unmount
    return () => {
      socket.off('receive-private-message');
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        onlineUsers,
        setOnlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
