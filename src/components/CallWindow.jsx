import React, { useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';

const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { callState, setCallState } = useCall();
  const { stream, peer } = callState;

  useEffect(() => {
    // Attach local stream
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }

    // Attach remote stream (peer.on('stream'))
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
    if (peer) peer.destroy();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setCallState({
      isCalling: false,
      isReceivingCall: false,
      isInCall: false,
      callType: null,
      peer: null,
      stream: null,
      from: null,
      offer: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-90">
      <div className="flex w-full h-full">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-1/2 h-full object-cover border-r border-gray-800"
        ></video>
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-1/2 h-full object-cover"
        ></video>
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
    