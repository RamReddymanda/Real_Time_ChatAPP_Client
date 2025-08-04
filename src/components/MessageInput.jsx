import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';

const MessageInput = () => {
  const { selectedUser, setMessages, message } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    // console.log(user._id, selectedUser, input);
    
    const newMsg = {
      sender: user.phone,
      receiver: selectedUser[0],
      message: input,
      timestamp: new Date().toISOString(),
    };

    // Emit to server
    socket.emit('send-private-message', newMsg);
    
    // Update local message list
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  
  };
  
  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border p-2 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type your message..."
      />
      <button
        onClick={sendMessage}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
