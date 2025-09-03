import React, { useState } from 'react';
import { useCall } from '../context/CallContext';
import { Phone, PhoneOff } from 'lucide-react';

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Incoming {callState.callType} call
        </h2>
        <p className="text-gray-600 mt-2">{callState.from}</p>

        {/* Animated Ring */}
        <div className="flex justify-center my-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full flex items-center justify-center animate-pulse">
            {callState.callType === 'video' ? '🎥' : '📞'}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-around mt-4">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-4 py-2 rounded-full transition-all shadow-md"
          >
            <Phone size={20} />
            {loading ? 'Connecting...' : 'Accept'}
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded-full transition-all shadow-md"
          >
            <PhoneOff size={20} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
