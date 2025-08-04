import React from 'react';
import { useCall } from '../context/CallContext';

const CallModal = ({ onAccept, onReject }) => {
  const { callState } = useCall();
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow">
        <p>{callState.from} is calling you ({callState.callType})</p>
        <div className="flex gap-4 mt-4">
          <button onClick={onAccept} className="bg-green-500 text-white px-4 py-2 rounded">Accept</button>
          <button onClick={onReject} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
