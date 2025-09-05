import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useAuth } from './AuthContext';
import { decryptMessageFromSender } from '../services/encrptionService';
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [typing,setTyping]=useState(new Set())
  const [users, setUsers] = useState([]);
   useEffect(() => {
      if (messages) {
        console.log('Messages updated:', messages);
        localStorage.setItem('messages', JSON.stringify(messages));
        console.log('Messages saved to localStorage',localStorage.getItem('messages'));
      } 
    }, [messages]);
  useEffect(() => {
    socket.on('private-message',async({from,payload,timestamp})=>{
      const text=await decryptMessageFromSender(payload)
      const msg={
        sender:from,
        receiver:user.phone,
        message:text,
        timestamp
      }
      console.log('Received private message:', msg);
      setMessages((prev) => {
        const updated = [...prev, msg];
        return updated;
      });
    })
    socket.on('typing', ({from}) => {
        console.log(from,"typing")
        setTyping(prev => {
          const updated = new Set(prev);
          updated.add(from);
          return updated;
        });
      });

    socket.on('stopped-typing', ({from}) => {
      setTyping(prev => {
        const updated = new Set(prev);
        updated.delete(from);
        return updated;
      });
  });
    // Optional: Clear listeners on unmount
    return () => {
      socket.off('receive-private-message');
      socket.off('typing');
      socket.off('stopped-typing');
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        typing,
        users,
        setUsers,
        setTyping
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
