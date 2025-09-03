import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useCall } from '../context/CallContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CallWindow from './CallWindow';
import Peer from 'simple-peer';
import socket from '../utils/socket';

const ChatWindow = () => {
  const { selectedUser } = useChat();
  const { callState, setCallState } = useCall();
  const chatBoxRef = useRef();
  const [videoPermissionGranted, setVideoPermissionGranted] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [callState, selectedUser]);

  if (!selectedUser || !selectedUser[0]) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p>Select a user to start chatting</p>
      </div>
    );
  }
// const ICE_SERVERS = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' },
//     {
//       urls: 'turn:openrelay.metered.ca:80',
//       username: 'openrelayproject',
//       credential: 'openrelayproject'
//     }
//   ]
// };
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }, // STUN
    {
      urls: [
        'turn:relay1.expressturn.com:3478',
        'turns:relay1.expressturn.com:5349'
      ],
      username: 'expressturn',
      credential: 'expressturn'
    }
  ]
};

// --- HANDLE CALL IN CHATWINDOW (Caller Side) ---
const handleCall = async (type = 'video') => {
  try {
    const videoEnabled = type === 'video';
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoEnabled,
      audio: true,
    });

    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream,
      config: ICE_SERVERS,
      iceTransportPolicy: 'relay' 
    });

    peer.on('signal', (data) => {
      if (data.type === 'offer') {
        socket.emit('call-user', {
          to: selectedUser[0],
          offer: data,
          callType: type,
        });
      } else {
        socket.emit('ice-candidate', {
          to: selectedUser[0],
          candidate: data,
        });
      }
    });


    setCallState({
      isCalling: true,
      isInCall: true,
      callType: type,
      peer,
      stream,
      from: null,
      offer: null,
      isReceivingCall: false,
    });

    setTimeout(() => {
      const localVideo = document.getElementById('localVideo');
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.muted = true;
      }
    }, 0);
  } catch (err) {
    alert('Camera or microphone access was blocked or failed.');
    console.error(err);
  }
};
return (
  <div className="flex flex-col flex-1 bg-white h-full overflow-hidden">
    {/* Header with Gradient and Call Buttons */}
    <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md h-16">
      <div className="font-semibold text-lg">
        Chat with {selectedUser[0]}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleCall("audio")}
          className="bg-white text-blue-600 px-3 py-1 rounded shadow hover:bg-gray-100 transition"
          disabled={callState?.isCalling || callState?.isInCall}
        >
          📞
        </button>
        <button
          onClick={() => handleCall("video")}
          className="bg-white text-purple-600 px-3 py-1 rounded shadow hover:bg-gray-100 transition"
          disabled={callState?.isCalling || callState?.isInCall}
        >
          🎥
        </button>
      </div>
    </div>

    {/* Scrollable Chat Messages */}
    <div
      ref={chatBoxRef}
      className="flex-1 overflow-y-auto bg-gray-100"
    >
      <MessageList />
    </div>

    {/* Message Input */}
    <div className="p-2 border-t bg-white">
      <MessageInput />
    </div>

    {/* Call Window */}
    {(callState?.isCalling || callState?.isInCall) && <CallWindow />}
  </div>
);


};

export default ChatWindow;