import React, { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../context/ChatContext";

const ChatLayout = ({ Sidebar }) => {
  const { selectedUser } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Open sidebar if no user selected (mobile only)
  useEffect(() => {
    if (!selectedUser) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [selectedUser]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Component */}
        <div className="h-full overflow-y-auto">
          {Sidebar}
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white shadow-md">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-black"
          >
            ☰
          </button>
          <h2 className="text-lg font-semibold">
            {selectedUser ? "Chat with User" : "Select a user"}
          </h2>
          <div></div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
          {selectedUser ? (
            <MessageList />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Please select a user to start chatting.
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedUser && (
          <div className="p-2 bg-white border-t sticky bottom-0">
            <MessageInput />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
