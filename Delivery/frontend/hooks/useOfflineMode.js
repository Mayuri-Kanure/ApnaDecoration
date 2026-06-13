import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing offline mode in Delivery App
 */
export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Back online!');
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      console.log('🔴 Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline data when online
  const syncOfflineData = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    console.log('🔄 Syncing offline data...');
    setIsSyncing(true);

    try {
      for (const item of offlineQueue) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body ? JSON.stringify(item.body) : undefined,
          });

          if (response.ok) {
            console.log('✅ Synced:', item.url);
            setOfflineQueue((prev) => prev.filter((q) => q.id !== item.id));
          }
        } catch (error) {
          console.error('❌ Sync failed:', item.url, error);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [offlineQueue]);

  // Queue request for offline
  const queueRequest = useCallback((request) => {
    const queueItem = {
      id: `${Date.now()}_${Math.random()}`,
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      timestamp: new Date().toISOString(),
    };

    setOfflineQueue((prev) => [...prev, queueItem]);
    console.log('📋 Request queued for sync:', queueItem);
    return queueItem.id;
  }, []);

  // Trigger manual sync
  const manualSync = useCallback(() => {
    if ('serviceWorker' in navigator && 'serviceWorkerContainer' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.sync) {
          registration.sync.register('sync-deliveries');
          console.log('🔔 Manual sync requested');
        }
      });
    }
    syncOfflineData();
  }, [syncOfflineData]);

  return {
    isOnline,
    offlineQueue,
    isSyncing,
    queueRequest,
    manualSync,
    syncOfflineData,
  };
};

export default useOfflineMode;
