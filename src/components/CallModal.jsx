import React, { useState } from 'react';
import { useCall } from '../context/CallContext';

const CallModal = ({ onAccept, onReject }) => {
  const { callState } = useCall();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onAccept();
    } catch (err) {
      console.error('Error accepting call:', err);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // If any devices are active already (due to race conditions), stop them
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('No media to clean on reject');
      }
    }
    onReject();
  };

  if (!callState?.from || !callState?.callType) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow">
        <p className="font-semibold text-gray-800">
          {callState.from} is calling you ({callState.callType})
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Accept'}
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
