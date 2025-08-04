// components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useChat } from '../context/ChatContext';
import UserItem from './UserItem';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { fetchRecentChats } from '../services/auth';
const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [view, setView] = useState('recent'); // 'recent' or 'online'
  const { setSelectedUser,messages } = useChat();
  const { user } = useAuth();

  // Fetch online users
  useEffect(() => {
    if (!user) return;
    socket.on('online-users', (onlineUsers) => {
      setUsers(onlineUsers.filter((u) => u[0] !== user.phone));
    });

    return () => {
      socket.off('online-users');
    };
  }, [user]);

  // Fetch recent chats
  useEffect(() => {
    if (user) {
      fetchRecentChats(user.phone)
        .then((res) => setRecentChats(res.data))
        .catch((err) => console.error('Error fetching recent chats:', err));
    }
  }, [messages]);

  const handleClick = (username) => {
    setSelectedUser(username);
  };

  return (
    <div className="h-screen w-64 bg-gray-100 border-r overflow-y-auto flex flex-col">
             <div className="bg-white text-center py-2 border-t">
      Welcome {user ? user.phone : 'Guest'}
    </div>
      <div className="flex justify-around border-b p-2 bg-white">
        <button
          className={`px-3 py-1 rounded ${
            view === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setView('recent')}
        >
          Recent
        </button>
        <button
          className={`px-3 py-1 rounded ${
            view === 'online' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setView('online')}
        >
          Online
        </button>
      </div>

      <div className="p-2">
        {view === 'recent' && (
          <>
            <h3 className="text-lg font-semibold mb-2">Recent Chats</h3>
            {recentChats.length === 0 && <p className="text-gray-500">No recent chats</p>}
            {recentChats.map((chat) => (
              <UserItem key={chat.phone} username={chat.phone} onClick={() => handleClick([chat.phone, 'recent'])} />
            ))}
          </>
        )}

        {view === 'online' && (
          <>
            <h3 className="text-lg font-semibold mb-2">Online Users</h3>
            {users.length === 0 && <p className="text-gray-500">No users online</p>}
            {users.map((u) => (
              <UserItem key={u[1]} username={u[0]} onClick={() => handleClick(u)} />
            ))}
          </>
        )}
      </div>

    </div>
  );
};

export default Sidebar;
