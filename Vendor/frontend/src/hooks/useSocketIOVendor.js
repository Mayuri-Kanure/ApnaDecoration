import { useEffect, useRef, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Custom hook for Socket.io integration in Vendor frontend
 */
export const useSocketIOVendor = (socketUrl = 'http://localhost:5000', enabled = true) => {
  const connectionRef = useRef(null);
  const socketRef = useRef(socketIOService);

  const getVendorData = useCallback(() => {
    const token = localStorage.getItem('vendorToken');
    const vendorId = localStorage.getItem('vendorId');

    if (!token || !vendorId) {
      console.warn('Vendor authentication required for Socket.io');
      return null;
    }

    return { token, vendorId };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const vendorData = getVendorData();
    if (!vendorData) return;

    socketRef.current.connect(socketUrl, vendorData.vendorId, 'vendor', vendorData.token);
    connectionRef.current = true;

    return () => {
      if (connectionRef.current) {
        socketRef.current.cleanup();
      }
    };
  }, [enabled, socketUrl, getVendorData]);

  return socketRef.current;
};

export default useSocketIOVendor;
