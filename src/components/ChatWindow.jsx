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

  const handleCall = async (type = 'video') => {
    console.log(type);
    
    try {
      const videoEnabled = type === 'video';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: true,
      });

      setVideoPermissionGranted(videoEnabled);
      setAudioPermissionGranted(true);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on('signal', (offer) => {
        socket.emit('call-user', {
          to: selectedUser[0],
          offer,
          callType:type, // required: this is call type (audio/video), NOT SDP type!
        });
      });

      peer.on('stream', (remoteStream) => {
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
        }
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        stream.getTracks().forEach((track) => track.stop());
        setCallState((prev) => ({
          ...prev,
          isCalling: false,
          isInCall: false,
        }));
      });

      // Save state
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

      // Attach stream after UI renders
      setTimeout(() => {
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
          localVideo.srcObject = stream;
          localVideo.muted = true;
        }
      }, 0);
    } catch (err) {
      console.error('Media access error:', err);
      alert('Camera or microphone access was blocked or failed.');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      <div className="bg-gray-200 p-4 font-semibold border-b">
        Chat with {selectedUser[0]}
      </div>

      <div className="flex gap-2 p-2">
        <button
          onClick={() => handleCall('audio')}
          className="bg-blue-500 px-3 py-1 text-white rounded"
          disabled={callState?.isCalling || callState?.isInCall}
        >
          📞 Audio Call
        </button>
        <button
          onClick={() => handleCall('video')}
          className="bg-purple-500 px-3 py-1 text-white rounded"
          disabled={callState?.isCalling || callState?.isInCall}
        >
          🎥 Video Call
        </button>
      </div>

      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
      >
        <MessageList />
      </div>

      <div className="p-4 border-t bg-white">
        <MessageInput />
      </div>

      {(callState?.isCalling || callState?.isInCall) && <CallWindow />}
    </div>
  );
};

export default ChatWindow;
