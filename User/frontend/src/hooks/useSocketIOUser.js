import { useEffect, useRef, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Custom hook for Socket.io integration in User frontend
 */
export const useSocketIOUser = (socketUrl = 'http://localhost:5000', enabled = true) => {
  const connectionRef = useRef(null);
  const socketRef = useRef(socketIOService);

  const getUserData = useCallback(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.warn('User authentication required for Socket.io');
      return null;
    }

    return { token, userId };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const userData = getUserData();
    if (!userData) return;

    socketRef.current.connect(socketUrl, userData.userId, 'user', userData.token);
    connectionRef.current = true;

    return () => {
      if (connectionRef.current) {
        socketRef.current.cleanup();
      }
    };
  }, [enabled, socketUrl, getUserData]);

  return socketRef.current;
};

export default useSocketIOUser;
