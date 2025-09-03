import React from "react";
import { useChat } from "../context/ChatContext";
import { useCall } from "../context/CallContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import CallWindow from "./CallWindow";

const ChatWindow = () => {
  const { selectedUser, typing, users } = useChat();
  const { callState } = useCall();

  if (!selectedUser || !selectedUser[0]) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500 text-lg">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${
              users.some((u) => u[0] === selectedUser[0])
                ? "bg-green-400"
                : "bg-gray-400"
            }`}
          ></span>
          <span className="font-semibold">{selectedUser[0]}</span>
          {typing.has(selectedUser[0]) && (
            <span className="ml-3 text-sm italic">typing...</span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">
            📞
          </button>
          <button className="bg-white text-purple-600 px-3 py-1 rounded hover:bg-gray-100">
            🎥
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <MessageList />

      {/* Input */}
      <div className="sticky bottom-0 bg-white p-2 border-t">
        <MessageInput />
      </div>

      {/* Call Overlay */}
      {callState?.isCalling || callState?.isInCall ? <CallWindow /> : null}
    </div>
  );
};

export default ChatWindow;
