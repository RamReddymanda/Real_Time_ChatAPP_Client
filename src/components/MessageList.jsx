import React, { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

const MessageList = () => {
  const { messages, selectedUser } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  if (!messages || !selectedUser) return null;

  const selectedId = selectedUser[0] || selectedUser;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      date.toDateString() === today.toDateString()
    ) {
      return "Today";
    } else if (
      date.toDateString() === yesterday.toDateString()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  };

const filteredMessages = messages.filter(
  (msg) =>
    (msg.receiver === selectedId && msg.sender===user.phone ) ||
    (msg.sender === selectedId && msg.receiver===user.phone)
);

  let lastDate = null;

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
      {filteredMessages.map((msg, index) => {
        const isSender = msg.sender === user.phone;
        const msgDate = new Date(msg.timestamp);
        const dateLabel = formatDateLabel(msgDate);

        const showDateSeparator = !lastDate || lastDate !== msgDate.toDateString();
        lastDate = msgDate.toDateString();

        return (
          <React.Fragment key={msg.timestamp || index}>
            {showDateSeparator && (
              <div className="flex justify-center my-2">
                <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {dateLabel}
                </span>
              </div>
            )}

            <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>
              <div
                className={`rounded-2xl px-4 py-2 text-sm shadow-md max-w-xs sm:max-w-md break-words ${
                  isSender
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}

                <div
                  className={`text-[10px] mt-1 ${
                    isSender ? "text-right text-blue-100" : "text-left text-gray-500"
                  }`}
                >
                  {msgDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default MessageList;
