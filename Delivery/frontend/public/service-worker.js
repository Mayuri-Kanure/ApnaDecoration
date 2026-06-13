// Service Worker for offline support in Delivery App

const CACHE_NAME = 'apna-delivery-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache opened');
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('⚠️ Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event with Cache First, then Network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API requests for offline handling
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } else {
    // Static assets - Cache First
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache First Strategy
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('✅ Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('❌ Fetch failed:', error);
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('📡 Network unavailable, checking cache:', request.url);
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Return offline data
    return new Response(
      JSON.stringify({
        offline: true,
        message: 'Offline mode - Pending sync',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'sync-deliveries') {
    event.waitUntil(syncDeliveries());
  }
});

async function syncDeliveries() {
  console.log('🔄 Syncing delivery data...');
  try {
    // Get pending deliveries from IndexedDB
    const pendingDeliveries = await getAllPendingDeliveries();

    // Sync each pending delivery
    for (const delivery of pendingDeliveries) {
      try {
        const response = await fetch('/api/deliveries/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(delivery),
        });

        if (response.ok) {
          // Remove from pending
          await removePendingDelivery(delivery.id);
          console.log('✅ Synced delivery:', delivery.id);
        }
      } catch (err) {
        console.error('❌ Sync failed for:', delivery.id, err);
      }
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
    throw error;
  }
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_NOW') {
    syncDeliveries();
  }
});

// Helper functions (would be connected to IndexedDB)
async function getAllPendingDeliveries() {
  // This would query IndexedDB for pending deliveries
  return [];
}

async function removePendingDelivery(id) {
  // This would remove from IndexedDB
}
