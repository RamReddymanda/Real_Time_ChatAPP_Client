import React, { useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
import socket from '../utils/socket';
const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { callState, resetCallState } = useCall();
  const { stream, peer,from } = callState || {};

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }

    const handleRemoteStream = (remoteStream) => {
      console.log('✅ Remote stream received:', remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };
    
    peer.on('stream', (remoteStream) => {
      console.log('📺 Remote stream received');
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
      }
    });
    // if (peer) {
    //   console.log('📡 Binding remote stream handler');
    //   peer.on('stream', handleRemoteStream);
    // }

    return () => {
      if (peer) {
        console.log('🧹 Removing remote stream handler');
        peer.removeListener('stream', handleRemoteStream);
      }
    };
  }, [peer, stream]);

  const handleEndCall = () => {
    // Notify the other user to end the call
    if (from) {
      socket.emit('end-call', { to: from });
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn('Error stopping track:', err);
        }
      });
    }

    if (peer) {
      try {
        peer.destroy();
      } catch (err) {
        console.error('Error destroying peer:', err);
      }
    }

    resetCallState();
  };
 useEffect(() => {
    // Handle receiving end-call signal
    socket.on('call-ended', () => {
      console.log('📴 Call ended by remote');
      handleEndCall();
    });

    return () => {
      socket.off('call-ended');
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-90">
      <div className="flex w-full h-full">
        <video
          id="localVideo"
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-1/2 h-full object-cover border-r border-gray-800"
        />
        <video
          id="remoteVideo"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 h-full object-cover"
        />
      </div>
      <button
        onClick={handleEndCall}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full shadow-lg transition"
      >
        End Call
      </button>
    </div>
  );
};

export default CallWindow;
