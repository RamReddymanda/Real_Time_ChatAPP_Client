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
  const { callState, setCallState, resetCallState } = useCall(); // 👈 Add resetCallState in context

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    socket.auth = { userId: user._id };
    if (!socket.connected) socket.connect();

    const username = user.username || user.phone;
    socket.emit('set-username', username);
    socket.emit('user-online', { userId: user._id, phone: user.phone });

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
    socket.on('incoming-call', ({ from, offer, callType }) => {
      setCallState({
        isReceivingCall: true,
        from,
        offer,
        callType,
        isCalling: false,
        isInCall: false,
        peer: null,
        stream: null,
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

  const handleAccept = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callState.callType === 'video',
        audio: true,
      });

      const localVideo = document.getElementById('localVideo');
      if (localVideo) localVideo.srcObject = stream;

      const peer = new Peer({ initiator: false, trickle: false, stream });

      peer.on('signal', (answer) => {
        socket.emit('answer-call', {
          to: callState.from,
          answer,
        });
      });

      peer.on('stream', (remoteStream) => {
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) remoteVideo.srcObject = remoteStream;
      });

      peer.signal(callState.offer);

      setCallState((prev) => ({
        ...prev,
        isReceivingCall: false,
        isInCall: true, // ✅ This renders CallWindow
        peer,
        stream,
      }));
    } catch (err) {
      alert('Unable to access camera/mic');
      console.error(err);
      resetCallState();
    }
  };

  const handleReject = () => {
    if (callState.stream) {
      callState.stream.getTracks().forEach((track) => track.stop());
    }
    resetCallState(); // 👈 Clean everything
  };

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatWindow />
      {callState.isReceivingCall && (
        <CallModal onAccept={handleAccept} onReject={handleReject} />
      )}
    </div>
  );
};

export default ChatPage;
