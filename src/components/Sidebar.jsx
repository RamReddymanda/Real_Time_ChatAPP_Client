import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { fetchRecentChats } from '../services/auth';
import UserItem from './UserItem';

const Sidebar = () => {
  const { users, setUsers, setSelectedUser, messages } = useChat();
  const { user } = useAuth();
  const [recentChats, setRecentChats] = useState([]);
  const [view, setView] = useState('recent');
  const [search, setSearch] = useState('');

  // ✅ Listen for online users
  useEffect(() => {
    if (!user) return;
    socket.on('online-users', (onlineUsers) => {
      setUsers(onlineUsers.filter((u) => u[0] !== user.phone));
    });

    return () => {
      socket.off('online-users');
    };
  }, [user, setUsers]);

  // ✅ Fetch initial recent chats only once
  useEffect(() => {
    if (user) {
      fetchRecentChats(user.phone)
        .then((res) => setRecentChats(res.data || []))
        .catch((err) => console.error('Error fetching recent chats:', err));
    }
  }, [user]);

  // ✅ Update recentChats order when a new message is sent/received
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const partner =
      lastMessage.sender === user.phone ? lastMessage.receiver : lastMessage.sender;

    setRecentChats((prev) => {
      const existing = prev.find((c) => c.phone === partner);
      const filtered = prev.filter((c) => c.phone !== partner);

      // Add partner to top (if new, just add it)
      return [{ phone: partner }, ...filtered];
    });
  }, [messages, user.phone]);

  const handleClick = (username) => setSelectedUser(username);

  const filteredUsers =
    view === 'recent'
      ? recentChats.filter((chat) => chat.phone.includes(search))
      : users.filter((u) => u[0].includes(search));

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white text-center py-4 font-bold text-lg">
        Welcome {user ? user.phone : 'Guest'}
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b bg-gray-50">
        <button
          className={`flex-1 py-2 ${view === 'recent' ? 'bg-blue-100 font-semibold' : ''}`}
          onClick={() => setView('recent')}
        >
          Recent
        </button>
        <button
          className={`flex-1 py-2 ${view === 'online' ? 'bg-green-100 font-semibold' : ''}`}
          onClick={() => setView('online')}
        >
          Online
        </button>
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No users found</p>
        ) : (
          filteredUsers.map((item) =>
            view === 'recent' ? (
              <UserItem
                key={item.phone}
                username={item.phone}
                onClick={() => handleClick([item.phone, 'recent'])}
              />
            ) : (
              <UserItem
                key={item[1]}
                username={item[0]}
                onClick={() => handleClick(item)}
              />
            )
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
