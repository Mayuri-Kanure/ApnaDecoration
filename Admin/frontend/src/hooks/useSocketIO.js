import { useEffect, useRef, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Custom hook for Socket.io integration in React components
 * @param {string} socketUrl - Socket.io server URL
 * @param {boolean} enabled - Whether to enable socket connection
 * @returns {Object} - Socket service and connection state
 */
export const useSocketIO = (socketUrl = 'http://localhost:5000', enabled = true) => {
  const connectionRef = useRef(null);
  const socketRef = useRef(socketIOService);

  // Get auth data
  const getUserData = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') || 'user';

    if (!token || !userId) {
      console.warn('User authentication required for Socket.io');
      return null;
    }

    return { token, userId, userType };
  }, []);

  // Connect to Socket.io
  useEffect(() => {
    if (!enabled) return;

    const userData = getUserData();
    if (!userData) return;

    // Connect to socket server
    socketRef.current.connect(socketUrl, userData.userId, userData.userType, userData.token);
    connectionRef.current = true;

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        socketRef.current.cleanup();
      }
    };
  }, [enabled, socketUrl, getUserData]);

  return socketRef.current;
};

export default useSocketIO;
