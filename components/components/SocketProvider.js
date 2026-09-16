import {useSelector} from 'react-redux';
import {io} from 'socket.io-client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {endPoints} from '../services/ENV';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({children}) => {
  const token = useSelector(state => state.authConfig.token);

  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const initializeSocket = () => {
    if (!token) return;

    const newSocket = io(endPoints.SOCKET_BASE_URL, {
      reconnectionAttempts: 15,
      transports: ['websocket'],
    });

    newSocket.emit('authenticate', token);
    newSocket.on('authenticated', id => {
      // console.log("Socket authenticated with ID:", id);
      setSocket(newSocket);
    });
    newSocket.on('connect_error', error => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('unauthorized', error => {
      console.error('Unauthorized socket connection:', error.message);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected. Attempting to reconnect...');
      setSocket(null); // Clear the current socket
      initializeSocket(); // Re-initialize socket on disconnect
    });

    socketRef.current = newSocket;
  };

  useEffect(() => {
    if (token) {
      initializeSocket();
      // console.log("===============Socket Initialize");
    } else {
      console.log('No token found for authentication');
    }

    // Clean up on unmount or app kill
    return () => {
      // console.log("======Disconnecting socket...");
      socketRef.current?.disconnect();
      setSocket(null);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
export default SocketProvider;
