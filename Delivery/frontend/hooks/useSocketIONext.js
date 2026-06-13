import { useEffect, useRef, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Custom hook for Socket.io integration in Next.js components
 * @param {string} socketUrl - Socket.io server URL
 * @param {boolean} enabled - Whether to enable socket connection
 * @returns {Object} - Socket service and connection state
 */
export const useSocketIONext = (socketUrl = 'http://localhost:5000', enabled = true) => {
  const connectionRef = useRef(null);
  const socketRef = useRef(socketIOService);

  const getUserData = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') || 'delivery_boy';

    if (!token || !userId) {
      console.warn('User authentication required for Socket.io');
      return null;
    }

    return { token, userId, userType };
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const userData = getUserData();
    if (!userData) return;

    socketRef.current.connect(socketUrl, userData.userId, userData.userType, userData.token);
    connectionRef.current = true;

    return () => {
      if (connectionRef.current) {
        socketRef.current.cleanup();
      }
    };
  }, [enabled, socketUrl, getUserData]);

  return socketRef.current;
};

export default useSocketIONext;
