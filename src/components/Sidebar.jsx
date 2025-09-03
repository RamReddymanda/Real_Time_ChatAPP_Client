import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useChat } from '../context/ChatContext';
import UserItem from './UserItem';
import { useAuth } from '../context/AuthContext';
import { fetchRecentChats } from '../services/auth';
import { useNavigate } from 'react-router-dom';
const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [view, setView] = useState('recent'); // 'recent' or 'online'
  const { setSelectedUser, messages } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Fetch recent chats (initial load)
  useEffect(() => {
    if (user) {
      fetchRecentChats(user.phone)
        .then((res) => {
          // Sort recent chats by last message timestamp
          const sorted = res.data.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
          setRecentChats(sorted);
        })
        .catch((err) => console.error('Error fetching recent chats:', err));
    }
  }, [user]);

  // Update recent chat order when new message arrives
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    setRecentChats((prev) => {
      const updated = prev.filter((chat) => chat.phone !== lastMsg.sender && chat.phone !== lastMsg.receiver);

      // Find the other party (not the current user)
      const otherUser = lastMsg.sender === user.phone ? lastMsg.receiver : lastMsg.sender;

      updated.unshift({ phone: otherUser, lastMessageTime: lastMsg.timestamp });
      return updated;
    });
  }, [messages, user]);

  const handleClick = (username) => {
    setSelectedUser(username);
  };

  return (
    <div className="h-full w-64 bg-gray-100 border-r flex flex-col">
      {/* Sidebar Header (Match ChatWindow Header) */}
      <div className="bg-gradient-to-r from-blue-500 to-violet-600 text-white text-center font-bold text-lg flex items-center justify-center h-16 shadow-md">
        {user ? `Welcome ${user.phone}` : "Guest"}
        <button
      onClick={() => navigate('/logout')}
      className="text-red-600 hover:underline"
    >
      Logout
    </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-around border-b p-2 bg-white">
        <button
          className={`px-3 py-1 rounded ${view === "recent" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setView("recent")}
        >
          Recent
        </button>
        <button
          className={`px-3 py-1 rounded ${view === "online" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          onClick={() => setView("online")}
        >
          Online
        </button>
      </div>

      {/* Chat Lists */}
      <div className="p-3 overflow-y-auto">
        {view === "recent" && (
          <>
            <h3 className="text-sm font-semibold mb-2 text-gray-600">
              Recent Chats
            </h3>
            {recentChats.length === 0 && <p className="text-gray-500">No recent chats</p>}
            {recentChats.map((chat) => (
              <UserItem
                key={chat.phone}
                username={chat.phone}
                onClick={() => handleClick([chat.phone, "recent"])}
              />
            ))}
          </>
        )}

        {view === "online" && (
          <>
            <h3 className="text-sm font-semibold mb-2 text-gray-600">
              Online Users
            </h3>
            {users.length === 0 && <p className="text-gray-500">No users online</p>}
            {users.map((u) => (
              <UserItem
                key={u[1]}
                username={u[0]}
                onClick={() => handleClick(u)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
