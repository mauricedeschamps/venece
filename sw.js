const CACHE_NAME = 'venice-travel-guide-v3';
const urlsToCache = [
  '/',
  '/index.html',
  'icon-192x192.jpg',
  'icon-512x512.jpg',
  'https://images.unsplash.com/photo-*', // Unsplash画像をキャッシュ
  'https://fonts.googleapis.com/css2?family=*' // Google Fontsをキャッシュ
];

// インストールイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント（キャッシュファースト戦略）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        
        // ネットワークリクエスト
        return fetch(event.request).then(response => {
          // 有効なレスポンスかチェック
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // レスポンスをクローン
          const responseToCache = response.clone();
          
          // キャッシュを開いて追加
          caches.open(CACHE_NAME)
            .then(cache => {
              // 画像リクエストのみキャッシュ（動的コンテンツはキャッシュしない）
              if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                cache.put(event.request, responseToCache);
              }
            });
          
          return response;
        }).catch(() => {
          // オフライン時のフォールバック
          return caches.match('/offline.html');
        });
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});