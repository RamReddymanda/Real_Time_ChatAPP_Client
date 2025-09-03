import React, { useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
import socket from '../utils/socket';
import { PhoneOff } from 'lucide-react';

const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { callState, resetCallState } = useCall();
  const { stream, peer, from } = callState || {};

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }

    const handleRemoteStream = (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    if (peer) {
      peer.on('stream', handleRemoteStream);
    }

    return () => {
      if (peer) peer.removeListener('stream', handleRemoteStream);
    };
  }, [peer, stream]);

  const handleEndCall = () => {
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
    socket.on('call-ended', () => {
      handleEndCall();
    });
    return () => socket.off('call-ended');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Video Container */}
      <div className="relative flex w-full h-full">
        <video
          id="localVideo"
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute top-4 left-4 w-40 h-32 rounded-xl shadow-lg border-2 border-white object-cover z-20"
        />
        <video
          id="remoteVideo"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-none"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 flex justify-center gap-6">
        <button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-transform transform hover:scale-110"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};

export default CallWindow;
