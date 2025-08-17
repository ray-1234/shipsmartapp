// public/sw.js - Service Worker
const CACHE_NAME = 'shipsmart-v1.0.0';
const OFFLINE_URL = '/offline.html';

// キャッシュするリソース
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // 基本的なCSS/JSファイル（Expoが生成するもの）
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// API キャッシュ対象（発送料金データなど）
const API_CACHE_URLS = [
  '/api/shipping-rates',
  '/api/location-data'
];

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // 静的リソースをキャッシュ
        await cache.addAll(STATIC_CACHE_URLS);
        console.log('Service Worker: Static resources cached');
        
        // オフラインページを事前キャッシュ
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        
      } catch (error) {
        console.error('Service Worker: Cache failed', error);
      }
    })()
  );
  
  // 新しいService Workerを即座にアクティブにする
  self.skipWaiting();
});

// アクティベーション時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      // 古いキャッシュを削除
      const cacheKeys = await caches.keys();
      const cacheDeletePromises = cacheKeys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key));
      
      await Promise.all(cacheDeletePromises);
      console.log('Service Worker: Old caches cleaned');
      
      // 全てのクライアントで新しいService Workerを有効にする
      return self.clients.claim();
    })()
  );
});

// フェッチイベントの処理（キャッシュ戦略）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // HTMLリクエストの処理
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // ネットワークから取得を試行
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // オフライン時はキャッシュから返す
          console.log('Service Worker: Serving offline page');
          const cache = await caches.open(CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }
  
  // APIリクエストの処理（ネットワーク優先、フォールバックでキャッシュ）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        
        try {
          // ネットワークから取得
          const networkResponse = await fetch(request);
          
          // 成功時はキャッシュを更新
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // ネットワークエラー時はキャッシュから返す
          console.log('Service Worker: Serving API from cache', request.url);
          const cachedResponse = await cache.match(request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // キャッシュにもない場合は基本的なエラーレスポンス
          return new Response(
            JSON.stringify({ 
              error: 'オフラインのため、最新のデータを取得できません',
              cached: false 
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
    return;
  }
  
  // 静的リソースの処理（キャッシュ優先）
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const networkResponse = await fetch(request);
          
          // 成功時はキャッシュに保存
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          console.log('Service Worker: Failed to fetch resource', request.url);
          return new Response('', { status: 404 });
        }
      })()
    );
  }
});

// バックグラウンド同期（診断結果の保存など）
self.addEventListener('sync', (event) => {
  if (event.tag === 'diagnosis-backup') {
    event.waitUntil(
      (async () => {
        try {
          // IndexedDBから未同期のデータを取得
          const unsynced = await getUnsyncedDiagnosis();
          
          for (const diagnosis of unsynced) {
            await fetch('/api/diagnosis/backup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(diagnosis)
            });
          }
          
          console.log('Service Worker: Background sync completed');
        } catch (error) {
          console.error('Service Worker: Background sync failed', error);
        }
      })()
    );
  }
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || '新しい配送情報が更新されました',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: '開く',
        icon: '/icons/open-icon.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/close-icon.png'
      }
    ],
    tag: 'shipsmart-notification',
    renotify: true,
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ShipSmart', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // 既に開いているタブがあるかチェック
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 新しいタブを開く
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ヘルパー関数（IndexedDBアクセス）
async function getUnsyncedDiagnosis() {
  // IndexedDBから未同期の診断データを取得
  // 実装は別途 IndexedDB ヘルパーで行う
  return [];
}

// キャッシュサイズ管理
async function cleanupCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  // 100個を超えたら古いものから削除
  if (requests.length > 100) {
    const toDelete = requests.slice(0, requests.length - 100);
    await Promise.all(toDelete.map(request => cache.delete(request)));
  }
}

// 定期的なキャッシュクリーンアップ
setInterval(cleanupCache, 24 * 60 * 60 * 1000); // 24時間ごと