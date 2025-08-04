import React from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const MessageList = () => {
  const { message,messages, selectedUser } = useChat();
  const { user } = useAuth();

  if (!messages || !selectedUser) return null;

  const selectedId = selectedUser[0] || selectedUser;
  console.log("selectedId", selectedId);
  return (
    <div className="flex flex-col gap-2">
      {messages
        .filter(
          (msg) =>
            (msg.receiver === selectedId) ||
            (msg.sender === selectedId)
        )
        .map((msg) => (
          <div
            key={msg.timestamp}
            className={`p-2 rounded max-w-xs break-words ${
              msg.sender === user.phone
                ? 'bg-green-200 self-end'
                : 'bg-gray-300 self-start'
            }`}
          >
            {msg.message}
          </div>
        ))}
    </div>
  );
};

export default MessageList;
