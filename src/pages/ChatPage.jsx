import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useCall } from '../context/CallContext';
import CallModal from '../components/CallModal';
import Peer from 'simple-peer';

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { callState, setCallState } = useCall();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Connect and authenticate
    socket.auth = { userId: user._id };
    if (!socket.connected) socket.connect();

    // Emit set-username (can use user.phone or user.username)
    const username = user.username || user.phone; // fallback if no username
    socket.emit('set-username', username);

    // Optional: Emit user-online
    socket.emit('user-online', {
      userId: user._id,
      phone: user.phone,
    });

    const handleBeforeUnload = () => {
      socket.emit('user-offline', user._id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.emit('user-offline', user._id);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.disconnect();
    };
  }, [user]);


useEffect(() => {
  socket.on('incoming-call', ({ from, offer }) => {
    setCallState({
      isReceivingCall: true,
      from,
      offer,
      callType: offer.type,
    });
  });

  socket.on('call-accepted', ({ answer }) => {
    if (callState.peer) {
      callState.peer.signal(answer);
    }
  });

  socket.on('ice-candidate', ({ candidate }) => {
    if (callState.peer) {
      callState.peer.signal(candidate);
    }
  });

  return () => {
    socket.off('incoming-call');
    socket.off('call-accepted');
    socket.off('ice-candidate');
  };
}, [callState.peer, setCallState]);

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatWindow />
      {callState.isReceivingCall && (
  <CallModal
    onAccept={() => {
      navigator.mediaDevices.getUserMedia({
  video: callState.callType === 'video',
  audio: true
}).then((stream) => {
  const localVideo = document.getElementById('localVideo');
  if (localVideo) localVideo.srcObject = stream;

  const peer = new Peer({ initiator: false, trickle: false, stream });

  peer.on('signal', (answer) => {
    socket.emit('answer-call', {
      to: callState.from,
      answer
    });
  });

  peer.on('stream', (remoteStream) => {
    const remoteVideo = document.getElementById('remoteVideo');
    if (remoteVideo) remoteVideo.srcObject = remoteStream;
  });

  peer.signal(callState.offer); // respond to offer
  setCallState({ ...callState, isReceivingCall: false, peer, stream });
});

    }}
    onReject={() => setCallState({ isReceivingCall: false })}
  />
)}

    </div>
  );
};

export default ChatPage;
