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
      const timestamp = new Date().toISOString();

      // 1. Get recipient public key
      const recipientPubB64 = await getPublicKeyFor(remoteUserId);
      if (!recipientPubB64) throw new Error("Recipient public key not found");

      // 2. Encrypt message
      const payload = await encryptMessageToRecipient(recipientPubB64, input);

      // 3. Prepare local message for UI
      const newMsg = {
        sender: user.phone,
        receiver: remoteUserId,
        message: input,
        timestamp,
      };

      // 4. Prepare encrypted packet for backend
      const messagePacket = {
        to: remoteUserId,
        from: user.phone,
        timestamp,
        payload,
      };

      // 5. Send encrypted message via socket
      socket.emit("private-message", messagePacket);

      // 6. Stop typing
      socket.emit("stopped-typing", remoteUserId);

      // 7. Update local state
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      console.error("Failed to send encrypted message:", err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (selectedUser && selectedUser[0]) {
      socket.emit("typing", { to: selectedUser[0] });

      if (typingTimeout.current) clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        socket.emit("stopped-typing", { to: selectedUser[0] });
      }, 1500);
    }
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
        onKeyDown={(e) => e.key === "Enter" && sendEncryptedMessage()}
        placeholder="Type a message..."
      />

      {/* Emoji */}
      <button className="p-2 text-gray-500 hover:text-gray-700">😊</button>

      {/* Send */}
      <button
        onClick={sendEncryptedMessage}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-all"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;
