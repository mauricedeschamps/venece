const CACHE_NAME = 'venice-travel-guide-v3';
const urlsToCache = [
  '/',
  '/index.html',
  'IMG_20250716_222622_(192_x_192_ピクセル).jpg',
  'IMG_20250716_222711_(512_x_512_ピクセル).jpg'
];

// インストールイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあれば返す
        if (response) {
          return response;
        }
        
        // ネットワークリクエスト
        return fetch(event.request).then(response => {
          // レスポンスが有効かチェック
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // レスポンスをクローン
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // 画像リクエストのみキャッシュ
              if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                cache.put(event.request, responseToCache);
              }
            });
          
          return response;
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
