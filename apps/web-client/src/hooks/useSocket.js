// apps/web-client/src/hooks/useSocket.js

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (serverUrl) => {
  // useRef is used to store the socket instance so it persists across re-renders
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create the socket connection when the component mounts
    const socket = io(serverUrl, {
      // These options help prevent connection issues
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current = socket;

    // This is the cleanup function that runs when the component unmounts
    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
    };
  }, [serverUrl]); // The effect re-runs only if the serverUrl changes

  return { socket: socketRef.current, isConnected };
};

export default useSocket;