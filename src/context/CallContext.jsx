import { createContext, useContext, useState } from 'react';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [callState, setCallState] = useState({
    isCalling: false,
    isReceivingCall: false,
    callType: null,
    from: null,
    offer: null,
    peer: null,
    stream: null,
  });

  return (
    <CallContext.Provider value={{ callState, setCallState }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
