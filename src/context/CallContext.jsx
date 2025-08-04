import { createContext, useContext, useState, useCallback } from 'react';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [callState, setCallState] = useState({
    isCalling: false,
    isReceivingCall: false,
    isInCall: false,
    callType: null,
    from: null,
    offer: null,
    peer: null,
    stream: null,
  });

  // Helper to reset call state cleanly
  const resetCallState = useCallback(() => {
    setCallState({
      isCalling: false,
      isReceivingCall: false,
      isInCall: false,
      callType: null,
      from: null,
      offer: null,
      peer: null,
      stream: null,
    });
  }, []);

  return (
    <CallContext.Provider value={{ callState, setCallState, resetCallState }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
