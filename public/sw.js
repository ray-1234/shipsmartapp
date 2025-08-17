// public/sw.js - 本番環境対応版
const CACHE_NAME = 'shipsmart-v1.0.1';
const OFFLINE_URL = '/offline.html';

// 本番環境で確実に存在するファイルのみキャッシュ
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json'
  // 動的に生成されるJSファイルはruntime時に追加
];

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // 基本ファイルをキャッシュ（エラー無視）
        for (const url of STATIC_CACHE_URLS) {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
            console.log(`✅ Cached: ${url}`);
          } catch (error) {
            console.warn(`⚠️ Failed to cache: ${url}`, error);
          }
        }
        
        console.log('Service Worker: Core files cached');
        
      } catch (error) {
        console.error('Service Worker: Cache failed', error);
      }
    })()
  );
  
  self.skipWaiting();
});

// アクティベーション時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const cacheDeletePromises = cacheKeys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key));
      
      await Promise.all(cacheDeletePromises);
      console.log('Service Worker: Old caches cleaned');
      
      return self.clients.claim();
    })()
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // HTMLリクエストの処理
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          
          // 成功時は動的にキャッシュ
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          console.log('Service Worker: Serving offline page');
          const cache = await caches.open(CACHE_NAME);
          const offlineResponse = await cache.match(OFFLINE_URL);
          return offlineResponse || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }
  
  // 静的リソースの処理（キャッシュ優先）
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.includes('/icons/') ||
      url.pathname === '/manifest.json') {
    
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const networkResponse = await fetch(request);
          
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          console.log('Service Worker: Failed to fetch resource', request.url);
          
          // manifest.jsonの場合は基本的なJSONを返す
          if (url.pathname === '/manifest.json') {
            return new Response(JSON.stringify({
              name: 'ShipSmart',
              short_name: 'ShipSmart',
              start_url: '/',
              display: 'standalone'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          return new Response('', { status: 404 });
        }
      })()
    );
  }
});