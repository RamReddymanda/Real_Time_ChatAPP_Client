import React, { useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import { encryptMessageToRecipient } from "../services/encrptionService";
import { getPublicKeyFor } from "../services/keymanager";

const MessageInput = () => {
  const { selectedUser, setMessages } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const typingTimeout = useRef(null);

  const sendEncryptedMessage = async () => {
    try {
      if (!input.trim()) return;
      if (!selectedUser || selectedUser.length === 0) return;

      const remoteUserId = selectedUser[0];
      const recipientPubB64 = await getPublicKeyFor(remoteUserId);
      console.log(recipientPubB64);
      const payload = await encryptMessageToRecipient(recipientPubB64, input);

      const messagePacket = {
        to: selectedUser[0],
        from: user.phone,
        timestamp: new Date().toISOString(),
        payload,
      };

      socket.emit("private-message", messagePacket);
    } catch (err) {
      console.error("Failed to send encrypted message:", err);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      sender: user.phone,
      receiver: selectedUser[0],
      message: input,
      timestamp: new Date().toISOString(),
    };

    sendEncryptedMessage();
    socket.emit("stopped-typing", selectedUser[0]);
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (selectedUser && selectedUser[0]) {
      socket.emit("typing", { to: selectedUser[0] });
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      if (selectedUser && selectedUser[0]) {
        socket.emit("stopped-typing", { to: selectedUser[0] });
      }
    }, 1500);
  };

  return (
    <div className="sticky bottom-0 bg-white p-2 flex items-center gap-2 shadow-md">
      {/* Attachment */}
      <button className="p-2 text-gray-500 hover:text-gray-700">📎</button>

      {/* Input */}
      <input
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />

      {/* Emoji */}
      <button className="p-2 text-gray-500 hover:text-gray-700">😊</button>

      {/* Send */}
      <button
        onClick={sendMessage}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-all"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;
