import React, { useState,useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useCall } from '../context/CallContext';
import CallModal from '../components/CallModal';
import Peer from 'simple-peer';

const ChatPage = () => {
  const { user,token } = useAuth();
  const navigate = useNavigate();
  const { callState, setCallState, resetCallState } = useCall(); // 👈 Add resetCallState in context

  useEffect(() => {
    // console.log(user,token)
    // if (!user) {
    //   navigate('/login');
    //   return;
    // }
    // // if()

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
      // console.log(`📞 Incoming call from ${from} ${offer} (${callType})`);
      console.log("recieved offer:", offer);
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
      if(!answer){
        resetCallState();
        if (callState.stream) {
    callState.stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('Error stopping track:', err);
      }
    });
  }
      }
      if (answer && callState.peer) {
        callState.peer.signal(answer);
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      console.log('Received ICE candidate:', candidate);
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


  const handleAccept = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: callState.callType === 'video',
      audio: false,
    });

    const localVideo = document.getElementById('localVideo');
    if (localVideo) localVideo.srcObject = stream;

    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream,
      config: ICE_SERVERS,
        iceTransportPolicy: 'relay' 
    });
    // peer.on('stream', (remoteStream) => {
    // if (remoteVideoRef.current) {
    //   remoteVideoRef.current.srcObject = remoteStream;
    //   console.log("✅ Remote video element found and stream attached.");
    // } else {
    //   console.warn("❌ remoteVideoRef.current is null when stream received");
    // }

    // });
    peer.on('signal', (data) => {
      if (data.type === 'answer') {
        socket.emit('answer-call', {
          to: callState.from,
          answer: data,
        });
      } else {
        socket.emit('ice-candidate', {
          to: callState.from,
          candidate: data,
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
      }
    });

    // Removed duplicate ice-candidate listener from here ✅
    setTimeout(() => {
  peer.signal(callState.offer);
}, 100);

    // peer.signal(callState.offer);

    setCallState((prev) => ({
      ...prev,
      isReceivingCall: false,
      isInCall: true,
      peer,
      stream,
    }));
  } catch (err) {
    alert('Unable to access camera/mic');
    socket.emit('answer-call', { to: callState.from, answer: null });
    console.error(err);
    resetCallState();
  }
};

  const handleReject = () => {
  if (callState.stream) {
    callState.stream.getTracks().forEach((track) => track.stop());
  }

  // Emit rejection to backend
  socket.emit('answer-call', {
    to: callState.from,
    answer: null, // or use a flag like { rejected: true }
  });

  resetCallState();
};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) return null;


  return (
    <div className="flex h-screen relative">
      {/* Hamburger Menu for Mobile */}
      <button
        className="absolute top-4 left-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded"
        onClick={handleSidebarToggle}
      >
        ☰
      </button>

      {/* Sidebar (Desktop: visible | Mobile: sliding drawer) */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-100 border-r transform transition-transform duration-300 ease-in-out z-40 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow />
        {callState.isReceivingCall && (
          <CallModal onAccept={handleAccept} onReject={handleReject} />
        )}
      </div>
    </div>
  );
};


export default ChatPage;