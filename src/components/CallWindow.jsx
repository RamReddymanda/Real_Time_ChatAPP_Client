import React, { useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
// import { useCall } from '../context/CallContext';

const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { callState, resetCallState } = useCall();
  const { stream, peer } = callState || {};

  useEffect(() => {
    // Show local stream
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }

    const handleRemoteStream = (remoteStream) => {
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    if (peer) {
      peer.on('stream', handleRemoteStream);
    }

    // Cleanup
    return () => {
      if (peer) {
        peer.removeListener('stream', handleRemoteStream);
      }
    };
  }, [peer, stream]);


const handleEndCall = () => {


  // Stop all local media tracks
  if (stream) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('Error stopping track:', err);
      }
    });
  }

  // Destroy the peer connection
  if (peer) {
    try {
      peer.destroy();
    } catch (err) {
      console.error('Error destroying peer:', err);
    }
  }

  // Reset call state
  resetCallState();
};


  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-90">
      <div className="flex w-full h-full">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-1/2 h-full object-cover border-r border-gray-800"
        />
        <video
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
