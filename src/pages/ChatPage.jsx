import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useCall } from "../context/CallContext";
import CallModal from "../components/CallModal";

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { callState, resetCallState } = useCall();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    socket.auth = { userId: user._id };
    if (!socket.connected) socket.connect();

    const username = user.username || user.phone;
    socket.emit("set-username", username);
    socket.emit("user-online", { userId: user._id, phone: user.phone });

    const handleBeforeUnload = () => {
      socket.emit("user-offline", user._id);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.emit("user-offline", user._id);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.disconnect();
    };
  }, [user, navigate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-70 bg-white border-r">
        <Sidebar />
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 w-full">
        <ChatWindow />
      </div>

      {/* Call Modal */}
      {callState.isReceivingCall && (
        <CallModal onAccept={resetCallState} onReject={resetCallState} />
      )}
    </div>
  );
};

export default ChatPage;
