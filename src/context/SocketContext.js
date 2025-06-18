import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [disasterUpdates, setDisasterUpdates] = useState([]);
  const [socialUpdates, setSocialUpdates] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    newSocket.on('disaster_updated', (update) => {
      setDisasterUpdates(prev => [...prev, update]);
    });

    newSocket.on('social_media_updated', (update) => {
      setSocialUpdates(prev => [...prev, update]);
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, disasterUpdates, socialUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
